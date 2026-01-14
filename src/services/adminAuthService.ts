import { adminApiClient, clearAdminToken, setAdminToken } from './adminApiClient'

export type AdminLoginPayload = {
  email: string
  password: string
}

export type AdminUser = {
  id: string
  name: string
  email: string
}

export type AdminLoginResponse = {
  token: string
  admin: AdminUser
}

const adminUserKey = 'admin_user'

export function getAdminUserFromStorage(): AdminUser | undefined {
  const raw = localStorage.getItem(adminUserKey)
  if (!raw) return undefined
  try {
    return JSON.parse(raw) as AdminUser
  } catch {
    return undefined
  }
}

export async function adminLogin(payload: AdminLoginPayload): Promise<AdminLoginResponse> {
  const { data } = await adminApiClient.post<AdminLoginResponse>('/api/admin/auth/login', payload)
  setAdminToken(data.token)
  localStorage.setItem(adminUserKey, JSON.stringify(data.admin))
  return data
}

export async function adminLogout(): Promise<void> {
  clearAdminToken()
  localStorage.removeItem(adminUserKey)
}
