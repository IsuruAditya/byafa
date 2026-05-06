# Story 4.3: Cart Page

**Status:** done
**Epic:** 4 — Shopping Cart
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to view my cart with a summary and proceed to checkout,
so that I can review my order before paying.

## Acceptance Criteria

**AC1 — Cart items display:**
Given I navigate to the cart page
When the page loads
Then all cart items are displayed with image, name, price, and quantity controls
And the order subtotal is calculated and displayed

**AC2 — Empty cart:**
Given my cart is empty
When I navigate to the cart page
Then a "Your cart is empty" message is shown
And a link to the products page is displayed

**AC3 — Proceed to checkout:**
Given I have items in my cart
When I click "Proceed to Checkout"
Then if I am authenticated, I am taken to the checkout page
And if I am not authenticated, I am redirected to the login page with a return URL

## Tasks

- [x] `frontend/src/features/cart/CartPage.tsx` — cart page component
- [x] `frontend/src/features/cart/CartItemRow.tsx` — individual cart item row

## Dev Notes

### Architecture references
- Subtotal: `items.reduce((sum, item) => sum + item.price * item.quantity, 0)`
- Auth check: use `isAuthenticated` from `authSlice` before navigating to checkout
- Return URL: `navigate('/login?redirect=/checkout')` for unauthenticated users

### Key files
- `frontend/src/features/cart/CartPage.tsx` — main cart view
- `frontend/src/store/slices/cartSlice.ts` — cart state
- `frontend/src/store/slices/authSlice.ts` — auth state for checkout guard

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ CartPage displays all items with CartItemRow components
- ✅ Subtotal calculated and displayed
- ✅ Empty cart state with link to products page
- ✅ Checkout button redirects to login if not authenticated

### File List
- `frontend/src/features/cart/CartPage.tsx`
- `frontend/src/features/cart/CartItemRow.tsx`
