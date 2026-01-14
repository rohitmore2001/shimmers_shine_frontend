import { Router } from 'express'
import { Coupon } from '../models/Coupon.js'

export const adminCouponsRouter = Router()

adminCouponsRouter.get('/', async (_req, res) => {
  const items = await Coupon.find({}).sort({ createdAt: -1 }).lean()
  res.json(
    items.map((c) => ({
      code: c.code,
      label: c.label || '',
      description: c.description || '',
      type: c.type,
      value: c.value,
      active: Boolean(c.active),
      startsAt: c.startsAt ? new Date(c.startsAt).toISOString() : '',
      endsAt: c.endsAt ? new Date(c.endsAt).toISOString() : '',
      minSubtotal: c.minSubtotal ?? '',
      maxDiscount: c.maxDiscount ?? '',
    })),
  )
})

adminCouponsRouter.post('/', async (req, res) => {
  const { code, label, description, type, value, active, startsAt, endsAt, minSubtotal, maxDiscount } = req.body || {}

  if (!code || !type || value === undefined) {
    return res.status(400).json({ message: 'code, type, value are required' })
  }

  const created = await Coupon.create({
    code: String(code).trim().toUpperCase(),
    label: label ? String(label) : undefined,
    description: description ? String(description) : undefined,
    type: String(type),
    value: Number(value),
    active: active === undefined ? true : Boolean(active),
    startsAt: startsAt ? new Date(startsAt) : undefined,
    endsAt: endsAt ? new Date(endsAt) : undefined,
    minSubtotal: minSubtotal !== undefined && minSubtotal !== '' ? Number(minSubtotal) : undefined,
    maxDiscount: maxDiscount !== undefined && maxDiscount !== '' ? Number(maxDiscount) : undefined,
  })

  res.status(201).json({ code: created.code })
})

adminCouponsRouter.put('/:code', async (req, res) => {
  const code = String(req.params.code).trim().toUpperCase()
  const { label, description, type, value, active, startsAt, endsAt, minSubtotal, maxDiscount } = req.body || {}

  const updated = await Coupon.findOneAndUpdate(
    { code },
    {
      ...(label !== undefined ? { label: label ? String(label) : undefined } : {}),
      ...(description !== undefined ? { description: description ? String(description) : undefined } : {}),
      ...(type !== undefined ? { type: String(type) } : {}),
      ...(value !== undefined ? { value: Number(value) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
      ...(startsAt !== undefined ? { startsAt: startsAt ? new Date(startsAt) : undefined } : {}),
      ...(endsAt !== undefined ? { endsAt: endsAt ? new Date(endsAt) : undefined } : {}),
      ...(minSubtotal !== undefined ? { minSubtotal: minSubtotal === '' ? undefined : Number(minSubtotal) } : {}),
      ...(maxDiscount !== undefined ? { maxDiscount: maxDiscount === '' ? undefined : Number(maxDiscount) } : {}),
    },
    { new: true },
  ).lean()

  if (!updated) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})

adminCouponsRouter.delete('/:code', async (req, res) => {
  const code = String(req.params.code).trim().toUpperCase()
  const deleted = await Coupon.findOneAndDelete({ code }).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
