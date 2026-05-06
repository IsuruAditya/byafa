# Story 10.5: Mobile Profile and Account Management

**Status:** done
**Epic:** 10 — Mobile App (React Native + Expo)
**Project context:** `_bmad-output/project-context.md`

## Story

As a mobile customer,
I want to view and manage my profile on my phone,
so that I can keep my account information up to date.

## Acceptance Criteria

**AC1 — Profile screen:**
Given I am logged in and on the Profile tab
When the screen loads
Then my name and email are displayed
And I can tap "Edit Profile" to update my name

**AC2 — Logout:**
Given I am on the Profile tab
When I tap "Logout"
Then the refresh token is invalidated
And my auth state is cleared
And I am navigated to the login screen

**AC3 — Delete account:**
Given I tap "Delete Account"
When I confirm in the alert dialog
Then my account is deleted
And I am logged out and navigated to the login screen

**AC4 — Unauthenticated:**
Given I am not logged in
When I navigate to the Profile tab
Then I am redirected to the login screen

## Tasks

- [x] `mobile/src/screens/profile/ProfileScreen.tsx` — profile screen
- [x] `mobile/src/api/authApi.ts` — auth API client (logout, deleteAccount, updateProfile)

## Dev Notes

### Architecture references
- Alert dialog: `Alert.alert('Delete Account', 'Are you sure?', [{ text: 'Cancel' }, { text: 'Delete', onPress: handleDelete, style: 'destructive' }])`
- Logout: call `POST /api/v1/auth/logout`, clear auth state, clear cart
- Token cleanup: clear `expo-secure-store` on logout

### Key files
- `mobile/src/screens/profile/ProfileScreen.tsx` — profile UI
- `mobile/src/api/authApi.ts` — auth API functions

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ProfileScreen with name, email display
- ✅ Edit profile form
- ✅ Logout clears auth state and secure store
- ✅ Delete account with Alert confirmation
- ✅ Auth guard redirects to login

### File List
- `mobile/src/screens/profile/ProfileScreen.tsx`
- `mobile/src/api/authApi.ts`
