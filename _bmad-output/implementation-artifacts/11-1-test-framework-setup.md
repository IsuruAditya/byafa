# Story 11.1: Test Framework Setup

**Status:** backlog
**Epic:** 11 — Test Coverage (TEA Module)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a configured test framework for both backend and frontend,
so that all subsequent test stories have a working foundation to build on.

## Acceptance Criteria

**AC1 — Backend test framework:**
Given the backend directory
When the test framework is configured
Then `vitest` (or `jest`) is installed and configured in `backend/package.json`
And `supertest` is installed for HTTP integration testing
And a test script `npm run test` runs all tests
And a coverage script `npm run test:coverage` generates a coverage report

**AC2 — Frontend test framework:**
Given the frontend directory
When the test framework is configured
Then `vitest` is installed (already included with Vite)
And `@testing-library/react` and `@testing-library/user-event` are installed
And `msw` (Mock Service Worker) is configured for API mocking
And a test script `npm run test` runs all tests in watch mode
And `npm run test:run` runs tests once (CI mode)

**AC3 — Test utilities:**
Given the test frameworks are configured
When tests are written
Then a shared test utilities file provides: `renderWithProviders()` (wraps component with Redux store and Router), `createMockStore()`, and common mock data factories

## Tasks

- [ ] `backend/package.json` — add vitest, supertest, @types/supertest
- [ ] `backend/vitest.config.ts` — vitest configuration
- [ ] `backend/src/test/setup.ts` — test setup (connect to test DB, seed, teardown)
- [ ] `frontend/src/test/setup.ts` — MSW setup, testing-library config
- [ ] `frontend/src/test/utils.tsx` — renderWithProviders, createMockStore
- [ ] `frontend/src/test/mocks/handlers.ts` — MSW request handlers

## Dev Notes

### Architecture references
- Backend DB: use `mongodb-memory-server` for in-memory MongoDB in tests
- MSW: intercept API calls in frontend tests without hitting real backend
- renderWithProviders: `render(<Provider store={store}><MemoryRouter>{children}</MemoryRouter></Provider>)`
- Coverage threshold: aim for 70% line coverage on services and controllers

### Key files
- `backend/vitest.config.ts` — backend test config
- `frontend/vite.config.ts` — frontend test config (vitest section)
- `frontend/src/test/utils.tsx` — shared test utilities

## Dev Agent Record

### Agent Model Used
(not yet assigned)

### Completion Notes
(pending implementation)

### File List
(pending implementation)
