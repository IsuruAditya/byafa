# Story 5.2: Checkout Flow — Shipping and Payment Intent

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to enter my shipping details and initiate a Stripe payment,
so that I can complete my purchase securely.

## Acceptance Criteria

**AC1 — Checkout page:**
Given I am authenticated and have items in my cart
When I navigate to the checkout page
Then I see a shipping address form (fullName, addressLine1, city, state, postalCode, country)

**AC2 — Payment intent creation:**
Given I submit the shipping form
When `POST /api/v1/orders/create-payment-intent` is called
Then the backend validates stock availability for all cart items atomically
And if stock is insufficient, a 409 error is returned with the affected product name
And if stock is available, a Stripe Payment Intent is created and `clientSecret` is returned

**AC3 — Stripe Elements:**
Given the `clientSecret` is returned
When the Stripe payment form renders
Then Stripe Elements is displayed for card entry
And the form is styled to match the application theme

**AC4 — Stock validation:**
Given a cart item has insufficient stock
When the payment intent request is processed
Then a 409 response is returned: `{ success: false, message: "Insufficient stock for {productName}" }`

## Tasks

- [x] `backend/src/services/order.service.ts` — `createPaymentIntent()` with stock validation
- [x] `backend/src/api/controllers/order.controller.ts` — `createPaymentIntent()` handler
- [x] `backend/src/api/routes/order.routes.ts` — `POST /api/v1/orders/create-payment-intent`
- [x] `backend/src/services/stripe.service.ts` — Stripe Payment Intent creation
- [x] `frontend/src/features/checkout/CheckoutPage.tsx` — shipping form + Stripe Elements

## Dev Notes

### Architecture references
- Stock check: `Product.findById(id).select('stockQuantity name')` for each cart item
- Atomic stock check: use session/transaction or check-then-create pattern
- Stripe: `stripe.paymentIntents.create({ amount: totalInCents, currency: 'usd', metadata: { userId, cartItems } })`
- Frontend: `@stripe/react-stripe-js` with `Elements` provider and `PaymentElement`

### Key files
- `backend/src/services/stripe.service.ts` — Stripe API wrapper
- `backend/src/services/order.service.ts` — business logic
- `frontend/src/features/checkout/CheckoutPage.tsx` — checkout UI

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Shipping address form with validation
- ✅ Stock validation before creating payment intent
- ✅ Stripe Payment Intent created with cart metadata
- ✅ Stripe Elements integrated for card entry
- ✅ 409 error returned for insufficient stock

### File List
- `backend/src/services/order.service.ts`
- `backend/src/services/stripe.service.ts`
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/features/checkout/CheckoutPage.tsx`
