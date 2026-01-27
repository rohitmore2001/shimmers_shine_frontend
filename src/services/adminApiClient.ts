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

export const adminApiClient = axios.create({
  baseURL: '', // Use relative URL so Vite proxy can handle it
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
