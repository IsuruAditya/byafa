# Story 5.1: Order and Stripe Models

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want Order and RefreshToken Mongoose models with all required fields,
so that orders and payment data can be stored and queried.

## Acceptance Criteria

**AC1 — Order schema:**
Given the Order model is defined
Then it includes: `userId`, `items[]`, `shippingAddress`, `totalAmount`, `status`, `stripePaymentIntentId`, `stripeChargeId`, `createdAt`, `updatedAt`
And `status` is an enum: `pending | processing | shipped | delivered | cancelled`
And `stripePaymentIntentId` has a unique index (idempotency guard)
And `items` validates `length > 0`
And `timestamps: true` is set

**AC2 — Order indexes:**
Then indexes exist on:
- `{ userId: 1, createdAt: -1 }` — customer order history
- `{ status: 1, createdAt: -1 }` — admin order management
- `{ createdAt: -1 }` — recent orders polling

**AC3 — Sub-document schemas:**
Then `IOrderItem` has: `productId`, `name`, `price`, `quantity`, `image`
And `IShippingAddress` has: `fullName`, `addressLine1`, `addressLine2?`, `city`, `state`, `postalCode`, `country`
And both use `{ _id: false }` (no sub-document IDs needed)

## Tasks

- [x] `backend/src/models/Order.model.ts` — full schema with sub-documents and indexes

## Dev Notes

### OrderStatus type
```ts
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
```
Exported from model file — used in services and controllers.

### stripePaymentIntentId unique index
This is the idempotency mechanism. If Stripe delivers the same webhook twice,
the second `Order.create()` will throw a duplicate key error (code 11000),
which the webhook handler catches and ignores (returns 200 to Stripe).

### price snapshot
`items[].price` stores the price at time of order — never recalculated from current product price.
This is critical for order history accuracy.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Order model with all fields, sub-document schemas, indexes
- ✅ `stripePaymentIntentId` unique index for webhook idempotency
- ✅ `items` array validator: `v.length > 0`
- ✅ `OrderStatus` type exported

### File List
- `backend/src/models/Order.model.ts`
