# Story 11.2: Backend Unit Tests — Auth and Order Services

**Status:** backlog
**Epic:** 11 — Test Coverage (TEA Module)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want unit tests for the auth and order services,
so that critical business logic is verified and regressions are caught early.

## Acceptance Criteria

**AC1 — Auth service tests:**
Given the auth service
When unit tests run
Then `registerUser()` is tested for: happy path, duplicate email (409), password hashing
And `loginUser()` is tested for: valid credentials, invalid password (401), non-existent email (401)
And `refreshToken()` is tested for: valid token, expired token, invalid token
And `deleteAccount()` is tested for: successful deletion, token cleanup

**AC2 — Order service tests:**
Given the order service
When unit tests run
Then `createPaymentIntent()` is tested for: stock validation pass, stock validation fail (409)
And `handleStripeWebhook()` is tested for: idempotency (duplicate event), stock decrement, order creation
And `getUserOrders()` is tested for: returns only the requesting user's orders

**AC3 — Coverage:**
Given all auth and order service tests pass
When coverage is measured
Then line coverage for `auth.service.ts` and `order.service.ts` is >= 80%

## Tasks

- [ ] `backend/src/services/__tests__/auth.service.test.ts` — auth service unit tests
- [ ] `backend/src/services/__tests__/order.service.test.ts` — order service unit tests

## Dev Notes

### Architecture references
- Mock MongoDB: use `mongodb-memory-server` for isolated DB per test suite
- Mock Stripe: `vi.mock('../stripe.service')` to avoid real Stripe calls
- Mock email: `vi.mock('../email.service')` to avoid real email sends
- Test data: use factory functions to create test users, products, orders

### Key files
- `backend/src/services/__tests__/auth.service.test.ts`
- `backend/src/services/__tests__/order.service.test.ts`

## Dev Agent Record

### Agent Model Used
(not yet assigned)

### Completion Notes
(pending implementation)

### File List
(pending implementation)
