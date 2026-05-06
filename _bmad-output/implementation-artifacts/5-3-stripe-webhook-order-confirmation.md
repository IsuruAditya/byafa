# Story 5.3: Stripe Webhook — Order Confirmation

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want an idempotent Stripe webhook handler that creates orders on successful payment,
so that orders are only created after payment is confirmed.

## Acceptance Criteria

**AC1 — Webhook signature verification:**
Given Stripe sends a webhook event
When the handler at `POST /api/v1/webhooks/stripe` receives it
Then the signature is verified using `stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)`
And if verification fails, status 400 is returned

**AC2 — Idempotent order creation:**
Given a `payment_intent.succeeded` event is received
When the handler processes it
Then if an order with this `paymentIntentId` already exists, return 200 without creating a duplicate
And if no order exists, create a new Order document with status `pending`

**AC3 — Stock decrement:**
Given the order is created
When stock is decremented
Then `Product.findByIdAndUpdate(id, { $inc: { stockQuantity: -quantity } })` is used atomically
And stock cannot go below 0

**AC4 — Webhook response time:**
Given the webhook handler is processing
When all operations complete
Then the handler returns 200 to Stripe within 30 seconds

## Tasks

- [x] `backend/src/services/order.service.ts` — `handleStripeWebhook()` function
- [x] `backend/src/api/controllers/order.controller.ts` — `stripeWebhook()` handler
- [x] `backend/src/api/routes/order.routes.ts` — `POST /api/v1/webhooks/stripe` with raw body parser
- [x] `backend/src/app.ts` — raw body parser for webhook route (before JSON middleware)

## Dev Notes

### Architecture references
- Raw body: webhook route must use `express.raw({ type: 'application/json' })` BEFORE the global JSON parser
- Idempotency: check `Order.findOne({ stripePaymentIntentId })` before creating
- Stock decrement: `$inc: { stockQuantity: -quantity }` with `{ new: true }` to get updated doc
- Error handling: catch errors, log them, but still return 200 to Stripe to prevent retries for non-recoverable errors

### Key files
- `backend/src/app.ts` — raw body parser setup for webhook route
- `backend/src/services/order.service.ts` — webhook business logic
- `backend/src/api/routes/order.routes.ts` — webhook route registration

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Stripe webhook signature verification
- ✅ Idempotent order creation (check for existing order first)
- ✅ Atomic stock decrement with $inc
- ✅ Raw body parser configured before JSON middleware
- ✅ Order confirmation email triggered after order creation

### File List
- `backend/src/app.ts`
- `backend/src/services/order.service.ts`
- `backend/src/api/controllers/order.controller.ts`
- `backend/src/api/routes/order.routes.ts`
