---
stepsCompleted:
  - step-01-init
  - step-02-context
  - step-03-starter
  - step-04-decisions
  - step-05-patterns
  - step-06-structure
  - step-07-validation
  - step-08-complete
status: complete
completedAt: 'May 3, 2026'
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
workflowType: 'architecture'
project_name: 'simple-ecommerce'
user_name: 'Aditya'
date: 'May 3, 2026'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
46 FRs across 8 capability areas. Core architectural drivers:

- **Auth & RBAC** (FR1–FR7): Two roles (customer, admin/seller), server-side enforcement, JWT with refresh token pattern, session invalidation on logout
- **Product Catalog** (FR8–FR14): Paginated browsing, keyword search, category filter, sort, real-time stock updates via Socket.io
- **Cart & Checkout** (FR15–FR23): Guest cart in localStorage, merge on login, Stripe Payment Intents, webhook-confirmed order creation, atomic stock decrement
- **Order Management** (FR24–FR28): Customer order history, real-time status push via Socket.io, email notifications on confirmation and shipping
- **Reviews** (FR29–FR30): Post-purchase only, authenticated, rating + text
- **Admin Dashboard** (FR31–FR40): Real-time new order notifications, income/expense summary, product CRUD with image upload, order search/filter/status management, Stripe refunds
- **Notifications** (FR41–FR44): Transactional email (Nodemailer/SendGrid) + Socket.io real-time push
- **SEO** (FR45–FR46): React Helmet, sitemap, robots.txt

**Non-Functional Requirements:**
- Performance: LCP < 3s, TTI < 4s, API < 500ms, Socket.io events < 1s
- Security: bcrypt, short-lived JWTs, httpOnly cookies, webhook signature verification, CORS, input sanitization
- Reliability: 99.5% uptime, idempotent webhooks, atomic stock decrement, graceful error handling
- Scalability: Stateless API, MongoDB indexes, externalized image storage

**Scale & Complexity:**
- Primary domain: Full-stack web application (MERN)
- Complexity level: Medium — real-time features, payment integration, dual-role system, single-seller, no multi-tenancy
- Estimated architectural components: ~8 backend modules, ~10 frontend feature areas

### Technical Constraints & Dependencies

- Stack: MongoDB, Express, React, Node.js (fixed)
- Stripe: Payment Intents API + webhooks
- Socket.io: 3 real-time event types (new order, stock update, order status)
- Email: Nodemailer or SendGrid
- Image hosting: Cloudinary (multer fallback for MVP)
- Frontend: React SPA (CSR only, no SSR/SSG), React Helmet for SEO

### Cross-Cutting Concerns Identified

- **Authentication middleware**: JWT verification + role check on every protected route
- **Error handling**: Consistent error response shape across all API routes
- **Real-time events**: Socket.io rooms strategy affects both backend emission and frontend subscription
- **Atomic operations**: Stock decrement and order creation must be transactional
- **Webhook idempotency**: Stripe webhook handler must deduplicate events
- **Image pipeline**: Upload → storage → URL reference consistent across product CRUD

## Starter Template Evaluation

### Primary Technology Domain

Full-stack MERN web application — React SPA frontend + Node.js/Express REST API backend, MongoDB as data store. Stack fixed per PRD requirements.

### Selected Approach: Monorepo with Separate Frontend/Backend

The workspace already has `frontend/` and `backend/` directories — this structure is confirmed.

**Frontend Initialization:**
```bash
npm create vite@latest frontend -- --template react-ts
```

**Backend Initialization:**
```bash
cd backend
npm init -y
npm install express@^5.1.0 mongoose socket.io cors dotenv bcryptjs jsonwebtoken stripe nodemailer
npm install -D typescript @types/express @types/node @types/bcryptjs @types/jsonwebtoken ts-node-dev
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- TypeScript throughout (frontend + backend), strict mode enabled
- Node.js 18+ (LTS)

**Frontend (Vite + React):**
- React 19 with TypeScript
- Vite 7 — fast HMR, optimized production builds, path aliases via `vite.config.ts`
- ESLint pre-configured

**Backend (Express v5.1):**
- Express v5.1 — npm default as of March 2025; async error handling built-in
- TypeScript with `ts-node-dev` for hot reload in development
- CommonJS modules for simplicity

**Styling Solution:**
- Tailwind CSS v4 — utility-first, mobile-first, no runtime overhead

**Testing Framework:**
- Frontend: Vitest + React Testing Library
- Backend: Jest + Supertest

**Code Organization:**
- `frontend/src/` — feature-based folder structure
- `backend/src/` — layered architecture (routes → controllers → services → models)

**Development Experience:**
- `ts-node-dev` for backend hot reload
- Vite HMR for frontend
- `.env` files per layer (`VITE_` prefix for frontend env vars)
- `concurrently` to run both servers in development

**Note:** Project initialization is the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- State management: Redux Toolkit
- Database ODM: Mongoose
- Email service: Nodemailer
- Deployment: Vercel (frontend + backend), MongoDB Atlas M0
- Real-time: HTTP polling (Socket.io deferred to post-MVP)
- API versioning: `/api/v1/` prefix

**Important Decisions (Shape Architecture):**
- Backend as Vercel Serverless Functions via `@vercel/node`
- Express v5.1 wrapped for serverless deployment
- Tailwind CSS v4 for styling

**Deferred Decisions (Post-MVP):**
- Socket.io real-time (requires persistent server — add when upgrading hosting)
- Multi-seller support
- Advanced analytics

### Data Architecture

- **ODM:** Mongoose with TypeScript — typed schemas, validation, middleware hooks
- **Database:** MongoDB Atlas M0 free tier (512MB, no credit card required)
- **Connection:** Single Mongoose connection instance, reused across serverless function invocations via module-level caching
- **Indexes:** Compound indexes on `products` (name, category), `orders` (userId, status, createdAt), `users` (email unique)
- **Atomic operations:** `findOneAndUpdate` with `$inc` for stock decrement at checkout to prevent overselling

### Authentication & Security

- **Auth method:** JWT — short-lived access token (15min) + refresh token (7 days) stored in httpOnly cookie
- **Password hashing:** bcrypt, 12 salt rounds
- **RBAC:** Role field on User model (`customer` | `admin`); server-side middleware validates role on every protected route
- **Webhook security:** Stripe webhook signature verified via `stripe.webhooks.constructEvent()` before processing
- **Input validation:** `express-validator` on all POST/PUT routes
- **CORS:** Configured to allow only Vercel frontend domain in production

### API & Communication Patterns

- **Style:** RESTful JSON API, all routes prefixed `/api/v1/`
- **Error handling:** Centralized error middleware — all errors flow to a single handler returning `{ success: false, message, errors? }`
- **Async errors:** Express v5.1 handles async errors natively — no `try/catch` wrappers needed on route handlers
- **Real-time (MVP):** HTTP polling
  - Admin dashboard: polls `/api/v1/orders/recent` every 30 seconds
  - Product pages: stock count fetched on load, refreshed on add-to-cart
  - Customer order detail: polls `/api/v1/orders/:id/status` every 60 seconds
- **Real-time (Post-MVP):** Socket.io when migrating to persistent server hosting

### Frontend Architecture

- **Framework:** React 19 + TypeScript + Vite 7
- **State management:** Redux Toolkit
  - `authSlice` — user session, JWT token, role
  - `cartSlice` — cart items, persisted to localStorage
  - `uiSlice` — loading states, notifications
- **Routing:** React Router v7 — protected routes via wrapper component checking auth state
- **Styling:** Tailwind CSS v4 — mobile-first, utility classes
- **API client:** Axios with interceptors for JWT attachment and 401 refresh token handling
- **SEO:** React Helmet Async for dynamic meta tags per page
- **Forms:** React Hook Form + Zod for validation

### Infrastructure & Deployment

- **Frontend:** Vercel (static SPA deployment, automatic from `main` branch)
- **Backend:** Vercel Serverless Functions — Express app wrapped with `@vercel/node`, entry point `api/index.ts`
- **Database:** MongoDB Atlas M0 (free tier, no credit card)
- **Images:** Cloudinary free tier (25GB storage, 25GB bandwidth/month)
- **Email:** Nodemailer with Gmail SMTP (free, app password auth) for MVP; swap to SendGrid when volume grows
- **Environment config:** `.env.local` for development; Vercel environment variables for production
- **CI/CD:** Vercel auto-deploy on push to `main`; preview deployments on PRs

### Decision Impact Analysis

**Implementation Sequence:**
1. Project scaffolding (Vite frontend + Express backend + Vercel config)
2. MongoDB Atlas setup + Mongoose models
3. Auth system (JWT + RBAC middleware)
4. Product catalog API + frontend
5. Cart (Redux) + Checkout (Stripe)
6. Order management + polling
7. Admin dashboard
8. Email notifications (Nodemailer)
9. Reviews
10. SEO + sitemap

**Cross-Component Dependencies:**
- Auth middleware must exist before any protected route is built
- Mongoose models must be defined before any API route uses them
- Redux store must be configured before any component uses `useSelector`/`useDispatch`
- Stripe webhook handler must be idempotent before going live
- Cloudinary config must be set before product image upload works

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (Mongoose):**
- Collection names: plural, camelCase (`users`, `products`, `orders`, `reviews`)
- Field names: camelCase (`firstName`, `createdAt`, `stockQuantity`)
- Ref fields: camelCase with `Id` suffix (`userId`, `productId`, `orderId`)
- Timestamps: always use Mongoose `{ timestamps: true }` — auto-adds `createdAt`, `updatedAt`

**API Endpoints:**
- Resources: plural, kebab-case (`/api/v1/products`, `/api/v1/orders`, `/api/v1/auth`)
- Route params: `:id` for primary identifier (e.g., `/api/v1/products/:id`)
- Query params: camelCase (`?sortBy=price&pageSize=10`)
- Nested resources: `/api/v1/orders/:id/status`, `/api/v1/products/:id/reviews`

**Code (TypeScript):**
- Files: `camelCase.ts` for utilities/services, `PascalCase.tsx` for React components
- Components: PascalCase (`ProductCard`, `AdminDashboard`)
- Functions/variables: camelCase (`getUserById`, `cartItems`)
- Types/Interfaces: PascalCase with `I` prefix for interfaces (`IUser`, `IProduct`), plain PascalCase for types (`OrderStatus`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_CART_ITEMS`, `JWT_EXPIRY`)
- Redux slices: camelCase + `Slice` suffix (`authSlice`, `cartSlice`)

### Structure Patterns

**Backend (`backend/src/`):**
```
src/
  api/
    routes/         # Express routers (one per resource)
    controllers/    # Request handlers — thin, delegate to services
    middleware/     # auth, role, error, validation
  services/         # Business logic — no req/res objects
  models/           # Mongoose schemas + models
  utils/            # Pure helpers (email, cloudinary, stripe)
  config/           # DB connection, env validation
  types/            # Shared TypeScript types/interfaces
  app.ts            # Express app setup (no listen())
  server.ts         # Entry point (calls app.listen)
api/
  index.ts          # Vercel serverless entry point (imports app.ts)
```

**Frontend (`frontend/src/`):**
```
src/
  features/         # Feature-based folders
    auth/           # components, hooks, slice
    products/
    cart/
    orders/
    admin/
    reviews/
  components/       # Shared/reusable UI components
  pages/            # Route-level page components
  store/            # Redux store setup + root reducer
  hooks/            # Shared custom hooks
  utils/            # Pure helpers
  api/              # Axios instance + API call functions
  types/            # Shared TypeScript types
  App.tsx
  main.tsx
```

**Tests:** Co-located with source files — `*.test.ts` / `*.test.tsx` next to the file being tested.

### Format Patterns

**API Response — Success:**
```json
{
  "success": true,
  "data": { },
  "message": "Optional success message"
}
```

**API Response — Paginated:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

**API Response — Error:**
```json
{
  "success": false,
  "message": "Human-readable error message",
  "errors": [{ "field": "email", "message": "Invalid email" }]
}
```

**HTTP Status Codes:**
- `200` — success (GET, PUT, PATCH)
- `201` — created (POST)
- `400` — validation error / bad request
- `401` — unauthenticated
- `403` — unauthorized (authenticated but wrong role)
- `404` — not found
- `409` — conflict (e.g., email already exists)
- `500` — server error

**Dates:** Always ISO 8601 strings in API responses (`"2026-05-03T10:00:00.000Z"`). Never Unix timestamps.

**JSON fields:** camelCase throughout (`firstName`, `createdAt`, `stockQuantity`).

### State Management Patterns (Redux Toolkit)

- Each slice: state + reducers + async thunks in one file
- Async operations use `createAsyncThunk`
- State shape: `{ data, status: 'idle'|'loading'|'succeeded'|'failed', error }`
- Loading states: every async operation tracks `status` — never use ad-hoc boolean `isLoading` flags
- Cart persistence: `cartSlice` syncs to `localStorage` on every change; rehydrated on app init
- Auth: `authSlice` stores `{ user, accessToken, isAuthenticated }`; refresh token in httpOnly cookie only

### Process Patterns

**Error handling (backend):**
- All route handlers are async — Express v5.1 catches thrown errors automatically
- Throw `new AppError(message, statusCode)` for expected errors
- Centralized error middleware formats all errors into the standard response shape
- Never expose stack traces in production

**Error handling (frontend):**
- Axios interceptor catches 401 → attempts token refresh → retries request
- Axios interceptor catches other errors → dispatches to `uiSlice` for toast notification
- Component-level error boundaries for page-level crashes

**Validation:**
- Backend: `express-validator` on all mutating routes; validate before hitting service layer
- Frontend: React Hook Form + Zod schema — validate on submit, show inline errors

**Polling pattern:**
```ts
useEffect(() => {
  const interval = setInterval(() => fetchData(), 30000);
  return () => clearInterval(interval);
}, []);
```

### Enforcement Guidelines

**All agents MUST:**
- Use the standard API response shape (`{ success, data, message }`) — no exceptions
- Use camelCase for all JSON fields and TypeScript variables
- Place business logic in services, not controllers
- Use `AppError` for expected errors, never `res.json({ error: ... })` directly
- Use Mongoose `timestamps: true` on every schema
- Prefix all API routes with `/api/v1/`
- Never trust client-side role claims — always verify from JWT payload server-side

**Anti-patterns to avoid:**
- ❌ `res.json({ error: 'something went wrong' })` → use centralized error middleware
- ❌ Business logic in route handlers → move to service layer
- ❌ `any` type in TypeScript → define proper interfaces
- ❌ Direct `localStorage` access in components → use Redux + cart persistence middleware
- ❌ Hardcoded strings for order status → use TypeScript enum/union type

## Project Structure & Boundaries

### Complete Project Directory Structure

```
simple-ecommerce/
├── README.md
├── package.json                    # Root: concurrently scripts for dev
├── .gitignore
│
├── frontend/                       # React SPA (Vite + TypeScript)
│   ├── index.html
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tailwind.config.ts
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── .env.local                  # VITE_API_URL, VITE_CLOUDINARY_CLOUD_NAME
│   ├── .env.example
│   └── src/
│       ├── main.tsx
│       ├── App.tsx                 # Router setup + protected routes
│       ├── index.css               # Tailwind base imports
│       ├── store/
│       │   ├── index.ts            # Redux store + root reducer
│       │   ├── authSlice.ts        # User session, accessToken, isAuthenticated
│       │   ├── cartSlice.ts        # Cart items + localStorage persistence
│       │   └── uiSlice.ts          # Loading states, toast notifications
│       ├── api/
│       │   ├── axiosInstance.ts    # Axios + JWT interceptor + refresh logic
│       │   ├── authApi.ts
│       │   ├── productsApi.ts
│       │   ├── ordersApi.ts        # includes pollStatus
│       │   ├── reviewsApi.ts
│       │   └── adminApi.ts
│       ├── features/
│       │   ├── auth/
│       │   │   ├── LoginPage.tsx
│       │   │   ├── RegisterPage.tsx
│       │   │   └── useAuth.ts
│       │   ├── products/
│       │   │   ├── ProductsPage.tsx
│       │   │   ├── ProductDetailPage.tsx
│       │   │   ├── ProductCard.tsx
│       │   │   ├── ProductSearch.tsx
│       │   │   ├── ProductFilters.tsx
│       │   │   └── useStockPolling.ts
│       │   ├── cart/
│       │   │   ├── CartPage.tsx
│       │   │   ├── CartItem.tsx
│       │   │   └── CartSummary.tsx
│       │   ├── checkout/
│       │   │   ├── CheckoutPage.tsx
│       │   │   ├── ShippingForm.tsx
│       │   │   └── StripePaymentForm.tsx
│       │   ├── orders/
│       │   │   ├── OrderHistoryPage.tsx
│       │   │   ├── OrderDetailPage.tsx
│       │   │   └── useOrderStatusPolling.ts
│       │   ├── reviews/
│       │   │   ├── ReviewList.tsx
│       │   │   └── ReviewForm.tsx
│       │   └── admin/
│       │       ├── AdminDashboard.tsx
│       │       ├── AdminProductList.tsx
│       │       ├── AdminProductForm.tsx
│       │       ├── AdminOrderList.tsx
│       │       ├── AdminOrderDetail.tsx
│       │       └── useAdminPolling.ts
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Navbar.tsx
│       │   │   ├── Footer.tsx
│       │   │   └── AdminLayout.tsx
│       │   ├── ui/
│       │   │   ├── Button.tsx
│       │   │   ├── Input.tsx
│       │   │   ├── Modal.tsx
│       │   │   ├── Toast.tsx
│       │   │   ├── Spinner.tsx
│       │   │   ├── Pagination.tsx
│       │   │   └── StarRating.tsx
│       │   └── guards/
│       │       ├── ProtectedRoute.tsx
│       │       └── AdminRoute.tsx
│       ├── pages/
│       │   ├── HomePage.tsx
│       │   ├── NotFoundPage.tsx
│       │   └── ProfilePage.tsx
│       ├── hooks/
│       │   ├── useDebounce.ts
│       │   └── useLocalStorage.ts
│       ├── utils/
│       │   ├── formatCurrency.ts
│       │   ├── formatDate.ts
│       │   └── cn.ts
│       └── types/
│           ├── user.types.ts
│           ├── product.types.ts
│           ├── order.types.ts
│           └── api.types.ts
│
├── backend/                        # Express API (Node.js + TypeScript)
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   ├── .env.example
│   ├── vercel.json
│   └── src/
│       ├── app.ts                  # Express app setup (no listen())
│       ├── server.ts               # Local dev entry (app.listen)
│       ├── config/
│       │   ├── db.ts               # Mongoose connection (cached for serverless)
│       │   └── env.ts              # Env validation
│       ├── api/
│       │   ├── routes/
│       │   │   ├── auth.routes.ts
│       │   │   ├── product.routes.ts
│       │   │   ├── order.routes.ts
│       │   │   ├── review.routes.ts
│       │   │   ├── admin.routes.ts
│       │   │   └── webhook.routes.ts
│       │   ├── controllers/
│       │   │   ├── auth.controller.ts
│       │   │   ├── product.controller.ts
│       │   │   ├── order.controller.ts
│       │   │   ├── review.controller.ts
│       │   │   └── admin.controller.ts
│       │   └── middleware/
│       │       ├── auth.middleware.ts
│       │       ├── role.middleware.ts
│       │       ├── error.middleware.ts
│       │       └── validate.middleware.ts
│       ├── services/
│       │   ├── auth.service.ts
│       │   ├── product.service.ts
│       │   ├── order.service.ts
│       │   ├── review.service.ts
│       │   ├── admin.service.ts
│       │   ├── email.service.ts
│       │   ├── stripe.service.ts
│       │   └── cloudinary.service.ts
│       ├── models/
│       │   ├── User.model.ts
│       │   ├── Product.model.ts
│       │   ├── Order.model.ts
│       │   ├── Review.model.ts
│       │   └── RefreshToken.model.ts
│       ├── utils/
│       │   ├── AppError.ts
│       │   └── generateTokens.ts
│       └── types/
│           ├── express.d.ts        # Augment req.user type
│           └── index.ts
│
└── api/                            # Vercel serverless entry point
    └── index.ts                    # imports app from backend/src/app
```

### Architectural Boundaries

**API Boundaries:**
- All client→server communication via `/api/v1/*` REST endpoints
- Stripe webhook at `/api/v1/webhooks/stripe` (raw body parser, signature verified)
- Admin routes at `/api/v1/admin/*` — require `role: 'admin'` in JWT
- Auth routes at `/api/v1/auth/*` — public (login, register) + protected (refresh, logout)

**Component Boundaries:**
- `ProtectedRoute` / `AdminRoute` guard components enforce auth at the router level
- Redux store is the single source of truth for auth state and cart — no prop drilling
- Feature folders are self-contained — cross-feature communication via Redux store only

**Service Boundaries:**
- Controllers are thin — extract params, call service, return response
- Services contain all business logic — no `req`/`res` objects
- `email.service.ts`, `stripe.service.ts`, `cloudinary.service.ts` are pure utility services

**Data Boundaries:**
- All DB access through Mongoose models — no raw MongoDB driver calls
- Mongoose connection cached at module level for serverless reuse
- Stripe handles all card data — never passes through application layer

### Requirements to Structure Mapping

| FR Category | Backend | Frontend |
|---|---|---|
| Auth & RBAC (FR1–FR7) | `auth.routes/controller/service`, `auth.middleware`, `role.middleware`, `User.model` | `features/auth/`, `store/authSlice`, `guards/` |
| Product Catalog (FR8–FR14) | `product.routes/controller/service`, `Product.model` | `features/products/` |
| Cart & Checkout (FR15–FR23) | `order.routes/controller/service`, `stripe.service`, `webhook.routes` | `features/cart/`, `features/checkout/`, `store/cartSlice` |
| Order Management (FR24–FR28) | `order.routes/controller/service`, `email.service` | `features/orders/`, `useOrderStatusPolling` |
| Reviews (FR29–FR30) | `review.routes/controller/service`, `Review.model` | `features/reviews/` |
| Admin Dashboard (FR31–FR40) | `admin.routes/controller/service`, `stripe.service` | `features/admin/`, `useAdminPolling` |
| Notifications (FR41–FR44) | `email.service`, polling endpoints | `useOrderStatusPolling`, `useAdminPolling` |
| SEO (FR45–FR46) | sitemap + robots.txt routes in `app.ts` | React Helmet Async in page components |

### Data Flow

```
Customer checkout:
Frontend → POST /api/v1/orders/create-payment-intent
         → Stripe Payment Intent created
         → Frontend confirms payment (Stripe.js)
         → Stripe sends webhook → POST /api/v1/webhooks/stripe
         → Webhook: verify sig → create Order → decrement stock → send email
         → Customer polls GET /api/v1/orders/:id/status every 60s

Admin order management:
Admin dashboard polls GET /api/v1/admin/orders/recent every 30s
Admin updates → PATCH /api/v1/admin/orders/:id/status
             → email.service sends shipping notification to customer
```

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are compatible. React 19 + Vite 7 + Redux Toolkit + React Router v7 + Tailwind CSS v4 + Axios + React Helmet Async are current, actively maintained, and work together without conflicts. Express v5.1 + Mongoose + bcryptjs + jsonwebtoken + Stripe + Nodemailer + Cloudinary are all compatible with Node.js 18+. TypeScript strict mode supported across the full stack.

**Pattern Consistency:**
Naming conventions (camelCase fields, plural REST resources, PascalCase components) are consistent across backend and frontend. Layered backend architecture (routes → controllers → services → models) aligns with the stateless serverless deployment model. Redux Toolkit slice pattern aligns with feature-based frontend structure.

**Structure Alignment:**
Project structure directly supports all architectural decisions. Vercel serverless entry point (`api/index.ts`) correctly wraps the Express app. Mongoose connection caching in `config/db.ts` handles serverless cold-start reuse. Feature-based frontend folders align with Redux slice boundaries.

### Requirements Coverage Validation ✅

| FR Category | Covered By | Status |
|---|---|---|
| Auth & RBAC (FR1–FR7) | `auth.service`, `auth.middleware`, `role.middleware`, `User.model`, `authSlice` | ✅ |
| Product Catalog (FR8–FR14) | `product.service`, `Product.model`, `features/products/`, stock polling | ✅ |
| Cart & Checkout (FR15–FR23) | `cartSlice`, `stripe.service`, `webhook.routes`, atomic stock decrement | ✅ |
| Order Management (FR24–FR28) | `order.service`, `email.service`, `useOrderStatusPolling` | ✅ |
| Reviews (FR29–FR30) | `review.service`, `Review.model`, `features/reviews/` | ✅ |
| Admin Dashboard (FR31–FR40) | `admin.service`, `useAdminPolling`, `stripe.service` refunds | ✅ |
| Notifications (FR41–FR44) | `email.service` (transactional), polling hooks | ✅ |
| SEO (FR45–FR46) | React Helmet Async, sitemap/robots.txt in `app.ts` | ✅ |

**Non-Functional Requirements Coverage:**
- Performance: Mongoose indexes, image lazy-loading, Cloudinary optimized delivery ✅
- Security: bcrypt, JWT httpOnly, webhook signature verification, CORS, `express-validator` ✅
- Reliability: Idempotent webhook handler, atomic stock decrement, centralized error middleware ✅
- Scalability: Stateless API, cached Mongoose connection, externalized image storage ✅
- Integration: Stripe, Nodemailer, Cloudinary all have dedicated service files ✅

### Implementation Readiness Validation ✅

- All critical decisions documented with specific packages and versions
- Every FR maps to specific files — no ambiguous "TBD" decisions remain
- API response shape, error handling, polling pattern, Redux slice shape, naming conventions all specified with concrete examples

### Gap Analysis Results

**No Critical Gaps** — all 46 FRs are architecturally supported.

**Minor gaps (non-blocking, address during implementation):**
- Mongoose schema field definitions — handled in epics/stories phase
- Stripe client-side Payment Intent flow (Stripe.js) — standard pattern, well-documented
- Email template content — content decisions, not architectural

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** ✅ READY FOR IMPLEMENTATION

**Confidence Level:** High — all 16 checklist items confirmed, no critical gaps

**Key Strengths:**
- Clean separation of concerns (routes → controllers → services → models)
- Deployment constraints (Vercel serverless) fully accounted for in architecture
- All real-time features gracefully handled via polling with clear upgrade path to Socket.io
- Every FR traces to a specific file/service

**Areas for Future Enhancement:**
- Migrate to persistent server (Railway/Fly.io) to enable Socket.io real-time
- Add Redis for session caching when traffic grows
- Add rate limiting middleware (`express-rate-limit`) before going live

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use the standard `{ success, data, message }` response shape — no exceptions
- Place business logic in services, not controllers
- Use `AppError` for all expected errors
- Refer to this document for all architectural questions

**First Implementation Story:**
```bash
# Frontend
npm create vite@latest frontend -- --template react-ts

# Backend
cd backend && npm init -y
npm install express@^5.1.0 mongoose cors dotenv bcryptjs jsonwebtoken stripe nodemailer cloudinary multer express-validator
npm install -D typescript @types/express @types/node ts-node-dev
```
