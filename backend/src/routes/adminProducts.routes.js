import { Router } from 'express'
import { Product } from '../models/Product.js'

export const adminProductsRouter = Router()

adminProductsRouter.get('/', async (_req, res) => {
  const items = await Product.find({}).sort({ createdAt: -1 }).lean()
  res.json(
    items.map((p) => ({
      id: p.id,
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      currency: p.currency,
      metal: p.metal || '',
      image: p.image,
      rating: p.rating ?? null,
      active: Boolean(p.active),
    })),
  )
})

adminProductsRouter.post('/', async (req, res) => {
  const { id, name, categoryId, price, currency, metal, image, rating, active } = req.body || {}

  if (!id || !name || !categoryId || price === undefined || !currency || !image) {
    return res.status(400).json({ message: 'id, name, categoryId, price, currency, image are required' })
  }

  const created = await Product.create({
    id: String(id),
    name: String(name),
    categoryId: String(categoryId),
    price: Number(price),
    currency: String(currency),
    metal: metal ? String(metal) : undefined,
    image: String(image),
    rating: rating !== undefined && rating !== null && rating !== '' ? Number(rating) : undefined,
    active: active === undefined ? true : Boolean(active),
  })

  res.status(201).json({ id: created.id })
})

adminProductsRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const { name, categoryId, price, currency, metal, image, rating, active } = req.body || {}

  const updated = await Product.findOneAndUpdate(
    { id },
    {
      ...(name !== undefined ? { name: String(name) } : {}),
      ...(categoryId !== undefined ? { categoryId: String(categoryId) } : {}),
      ...(price !== undefined ? { price: Number(price) } : {}),
      ...(currency !== undefined ? { currency: String(currency) } : {}),
      ...(metal !== undefined ? { metal: metal ? String(metal) : undefined } : {}),
      ...(image !== undefined ? { image: String(image) } : {}),
      ...(rating !== undefined ? { rating: rating === null || rating === '' ? undefined : Number(rating) } : {}),
      ...(active !== undefined ? { active: Boolean(active) } : {}),
    },
    { new: true },
  ).lean()

  if (!updated) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})

adminProductsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  const deleted = await Product.findOneAndDelete({ id }).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
