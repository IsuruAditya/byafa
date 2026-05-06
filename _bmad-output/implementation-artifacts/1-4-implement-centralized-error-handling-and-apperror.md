# Story 1.4: Implement Centralized Error Handling and AppError

**Status:** done
**Epic:** 1 — Project Foundation & Infrastructure
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a centralized error handling system with a custom AppError class,
so that all API errors return a consistent `{ success, message, errors? }` response shape.

## Acceptance Criteria

**AC1 — AppError class:**
Given any route handler throws an `AppError(message, statusCode)`
When the error reaches the centralized error middleware
Then the response returns `{ success: false, message }` with the correct HTTP status code

**AC2 — Unhandled errors:**
Given an unexpected error is thrown
When it reaches the error middleware
Then the response returns `{ success: false, message: "Internal server error" }` with status 500
And stack traces are never included in production responses

**AC3 — Validation errors:**
Given `express-validator` validation fails
When the error is formatted
Then the response is `{ success: false, message: "Validation failed", errors: [{ field, message }] }` with status 400

## Tasks

- [x] `backend/src/utils/AppError.ts` — custom AppError class
- [x] `backend/src/api/middleware/error.middleware.ts` — centralized error handler
- [x] `backend/src/api/middleware/validate.middleware.ts` — express-validator error formatter

## Dev Notes

### Architecture references
- AppError: `class AppError extends Error { constructor(message: string, public statusCode: number) { super(message) } }`
- Error middleware: `(err, req, res, next)` — 4-argument signature required by Express
- Production check: `process.env.NODE_ENV === 'production'` to suppress stack traces
- Validation middleware: `validationResult(req)` → format errors → throw AppError(400)

### Key files
- `backend/src/utils/AppError.ts` — AppError class
- `backend/src/api/middleware/error.middleware.ts` — error handler
- `backend/src/api/middleware/validate.middleware.ts` — validation error handler

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ AppError class with message and statusCode
- ✅ Centralized error middleware handles AppError and generic errors
- ✅ Stack traces suppressed in production
- ✅ express-validator errors formatted as { field, message } array

### File List
- `backend/src/utils/AppError.ts`
- `backend/src/api/middleware/error.middleware.ts`
- `backend/src/api/middleware/validate.middleware.ts`
