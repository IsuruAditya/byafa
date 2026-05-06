# Story 1.6: Configure Redux Toolkit Store and Axios Instance

**Status:** done
**Epic:** 1 — Project Foundation & Infrastructure
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a configured Redux Toolkit store with base slices and an Axios instance with JWT interceptors,
so that all frontend features can use consistent state management and API communication.

## Acceptance Criteria

**AC1 — Redux store:**
Given the frontend is running
When the Redux store is initialized
Then `authSlice`, `cartSlice`, and `uiSlice` are registered in the root reducer
And `cartSlice` rehydrates from `localStorage` on app init

**AC2 — Axios instance:**
Given the Axios instance is configured
When an API request is made
Then the request interceptor attaches the JWT access token from `authSlice` as `Authorization: Bearer <token>`
And the response interceptor detects 401 responses and attempts token refresh
And the original request is retried with the new token after a successful refresh
And a failed refresh redirects the user to the login page

**AC3 — Typed hooks:**
Given the Redux store is configured
When components use Redux
Then `useAppDispatch` and `useAppSelector` are typed to the root state

## Tasks

- [x] `frontend/src/store/index.ts` — root reducer and store configuration
- [x] `frontend/src/store/slices/authSlice.ts` — auth state slice
- [x] `frontend/src/store/slices/cartSlice.ts` — cart state slice
- [x] `frontend/src/store/slices/uiSlice.ts` — UI state slice (toasts, modals)
- [x] `frontend/src/store/hooks.ts` — typed useAppDispatch and useAppSelector
- [x] `frontend/src/api/axiosInstance.ts` — Axios instance with JWT interceptors

## Dev Notes

### Architecture references
- Auth state shape: `{ user: IUser | null, accessToken: string | null, isAuthenticated: boolean }`
- Cart rehydration: `const preloadedState = { cart: JSON.parse(localStorage.getItem('cart') || '{}') }`
- Refresh token: stored in httpOnly cookie, sent automatically with `withCredentials: true`
- Retry logic: use a queue to prevent multiple simultaneous refresh calls

### Key files
- `frontend/src/store/index.ts` — store setup
- `frontend/src/api/axiosInstance.ts` — Axios with interceptors
- `frontend/src/store/slices/authSlice.ts` — auth state

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Redux store with authSlice, cartSlice, uiSlice
- ✅ Cart rehydrated from localStorage on init
- ✅ Axios instance with request interceptor (attach token)
- ✅ Axios response interceptor with 401 → refresh → retry
- ✅ Failed refresh clears auth state and redirects to login
- ✅ Typed useAppDispatch and useAppSelector hooks

### File List
- `frontend/src/store/index.ts`
- `frontend/src/store/slices/authSlice.ts`
- `frontend/src/store/slices/cartSlice.ts`
- `frontend/src/store/slices/uiSlice.ts`
- `frontend/src/store/hooks.ts`
- `frontend/src/api/axiosInstance.ts`
