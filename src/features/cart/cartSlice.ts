import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type CartLine = {
  productId: string
  quantity: number
}

export type CartState = {
  lines: CartLine[]
}

const initialState: CartState = {
  lines: [],
}

function upsertLine(lines: CartLine[], productId: string, quantity: number) {
  const idx = lines.findIndex((l) => l.productId === productId)
  if (idx === -1) {
    return [...lines, { productId, quantity }]
  }

  const next = [...lines]
  next[idx] = { productId, quantity }
  return next
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<{ productId: string; quantity?: number }>) {
      const { productId, quantity = 1 } = action.payload
      const current = state.lines.find((l) => l.productId === productId)
      const nextQty = (current?.quantity || 0) + quantity
      state.lines = upsertLine(state.lines, productId, nextQty)
    },
    removeFromCart(state, action: PayloadAction<{ productId: string }>) {
      state.lines = state.lines.filter((l) => l.productId !== action.payload.productId)
    },
    setQuantity(state, action: PayloadAction<{ productId: string; quantity: number }>) {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        state.lines = state.lines.filter((l) => l.productId !== productId)
        return
      }
      state.lines = upsertLine(state.lines, productId, quantity)
    },
    clearCart(state) {
      state.lines = []
    },
  },
})

export const { addToCart, removeFromCart, setQuantity, clearCart } = cartSlice.actions
export default cartSlice.reducer
