import axios from 'axios'

const tokenKey = 'auth_token'

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || ''
}

export const apiClient = axios.create({
  baseURL: '', // Use relative URL so Vite proxy can handle it
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  if (token) {
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
