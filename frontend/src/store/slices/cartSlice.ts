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

const CART_STORAGE_KEY = 'cart'

function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as CartItem[]) : []
  } catch {
    return []
  }
}

function saveCartToStorage(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

const initialState: CartState = {
  items: loadCartFromStorage(),
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
      saveCartToStorage(state.items)
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
      saveCartToStorage(state.items)
    },
    removeFromCart(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.productId !== action.payload)
      saveCartToStorage(state.items)
    },
    // Merge guest cart into authenticated cart — guest quantities take precedence
    mergeCart(state, action: PayloadAction<CartItem[]>) {
      const serverItems = action.payload
      for (const serverItem of serverItems) {
        const exists = state.items.find(
          (i) => i.productId === serverItem.productId
        )
        if (!exists) {
          state.items.push(serverItem)
        }
        // If already in guest cart, keep guest quantity (no override)
      }
      saveCartToStorage(state.items)
    },
    clearCart(state) {
      state.items = []
      localStorage.removeItem(CART_STORAGE_KEY)
    },
  },
})

export const { addToCart, updateQuantity, removeFromCart, mergeCart, clearCart } =
  cartSlice.actions
export default cartSlice.reducer
