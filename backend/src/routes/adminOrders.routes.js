import { Router } from 'express'
import { Order } from '../models/Order.js'

export const adminOrdersRouter = Router()

adminOrdersRouter.get('/', async (_req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).lean()
  res.json(
    orders.map((o) => ({
      orderId: o.orderId,
      customer: o.customer || null,
      orderStatus: o.orderStatus || 'created',
      paymentStatus: o.paymentStatus || 'pending',
      subtotal: o.subtotal,
      discountAmount: o.discountAmount ?? 0,
      total: o.total ?? o.subtotal,
      couponCode: o.couponCode || null,
      currency: o.currency,
      lines: o.lines,
      delivery: o.delivery || null,
      payment: o.payment || null,
      createdAt: o.createdAt,
      updatedAt: o.updatedAt,
    })),
  )
})

adminOrdersRouter.put('/:orderId', async (req, res) => {
  const orderId = String(req.params.orderId)
  const { orderStatus, paymentStatus } = req.body || {}

  const patch = {}

  if (orderStatus !== undefined) {
    patch.orderStatus = String(orderStatus)
  }

  if (paymentStatus !== undefined) {
    patch.paymentStatus = String(paymentStatus)
  }

  const updated = await Order.findOneAndUpdate({ orderId }, patch, { new: true }).lean()
  if (!updated) return res.status(404).json({ message: 'Not found' })

  return res.json({
    ok: true,
    orderId: updated.orderId,
    orderStatus: updated.orderStatus,
    paymentStatus: updated.paymentStatus,
  })
})
