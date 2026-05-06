# Story 2.5: Delete Account

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As a logged-in customer,
I want to delete my account,
so that I can remove my data from the platform.

## Acceptance Criteria

**AC1 — Confirmation required:**
Given I am on the profile page
When I click "Delete Account"
Then a confirmation Modal is shown before any deletion occurs

**AC2 — Account deletion:**
Given I confirm the deletion
When `DELETE /api/v1/auth/account` is processed
Then my User document is deleted from MongoDB
And all my RefreshToken documents are deleted
And the httpOnly cookie is cleared
And `authSlice` is reset to unauthenticated state
And `cartSlice` is cleared
And I am redirected to the homepage

**AC3 — Error handling:**
Given the deletion fails
Then an error message is shown in the modal
And the modal stays open

## Tasks

- [x] `backend/src/services/auth.service.ts` — `deleteAccount()`
- [x] `backend/src/api/controllers/auth.controller.ts` — `deleteAccount()`
- [x] `backend/src/api/routes/auth.routes.ts` — `DELETE /account`
- [x] `frontend/src/pages/ProfilePage.tsx` — delete button, Modal, error state

## Dev Notes

### deleteAccount service
```ts
await RefreshToken.deleteMany({ userId })
await User.findByIdAndDelete(userId)
```
Order matters: delete tokens first, then user.

### Frontend flow
- `isDeleting` state prevents double-submit and disables modal close during deletion
- On success: `dispatch(logout())` + `dispatch(clearCart())` + `navigate('/', { replace: true })`
- `replace: true` prevents back-navigation to the profile page after deletion

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `deleteAccount()` — deletes tokens then user
- ✅ Controller clears cookie after deletion
- ✅ ProfilePage — Modal with loading state, error display, success redirect

### File List
- `backend/src/services/auth.service.ts` (deleteAccount)
- `backend/src/api/controllers/auth.controller.ts` (deleteAccount)
- `backend/src/api/routes/auth.routes.ts`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/api/authApi.ts` (deleteAccountApi)
