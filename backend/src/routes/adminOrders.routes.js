import { Router } from 'express'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'

export const adminOrdersRouter = Router()

adminOrdersRouter.get('/', async (_req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean()

  const missingNameIds = new Set()
  for (const o of orders) {
    for (const l of o.lines || []) {
      if (!l?.productName && l?.productId) missingNameIds.add(String(l.productId))
    }
  }

  const products = missingNameIds.size
    ? await Product.find({ id: { $in: Array.from(missingNameIds) } }).select({ id: 1, name: 1 }).lean()
    : []
  const nameById = new Map(products.map((p) => [p.id, p.name]))

  res.json(
    orders.map((o) => ({
      orderId: o.orderId,
      customer: o.customer || null,
      orderStatus: o.orderStatus || 'created',
      paymentStatus: o.paymentStatus || 'pending',
      deliveryStatus: o.deliveryStatus || 'pending',
      subtotal: o.subtotal,
      discountAmount: o.discountAmount ?? 0,
      total: o.total ?? o.subtotal,
      couponCode: o.couponCode || null,
      currency: o.currency,
      lines: (o.lines || []).map((l) => ({
        ...l,
        productName: l?.productName || nameById.get(String(l.productId)) || '',
      })),
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

adminOrdersRouter.put('/:orderId', async (req, res) => {
  const orderId = String(req.params.orderId)
  const { orderStatus, paymentStatus, deliveryStatus } = req.body || {}

  const patch = {}

  if (orderStatus !== undefined) {
    patch.orderStatus = String(orderStatus)
  }

  if (paymentStatus !== undefined) {
    patch.paymentStatus = String(paymentStatus)
  }

  if (deliveryStatus !== undefined) {
    patch.deliveryStatus = String(deliveryStatus)
  }

  const updated = await Order.findOneAndUpdate({ orderId }, patch, { new: true }).lean()
  if (!updated) return res.status(404).json({ message: 'Not found' })

  return res.json({
    ok: true,
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
    deliveryStatus: updated.deliveryStatus,
  })
})

adminOrdersRouter.put('/:orderId/return', async (req, res) => {
  const orderId = String(req.params.orderId)
  const { action, rejectionReason } = req.body || {}

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject' })
  }

  const order = await Order.findOne({ orderId })
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.orderStatus !== 'return_requested') {
    return res.status(400).json({ message: 'No return request found for this order' })
  }

  const patch = {
    returnRequest: {
      ...order.returnRequest,
      ...(action === 'approve' 
        ? { approvedAt: new Date() }
        : { rejectedAt: new Date(), rejectionReason: rejectionReason || '' }
      )
    },
    orderStatus: action === 'approve' ? 'return_approved' : 'return_rejected'
  }

  const updated = await Order.findOneAndUpdate({ orderId }, patch, { new: true }).lean()

  return res.json({
    ok: true,
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    returnRequest: updated.returnRequest,
  })
})

adminOrdersRouter.put('/:orderId/replace', async (req, res) => {
  const orderId = String(req.params.orderId)
  const { action, rejectionReason } = req.body || {}

  if (!['approve', 'reject'].includes(action)) {
    return res.status(400).json({ message: 'Action must be approve or reject' })
  }

  const order = await Order.findOne({ orderId })
  if (!order) return res.status(404).json({ message: 'Order not found' })

  if (order.orderStatus !== 'replacement_requested') {
    return res.status(400).json({ message: 'No replacement request found for this order' })
  }

  const patch = {
    replacementRequest: {
      ...order.replacementRequest,
      ...(action === 'approve' 
        ? { approvedAt: new Date() }
        : { rejectedAt: new Date(), rejectionReason: rejectionReason || '' }
      )
    },
    orderStatus: action === 'approve' ? 'replacement_approved' : 'replacement_rejected'
  }

  const updated = await Order.findOneAndUpdate({ orderId }, patch, { new: true }).lean()

  return res.json({
    ok: true,
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    replacementRequest: updated.replacementRequest,
  })
})

adminOrdersRouter.delete('/:orderId', async (req, res) => {
  const orderId = String(req.params.orderId)
  const deleted = await Order.findOneAndDelete({ orderId }).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
