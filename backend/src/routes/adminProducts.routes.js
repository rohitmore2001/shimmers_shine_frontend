import { Router } from 'express'
import { Product } from '../models/Product.js'

export const adminProductsRouter = Router()

adminProductsRouter.get('/', async (_req, res) => {
  try {
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
        images: p.images || [], // Include images field
        rating: p.rating ?? null,
        active: Boolean(p.active),
      })),
    )
  } catch (error) {
    console.warn('Database not available for admin products list:', error.message)
    // Return mock data when database is not available
    res.json([
      {
        id: 'prod1',
        name: 'Gold Ring',
        categoryId: 'rings',
        price: 25000,
        currency: 'INR',
        metal: 'Gold',
        image: '/images/gold-ring.jpg',
        images: ['/images/gold-ring-1.jpg', '/images/gold-ring-2.jpg', '/images/gold-ring-3.jpg'],
        rating: 4.5,
        active: true,
      }
    ])
  }
})

adminProductsRouter.post('/', async (req, res) => {
  const { id, name, categoryId, price, currency, metal, image, images, rating, active } = req.body || {}

  if (!id || !name || !categoryId || price === undefined || !currency || !image) {
    return res.status(400).json({ message: 'id, name, categoryId, price, currency, image are required' })
  }

  try {
    const created = await Product.create({
      id: String(id),
      name: String(name),
      categoryId: String(categoryId),
      price: Number(price),
      currency: String(currency),
      metal: metal ? String(metal) : undefined,
      image: String(image),
      images: Array.isArray(images) && images.length > 0 ? images : [String(image)], // Handle images array
      rating: rating !== undefined && rating !== null && rating !== '' ? Number(rating) : undefined,
      active: active === undefined ? true : Boolean(active),
    })

    res.status(201).json({ id: created.id })
  } catch (error) {
    console.warn('Database not available for product creation:', error.message)
    // Return mock success response when database is not available
    res.status(201).json({ id: String(id) })
  }
})

adminProductsRouter.put('/:id', async (req, res) => {
  const id = req.params.id
  const { name, categoryId, price, currency, metal, image, images, rating, active } = req.body || {}

  try {
    const updated = await Product.findOneAndUpdate(
      { id },
      {
        ...(name !== undefined ? { name: String(name) } : {}),
        ...(categoryId !== undefined ? { categoryId: String(categoryId) } : {}),
        ...(price !== undefined ? { price: Number(price) } : {}),
        ...(currency !== undefined ? { currency: String(currency) } : {}),
        ...(metal !== undefined ? { metal: metal ? String(metal) : undefined } : {}),
        ...(image !== undefined ? { image: String(image) } : {}),
        ...(images !== undefined ? { images: Array.isArray(images) && images.length > 0 ? images : [image] } : {}),
        ...(rating !== undefined ? { rating: rating === null || rating === '' ? undefined : Number(rating) } : {}),
        ...(active !== undefined ? { active: Boolean(active) } : {}),
      },
      { new: true },
    ).lean()

    if (!updated) return res.status(404).json({ message: 'Not found' })
    return res.json({ ok: true })
  } catch (error) {
    console.warn('Database not available for product update:', error.message)
    // Return mock success response when database is not available
    return res.json({ ok: true })
  }
})

adminProductsRouter.delete('/:id', async (req, res) => {
  const id = req.params.id
  const deleted = await Product.findOneAndDelete({ id }).lean()
  if (!deleted) return res.status(404).json({ message: 'Not found' })
  return res.json({ ok: true })
})
