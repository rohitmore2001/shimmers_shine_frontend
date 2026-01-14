import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export const selectCartLines = (state: RootState) => state.cart.lines

export const selectCartCount = createSelector([selectCartLines], (lines) =>
  lines.reduce((sum, l) => sum + l.quantity, 0),
)
