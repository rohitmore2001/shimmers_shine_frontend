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
  image: string
  rating?: number
}

export type CatalogResponse = {
  categories: Category[]
  products: Product[]
}
