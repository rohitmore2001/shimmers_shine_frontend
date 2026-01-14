export type LoginPayload = {
  email: string
  password: string
}

export type AuthUser = {
  id: string
  name: string
  email: string
}

export type LoginResponse = {
  token: string
  user: AuthUser
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { apiClient } = await import('./apiClient')
  const { data } = await apiClient.post<LoginResponse>('/api/auth/login', payload)
  return data
}

export async function logout(): Promise<void> {
  await new Promise((r) => setTimeout(r, 200))
}
