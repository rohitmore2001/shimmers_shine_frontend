import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Category, Product } from '../../types/catalog'
import { fetchCatalog } from '../../services/catalogService'

export type CatalogState = {
  categories: Category[]
  products: Product[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error?: string
}

const initialState: CatalogState = {
  categories: [],
  products: [],
  status: 'idle',
}

export const loadCatalog = createAsyncThunk('catalog/loadCatalog', async () => {
  return await fetchCatalog()
})

const catalogSlice = createSlice({
  name: 'catalog',
  initialState,
  reducers: {
    setProducts(state, action: PayloadAction<Product[]>) {
      state.products = action.payload
    },
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCatalog.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(loadCatalog.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.categories = action.payload.categories
        state.products = action.payload.products
      })
      .addCase(loadCatalog.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to load catalog'
      })
  },
})

export const { setCategories, setProducts } = catalogSlice.actions
export default catalogSlice.reducer
