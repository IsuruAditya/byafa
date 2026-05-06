# Story 5.1: Order and Stripe Models

**Status:** done
**Epic:** 5 — Checkout & Payment
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want Order and RefreshToken Mongoose models with all required fields,
so that orders and payment data can be stored and queried.

## Acceptance Criteria

**AC1 — Order model:**
Given the backend is running
When the Order model is defined
Then it includes: `userId`, `items` (array of `{ productId, name, price, quantity }`), `shippingAddress`, `totalAmount`, `status` (enum: `pending|processing|shipped|delivered|cancelled`), `stripePaymentIntentId`, `stripeChargeId`, `createdAt`, `updatedAt`
And MongoDB indexes exist on `userId`, `status`, and `createdAt`
And `timestamps: true` is set on the schema

**AC2 — RefreshToken model:**
Given the backend is running
When the RefreshToken model is defined
Then it stores `userId`, `token` (SHA-256 hashed), `expiresAt`
And a TTL index on `expiresAt` auto-deletes expired tokens

## Tasks

- [x] `backend/src/models/Order.model.ts` — Order schema with all fields and indexes
- [x] `backend/src/models/RefreshToken.model.ts` — RefreshToken schema with TTL index

## Dev Notes

### Architecture references
- Order status enum: `['pending', 'processing', 'shipped', 'delivered', 'cancelled']`
- Shipping address sub-document: `{ fullName, addressLine1, city, state, postalCode, country }`
- Order item sub-document: `{ productId, name, price, quantity, image }`
- RefreshToken: store SHA-256 hash of raw token, compare hash on refresh
- TTL index: `{ expiresAt: 1 }` with `expireAfterSeconds: 0`

### Key files
- `backend/src/models/Order.model.ts` — Order schema
- `backend/src/models/RefreshToken.model.ts` — RefreshToken schema

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Order model with all required fields, status enum, compound indexes
- ✅ Shipping address as embedded sub-document
- ✅ RefreshToken model with TTL index for automatic expiry cleanup
- ✅ Both models use `timestamps: true`

### File List
- `backend/src/models/Order.model.ts`
- `backend/src/models/RefreshToken.model.ts`
