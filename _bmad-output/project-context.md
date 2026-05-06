# Project Context — Byafa (simple-ecommerce)

> **LLM Agent Grounding Document**
> Generated: 2026-05-06 | Project: simple-ecommerce | Owner: Aditya
> This file is the single source of truth for implementation rules. Every Dev Story agent reads this before touching code.

---

## Project Identity

- **Brand name:** Byafa (display name everywhere in UI, emails, meta tags)
- **Internal name:** simple-ecommerce (package names, repo, BMAD artifacts)
- **Stack:** MERN — MongoDB Atlas + Express v5 + React 19 + Node.js 18+
- **Mobile:** React Native + Expo (separate deployable, same backend)
- **Deployment:** Render (backend web service + frontend static site) / Vercel (serverless fallback)
- **Monorepo layout:** `backend/` | `frontend/` | `mobile/` | `api/` (Vercel entry) | `docs/` | `_bmad-output/`

---

## Architecture Decisions (Non-Negotiable)

### API
- All routes: `/api/v1/` prefix — no exceptions
- Response shape — always one of these three, never anything else:
  ```json
  { "success": true, "data": {}, "message": "optional" }
  { "success": true, "data": [], "pagination": { "page", "pageSize", "total", "totalPages" } }
  { "success": false, "message": "human-readable", "errors": [{ "field", "message" }] }
  ```
- HTTP status codes: 200 GET/PUT, 201 POST create, 400 validation, 401 unauth, 403 forbidden, 404 not found, 409 conflict, 429 rate limit, 500 server error
- Dates: ISO 8601 strings always (`"2026-05-06T10:00:00.000Z"`) — never Unix timestamps
- JSON fields: camelCase throughout

### Backend Layering (strict — never cross layers)
```
routes → controllers → services → models
```
- **Controllers:** thin — extract params, call service, return response. No business logic.
- **Services:** all business logic. No `req`/`res` objects ever.
- **Models:** Mongoose schemas only. No query logic outside services.
- **Error handling:** throw `new AppError(message, statusCode)` for expected errors. Never `res.json({ error: ... })` directly.
- **Async errors:** Express v5.1 catches thrown errors natively — no try/catch wrappers on route handlers needed.

### Auth
- Access token: JWT, 15min, stored in Redux (web) / memory (mobile)
- Refresh token: 7 days, stored in httpOnly cookie (web) / SecureStore (mobile), hashed in DB
- RBAC: `role.middleware.ts` → `requireRole('admin')` — always server-side, never trust client role claims
- Admin routes: `/api/v1/admin/*` — require both `authMiddleware` + `requireRole('admin')`

### Rate Limiting
- Global: 200 req / 15min per IP
- Auth routes: 20 req / 15min per IP
- Skipped in `NODE_ENV === 'test'`

### Real-time (MVP)
- HTTP polling only — Socket.io deferred post-MVP
- Admin dashboard: polls `/api/v1/admin/dashboard` every 30s
- Order status: polls `/api/v1/orders/:id/status` every 60s
- Stock: fetched on product load + after add-to-cart

### Payments
- Stripe Payment Intents — order created ONLY in webhook handler after `payment_intent.succeeded`
- Webhook at `/api/v1/webhooks/stripe` — raw body parser, signature verified every time
- Idempotency: `stripePaymentIntentId` unique index on Order prevents duplicate orders
- Stock decrement: atomic via MongoDB session + `findOneAndUpdate` with `$gte` guard

### Database
- MongoDB Atlas M0 free tier
- Mongoose with TypeScript, `timestamps: true` on every schema
- Connection cached at module level for serverless reuse (`config/db.ts`)
- Indexes: see individual model files

---

## File Naming Conventions

| Context | Convention | Example |
|---------|-----------|---------|
| Backend TS files | camelCase | `auth.service.ts` |
| React components | PascalCase | `ProductCard.tsx` |
| React Native screens | PascalCase + Screen suffix | `LoginScreen.tsx` |
| Variables/functions | camelCase | `getUserById` |
| Types/Interfaces | PascalCase | `IUser`, `OrderStatus` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CART_ITEMS` |
| Redux slices | camelCase + Slice | `authSlice` |
| API endpoints | plural kebab-case | `/api/v1/products` |

---

## Frontend (React Web) Patterns

### State Management
- Redux Toolkit — `useAppDispatch` / `useAppSelector` typed hooks always
- Three slices: `authSlice` (user + accessToken), `cartSlice` (items + localStorage sync), `uiSlice` (toasts)
- Cart persisted to `localStorage` on every change via `saveCartToStorage()` in slice reducers
- Auth: never in localStorage — Redux only (access token) + httpOnly cookie (refresh token)

### API Layer
- Axios instance: `frontend/src/api/axiosInstance.ts` — attaches Bearer token, handles 401 refresh
- One API file per resource: `authApi.ts`, `productsApi.ts`, `ordersApi.ts`, `reviewsApi.ts`, `adminApi.ts`
- Never use raw `axios` in components — always use the typed API functions

### Routing
- React Router v7 — `ProtectedRoute` (auth check) + `AdminRoute` (role check) guard components
- Auth init: `useAuthInit` hook in `AppInitializer` — calls `/auth/refresh` then `/auth/me` on mount

### Styling
- Tailwind CSS v4 — utility classes only, no custom CSS files except `index.css`
- `@import "tailwindcss"` in `index.css` — no `tailwind.config.ts` needed (v4 auto-detects)
- Color scheme: emerald-600 primary (`#059669`), gray-900 text, gray-50 background
- Mobile-first: `sm:` (768px), `md:` (1024px), `lg:` (1280px)

### Forms
- React Hook Form + Zod — always together, never one without the other
- `zodResolver` from `@hookform/resolvers/zod`
- Inline field errors, `role="alert"` on error messages

### SEO
- React Helmet Async — `<Helmet>` in every page component
- Title format: `{Page Name} | Byafa`
- OG tags on product detail and homepage

---

## Mobile (React Native) Patterns

### Navigation
- React Navigation v7 — native stack + bottom tabs
- `RootNavigator` → `AuthNavigator` (Login/Register) or `MainNavigator` (tabs)
- Tab structure: Home | Products | Cart | Orders | Profile
- Each tab has its own stack navigator for nested screens

### Auth
- Refresh token stored in `expo-secure-store` (key: `'refreshToken'`)
- Access token in Redux only
- `AppInitializer` in `App.tsx` — reads SecureStore, calls `/auth/refresh`, then `/auth/me`

### API Layer
- Same pattern as web: `mobile/src/api/axiosInstance.ts` with interceptors
- Refresh token sent in request body (not cookie) for mobile: `{ refreshToken: "..." }`
- Same API function files as web

### Styling
- React Native `StyleSheet.create()` — no external styling library
- Design tokens in `mobile/src/constants/theme.ts` — always use `colors`, `spacing`, `fontSize`, `fontWeight`, `radius` constants
- Never hardcode color values or spacing numbers in component styles

### State
- Same Redux Toolkit slices as web (auth, cart, ui)
- Cart NOT persisted to AsyncStorage on mobile (in-memory only — cleared on app restart)
- `uiSlice` toasts rendered by `ToastContainer` in `App.tsx`

---

## Backend File Structure

```
backend/src/
├── api/
│   ├── controllers/    auth | product | order | admin | review
│   ├── middleware/     auth | role | error | validate
│   └── routes/         auth | product | order | admin | review | webhook
├── config/             db.ts | env.ts
├── models/             User | Product | Order | Review | RefreshToken
├── scripts/            seed.ts
├── services/           auth | product | order | admin | review | email | stripe | cloudinary
├── types/              express.d.ts | index.ts
├── utils/              AppError.ts | generateTokens.ts
├── app.ts              Express setup (no listen)
└── server.ts           Local dev entry (app.listen)
api/index.ts            Vercel serverless entry
```

## Frontend File Structure

```
frontend/src/
├── api/                axiosInstance | authApi | productsApi | ordersApi | reviewsApi | adminApi
├── components/
│   ├── guards/         ProtectedRoute | AdminRoute
│   ├── layout/         Navbar | Footer | MainLayout | AdminLayout | NewsletterSection
│   └── ui/             Button | Input | Modal | Toast | Spinner | Pagination | StarRating | BackToTop | ProductCardSkeleton
├── features/
│   ├── admin/          AdminDashboard | AdminProductList | AdminProductForm | AdminOrderList | AdminOrderDetail | useAdminPolling
│   ├── auth/           LoginPage | RegisterPage | useAuthInit
│   ├── cart/           CartPage | CartItemRow
│   ├── checkout/       CheckoutPage | CheckoutCompletePage | ShippingForm | StripePaymentForm
│   ├── orders/         useOrderStatusPolling
│   ├── products/       ProductsPage | ProductDetailPage | ProductCard | useStockPolling
│   └── reviews/        ReviewForm | ReviewList
├── hooks/              useDebounce | useLocalStorage
├── pages/              HomePage | NotFoundPage | OrderDetailPage | OrderHistoryPage | ProfilePage
├── store/              index | hooks | slices/(auth|cart|ui)Slice
├── types/              api.types | user.types | product.types | order.types | review.types
└── utils/              formatCurrency | formatDate | cn | cloudinaryImage
```

## Mobile File Structure

```
mobile/src/
├── api/                axiosInstance | authApi | productsApi | ordersApi | reviewsApi
├── components/ui/      Button | Input | Spinner | StarRating | Toast | Badge
├── constants/          theme.ts
├── navigation/         RootNavigator | AuthNavigator | MainNavigator | types
├── screens/
│   ├── auth/           LoginScreen | RegisterScreen
│   ├── cart/           CartScreen
│   ├── checkout/       CheckoutScreen | CheckoutCompleteScreen
│   ├── home/           HomeScreen
│   ├── orders/         OrderHistoryScreen | OrderDetailScreen
│   ├── products/       ProductsScreen | ProductDetailScreen
│   └── profile/        ProfileScreen | ChangePasswordScreen
├── store/              index | hooks | slices/(auth|cart|ui)Slice
├── types/              api.types | user.types | product.types | order.types | review.types
└── utils/              formatCurrency
```

---

## Critical Anti-Patterns (Never Do These)

- ❌ `res.json({ error: '...' })` → use `throw new AppError(message, statusCode)`
- ❌ Business logic in controllers → move to service layer
- ❌ `any` type in TypeScript → define proper interfaces
- ❌ Direct `localStorage` access in components → use Redux + cart slice
- ❌ Hardcoded order status strings → use `OrderStatus` type union
- ❌ Raw `axios` in components → use typed API functions from `api/` folder
- ❌ Hardcoded colors/spacing in mobile StyleSheet → use `theme.ts` constants
- ❌ Trust client-side role claims → always verify from JWT payload server-side
- ❌ `express.json()` before webhook route → webhook needs raw body for Stripe sig verification
- ❌ Creating order in payment intent handler → order created ONLY in webhook handler

---

## Environment Variables

### Backend (required)
- `MONGO_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`

### Backend (optional — features disabled if missing)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — payments
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — image uploads
- `EMAIL_USER`, `EMAIL_PASS` — transactional emails (Gmail SMTP)
- `CLIENT_URL` — CORS origin (defaults to `http://localhost:5173`)

### Frontend
- `VITE_API_URL` — backend base URL + `/api/v1`
- `VITE_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

### Mobile
- `EXPO_PUBLIC_API_URL` — backend base URL + `/api/v1`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key

---

## Seed / Admin Bootstrap

Run `npm run seed` from `backend/` to populate products and create admin user:
- Email: `admin@simple-ecommerce.dev`
- Password: `Admin1234!`

---

## Key External Integrations

| Service | Purpose | Config |
|---------|---------|--------|
| MongoDB Atlas M0 | Database | `MONGO_URI` |
| Stripe | Payments + webhooks + refunds | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` |
| Cloudinary | Product image upload + delivery | `CLOUDINARY_*` |
| Nodemailer (Gmail) | Order confirmation + shipping emails | `EMAIL_USER`, `EMAIL_PASS` |
| Expo | Mobile build + distribution | `eas.json` |

---

## Testing Stack (TEA Module — configured, not yet implemented)

- Backend: Jest + Supertest
- Frontend: Vitest + React Testing Library
- Mobile: Jest + React Native Testing Library
- E2E: Playwright (web)
- Test artifacts: `_bmad-output/test-artifacts/`
- Risk threshold: P1 (critical paths only for MVP)
