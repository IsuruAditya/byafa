# Story 10.1: Mobile Scaffold, Navigation, and Auth

**Status:** done
**Epic:** 10 — Mobile App (React Native + Expo)
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a working React Native + Expo scaffold with navigation and authentication,
so that all mobile development can begin from a consistent, production-ready base.

## Acceptance Criteria

**AC1 — Expo scaffold:**
Given the mobile directory exists
When the scaffold is initialized
Then `mobile/` contains a working Expo + React Native + TypeScript project
And `expo-router` is configured for file-based navigation
And the app runs on iOS simulator, Android emulator, and Expo Go

**AC2 — Navigation structure:**
Given the app is running
When I navigate through the app
Then a bottom tab navigator provides: Home, Products, Cart, Orders, Profile tabs
And a stack navigator handles product detail, order detail, and auth screens
And unauthenticated users are redirected to the login screen for protected tabs

**AC3 — Authentication:**
Given I am on the login screen
When I submit valid credentials
Then the app calls `POST /api/v1/auth/login`
And the access token is stored in `expo-secure-store`
And I am navigated to the home tab
And the refresh token flow works via the Axios interceptor

## Tasks

- [x] `mobile/app/_layout.tsx` — root layout with navigation
- [x] `mobile/app/(tabs)/_layout.tsx` — bottom tab navigator
- [x] `mobile/src/store/index.ts` — Redux store for mobile
- [x] `mobile/src/store/slices/authSlice.ts` — auth state
- [x] `mobile/src/api/axiosInstance.ts` — Axios with JWT interceptor
- [x] `mobile/src/screens/auth/LoginScreen.tsx` — login screen
- [x] `mobile/src/screens/auth/RegisterScreen.tsx` — register screen

## Dev Notes

### Architecture references
- Navigation: `expo-router` with file-based routing
- Token storage: `expo-secure-store` for access token (not AsyncStorage — more secure)
- Auth guard: check `isAuthenticated` in tab layout, redirect to `/auth/login` if false
- Axios interceptor: same pattern as web — 401 → refresh → retry

### Key files
- `mobile/app/_layout.tsx` — root layout
- `mobile/src/store/slices/authSlice.ts` — auth state management
- `mobile/src/api/axiosInstance.ts` — API client

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Expo + React Native + TypeScript scaffold
- ✅ expo-router with tab and stack navigation
- ✅ Redux store with authSlice
- ✅ Axios instance with JWT interceptor and refresh token flow
- ✅ Login and Register screens
- ✅ Auth guard redirects unauthenticated users

### File List
- `mobile/app/_layout.tsx`
- `mobile/app/(tabs)/_layout.tsx`
- `mobile/src/store/index.ts`
- `mobile/src/store/slices/authSlice.ts`
- `mobile/src/api/axiosInstance.ts`
- `mobile/src/screens/auth/LoginScreen.tsx`
- `mobile/src/screens/auth/RegisterScreen.tsx`
