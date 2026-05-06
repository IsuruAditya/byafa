import { describe, it, expect, beforeEach } from 'vitest'
import { createTestStore } from '../../../test/utils'
import {
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart,
  mergeCart,
} from '../cartSlice'
import type { CartItem } from '../cartSlice'

const item: CartItem = {
  productId: 'p1',
  name: 'Widget',
  price: 10.00,
  image: '',
  quantity: 1,
  stockQuantity: 5,
}

function getItems(store: ReturnType<typeof createTestStore>) {
  return store.getState().cart.items
}

describe('cartSlice', () => {
  let store: ReturnType<typeof createTestStore>

  beforeEach(() => {
    store = createTestStore()
    localStorage.clear()
  })

  // ── addToCart ───────────────────────────────────────────────────────────────

  describe('addToCart', () => {
    it('adds a new item with quantity 1', () => {
      store.dispatch(addToCart(item))
      expect(getItems(store)).toHaveLength(1)
      expect(getItems(store)[0]!.quantity).toBe(1)
    })

    it('increments quantity when item already in cart', () => {
      store.dispatch(addToCart(item))
      store.dispatch(addToCart(item))
      expect(getItems(store)).toHaveLength(1)
      expect(getItems(store)[0]!.quantity).toBe(2)
    })

    it('does not exceed stockQuantity', () => {
      // Add 5 times to an item with stockQuantity=5
      for (let i = 0; i < 7; i++) {
        store.dispatch(addToCart(item))
      }
      expect(getItems(store)[0]!.quantity).toBe(5)
    })

    it('persists to localStorage', () => {
      store.dispatch(addToCart(item))
      const stored = JSON.parse(localStorage.getItem('cart') ?? '[]') as CartItem[]
      expect(stored).toHaveLength(1)
    })
  })

  // ── updateQuantity ──────────────────────────────────────────────────────────

  describe('updateQuantity', () => {
    beforeEach(() => {
      store.dispatch(addToCart(item))
    })

    it('updates the quantity', () => {
      store.dispatch(updateQuantity({ productId: 'p1', quantity: 3 }))
      expect(getItems(store)[0]!.quantity).toBe(3)
    })

    it('removes item when quantity set to 0', () => {
      store.dispatch(updateQuantity({ productId: 'p1', quantity: 0 }))
      expect(getItems(store)).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      store.dispatch(updateQuantity({ productId: 'p1', quantity: -1 }))
      expect(getItems(store)).toHaveLength(0)
    })

    it('caps quantity at stockQuantity', () => {
      store.dispatch(updateQuantity({ productId: 'p1', quantity: 99 }))
      expect(getItems(store)[0]!.quantity).toBe(5) // stockQuantity is 5
    })
  })

  // ── removeFromCart ──────────────────────────────────────────────────────────

  describe('removeFromCart', () => {
    it('removes the item', () => {
      store.dispatch(addToCart(item))
      store.dispatch(removeFromCart('p1'))
      expect(getItems(store)).toHaveLength(0)
    })

    it('only removes the targeted item', () => {
      const item2: CartItem = { ...item, productId: 'p2', name: 'Gadget' }
      store.dispatch(addToCart(item))
      store.dispatch(addToCart(item2))
      store.dispatch(removeFromCart('p1'))
      expect(getItems(store)).toHaveLength(1)
      expect(getItems(store)[0]!.productId).toBe('p2')
    })
  })

  // ── clearCart ───────────────────────────────────────────────────────────────

  describe('clearCart', () => {
    it('empties the cart', () => {
      store.dispatch(addToCart(item))
      store.dispatch(clearCart())
      expect(getItems(store)).toHaveLength(0)
    })

    it('removes cart from localStorage', () => {
      store.dispatch(addToCart(item))
      store.dispatch(clearCart())
      expect(localStorage.getItem('cart')).toBeNull()
    })
  })

  // ── mergeCart ───────────────────────────────────────────────────────────────

  describe('mergeCart', () => {
    it('adds server items not already in cart', () => {
      const serverItem: CartItem = { ...item, productId: 'p2', name: 'Server Item' }
      store.dispatch(mergeCart([serverItem]))
      expect(getItems(store)).toHaveLength(1)
      expect(getItems(store)[0]!.productId).toBe('p2')
    })

    it('does not override existing guest cart items', () => {
      store.dispatch(addToCart({ ...item, quantity: 1 }))
      // Server has same item with different quantity — guest takes precedence
      const serverItem: CartItem = { ...item, quantity: 99 }
      store.dispatch(mergeCart([serverItem]))
      expect(getItems(store)[0]!.quantity).toBe(1) // guest quantity preserved
    })
  })
})
