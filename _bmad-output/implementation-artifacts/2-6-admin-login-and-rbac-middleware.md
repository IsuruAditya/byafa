# Story 2.6: Admin Login and RBAC Middleware

**Status:** done
**Epic:** 2 — User Authentication & Account Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to log in and access admin-only routes,
so that I can manage the store securely.

## Acceptance Criteria

**AC1 — Auth middleware:**
Given any request to a protected route
When `authMiddleware` runs
Then it extracts the Bearer token from `Authorization` header
And verifies it with `verifyAccessToken()`
And loads the user from DB: `User.findById(payload.userId)`
And attaches `user` to `req.user`
And throws `AppError('Authentication required', 401)` if token missing or invalid

**AC2 — Role middleware:**
Given a customer attempts to access `/api/v1/admin/*`
Then `requireRole('admin')` returns 403: `"You do not have permission to perform this action"`

**AC3 — Admin frontend guard:**
Given a non-admin authenticated user navigates to `/admin`
Then `AdminRoute` component redirects them to the homepage

**AC4 — Admin login:**
Given a user with `role: "admin"` logs in
Then they receive the same token pair as any user
And the `role` field in the JWT payload is `"admin"`
And `AdminRoute` allows access to admin pages

## Tasks

- [x] `backend/src/api/middleware/auth.middleware.ts` — JWT verification, user lookup
- [x] `backend/src/api/middleware/role.middleware.ts` — `requireRole(...roles)`
- [x] `backend/src/types/express.d.ts` — augments `req.user` type
- [x] `frontend/src/components/guards/AdminRoute.tsx` — role check
- [x] `frontend/src/components/guards/ProtectedRoute.tsx` — auth check

## Dev Notes

### authMiddleware
- Reads `Authorization: Bearer <token>` header
- `verifyAccessToken(token)` throws `JsonWebTokenError` or `TokenExpiredError` on invalid — caught by error middleware
- Loads full user from DB (not just payload) to ensure user still exists
- `req.user = user` — typed via `express.d.ts` augmentation

### requireRole
```ts
export function requireRole(...roles: Array<'customer' | 'admin'>) {
  return (req, _res, next) => {
    if (!req.user) throw new AppError('Authentication required', 401)
    if (!roles.includes(req.user.role)) throw new AppError('...', 403)
    next()
  }
}
```

### Admin routes usage
```ts
router.use(authMiddleware, requireRole('admin'))
```
Both middleware applied to all admin routes via `router.use()`.

### Frontend guards
- `ProtectedRoute`: checks `isAuthenticated` — redirects to `/login` with `state: { from: location }`
- `AdminRoute`: checks `user.role === 'admin'` — redirects to `/` if not admin

### Seed admin user
- `npm run seed` creates `admin@simple-ecommerce.dev` / `Admin1234!` with `role: 'admin'`

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `authMiddleware` — Bearer token extraction, JWT verify, DB user lookup
- ✅ `requireRole()` — factory function, checks `req.user.role`
- ✅ `express.d.ts` — `req.user?: IUser` augmentation
- ✅ `ProtectedRoute` — redirects with `from` state
- ✅ `AdminRoute` — role check, redirects to `/`

### File List
- `backend/src/api/middleware/auth.middleware.ts`
- `backend/src/api/middleware/role.middleware.ts`
- `backend/src/types/express.d.ts`
- `frontend/src/components/guards/ProtectedRoute.tsx`
- `frontend/src/components/guards/AdminRoute.tsx`
