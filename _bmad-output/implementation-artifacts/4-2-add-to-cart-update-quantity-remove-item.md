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
Given I click "Add to Cart" on a product detail page
Then the product is added to cartSlice with quantity 1
And if already in cart, quantity increments by 1 (capped at stockQuantity)
And a success toast fires: "{product.name} added to cart"

**AC2 — Update quantity:**
Given I change the quantity input on the cart page
Then cartSlice updates the quantity for that item
And setting quantity to 0 removes the item

**AC3 — Remove item:**
Given I click "Remove" on a cart item
Then the item is removed from cartSlice and localStorage

**AC4 — Max quantity guard:**
Given the item quantity equals stockQuantity
Then "Add to Cart" shows "Max quantity in cart" and is disabled

## Tasks

- [x] `frontend/src/features/products/ProductDetailPage.tsx` — Add to Cart button + handler
- [x] `frontend/src/features/cart/CartItemRow.tsx` — quantity controls + remove button
- [x] `frontend/src/store/slices/cartSlice.ts` — addToCart, updateQuantity, removeFromCart

## Dev Notes

### Add to cart handler (ProductDetailPage)
```ts
dispatch(addToCart({ productId, name, price, image, quantity: 1, stockQuantity: stock }))
dispatch(addToast({ message: `${product.name} added to cart`, type: 'success' }))
await refresh() // re-fetch stock from server
```

### CartItemRow quantity controls
- Decrement button: `dispatch(updateQuantity({ productId, quantity: item.quantity - 1 }))`
- Setting to 0 triggers removal via the `updateQuantity` reducer logic
- Increment disabled when `item.quantity >= item.stockQuantity`

### canAddMore check (ProductDetailPage)
```ts
const cartQuantity = useAppSelector(s => s.cart.items.find(i => i.productId === id)?.quantity ?? 0)
const canAddMore = stock > cartQuantity
```

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Add to Cart with stock refresh after dispatch
- ✅ CartItemRow with +/- controls, remove button
- ✅ Max quantity guard on Add to Cart button
- ✅ Toast notification on add

### File List
- `frontend/src/features/products/ProductDetailPage.tsx`
- `frontend/src/features/cart/CartItemRow.tsx`
- `frontend/src/store/slices/cartSlice.ts`
