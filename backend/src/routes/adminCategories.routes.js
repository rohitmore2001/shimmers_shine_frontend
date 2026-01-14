import { Router } from 'express'
import { Category } from '../models/Category.js'

export const adminCategoriesRouter = Router()

adminCategoriesRouter.get('/', async (_req, res) => {
  const items = await Category.find({}).sort({ name: 1 }).lean()
  res.json(items.map((c) => ({ id: c.id, name: c.name, image: c.image })))
})

adminCategoriesRouter.post('/', async (req, res) => {
  const { id, name, image } = req.body || {}

  if (!id || !name || !image) {
    return res.status(400).json({ message: 'id, name, image are required' })
  }

  const created = await Category.create({ id: String(id), name: String(name), image: String(image) })
  res.status(201).json({ id: created.id, name: created.name, image: created.image })
})

adminCategoriesRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const { name, image } = req.body || {}

  const updated = await Category.findOneAndUpdate(
    { id },
    {
      ...(name !== undefined ? { name: String(name) } : {}),
      ...(image !== undefined ? { image: String(image) } : {}),
    },
    { new: true },
  ).lean()

  if (!updated) return res.status(404).json({ message: 'Not found' })
  return res.json({ id: updated.id, name: updated.name, image: updated.image })
})

adminCategoriesRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  const deleted = await Category.findOneAndDelete({ id }).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
