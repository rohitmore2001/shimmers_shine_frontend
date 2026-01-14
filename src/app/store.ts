import { configureStore } from '@reduxjs/toolkit'
import catalogReducer from '../features/catalog/catalogSlice'
import cartReducer from '../features/cart/cartSlice'
import authReducer from '../features/auth/authSlice'

export const store = configureStore({
  reducer: {
    catalog: catalogReducer,
    cart: cartReducer,
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
