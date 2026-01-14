import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { Customer } from '../models/Customer.js'

export const adminCustomersRouter = Router()

adminCustomersRouter.get('/', async (_req, res) => {
  const items = await Customer.find({}).sort({ createdAt: -1 }).lean()
  res.json(
    items.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      active: Boolean(c.active),
      defaultAddress: c.defaultAddress || null,
      addressesCount: Array.isArray(c.addresses) ? c.addresses.length : 0,
      lastLoginAt: c.lastLoginAt ? new Date(c.lastLoginAt).toISOString() : '',
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  )
})

adminCustomersRouter.post('/', async (req, res) => {
  const { email, name, password, phone, active } = req.body || {}

  if (!email || !name || !password) {
    return res.status(400).json({ message: 'email, name, password are required' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  const passwordHash = await bcrypt.hash(String(password), 10)

  const created = await Customer.create({
    email: normalizedEmail,
    name: String(name).trim(),
    passwordHash,
    phone: phone ? String(phone).trim() : undefined,
    active: active === undefined ? true : Boolean(active),
    lastLoginAt: undefined,
  })

  return res.status(201).json({ id: created._id.toString() })
})

adminCustomersRouter.put('/:id', async (req, res) => {
  const id = String(req.params.id)
  const { email, name, password, phone, active } = req.body || {}

  const patch = {
    ...(email !== undefined ? { email: String(email).trim().toLowerCase() } : {}),
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(phone !== undefined ? { phone: phone ? String(phone).trim() : undefined } : {}),
    ...(active !== undefined ? { active: Boolean(active) } : {}),
  }

  if (password !== undefined && String(password)) {
    patch.passwordHash = await bcrypt.hash(String(password), 10)
  }

  const updated = await Customer.findByIdAndUpdate(id, patch, { new: true }).lean()
  if (!updated) return res.status(404).json({ message: 'Not found' })

  return res.json({ ok: true })
})

adminCustomersRouter.delete('/:id', async (req, res) => {
  const id = String(req.params.id)
  const deleted = await Customer.findByIdAndDelete(id).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
