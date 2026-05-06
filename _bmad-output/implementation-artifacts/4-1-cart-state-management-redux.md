# Story 4.1: Cart State Management (Redux)

**Status:** done
**Epic:** 4 — Shopping Cart
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Redux cartSlice that persists to localStorage and merges on login,
so that cart state is consistent for both guest and authenticated users.

## Acceptance Criteria

**AC1 — Cart slice structure:**
Given the Redux store is initialized
When `cartSlice` is configured
Then it manages `items: [{ productId, name, price, image, quantity, stockQuantity }]`
And `totalItems` and `totalPrice` are derived from items

**AC2 — localStorage persistence:**
Given any cart action is dispatched
When the state changes
Then the updated cart is synced to `localStorage` under the key `cart`
And on app init, cart is rehydrated from `localStorage`

**AC3 — Cart merge on login:**
Given a guest user has items in their cart
When they log in
Then guest cart items are merged with any existing cart state
And guest item quantities take precedence

**AC4 — Cart clear on logout:**
Given a user logs out
When the logout action is dispatched
Then the cart is cleared from both Redux state and `localStorage`

## Tasks

- [x] `frontend/src/store/slices/cartSlice.ts` — cart slice with all actions
- [x] `frontend/src/store/index.ts` — store subscriber for localStorage sync
- [x] `frontend/src/store/hooks.ts` — typed `useAppDispatch` and `useAppSelector`

## Dev Notes

### Architecture references
- localStorage key: `cart`
- Cart item shape: `{ productId, name, price, image, quantity, stockQuantity }`
- Merge strategy: if same productId exists, keep guest quantity (don't double-count)
- Store subscriber: `store.subscribe(() => localStorage.setItem('cart', JSON.stringify(store.getState().cart)))`

### Key files
- `frontend/src/store/slices/cartSlice.ts` — `addToCart`, `updateQuantity`, `removeFromCart`, `clearCart`, `mergeCart`
- `frontend/src/store/index.ts` — root reducer, store config, localStorage subscriber

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ cartSlice with addToCart, updateQuantity, removeFromCart, clearCart actions
- ✅ localStorage persistence via store subscriber
- ✅ Cart rehydration on app init
- ✅ mergeCart action for login flow
- ✅ Typed hooks for useAppDispatch and useAppSelector

### File List
- `frontend/src/store/slices/cartSlice.ts`
- `frontend/src/store/index.ts`
- `frontend/src/store/hooks.ts`
