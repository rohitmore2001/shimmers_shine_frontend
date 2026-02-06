import path from 'path'
import { fileURLToPath } from 'url'
import { readFile } from 'fs/promises'
import { Category } from '../models/Category.js'
import { Product } from '../models/Product.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export async function seedFromPublicJsonIfEmpty() {
  try {
    const categoryCount = await Category.countDocuments()
    const productCount = await Product.countDocuments()

    if (categoryCount > 0 || productCount > 0) return

    const catalogPath = path.resolve(__dirname, '../../../public/data/products.json')
    const raw = await readFile(catalogPath, 'utf-8')
    const parsed = JSON.parse(raw)

    const categories = Array.isArray(parsed?.categories) ? parsed.categories : []
    const products = Array.isArray(parsed?.products) ? parsed.products : []

    if (categories.length > 0) {
      await Category.insertMany(
        categories.map((c) => ({
          id: String(c.id),
          name: String(c.name),
          image: String(c.image),
        })),
      )
    }

    if (products.length > 0) {
      await Product.insertMany(
        products.map((p) => ({
          id: String(p.id),
          name: String(p.name),
          categoryId: String(p.categoryId),
          price: Number(p.price),
          currency: String(p.currency || 'INR'),
          metal: p.metal ? String(p.metal) : undefined,
          image: String(p.image),
          rating: p.rating !== undefined ? Number(p.rating) : undefined,
          active: true,
        })),
      )
    }
  } catch (error) {
    console.warn('Database seeding skipped (no connection):', error.message)
  }
}
