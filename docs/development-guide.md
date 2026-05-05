# Development Guide

## Prerequisites

- Node.js 18+ (LTS)
- npm 9+
- MongoDB Atlas account (or local MongoDB)
- Stripe account (test mode)
- Cloudinary account (free tier)

---

## Local Setup

### 1. Install dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd frontend && npm install

# Mobile (optional)
cd mobile && npm install
```

### 2. Configure environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your values
```

### 3. Seed the database

```bash
cd backend && npm run seed
```

### 4. Start development servers

**Terminal 1 — Backend:**
```bash
cd backend && npm run dev
# Starts on http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend && npm run dev
# Starts on http://localhost:5173
```

---

## Project Structure

### Backend (`backend/src/`)

```
src/
├── api/
│   ├── controllers/    # Thin request handlers — extract params, call service, return response
│   ├── middleware/     # auth, role, error, validation
│   └── routes/         # Express routers (one per resource)
├── config/
│   ├── db.ts           # Mongoose connection (cached for serverless)
│   └── env.ts          # Environment variable validation
├── models/             # Mongoose schemas + TypeScript interfaces
├── scripts/
│   └── seed.ts         # Database seeding script
├── services/           # Business logic — no req/res objects
├── types/
│   ├── express.d.ts    # Augments req.user type
│   └── index.ts        # Shared TypeScript types
├── utils/
│   ├── AppError.ts     # Custom error class
│   └── generateTokens.ts # JWT + refresh token utilities
├── app.ts              # Express app setup (no listen())
└── server.ts           # Local dev entry point (calls app.listen)
```

### Frontend (`frontend/src/`)

```
src/
├── api/                # Axios instance + API call functions (one file per resource)
├── components/
│   ├── guards/         # ProtectedRoute, AdminRoute
│   ├── layout/         # Navbar, Footer, MainLayout, AdminLayout
│   └── ui/             # Reusable UI components (Button, Input, Modal, etc.)
├── features/           # Feature-based folders (self-contained)
│   ├── admin/          # Admin dashboard, product/order management
│   ├── auth/           # Login, register, auth init hook
│   ├── cart/           # Cart page, cart item row
│   ├── checkout/       # Checkout flow, Stripe payment form
│   ├── orders/         # Order status polling hook
│   ├── products/       # Product catalog, detail page, stock polling
│   └── reviews/        # Review form, review list
├── hooks/              # Shared custom hooks
├── pages/              # Route-level page components
├── store/              # Redux store + slices
├── types/              # TypeScript type definitions
└── utils/              # Pure helper functions
```

---

## Coding Standards

### TypeScript

- Strict mode enabled — no `any` types
- Use interfaces for object shapes, type aliases for unions/primitives
- Prefix interfaces with `I` only for Mongoose documents (e.g. `IUser`, `IProduct`)
- Use `unknown` instead of `any` when type is truly unknown

### Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Files (TS/JS) | camelCase | `auth.service.ts` |
| Files (React) | PascalCase | `ProductCard.tsx` |
| Variables/functions | camelCase | `getUserById` |
| Components | PascalCase | `ProductCard` |
| Types/Interfaces | PascalCase | `IUser`, `OrderStatus` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Redux slices | camelCase + Slice | `authSlice` |
| API endpoints | plural kebab-case | `/api/v1/products` |
| JSON fields | camelCase | `firstName`, `createdAt` |
| DB fields | camelCase | `stockQuantity` |

### Backend Patterns

**Controllers are thin:**
```typescript
// ✅ Good — controller delegates to service
export async function getProductById(req: Request, res: Response) {
  const product = await productService.getProductById(req.params.id)
  res.json({ success: true, data: product })
}

// ❌ Bad — business logic in controller
export async function getProductById(req: Request, res: Response) {
  const product = await Product.findById(req.params.id)
  if (!product) return res.status(404).json({ success: false, message: 'Not found' })
  res.json({ success: true, data: product })
}
```

**Use AppError for expected errors:**
```typescript
// ✅ Good
if (!product) throw new AppError('Product not found', 404)

// ❌ Bad
if (!product) return res.json({ error: 'not found' })
```

**Services have no req/res:**
```typescript
// ✅ Good — service is pure business logic
export async function getProductById(id: string): Promise<IProduct> {
  const product = await Product.findById(id)
  if (!product) throw new AppError('Product not found', 404)
  return product
}
```

### Frontend Patterns

**Use typed Redux hooks:**
```typescript
// ✅ Good
const dispatch = useAppDispatch()
const user = useAppSelector((s) => s.auth.user)

// ❌ Bad
const dispatch = useDispatch()
const user = useSelector((s: any) => s.auth.user)
```

**API calls in feature files, not components:**
```typescript
// ✅ Good — API call in feature/page component
const res = await getProductsApi({ category: 'electronics' })

// ❌ Bad — raw axios in component
const res = await axios.get('/api/v1/products?category=electronics')
```

---

## API Response Shape

All API responses follow this shape:

```typescript
// Success
{ success: true, data: T, message?: string }

// Paginated
{ success: true, data: T[], pagination: { page, pageSize, total, totalPages } }

// Error
{ success: false, message: string, errors?: Array<{ field: string, message: string }> }
```

**Never** return `{ error: '...' }` or `{ status: 'error' }` — always use the standard shape.

---

## Testing

### Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Test file location

Tests are co-located with source files:
- `backend/src/services/auth.service.test.ts`
- `frontend/src/features/auth/LoginPage.test.tsx`

---

## Common Tasks

### Add a new API endpoint

1. Add the route to the appropriate router in `backend/src/api/routes/`
2. Add the controller function in `backend/src/api/controllers/`
3. Add the business logic in `backend/src/services/`
4. Add the API call function in `frontend/src/api/`
5. Use it in the appropriate feature component

### Add a new product category

1. Add the category to `CATEGORIES` in `frontend/src/features/products/ProductsPage.tsx`
2. Add it to `CATEGORIES` in `frontend/src/pages/HomePage.tsx`
3. Add it to `CATEGORIES` in `frontend/src/components/layout/Navbar.tsx`
4. Update the seed script's `CATEGORY_MAP` in `backend/src/scripts/seed.ts`

### Change JWT expiry

Update `JWT_EXPIRES_IN` and `JWT_REFRESH_EXPIRES_IN` in your `.env` file.
The defaults are `15m` (access) and `7d` (refresh).
