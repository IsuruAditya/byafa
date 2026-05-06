# Story 11.4: Frontend Component Tests

**Status:** backlog
**Epic:** 11 — Test Coverage (TEA Module)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want unit tests for critical frontend components,
so that UI behavior is verified and regressions are caught early.

## Acceptance Criteria

**AC1 — Auth components:**
Given the auth components
When unit tests run
Then `LoginPage` is tested for: form submission, validation errors, redirect on success
And `RegisterPage` is tested for: form submission, duplicate email error, redirect on success

**AC2 — Product components:**
Given the product components
When unit tests run
Then `ProductCard` is tested for: renders product info, navigates to detail on click
And `ProductDetailPage` is tested for: renders product, add to cart, out of stock state
And `ProductsPage` is tested for: search, filter, sort, pagination

**AC3 — Cart components:**
Given the cart components
When unit tests run
Then `CartPage` is tested for: renders items, updates quantity, removes item, empty state
And `CartItemRow` is tested for: increment/decrement quantity, remove button

**AC4 — Coverage:**
Given all component tests pass
When coverage is measured
Then line coverage for tested components is >= 70%

## Tasks

- [ ] `frontend/src/features/auth/__tests__/LoginPage.test.tsx`
- [ ] `frontend/src/features/auth/__tests__/RegisterPage.test.tsx`
- [ ] `frontend/src/features/products/__tests__/ProductCard.test.tsx`
- [ ] `frontend/src/features/products/__tests__/ProductDetailPage.test.tsx`
- [ ] `frontend/src/features/products/__tests__/ProductsPage.test.tsx`
- [ ] `frontend/src/features/cart/__tests__/CartPage.test.tsx`
- [ ] `frontend/src/features/cart/__tests__/CartItemRow.test.tsx`

## Dev Notes

### Architecture references
- Render: use `renderWithProviders()` from test utils to wrap with Redux and Router
- User interaction: `userEvent.click()`, `userEvent.type()` from `@testing-library/user-event`
- API mocking: MSW handlers intercept API calls and return mock data
- Async: `await screen.findByText()` for async rendering, `waitFor()` for state updates

### Key files
- `frontend/src/test/utils.tsx` — renderWithProviders
- `frontend/src/test/mocks/handlers.ts` — MSW handlers for API mocking

## Dev Agent Record

### Agent Model Used
(not yet assigned)

### Completion Notes
(pending implementation)

### File List
(pending implementation)
