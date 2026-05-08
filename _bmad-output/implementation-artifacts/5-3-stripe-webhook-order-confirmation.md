# Story 5.3: Stripe Webhook — Order Confirmation

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want an idempotent Stripe webhook handler that creates orders on successful payment,
so that orders are only created after payment is confirmed.

## Acceptance Criteria

**AC1 — Signature verification:**
Given Stripe sends a webhook to `POST /api/v1/webhooks/stripe`
Then the raw request body is used (not parsed JSON)
And `stripe.webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET)` verifies the signature
And invalid signatures return 400

**AC2 — Order creation:**
Given a `payment_intent.succeeded` event is received
Then `createOrderFromWebhook()` is called with `paymentIntentId`, `chargeId`, and `metadata`
And if an order with this `paymentIntentId` already exists, it is returned without creating a duplicate
And stock is decremented atomically using a MongoDB session + `findOneAndUpdate` with `$gte` guard
And the order is created with `status: 'processing'`

**AC3 — Atomic stock decrement:**
Given two concurrent checkouts for the same product
Then only one succeeds — the other gets a 409 from the `$gte` guard
And the MongoDB session ensures both operations (stock decrement + order create) are atomic

**AC4 — Always return 200:**
Given any error occurs during order processing
Then the webhook handler still returns 200 to Stripe (prevents infinite retries)
And the error is logged

**AC5 — Raw body requirement:**
The webhook route MUST be registered BEFORE `express.json()` in `app.ts`
Using `raw({ type: 'application/json' })` per-route middleware

## Tasks

- [x] `backend/src/api/routes/webhook.routes.ts` — raw body, sig verification, event handling
- [x] `backend/src/services/order.service.ts` — `createOrderFromWebhook()`
- [x] `backend/src/app.ts` — webhook route registered before express.json()

## Dev Notes

### Webhook route registration order (CRITICAL)
```ts
// app.ts — MUST be in this order:
app.use('/api/v1/webhooks', webhookRouter)  // raw body
app.use(express.json())                      // parsed body for everything else
```
If `express.json()` runs first, `req.body` is a parsed object and Stripe sig verification fails.

### createOrderFromWebhook idempotency
```ts
const existing = await Order.findOne({ stripePaymentIntentId: paymentIntentId })
if (existing) return existing  // duplicate webhook — return early
```

### MongoDB session for atomic operations
```ts
const session = await mongoose.startSession()
await session.withTransaction(async () => {
  for (const item of items) {
    const result = await Product.findOneAndUpdate(
      { _id: item.productId, stockQuantity: { $gte: item.quantity } },
      { $inc: { stockQuantity: -item.quantity } },
      { session, new: true }
    )
    if (!result) throw new AppError(`Stock no longer available for ${item.productId}`, 409)
  }
  await Order.create([{ ...orderData }], { session })
})
await session.endSession()
```

### Email fire-and-forget
```ts
User.findById(userId).then(user => {
  if (!user) return
  return sendOrderConfirmationEmail(user.email, user.name, order)
}).catch(err => console.error('Email failed:', err))
```
Email failure must NOT cause the webhook to return non-200.

### Dev webhook testing
Use Stripe CLI: `stripe listen --forward-to localhost:5000/api/v1/webhooks/stripe`
Set `STRIPE_WEBHOOK_SECRET` to the CLI-provided `whsec_...` value.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Raw body middleware per-route, before express.json() in app.ts
- ✅ Signature verification with dev bypass when secret is placeholder
- ✅ `createOrderFromWebhook()` — idempotency check, MongoDB session, atomic stock decrement
- ✅ Email sent fire-and-forget after order creation
- ✅ Always returns 200 to Stripe even on processing errors

### File List
- `backend/src/api/routes/webhook.routes.ts`
- `backend/src/services/order.service.ts` (createOrderFromWebhook)
- `backend/src/app.ts` (route registration order)
