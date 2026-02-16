import axios from 'axios'

const tokenKey = 'admin_token'

export function getAdminToken() {
  return localStorage.getItem(tokenKey) || ''
}

export function setAdminToken(token: string) {
  localStorage.setItem(tokenKey, token)
}

export function clearAdminToken() {
  localStorage.removeItem(tokenKey)
}

function normalizeBaseUrl(raw: string) {
  const trimmed = (raw || '').trim()
  if (!trimmed) return ''
  return trimmed.replace(/\/+$/, '').replace(/\/api$/, '')
}

export const adminApiClient = axios.create({
  baseURL: import.meta.env.PROD ? normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || '') : '',
  headers: {
    'Content-Type': 'application/json',
  },
})

adminApiClient.interceptors.request.use((config) => {
  const token = getAdminToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
