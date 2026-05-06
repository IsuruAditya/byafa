import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stockQuantity: number
}

interface CartState {
  items: CartItem[]
}

const initialState: CartState = {
  items: [],
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const existing = state.items.find(
        (i) => i.productId === action.payload.productId
      )
      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + 1,
          action.payload.stockQuantity
        )
      } else {
        state.items.push({ ...action.payload, quantity: 1 })
      }
    },
    updateQuantity(
      state,
      action: PayloadAction<{ productId: string; quantity: number }>
    ) {
      const { productId, quantity } = action.payload
      if (quantity <= 0) {
        state.items = state.items.filter((i) => i.productId !== productId)
      } else {
        const item = state.items.find((i) => i.productId === productId)
        if (item) {
          item.quantity = Math.min(quantity, item.stockQuantity)
        }
      }
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload)
    },
    clearCart(state) {
      state.items = []
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, clearCart } =
  cartSlice.actions
export default cartSlice.reducer
