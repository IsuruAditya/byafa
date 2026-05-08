# Story 4.1: Cart State Management (Redux)

**Status:** done
**Epic:** 4 — Shopping Cart
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Redux cartSlice that persists to localStorage and merges on login,
so that cart state is consistent for both guest and authenticated users.

## Acceptance Criteria

**AC1 — Cart shape:**
`cartSlice` manages `items: CartItem[]` where each item has:
`{ productId, name, price, image, quantity, stockQuantity }`

**AC2 — localStorage persistence:**
Every state change syncs to `localStorage` key `'cart'` via `saveCartToStorage()`
On app init, cart is rehydrated from `localStorage` in `initialState`

**AC3 — Merge on login:**
`mergeCart(serverItems)` action merges server items into guest cart
Guest quantities take precedence — server items only added if not already in cart

**AC4 — Clear on logout:**
`clearCart()` removes items from state and `localStorage.removeItem('cart')`

**AC5 — Quantity bounds:**
`addToCart` caps quantity at `stockQuantity`
`updateQuantity` with quantity ≤ 0 removes the item

## Tasks

- [x] `frontend/src/store/slices/cartSlice.ts` — full slice with all actions
- [x] `frontend/src/store/index.ts` — registers cartReducer

## Dev Notes

### localStorage sync pattern
Each reducer calls `saveCartToStorage(state.items)` at the end — not a middleware.
This is simpler than redux-persist for this use case.

```ts
function saveCartToStorage(items: CartItem[]): void {
  localStorage.setItem('cart', JSON.stringify(items))
}
function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem('cart')
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}
const initialState: CartState = { items: loadCartFromStorage() }
```

### mergeCart action
Used when user logs in — guest cart already in Redux, server cart passed as payload.
Only adds server items that don't already exist in guest cart (no quantity override).

### Mobile cart
Mobile `cartSlice` is identical but WITHOUT localStorage persistence — in-memory only.
Cart clears on app restart on mobile (acceptable for MVP).

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ cartSlice with addToCart, updateQuantity, removeFromCart, mergeCart, clearCart
- ✅ localStorage rehydration in initialState
- ✅ saveCartToStorage called in every mutating reducer
- ✅ Quantity capped at stockQuantity in addToCart and updateQuantity

### File List
- `frontend/src/store/slices/cartSlice.ts`
- `frontend/src/store/index.ts`
