# Story 2.4: View and Update Profile

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As a logged-in customer,
I want to view and update my profile information,
so that I can keep my account details current.

## Acceptance Criteria

**AC1 — View profile:**
Given I am logged in and navigate to `/profile`
Then my current name and email are displayed
And my role badge is shown if I am admin

**AC2 — Update profile:**
Given I submit updated name and/or email
When `PATCH /api/v1/auth/profile` is processed
Then my User document is updated in MongoDB
And `authSlice` is updated with the new user data
And a success message is displayed

**AC3 — Duplicate email:**
Given I change my email to one already used by another account
Then a 409 error is returned and shown inline on the email field

**AC4 — Change password:**
Given I submit current password and new password (min 8 chars)
When `PATCH /api/v1/auth/password` is processed
Then the password is re-hashed and saved
And a success toast is shown

## Tasks

- [x] `backend/src/services/auth.service.ts` — `updateProfile()`, `changePassword()`
- [x] `backend/src/api/controllers/auth.controller.ts` — `getMe()`, `updateProfile()`, `changePassword()`
- [x] `backend/src/api/routes/auth.routes.ts` — `GET /me`, `PATCH /profile`, `PATCH /password`
- [x] `frontend/src/pages/ProfilePage.tsx` — edit form, avatar card, danger zone
- [x] `frontend/src/api/authApi.ts` — `getMeApi()`, `updateProfileApi()`, `changePasswordApi()`

## Dev Notes

### updateProfile
- `findByIdAndUpdate` with `{ new: true, runValidators: true }`
- Check email uniqueness: `User.findOne({ email, _id: { $ne: userId } })`

### changePassword
- `User.findById(userId)` — no `.select('+password')` needed here since we're saving
- Actually need `.select('+password')` to call `comparePassword` — fix: use `User.findById(userId).select('+password')`
- Wait — `comparePassword` is an instance method that uses `this.password` — need password field loaded
- Set `user.password = newPassword` then `user.save()` — pre-save hook re-hashes

### ProfilePage layout
- Avatar card: initials circle, name, email, admin badge
- Edit form: React Hook Form + Zod, `isDirty` disables Save button when unchanged
- `isSubmitSuccessful && !isDirty` shows success message (resets after next edit)
- Danger zone: delete account button → confirmation Modal

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `updateProfile()` — email uniqueness check, `findByIdAndUpdate`
- ✅ `changePassword()` — loads password field, bcrypt compare, re-saves
- ✅ `GET /auth/me` — returns user from `req.user` (set by authMiddleware)
- ✅ ProfilePage — avatar, edit form, success/error states, danger zone with Modal

### File List
- `backend/src/services/auth.service.ts` (updateProfile, changePassword)
- `backend/src/api/controllers/auth.controller.ts` (getMe, updateProfile, changePassword)
- `backend/src/api/routes/auth.routes.ts`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/api/authApi.ts`
