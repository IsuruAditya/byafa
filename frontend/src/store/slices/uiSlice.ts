import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
}

interface UiState {
  toasts: Toast[]
  isCartOpen: boolean
  isMobileMenuOpen: boolean
}

const initialState: UiState = {
  toasts: [],
  isCartOpen: false,
  isMobileMenuOpen: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast(
      state,
      action: PayloadAction<{ message: string; type: ToastType }>
    ) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      state.toasts.push({ id, ...action.payload })
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload)
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.isCartOpen = action.payload
    },
    setMobileMenuOpen(state, action: PayloadAction<boolean>) {
      state.isMobileMenuOpen = action.payload
    },
  },
})

export const { addToast, removeToast, setCartOpen, setMobileMenuOpen } =
  uiSlice.actions
export default uiSlice.reducer
