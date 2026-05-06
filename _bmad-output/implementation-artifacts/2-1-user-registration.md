# Story 2.1: User Registration

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As a new customer,
I want to register with my email and password,
so that I can create an account and start shopping.

## Acceptance Criteria

**AC1 — Happy path:**
Given I am on the registration page
When I submit a valid name, email, and password (min 8 chars)
Then a new User document is created in MongoDB with `role: "customer"`
And the password is hashed with bcrypt (12 salt rounds) via pre-save hook
And an access token (15min) and refresh token (7 days) are returned
And the refresh token is set in an httpOnly cookie (`refreshToken`)
And the refresh token is also returned in the response body (for mobile clients)
And I am redirected to the homepage as an authenticated user
And `authSlice` is updated with `{ user, accessToken, isAuthenticated: true }`

**AC2 — Duplicate email:**
Given I submit an email that already exists
When the registration request is processed
Then the response is `{ success: false, message: "Email already in use" }` with status 409

**AC3 — Validation errors:**
Given I submit invalid input (missing name, invalid email, password < 8 chars)
When the request is processed
Then the response is `{ success: false, message: "Validation failed", errors: [{ field, message }] }` with status 400

## Tasks

- [x] `backend/src/models/User.model.ts` — IUser interface, schema with bcrypt pre-save hook, `comparePassword` method
- [x] `backend/src/services/auth.service.ts` — `registerUser()` function
- [x] `backend/src/api/controllers/auth.controller.ts` — `register()` handler
- [x] `backend/src/api/routes/auth.routes.ts` — `POST /api/v1/auth/register` with express-validator
- [x] `frontend/src/features/auth/RegisterPage.tsx` — React Hook Form + Zod, dispatches `setCredentials`
- [x] `frontend/src/api/authApi.ts` — `registerApi()` function

## Dev Notes

### Architecture references
- Response shape: `{ success: true, data: { user, accessToken, refreshToken }, message }` — refreshToken in body for mobile
- Cookie: `httpOnly: true, secure: NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 days`
- Password hashing: bcrypt 12 rounds in `userSchema.pre('save')` — only when `isModified('password')`
- Refresh token: raw token sent to client, SHA-256 hash stored in `RefreshToken` collection

### Key files
- `backend/src/models/User.model.ts` — User schema
- `backend/src/models/RefreshToken.model.ts` — TTL index auto-deletes expired tokens
- `backend/src/utils/generateTokens.ts` — `generateAccessToken()`, `generateRefreshToken()`
- `frontend/src/store/slices/authSlice.ts` — `setCredentials` action

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ User model with bcrypt pre-save hook (12 rounds), `select: false` on password field
- ✅ RefreshToken model with TTL index (`expireAfterSeconds: 0` on `expiresAt`)
- ✅ `registerUser()` service checks duplicate email, creates user, generates both tokens
- ✅ Raw refresh token returned in body + set in httpOnly cookie
- ✅ RegisterPage with React Hook Form + Zod, inline validation errors, redirects to homepage on success
- ✅ 409 on duplicate email, 400 on validation failure

### File List
- `backend/src/models/User.model.ts`
- `backend/src/models/RefreshToken.model.ts`
- `backend/src/utils/generateTokens.ts`
- `backend/src/services/auth.service.ts`
- `backend/src/api/controllers/auth.controller.ts`
- `backend/src/api/routes/auth.routes.ts`
- `frontend/src/features/auth/RegisterPage.tsx`
- `frontend/src/api/authApi.ts`
