import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { AuthUser, LoginPayload } from '../../services/authService'
import { login as loginApi, logout as logoutApi } from '../../services/authService'

export type AuthState = {
  status: 'idle' | 'loading' | 'authenticated' | 'failed'
  token?: string
  user?: AuthUser
  error?: string
}

const tokenFromStorage = localStorage.getItem('auth_token') || undefined
const userFromStorage = localStorage.getItem('auth_user')

const initialState: AuthState = {
  status: tokenFromStorage ? 'authenticated' : 'idle',
  token: tokenFromStorage,
  user: userFromStorage ? (JSON.parse(userFromStorage) as AuthUser) : undefined,
}

export const login = createAsyncThunk('auth/login', async (payload: LoginPayload) => {
  return await loginApi(payload)
})

export const logout = createAsyncThunk('auth/logout', async () => {
  await logoutApi()
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action: PayloadAction<{ token: string; user: AuthUser }>) {
      state.token = action.payload.token
      state.user = action.payload.user
      state.status = 'authenticated'
      state.error = undefined
      localStorage.setItem('auth_token', action.payload.token)
      localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = undefined
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'authenticated'
        state.token = action.payload.token
        state.user = action.payload.user
        localStorage.setItem('auth_token', action.payload.token)
        localStorage.setItem('auth_user', JSON.stringify(action.payload.user))
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Login failed'
      })
      .addCase(logout.fulfilled, (state) => {
        state.status = 'idle'
        state.token = undefined
        state.user = undefined
        state.error = undefined
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      })
  },
})

export const { setAuth } = authSlice.actions
export default authSlice.reducer
