import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'
import { Coupon } from '../models/Coupon.js'
import { Order } from '../models/Order.js'
import { Customer } from '../models/Customer.js'
import { requireCustomer } from '../middleware/requireCustomer.js'
import { createOrderId } from '../utils/ids.js'
import { geocodeIndianAddress, calculateDistanceFromNaviMumbai } from '../utils/distance.js'

export const publicRouter = Router()

publicRouter.get('/health', (_req, res) => {
  res.json({ ok: true })
})

publicRouter.get('/catalog', async (_req, res) => {
  const [categories, products] = await Promise.all([
    Category.find({}).sort({ name: 1 }).lean(),
    Product.find({ active: true }).sort({ createdAt: -1 }).lean(),
  ])

  res.json({
    categories: categories.map((c) => ({ id: c.id, name: c.name, image: c.image })),
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      currency: p.currency,
      metal: p.metal || undefined,
      image: p.image,
      rating: p.rating ?? undefined,
    })),
  })
})

publicRouter.get('/coupons', async (_req, res) => {
  const now = Date.now()

  const items = await Coupon.find({ active: true }).sort({ createdAt: -1 }).lean()
  const usable = items.filter((c) => {
    const startsOk = !c.startsAt || now >= new Date(c.startsAt).getTime()
    const endsOk = !c.endsAt || now <= new Date(c.endsAt).getTime()
    return startsOk && endsOk
  })

  return res.json(
    usable.map((c) => ({
      code: c.code,
      label: c.label || c.code,
      description: c.description || '',
    })),
  )
})

publicRouter.get('/products', async (req, res) => {
  const category = req.query.category ? String(req.query.category) : ''
  const pageRaw = req.query.page ? Number(req.query.page) : 1
  const limitRaw = req.query.limit ? Number(req.query.limit) : 12

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(50, Math.floor(limitRaw)) : 12

  const filter = { active: true }
  if (category) {
    filter.categoryId = category
  }

  const skip = (page - 1) * limit

  const [total, items] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
  ])

  const mapped = items.map((p) => ({
    id: p.id,
    name: p.name,
    categoryId: p.categoryId,
    price: p.price,
    currency: p.currency,
    metal: p.metal || undefined,
    image: p.image,
    rating: p.rating ?? undefined,
  }))

  return res.json({
    items: mapped,
    page,
    limit,
    total,
    hasMore: skip + mapped.length < total,
  })
})

publicRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body || {}

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  const normalizedEmail = email.trim().toLowerCase()
  const name = normalizedEmail.split('@')[0] || 'Customer'

  let customer = await Customer.findOne({ email: normalizedEmail }).lean()

  if (!customer) {
    const passwordHash = await bcrypt.hash(password, 10)
    const created = await Customer.create({
      email: normalizedEmail,
      name,
      passwordHash,
      active: true,
      lastLoginAt: new Date(),
    })
    customer = created.toObject()
  } else {
    if (!customer.active) {
      return res.status(403).json({ message: 'Account is disabled' })
    }

    const ok = await bcrypt.compare(password, customer.passwordHash)
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    await Customer.updateOne({ _id: customer._id }, { $set: { lastLoginAt: new Date() } })
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'JWT_SECRET is not configured' })
  }

  const token = jwt.sign({ sub: customer._id.toString(), role: 'customer', email: customer.email }, secret, {
    expiresIn: '30d',
  })

  return res.json({
    token,
    user: {
      id: customer._id.toString(),
      name: customer.name,
      email: customer.email,
    },
  })
})

publicRouter.post('/orders', requireCustomer, async (req, res) => {
  const { lines, delivery, payment, coupon } = req.body || {}

  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: 'lines[] is required' })
  }

  const normalized = lines
    .map((l) => ({ productId: String(l.productId || ''), quantity: Number(l.quantity || 0) }))
    .filter((l) => l.productId && l.quantity > 0)

  if (normalized.length === 0) {
    return res.status(400).json({ message: 'No valid product lines' })
  }

  const products = await Product.find({ id: { $in: normalized.map((l) => l.productId) }, active: true }).lean()
  const productById = new Map(products.map((p) => [p.id, p]))

  const detailed = normalized
    .map((l) => {
      const p = productById.get(l.productId)
      return p ? { product: p, quantity: l.quantity } : null
    })
    .filter(Boolean)

  if (detailed.length === 0) {
    return res.status(400).json({ message: 'No valid product lines' })
  }

  const subtotal = detailed.reduce((sum, x) => sum + x.product.price * x.quantity, 0)
  const currency = detailed[0].product.currency || 'INR'
  const orderId = createOrderId()

  let couponCode = undefined
  let discountAmount = 0

  const requestedCode = coupon?.code ? String(coupon.code).trim().toUpperCase() : ''
  if (requestedCode) {
    const found = await Coupon.findOne({ code: requestedCode, active: true }).lean()
    if (found) {
      const now = Date.now()
      const startsOk = !found.startsAt || now >= new Date(found.startsAt).getTime()
      const endsOk = !found.endsAt || now <= new Date(found.endsAt).getTime()
      const minOk = !found.minSubtotal || subtotal >= found.minSubtotal

      if (startsOk && endsOk && minOk) {
        couponCode = found.code
        if (found.type === 'percentage') {
          discountAmount = subtotal * (found.value / 100)
        } else {
          discountAmount = found.value
        }
        if (found.maxDiscount && discountAmount > found.maxDiscount) {
          discountAmount = found.maxDiscount
        }
      }
    }
  }

  if (discountAmount < 0) discountAmount = 0
  if (discountAmount > subtotal) discountAmount = subtotal
  const total = Math.max(0, subtotal - discountAmount)

  const paymentMethod = payment?.method ? String(payment.method) : ''
  const paymentStatus = paymentMethod === 'upi' ? 'paid' : 'pending'

  const safeDelivery = delivery
    ? {
        fullName: delivery.fullName ? String(delivery.fullName) : '',
        phone: delivery.phone ? String(delivery.phone) : '',
        addressLine: delivery.addressLine ? String(delivery.addressLine) : '',
        city: delivery.city ? String(delivery.city) : '',
        pincode: delivery.pincode ? String(delivery.pincode) : '',
      }
    : null

  if (
    !safeDelivery ||
    !safeDelivery.fullName ||
    !safeDelivery.phone ||
    !safeDelivery.addressLine ||
    !safeDelivery.city ||
    !safeDelivery.pincode
  ) {
    return res.status(400).json({ message: 'delivery.fullName, delivery.phone, delivery.addressLine, delivery.city, delivery.pincode are required' })
  }

  const customerId = req.customer?.id

  if (customerId) {
    await Customer.updateOne(
      { _id: customerId },
      {
        $set: {
          phone: safeDelivery.phone,
          defaultAddress: safeDelivery,
          lastLoginAt: new Date(),
        },
        $addToSet: { addresses: safeDelivery },
      },
    )
  }

  // Calculate distance from Navi Mumbai
  const coords = geocodeIndianAddress(safeDelivery.addressLine, safeDelivery.city, safeDelivery.pincode)
  const distanceFromNaviMumbai = calculateDistanceFromNaviMumbai(coords.latitude, coords.longitude)
  
  const distanceInfo = {
    kilometers: Math.round(distanceFromNaviMumbai * 100) / 100, // Round to 2 decimal places
    fromNaviMumbai: distanceFromNaviMumbai <= 50 // Consider within 50km as "from Navi Mumbai"
  }

  const created = await Order.create({
    orderId,
    customerId,
    customer: {
      id: req.customer?.id || null,
      name: req.customer?.name || '',
      email: req.customer?.email || '',
      phone: safeDelivery.phone,
    },
    lines: normalized,
    subtotal,
    discountAmount,
    total,
    couponCode,
    currency,
    delivery: safeDelivery,
    payment: payment || null,
    orderStatus: 'created',
    paymentStatus,
    distance: distanceInfo,
  })

  return res.status(201).json({
    orderId: created.orderId,
    orderStatus: created.orderStatus,
    paymentStatus: created.paymentStatus,
    deliveryStatus: created.deliveryStatus,
    subtotal: created.subtotal,
    discountAmount: created.discountAmount,
    total: created.total,
    couponCode: created.couponCode || null,
    currency: created.currency,
    delivery: created.delivery || null,
    payment: created.payment || null,
    distance: created.distance || null,
    createdAt: created.createdAt,
  })
})

publicRouter.get('/orders/me', requireCustomer, async (req, res) => {
  const customerId = req.customer?.id
  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const orders = await Order.find({ customerId }).sort({ createdAt: -1 }).lean()

  return res.json(
    orders.map((o) => ({
      orderId: o.orderId,
      orderStatus: o.orderStatus || 'created',
      paymentStatus: o.paymentStatus || 'pending',
      deliveryStatus: o.deliveryStatus || 'pending',
      subtotal: o.subtotal,
      discountAmount: o.discountAmount ?? 0,
      total: o.total ?? o.subtotal,
      couponCode: o.couponCode || null,
      currency: o.currency,
      lines: o.lines || [],
      delivery: o.delivery || null,
      payment: o.payment || null,
      distance: o.distance || null,
      returnRequest: o.returnRequest || null,
      replacementRequest: o.replacementRequest || null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
  )
})

publicRouter.post('/orders/:orderId/cancel', requireCustomer, async (req, res) => {
  const orderId = String(req.params.orderId)
  const customerId = req.customer?.id
  const { reason } = req.body || {}

  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const order = await Order.findOne({ orderId, customerId })
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  if (!['created', 'confirmed'].includes(order.orderStatus)) {
    return res.status(400).json({ message: 'Order cannot be cancelled at this stage' })
  }

  const updated = await Order.findOneAndUpdate(
    { orderId, customerId },
    { 
      orderStatus: 'cancelled',
      paymentStatus: order.paymentStatus === 'paid' ? 'refunded' : order.paymentStatus
    },
    { new: true }
  ).lean()

  return res.json({
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
    message: 'Order cancelled successfully'
  })
})

publicRouter.post('/orders/:orderId/return', requireCustomer, async (req, res) => {
  const orderId = String(req.params.orderId)
  const customerId = req.customer?.id
  const { reason, description } = req.body || {}

  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ message: 'Return reason is required' })
  }

  const order = await Order.findOne({ orderId, customerId })
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ message: 'Only delivered orders can be returned' })
  }

  const updated = await Order.findOneAndUpdate(
    { orderId, customerId },
    { 
      orderStatus: 'return_requested',
      returnRequest: {
        reason: reason.trim(),
        description: description ? description.trim() : '',
        requestedAt: new Date()
      }
    },
    { new: true }
  ).lean()

  return res.json({
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    returnRequest: updated.returnRequest,
    message: 'Return request submitted successfully'
  })
})

publicRouter.post('/orders/:orderId/replace', requireCustomer, async (req, res) => {
  const orderId = String(req.params.orderId)
  const customerId = req.customer?.id
  const { reason, description } = req.body || {}

  if (!customerId) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  if (!reason || typeof reason !== 'string') {
    return res.status(400).json({ message: 'Replacement reason is required' })
  }

  const order = await Order.findOne({ orderId, customerId })
  if (!order) {
    return res.status(404).json({ message: 'Order not found' })
  }

  if (order.orderStatus !== 'delivered') {
    return res.status(400).json({ message: 'Only delivered orders can be replaced' })
  }

  const updated = await Order.findOneAndUpdate(
    { orderId, customerId },
    { 
      orderStatus: 'replacement_requested',
      replacementRequest: {
        reason: reason.trim(),
        description: description ? description.trim() : '',
        requestedAt: new Date()
      }
    },
    { new: true }
  ).lean()

  return res.json({
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    replacementRequest: updated.replacementRequest,
    message: 'Replacement request submitted successfully'
  })
})

publicRouter.post('/coupons/validate', async (req, res) => {
  const { code, subtotal } = req.body || {}

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, message: 'Coupon code is required' })
  }

  const sub = Number(subtotal || 0)

  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true }).lean()
  if (!coupon) {
    return res.json({ valid: false, message: 'Invalid coupon' })
  }

  const now = Date.now()
  if (coupon.startsAt && now < new Date(coupon.startsAt).getTime()) {
    return res.json({ valid: false, message: 'Coupon not active yet' })
  }
  if (coupon.endsAt && now > new Date(coupon.endsAt).getTime()) {
    return res.json({ valid: false, message: 'Coupon expired' })
  }
  if (coupon.minSubtotal && sub < coupon.minSubtotal) {
    return res.json({ valid: false, message: `Minimum subtotal is ${coupon.minSubtotal}` })
  }

  let discountAmount = 0
  if (coupon.type === 'percentage') {
    discountAmount = sub * (coupon.value / 100)
  } else {
    discountAmount = coupon.value
  }

  if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount
  }

  if (discountAmount < 0) discountAmount = 0
  if (discountAmount > sub) discountAmount = sub

  return res.json({
    valid: true,
    code: coupon.code,
    label: coupon.label || coupon.code,
    discountAmount,
  })
})
