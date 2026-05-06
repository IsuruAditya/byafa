# Story 2.3: JWT Refresh Token Flow

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an authenticated user,
I want my session to automatically refresh when my access token expires,
so that I don't get logged out unexpectedly during normal use.

## Acceptance Criteria

**AC1 — Automatic refresh (web):**
Given my access token has expired
When I make any API request
Then the Axios response interceptor detects the 401
And calls `POST /api/v1/auth/refresh` with the httpOnly cookie automatically
And receives a new access token, dispatches `updateAccessToken`
And retries the original request with the new token
And the user never sees a login page

**AC2 — Parallel request queuing:**
Given multiple requests fire simultaneously when the token is expired
Then only ONE refresh call is made
And all other requests are queued and retried after the refresh completes

**AC3 — Refresh token expired:**
Given the refresh token is also expired or invalid
When the refresh call returns 401
Then `dispatch(logout())` is called
And the user is redirected to `/login` (only if they were previously authenticated)

**AC4 — App init on hard refresh (web):**
Given the user hard-refreshes the browser (Redux store is empty)
When the app mounts
Then `useAuthInit` calls `POST /api/v1/auth/refresh` first (no access token in Redux)
And if successful, calls `GET /api/v1/auth/me` to rehydrate user state
And if refresh fails, user stays logged out (no redirect)

**AC5 — Backend refresh endpoint:**
Given a valid raw refresh token in cookie or body
When `POST /api/v1/auth/refresh` is called
Then the token is hashed, looked up in DB, checked for expiry
And a new access token is returned: `{ success: true, data: { accessToken } }`

## Tasks

- [x] `backend/src/services/auth.service.ts` — `refreshAccessToken()`
- [x] `backend/src/api/controllers/auth.controller.ts` — `refresh()`
- [x] `backend/src/api/routes/auth.routes.ts` — `POST /refresh`
- [x] `frontend/src/api/axiosInstance.ts` — response interceptor with queue pattern
- [x] `frontend/src/store/slices/authSlice.ts` — `updateAccessToken` action
- [x] `frontend/src/features/auth/useAuthInit.ts` — app mount auth rehydration

## Dev Notes

### Refresh token lookup
- Raw token from client → SHA-256 hash → `RefreshToken.findOne({ token: hash, expiresAt: { $gt: new Date() } })`
- If not found or expired: throw `AppError('Invalid or expired refresh token', 401)`

### Axios interceptor queue pattern (critical)
```ts
let isRefreshing = false
let pendingQueue: Array<{ resolve, reject }> = []
// On 401: if already refreshing, push to queue; else set isRefreshing=true, call /auth/refresh
// On success: processPendingQueue(null, newToken) — resolves all queued requests
// On failure: processPendingQueue(error, null) — rejects all queued requests
```

### useAuthInit flow (web)
1. Check Redux for access token — if empty (hard refresh), call `/auth/refresh` first
2. Dispatch `updateAccessToken(newToken)` to Redux
3. Call `/auth/me` to get user profile
4. Dispatch `setCredentials({ user, accessToken })`
5. If any step fails with 401 → user stays logged out, `setIsInitializing(false)`

### Mobile auth init (App.tsx)
- Read refresh token from `SecureStore.getItemAsync('refreshToken')`
- POST `/auth/refresh` with `{ refreshToken }` in body
- Dispatch `updateAccessToken`, then call `/auth/me`

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `refreshAccessToken()` — SHA-256 lookup, expiry check, returns new access token
- ✅ Axios interceptor — `_retry` flag prevents infinite loops, queue prevents parallel refreshes
- ✅ `updateAccessToken` action in authSlice
- ✅ `useAuthInit` — explicit refresh call on hard reload before /me
- ✅ Mobile `AppInitializer` in `App.tsx` — SecureStore → refresh → /me

### File List
- `backend/src/services/auth.service.ts` (refreshAccessToken)
- `backend/src/api/controllers/auth.controller.ts` (refresh)
- `backend/src/api/routes/auth.routes.ts`
- `frontend/src/api/axiosInstance.ts`
- `frontend/src/store/slices/authSlice.ts` (updateAccessToken)
- `frontend/src/features/auth/useAuthInit.ts`
- `mobile/App.tsx` (AppInitializer)
- `mobile/src/api/axiosInstance.ts`
