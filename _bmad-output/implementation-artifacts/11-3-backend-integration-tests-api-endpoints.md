# Story 11.3: Backend Integration Tests — API Endpoints

**Status:** backlog
**Epic:** 11 — Test Coverage (TEA Module)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want integration tests for the critical API endpoints,
so that the full request-response cycle is verified including middleware and validation.

## Acceptance Criteria

**AC1 — Auth endpoints:**
Given the Express app is running in test mode
When integration tests run
Then `POST /api/v1/auth/register` is tested for: 201 on success, 409 on duplicate email, 400 on validation error
And `POST /api/v1/auth/login` is tested for: 200 on success, 401 on invalid credentials
And `POST /api/v1/auth/logout` is tested for: 200 and cookie cleared
And `POST /api/v1/auth/refresh` is tested for: 200 with new token, 401 on invalid refresh token

**AC2 — Product endpoints:**
Given products exist in the test database
When integration tests run
Then `GET /api/v1/products` is tested for: pagination, search, filter, sort
And `GET /api/v1/products/:id` is tested for: 200 on found, 404 on not found

**AC3 — Admin endpoints:**
Given an admin user is authenticated
When integration tests run
Then `POST /api/v1/admin/products` is tested for: 201 on success, 403 for non-admin
And `PATCH /api/v1/admin/orders/:id/status` is tested for: 200 on success, 403 for non-admin

## Tasks

- [ ] `backend/src/api/__tests__/auth.routes.test.ts` — auth endpoint integration tests
- [ ] `backend/src/api/__tests__/product.routes.test.ts` — product endpoint integration tests
- [ ] `backend/src/api/__tests__/admin.routes.test.ts` — admin endpoint integration tests

## Dev Notes

### Architecture references
- Supertest: `const app = createApp(); const res = await request(app).post('/api/v1/auth/register').send(body)`
- Test DB: `mongodb-memory-server` started in `beforeAll`, cleared between tests
- Auth helper: `loginAs(role)` helper that returns a valid JWT for use in test requests
- Webhook test: use `stripe.webhooks.generateTestHeaderString()` to create valid webhook signatures

### Key files
- `backend/src/api/__tests__/auth.routes.test.ts`
- `backend/src/api/__tests__/product.routes.test.ts`
- `backend/src/api/__tests__/admin.routes.test.ts`

## Dev Agent Record

### Agent Model Used
(not yet assigned)

### Completion Notes
(pending implementation)

### File List
(pending implementation)
