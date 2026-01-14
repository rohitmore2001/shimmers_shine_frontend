import { apiClient } from './apiClient'
import type { CatalogResponse } from '../types/catalog'

export async function fetchCatalog(): Promise<CatalogResponse> {
  const { data } = await apiClient.get<CatalogResponse>('/api/catalog')
  return data
}
