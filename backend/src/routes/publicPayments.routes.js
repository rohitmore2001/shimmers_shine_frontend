import { Router } from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { Coupon } from '../models/Coupon.js'
import { Order } from '../models/Order.js'
import { Product } from '../models/Product.js'
import { Customer } from '../models/Customer.js'
import { requireCustomer } from '../middleware/requireCustomer.js'
import { createOrderId } from '../utils/ids.js'

export const publicPaymentsRouter = Router()

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET

  if (!key_id || !key_secret) {
    throw new Error('Razorpay keys are not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)')
  }

  return new Razorpay({ key_id, key_secret })
}

function computeSignature({ orderId, paymentId, secret }) {
  return crypto.createHmac('sha256', secret).update(`${orderId}|${paymentId}`).digest('hex')
}

async function computeOrderTotals({ lines, coupon }) {
  const normalized = lines
    .map((l) => ({ productId: String(l.productId || ''), quantity: Number(l.quantity || 0) }))
    .filter((l) => l.productId && l.quantity > 0)

  if (normalized.length === 0) {
    const err = new Error('No valid product lines')
    err.statusCode = 400
    throw err
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
    const err = new Error('No valid product lines')
    err.statusCode = 400
    throw err
  }

  const subtotal = detailed.reduce((sum, x) => sum + x.product.price * x.quantity, 0)
  const currency = detailed[0].product.currency || 'INR'

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
  return { normalized, subtotal, discountAmount, total, couponCode, currency }
}

// Create internal Order + Razorpay Order
publicPaymentsRouter.post('/razorpay/create-order', requireCustomer, async (req, res) => {
  const { lines, delivery, coupon } = req.body || {}

  if (!Array.isArray(lines) || lines.length === 0) {
    return res.status(400).json({ message: 'lines[] is required' })
  }

  try {
    const { normalized, subtotal, discountAmount, total, couponCode, currency } = await computeOrderTotals({
      lines,
      coupon,
    })

    const orderId = createOrderId()

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
      return res.status(400).json({
        message: 'delivery.fullName, delivery.phone, delivery.addressLine, delivery.city, delivery.pincode are required',
      })
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

    const customer = await Customer.findById(customerId).lean()
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' })
    }

    const created = await Order.create({
      orderId,
      customerId,
      customer: {
        id: customer._id.toString(),
        name: customer.name,
        email: customer.email,
        phone: safeDelivery.phone,
      },
      lines: normalized,
      subtotal,
      discountAmount,
      total,
      couponCode,
      currency,
      delivery: safeDelivery,
      payment: { method: 'upi', gateway: 'razorpay' },
      orderStatus: 'created',
      paymentStatus: 'pending',
      deliveryStatus: 'pending',
    })

    const client = getRazorpayClient()

    // Razorpay expects amount in paise
    const amountInPaise = Math.round(Number(created.total || 0) * 100)

    const rpOrder = await client.orders.create({
      amount: amountInPaise,
      currency: created.currency,
      receipt: created.orderId,
      payment_capture: 1,
      notes: {
        internalOrderId: created.orderId,
      },
    })

    await Order.updateOne(
      { orderId: created.orderId },
      { $set: { payment: { ...(created.payment || {}), razorpayOrderId: rpOrder.id } } },
    )

    return res.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: created.orderId,
      razorpayOrderId: rpOrder.id,
      amount: rpOrder.amount,
      currency: rpOrder.currency,
      name: 'SHIMMERS & SHINE',
      description: `Order ${created.orderId}`,
      prefill: {
        name: delivery?.fullName || '',
        contact: delivery?.phone || '',
      },
    })
  } catch (err) {
    const statusCode = err?.statusCode || 500
    return res.status(statusCode).json({ message: err?.message || 'Failed to create payment order' })
  }
})

// Verify signature after successful payment
publicPaymentsRouter.post('/razorpay/verify', requireCustomer, async (req, res) => {
  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {}

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ message: 'Missing verification fields' })
  }

  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) {
    return res.status(500).json({ message: 'RAZORPAY_KEY_SECRET is not configured' })
  }

  const order = await Order.findOne({ orderId }).lean()
  if (!order) return res.status(404).json({ message: 'Order not found' })

  const storedRpOrderId = order?.payment?.razorpayOrderId
  if (storedRpOrderId && storedRpOrderId !== razorpay_order_id) {
    return res.status(400).json({ message: 'Razorpay order mismatch' })
  }

  const expected = computeSignature({ orderId: razorpay_order_id, paymentId: razorpay_payment_id, secret })
  const ok = expected === razorpay_signature

  await Order.updateOne(
    { orderId },
    {
      $set: {
        paymentStatus: ok ? 'paid' : 'failed',
        payment: {
          ...(order.payment || {}),
          method: 'upi',
          gateway: 'razorpay',
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
        },
      },
    },
  )

  return res.json({ ok })
})
