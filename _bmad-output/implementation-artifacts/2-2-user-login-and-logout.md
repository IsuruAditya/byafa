# Story 2.2: User Login and Logout

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As a registered customer,
I want to log in with my email and password and log out when done,
so that I can securely access my account and end my session.

## Acceptance Criteria

**AC1 — Login happy path:**
Given I submit valid credentials
Then I receive a new access token and refresh token
And `authSlice` is updated with `{ user, accessToken, isAuthenticated: true }`
And I am redirected to the page I was trying to visit (or homepage)

**AC2 — Invalid credentials:**
Given I submit incorrect email or password
Then `{ success: false, message: "Invalid email or password" }` with status 401

**AC3 — Logout:**
Given I am logged in and click logout
Then `POST /api/v1/auth/logout` is called
And the refresh token is deleted from the `RefreshToken` collection
And the httpOnly cookie is cleared
And `authSlice` is reset to unauthenticated state
And I am redirected to the homepage

## Tasks

- [x] `backend/src/services/auth.service.ts` — `loginUser()`, `logoutUser()`
- [x] `backend/src/api/controllers/auth.controller.ts` — `login()`, `logout()`
- [x] `backend/src/api/routes/auth.routes.ts` — `POST /login`, `POST /logout`
- [x] `frontend/src/features/auth/LoginPage.tsx` — form, dispatches `setCredentials`, redirects
- [x] `frontend/src/components/layout/Navbar.tsx` — logout button calls `logoutApi()` then dispatches `logout()`

## Dev Notes

### Login flow
- `loginUser()` calls `User.findOne({ email }).select('+password')` — password field is `select: false` by default
- Uses `user.comparePassword(candidate)` instance method (bcrypt.compare)
- Returns same shape as register: `{ user, accessToken, refreshToken }`

### Logout flow
- Accept refresh token from cookie (web) OR request body (mobile): `req.cookies.refreshToken ?? req.body.refreshToken`
- Hash the raw token with SHA-256, delete matching `RefreshToken` document
- `res.clearCookie('refreshToken', { httpOnly, secure, sameSite })`
- Frontend: `dispatch(logout())` + `dispatch(clearCart())` + navigate to `/`

### Redirect after login
- `LoginPage` reads `location.state.from.pathname` — set by `ProtectedRoute` when redirecting unauthenticated users
- Falls back to `/` if no `from` state

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `loginUser()` — bcrypt compare, generates fresh token pair
- ✅ `logoutUser()` — SHA-256 hash lookup, deletes from DB, clears cookie
- ✅ LoginPage — React Hook Form + Zod, `from` redirect, root error display
- ✅ Navbar logout — calls API, dispatches `logout()` + `clearCart()`, navigates home

### File List
- `backend/src/services/auth.service.ts` (loginUser, logoutUser)
- `backend/src/api/controllers/auth.controller.ts` (login, logout)
- `backend/src/api/routes/auth.routes.ts`
- `frontend/src/features/auth/LoginPage.tsx`
- `frontend/src/components/layout/Navbar.tsx`
- `frontend/src/store/slices/authSlice.ts` (logout action)
- `frontend/src/store/slices/cartSlice.ts` (clearCart action)
