# Story 11.5: E2E Tests — Critical Purchase Flow

**Status:** backlog
**Epic:** 11 — Test Coverage (TEA Module)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want end-to-end tests for the critical purchase flow,
so that the entire user journey from browsing to order confirmation is verified.

## Acceptance Criteria

**AC1 — Guest purchase flow:**
Given the app is running in test mode
When the E2E test runs
Then a guest user can: browse products → add to cart → proceed to checkout → register/login → complete payment → view order confirmation
And the test verifies each step completes successfully

**AC2 — Authenticated purchase flow:**
Given a logged-in user
When the E2E test runs
Then the user can: browse products → add to cart → proceed to checkout → complete payment → view order confirmation
And the test verifies the order appears in order history

**AC3 — Admin order management flow:**
Given an admin user
When the E2E test runs
Then the admin can: view dashboard → see new order → view order detail → update status to shipped → verify email sent (mock)

**AC4 — Test environment:**
Given E2E tests run
When the test suite starts
Then a test database is seeded with products and users
And Stripe is mocked to avoid real charges
And email sending is mocked

## Tasks

- [ ] `e2e/tests/purchase-flow.spec.ts` — guest and authenticated purchase flow
- [ ] `e2e/tests/admin-order-management.spec.ts` — admin order management flow
- [ ] `e2e/setup.ts` — E2E test setup (seed DB, start servers, configure Playwright)

## Dev Notes

### Architecture references
- E2E framework: Playwright (recommended) or Cypress
- Test DB: separate test MongoDB instance, seeded before each test suite
- Stripe mock: use Stripe test mode with test card `4242 4242 4242 4242`
- Servers: start backend and frontend dev servers before E2E tests, tear down after
- Selectors: use `data-testid` attributes for stable selectors

### Key files
- `e2e/tests/purchase-flow.spec.ts` — main purchase flow
- `e2e/tests/admin-order-management.spec.ts` — admin flow
- `e2e/setup.ts` — test environment setup

## Dev Agent Record

### Agent Model Used
(not yet assigned)

### Completion Notes
(pending implementation)

### File List
(pending implementation)
