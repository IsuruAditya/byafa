# Story 4.3: Cart Page

**Status:** done
**Epic:** 4 — Shopping Cart
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to view my cart with a summary and proceed to checkout,
so that I can review my order before paying.

## Acceptance Criteria

**AC1 — Cart items:**
Given I navigate to `/cart`
Then all cart items are displayed with image, name, price, and quantity controls
And the order subtotal is calculated and displayed

**AC2 — Empty state:**
Given the cart is empty
Then a message and a "Browse products" button are shown

**AC3 — Checkout CTA:**
Given I click "Proceed to Checkout"
And I am not authenticated
Then I am redirected to `/login` with `state: { from: { pathname: '/checkout' } }`
And I am authenticated
Then I am navigated to `/checkout`

## Tasks

- [x] `frontend/src/features/cart/CartPage.tsx`
- [x] `frontend/src/features/cart/CartItemRow.tsx`

## Dev Notes

### Checkout redirect for unauthenticated users
```ts
function handleCheckout() {
  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } })
  } else {
    navigate('/checkout')
  }
}
```
`LoginPage` reads `location.state.from.pathname` and redirects back after login.

### Subtotal calculation
```ts
const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
```
Displayed with `formatCurrency(subtotal)`.

### CartItemRow
Renders as a `<li>` inside a `<ul aria-label="Cart items">` for accessibility.
Quantity controls use `dispatch(updateQuantity(...))` directly.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ CartPage with item list, subtotal, checkout CTA
- ✅ Empty state with SVG cart icon and browse link
- ✅ Unauthenticated redirect with `from` state
- ✅ CartItemRow with image, name, price, quantity controls, remove

### File List
- `frontend/src/features/cart/CartPage.tsx`
- `frontend/src/features/cart/CartItemRow.tsx`
