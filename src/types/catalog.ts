export type Category = {
  id: string
  name: string
  image: string
}

export type Product = {
  id: string
  name: string
  categoryId: string
  price: number
  currency: 'INR' | 'USD' | 'EUR'
  metal?: string
  image: string // Keep for backward compatibility
  images?: string[] // New field for multiple images
  rating?: number
}

export type CatalogResponse = {
  categories: Category[]
  products: Product[]
}
