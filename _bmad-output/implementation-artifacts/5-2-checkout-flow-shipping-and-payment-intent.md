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
Given I am authenticated and navigate to `/checkout`
Then I see a 2-step progress indicator: Shipping → Payment
And Step 1 shows a shipping address form

**AC2 — Payment intent creation:**
Given I submit a valid shipping address
When `POST /api/v1/orders/create-payment-intent` is called
Then the backend validates stock for all cart items
And if stock is insufficient, returns 409 with the affected product name
And if stock is available, creates a Stripe Payment Intent
And returns `{ clientSecret, totalAmount }`

**AC3 — Price integrity:**
Then `totalAmount` is always calculated from DB prices — never from client-submitted prices

**AC4 — Stripe payment form:**
Given the clientSecret is received
Then Stripe Elements (`<Elements>`) is rendered with the clientSecret
And `StripePaymentForm` uses `useStripe()` + `useElements()` to confirm payment

**AC5 — Payment success:**
Given payment is confirmed by Stripe.js
Then `dispatch(clearCart())` is called
And user is navigated to `/checkout/complete?payment_intent=...`

## Tasks

- [x] `backend/src/services/order.service.ts` — `createPaymentIntent()`
- [x] `backend/src/services/stripe.service.ts` — Stripe singleton
- [x] `backend/src/api/controllers/order.controller.ts` — `createPaymentIntent()`
- [x] `backend/src/api/routes/order.routes.ts` — `POST /create-payment-intent`
- [x] `frontend/src/features/checkout/CheckoutPage.tsx`
- [x] `frontend/src/features/checkout/ShippingForm.tsx`
- [x] `frontend/src/features/checkout/StripePaymentForm.tsx`
- [x] `frontend/src/api/ordersApi.ts` — `createPaymentIntentApi()`

## Dev Notes

### createPaymentIntent service
1. Load all products in one query: `Product.find({ _id: { $in: productIds } })`
2. Validate stock for each item — throw 409 if insufficient
3. Calculate total from DB prices: `Math.round(product.price * 100) * item.quantity`
4. Build `metadata` object with `userId`, `shippingAddress` (JSON), `items` (JSON)
5. `stripe.paymentIntents.create({ amount: totalCents, currency: 'usd', metadata, automatic_payment_methods: { enabled: true } })`

### Metadata pattern
Order data is embedded in Stripe metadata so the webhook handler can reconstruct the order
without a separate DB lookup. This is the standard pattern for Stripe + serverless.

### Stripe singleton
```ts
const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2026-04-22.dahlia' })
export default stripe
```
Single instance reused across invocations.

### CheckoutPage step flow
`step: 'shipping' | 'payment'` state controls which form is shown.
`clientSecret` is set after successful payment intent creation.
`<Elements stripe={stripePromise} options={{ clientSecret }}>` wraps StripePaymentForm.

### stripePromise
```ts
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
```
Defined OUTSIDE the component to avoid re-creating on every render.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `createPaymentIntent()` — stock validation, DB price calculation, metadata embedding
- ✅ Stripe singleton service
- ✅ CheckoutPage — 2-step flow, order summary sidebar
- ✅ ShippingForm — React Hook Form + Zod, all address fields
- ✅ StripePaymentForm — Stripe Elements, payment confirmation
- ✅ 409 on insufficient stock with product name in message

### File List
- `backend/src/services/order.service.ts` (createPaymentIntent)
- `backend/src/services/stripe.service.ts`
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
- `frontend/src/features/checkout/CheckoutPage.tsx`
- `frontend/src/features/checkout/ShippingForm.tsx`
- `frontend/src/features/checkout/StripePaymentForm.tsx`
- `frontend/src/api/ordersApi.ts`
