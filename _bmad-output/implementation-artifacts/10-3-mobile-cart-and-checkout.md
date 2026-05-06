# Story 10.3: Mobile Cart and Checkout

**Status:** done
**Epic:** 10 — Mobile App (React Native + Expo)
**Project context:** `_bmad-output/project-context.md`

## Story

As a mobile customer,
I want to manage my cart and complete checkout on my phone,
so that I can purchase products from the mobile app.

## Acceptance Criteria

**AC1 — Cart screen:**
Given I am on the Cart tab
When the screen loads
Then all cart items are displayed with image, name, price, and quantity controls
And the order subtotal is shown
And an empty cart shows a message and a link to the products tab

**AC2 — Checkout:**
Given I tap "Proceed to Checkout"
When the checkout screen loads
Then I see a shipping address form
And I can enter card details via Stripe's mobile SDK
And submitting the form creates a payment intent and processes the payment

**AC3 — Cart persistence:**
Given I add items to my cart
When I close and reopen the app
Then my cart items are still present (persisted via Redux Persist + AsyncStorage)

## Tasks

- [x] `mobile/src/screens/cart/CartScreen.tsx` — cart screen
- [x] `mobile/src/screens/checkout/CheckoutScreen.tsx` — checkout screen
- [x] `mobile/src/store/slices/cartSlice.ts` — cart state with persistence
- [x] `mobile/src/api/ordersApi.ts` — orders API client

## Dev Notes

### Architecture references
- Cart persistence: `redux-persist` with `AsyncStorage` adapter
- Stripe mobile: `@stripe/stripe-react-native` with `PaymentSheet`
- Checkout flow: create payment intent → present PaymentSheet → confirm → navigate to order confirmation
- Quantity controls: `TouchableOpacity` increment/decrement buttons

### Key files
- `mobile/src/screens/cart/CartScreen.tsx` — cart UI
- `mobile/src/screens/checkout/CheckoutScreen.tsx` — checkout with Stripe
- `mobile/src/store/slices/cartSlice.ts` — persisted cart

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ CartScreen with item list, quantity controls, subtotal
- ✅ Empty cart state
- ✅ CheckoutScreen with shipping form and Stripe PaymentSheet
- ✅ Cart persisted via redux-persist + AsyncStorage

### File List
- `mobile/src/screens/cart/CartScreen.tsx`
- `mobile/src/screens/checkout/CheckoutScreen.tsx`
- `mobile/src/store/slices/cartSlice.ts`
- `mobile/src/api/ordersApi.ts`
