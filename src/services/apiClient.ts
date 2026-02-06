import axios from 'axios'

const tokenKey = 'auth_token'

export function getAuthToken() {
  return localStorage.getItem(tokenKey) || ''
}

export const apiClient = axios.create({
  baseURL: import.meta.env.PROD ? import.meta.env.VITE_API_BASE_URL || '' : '',
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
