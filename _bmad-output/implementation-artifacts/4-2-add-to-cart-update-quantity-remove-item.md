# Story 4.2: Add to Cart, Update Quantity, Remove Item

**Status:** done
**Epic:** 4 — Shopping Cart
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to add products to my cart, change quantities, and remove items,
so that I can manage what I intend to purchase.

## Acceptance Criteria

**AC1 — Add to cart:**
Given I am on a product detail page
When I click "Add to Cart"
Then the product is added to `cartSlice` with quantity 1
And if the product is already in the cart, the quantity increments by 1
And quantity cannot exceed `stockQuantity`
And a toast notification confirms the item was added

**AC2 — Update quantity:**
Given I am on the cart page
When I change the quantity input for an item
Then `cartSlice` updates the quantity for that item
And setting quantity to 0 removes the item from the cart
And quantity cannot exceed `stockQuantity`

**AC3 — Remove item:**
Given I click "Remove" on a cart item
When the action is dispatched
Then the item is removed from `cartSlice` and `localStorage`

## Tasks

- [x] `frontend/src/features/cart/CartItemRow.tsx` — cart item row with quantity controls
- [x] `frontend/src/store/slices/cartSlice.ts` — `addToCart`, `updateQuantity`, `removeFromCart` actions
- [x] `frontend/src/components/ui/Toast.tsx` — toast notification component

## Dev Notes

### Architecture references
- Stock guard: `Math.min(quantity + 1, stockQuantity)` when adding
- Toast: dispatch `showToast({ message, type })` to `uiSlice`
- Quantity input: controlled input with min=1, max=stockQuantity

### Key files
- `frontend/src/store/slices/cartSlice.ts` — cart actions
- `frontend/src/store/slices/uiSlice.ts` — toast actions
- `frontend/src/features/cart/CartItemRow.tsx` — quantity controls UI

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ addToCart increments quantity if item already in cart
- ✅ Quantity capped at stockQuantity
- ✅ Toast notification on add-to-cart success
- ✅ CartItemRow with increment/decrement buttons and remove button
- ✅ Setting quantity to 0 removes item

### File List
- `frontend/src/features/cart/CartItemRow.tsx`
- `frontend/src/store/slices/cartSlice.ts`
- `frontend/src/components/ui/Toast.tsx`
