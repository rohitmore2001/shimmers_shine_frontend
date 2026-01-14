import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectCategories = (state: RootState) => state.catalog.categories
export const selectProducts = (state: RootState) => state.catalog.products
export const selectCatalogStatus = (state: RootState) => state.catalog.status

export const selectProductsByCategory = (categoryId?: string) =>
  createSelector([selectProducts], (products) => {
    if (!categoryId) return products
    return products.filter((p) => p.categoryId === categoryId)
  })
