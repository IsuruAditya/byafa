---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
---

# simple-ecommerce - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for simple-ecommerce, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Customers can register with email and password
FR2: Customers can log in and log out securely
FR3: Customers can view and update their profile information
FR4: Customers can delete their account
FR5: Admin/Seller can log in with elevated role access
FR6: The system enforces role-based access control (customer vs admin/seller)
FR7: The system invalidates sessions on logout
FR8: Customers can browse all available products in a paginated catalog
FR9: Customers can search products by name and keyword
FR10: Customers can filter products by category
FR11: Customers can sort products by price, newest, and popularity
FR12: Customers can view a product detail page with images, description, price, and stock status
FR13: The system displays real-time stock count updates on product pages
FR14: Customers can view all reviews and average rating for a product
FR15: Customers can add products to a cart
FR16: Customers can update item quantities in the cart
FR17: Customers can remove items from the cart
FR18: Guest users can maintain a cart that persists across page refreshes
FR19: Cart contents are preserved when a guest user logs in
FR20: Customers can proceed to checkout and enter shipping details
FR21: Customers can complete payment via Stripe (card payments)
FR22: The system validates stock availability at the point of order placement
FR23: The system confirms orders via Stripe webhook before marking them as placed
FR24: Customers can view their full order history
FR25: Customers can view the details of a specific order
FR26: Customers receive real-time order status updates without page refresh
FR27: Customers receive an email confirmation immediately after placing an order
FR28: Customers receive an email notification when their order status changes to shipped
FR29: Authenticated customers can submit a rating and text review on a product they have purchased
FR30: Customers can view all reviews and average rating on a product detail page
FR31: Admin can view a real-time dashboard showing today's orders, total revenue, and pending fulfillments
FR32: Admin receives a real-time notification when a new order is placed
FR33: Admin can view income and expense summary by time period
FR34: Admin can create, edit, and delete products (images, description, price, stock quantity, category)
FR35: Admin can update product inventory (stock levels)
FR36: Admin can view all orders with search and filter by customer, status, and date
FR37: Admin can view full details of any order
FR38: Admin can update order status (pending → processing → shipped → delivered)
FR39: Admin can manually override order status
FR40: Admin can initiate a refund for an order via Stripe
FR41: The system sends a transactional email on order confirmation
FR42: The system sends a transactional email when order status changes to shipped
FR43: The system pushes real-time order status updates to the relevant customer via Socket.io
FR44: The system pushes real-time new order notifications to the admin dashboard via Socket.io
FR45: Product and category pages have dynamic meta titles and descriptions
FR46: The application serves a sitemap and robots.txt

### NonFunctional Requirements

NFR1: LCP < 3 seconds on mobile (4G connection)
NFR2: TTI < 4 seconds on mobile
NFR3: API response time < 500ms for standard queries
NFR4: Stripe checkout completes without timeout under normal network conditions
NFR5: Product images lazy-loaded and served in optimized format (WebP preferred)
NFR6: Socket.io real-time events delivered within 1 second of trigger under normal load
NFR7: Passwords hashed with bcrypt (minimum 10 salt rounds)
NFR8: JWT access tokens short-lived (15–60 min); refresh token pattern for session continuity
NFR9: JWT stored in httpOnly cookies or localStorage with XSS mitigation
NFR10: All routes over HTTPS; HTTP redirects to HTTPS
NFR11: Admin/seller routes protected by server-side role middleware — no client-side role trust
NFR12: Raw card data never stored or transmitted — Stripe handles PCI-DSS
NFR13: Stripe webhook signatures verified on every incoming event
NFR14: Sensitive data (passwords, tokens, card info) never logged
NFR15: Input validation and sanitization on all API endpoints
NFR16: CORS configured to allow only trusted origins
NFR17: API layer stateless to support horizontal scaling
NFR18: MongoDB indexes on frequently queried fields
NFR19: Socket.io rooms scoped to order ID and admin channel only
NFR20: Image storage externalized (Cloudinary) to keep application server stateless
NFR21: 99.5%+ uptime post-launch
NFR22: Stripe webhook handlers idempotent — duplicate delivery does not create duplicate orders
NFR23: Stock decrement atomic at order placement — concurrent checkouts cannot oversell
NFR24: Graceful error handling on all API routes — no unhandled exceptions in production
NFR25: Failed payment attempts return clear, user-friendly error messages

### Additional Requirements

- Project uses monorepo structure with separate `frontend/` and `backend/` directories
- Frontend: React 19 + TypeScript + Vite 7, initialized via `npm create vite@latest frontend -- --template react-ts`
- Backend: Express v5.1 + TypeScript + Node.js 18+, manual npm init with specified dependencies
- Backend deployed as Vercel Serverless Functions via `@vercel/node`; entry point `api/index.ts` wraps Express app
- Mongoose connection must be cached at module level for serverless reuse across invocations
- All API routes prefixed `/api/v1/`
- Stripe webhook handler at `/api/v1/webhooks/stripe` requires raw body parser and signature verification
- Real-time features (FR13, FR26, FR31, FR32, FR43, FR44) implemented via HTTP polling (Socket.io deferred post-MVP): admin polls every 30s, order status polls every 60s, stock polls on page load + add-to-cart
- Redux Toolkit store with `authSlice`, `cartSlice`, `uiSlice`; cart persisted to localStorage
- Axios instance with JWT interceptor and 401 refresh token handling
- Centralized error middleware using `AppError` class; standard response shape `{ success, data, message }`
- `express-validator` on all mutating routes
- Cloudinary for image hosting (multer local storage as MVP fallback)
- Nodemailer with Gmail SMTP for transactional email
- MongoDB Atlas M0 free tier
- Frontend deployed on Vercel; backend deployed on Vercel Serverless Functions
- React Helmet Async for SEO meta tags; sitemap and robots.txt served from Express

### UX Design Requirements

No UX Design document provided — UX requirements derived from PRD user journeys and functional requirements.

### FR Coverage Map

FR1: Epic 2 — Customer registers with email and password
FR2: Epic 2 — Customer logs in and out securely
FR3: Epic 2 — Customer views and updates profile
FR4: Epic 2 — Customer deletes account
FR5: Epic 2 — Admin logs in with elevated role access
FR6: Epic 2 — System enforces RBAC (customer vs admin)
FR7: Epic 2 — System invalidates sessions on logout
FR8: Epic 3 — Customers browse paginated product catalog
FR9: Epic 3 — Customers search products by name/keyword
FR10: Epic 3 — Customers filter products by category
FR11: Epic 3 — Customers sort products by price/newest/popularity
FR12: Epic 3 — Customers view product detail page
FR13: Epic 3 — System displays stock count (polling on load + add-to-cart)
FR14: Epic 3 — Customers view reviews and average rating on product page
FR15: Epic 4 — Customers add products to cart
FR16: Epic 4 — Customers update item quantities in cart
FR17: Epic 4 — Customers remove items from cart
FR18: Epic 4 — Guest cart persists across page refreshes (localStorage)
FR19: Epic 4 — Cart merges with account on login
FR20: Epic 5 — Customers enter shipping details at checkout
FR21: Epic 5 — Customers complete payment via Stripe
FR22: Epic 5 — System validates stock at order placement
FR23: Epic 5 — System confirms orders via Stripe webhook
FR24: Epic 6 — Customers view full order history
FR25: Epic 6 — Customers view individual order details
FR26: Epic 6 — Customers receive order status updates (polling every 60s)
FR27: Epic 5 — Customers receive order confirmation email
FR28: Epic 6 — Customers receive shipping update email
FR29: Epic 7 — Authenticated customers submit rating and text review on purchased product
FR30: Epic 7 — Customers view all reviews and average rating on product detail page
FR31: Epic 8 — Admin views real-time dashboard (polling every 30s)
FR32: Epic 8 — Admin receives new order notification (polling)
FR33: Epic 8 — Admin views income/expense summary by time period
FR34: Epic 8 — Admin creates, edits, deletes products with images
FR35: Epic 8 — Admin updates product inventory (stock levels)
FR36: Epic 8 — Admin views all orders with search and filter
FR37: Epic 8 — Admin views full order details
FR38: Epic 8 — Admin updates order status
FR39: Epic 8 — Admin manually overrides order status
FR40: Epic 8 — Admin initiates Stripe refund
FR41: Epic 5 — System sends transactional email on order confirmation
FR42: Epic 6 — System sends transactional email when order ships
FR43: Epic 6 — System pushes order status updates to customer (polling)
FR44: Epic 8 — System pushes new order notifications to admin (polling)
FR45: Epic 9 — Product/category pages have dynamic meta titles and descriptions
FR46: Epic 9 — Application serves sitemap and robots.txt

## Epic List

### Epic 1: Project Foundation & Infrastructure
Set up the monorepo, configure Vite + React frontend, Express + TypeScript backend, Vercel deployment config, MongoDB Atlas connection, and base middleware (CORS, error handling, env validation). Enables all subsequent epics.
**FRs covered:** Infrastructure (enables FR1–FR46), Additional Requirements

### Epic 2: User Authentication & Account Management
Users can register, log in, log out, view/update their profile, and delete their account. Admins log in with elevated access. JWT + refresh token system, RBAC middleware, and session invalidation fully operational.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

### Epic 3: Product Catalog & Discovery
Customers can browse a paginated product catalog, search by keyword, filter by category, sort by price/newest/popularity, and view full product detail pages with images, description, price, and stock status.
**FRs covered:** FR8, FR9, FR10, FR11, FR12, FR13, FR14

### Epic 4: Shopping Cart
Customers can add products to cart, update quantities, and remove items. Guest cart persists in localStorage. Cart merges with account on login.
**FRs covered:** FR15, FR16, FR17, FR18, FR19

### Epic 5: Checkout & Payment
Customers enter shipping details and complete payment via Stripe Payment Intents. Stock validated at order placement. Orders confirmed via Stripe webhook. Order confirmation email sent immediately.
**FRs covered:** FR20, FR21, FR22, FR23, FR27, FR41

### Epic 6: Order Management (Customer)
Customers view their full order history, individual order details, and order status updates via polling. Email notification sent when order ships.
**FRs covered:** FR24, FR25, FR26, FR28, FR42, FR43

### Epic 7: Product Reviews
Authenticated customers who have purchased a product can submit a rating and text review. All customers can view reviews and average rating on product detail pages.
**FRs covered:** FR29, FR30

### Epic 8: Admin Dashboard & Store Management
Admin views a real-time dashboard (polling every 30s), manages products (CRUD + images + inventory), manages orders (search, filter, view, update status, refund), and views income/expense summary.
**FRs covered:** FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39, FR40, FR44

### Epic 9: SEO, Polish & Production Readiness
React Helmet Async for dynamic meta tags. Sitemap and robots.txt. Performance optimizations (image lazy-loading, Cloudinary WebP). Final accessibility pass.
**FRs covered:** FR45, FR46, NFR1–NFR5


---

## Epic 1: Project Foundation & Infrastructure

Set up the complete monorepo structure, configure frontend and backend tooling, establish Vercel deployment configuration, connect MongoDB Atlas, and implement base middleware. This epic has no user-facing features but enables all subsequent epics.

### Story 1.1: Initialize Monorepo and Frontend Scaffold

As a developer,
I want a working Vite + React + TypeScript frontend scaffold with Tailwind CSS configured,
So that all frontend development can begin from a consistent, production-ready base.

**Acceptance Criteria:**

**Given** the project root directory exists
**When** the frontend scaffold is initialized
**Then** `frontend/` contains a working Vite 7 + React 19 + TypeScript project
**And** Tailwind CSS v4 is installed and configured with a base `index.css`
**And** ESLint is configured with React and TypeScript rules
**And** `npm run dev` starts the development server without errors
**And** `npm run build` produces a production build without errors

---

### Story 1.2: Initialize Backend Scaffold with Express and TypeScript

As a developer,
I want a working Express v5.1 + TypeScript backend with all required dependencies installed,
So that all backend development can begin from a consistent, production-ready base.

**Acceptance Criteria:**

**Given** the `backend/` directory exists
**When** the backend scaffold is initialized
**Then** `backend/package.json` includes express, mongoose, cors, dotenv, bcryptjs, jsonwebtoken, stripe, nodemailer, cloudinary, multer, express-validator
**And** TypeScript is configured with strict mode enabled
**And** `ts-node-dev` is configured for hot reload in development
**And** `backend/src/app.ts` sets up Express with CORS, JSON body parser, and `/api/v1/` route prefix
**And** `backend/src/server.ts` starts the server locally without errors
**And** `backend/src/config/env.ts` validates required environment variables on startup

---

### Story 1.3: Configure MongoDB Atlas Connection with Serverless Caching

As a developer,
I want a Mongoose connection that caches across serverless function invocations,
So that cold starts don't create new DB connections on every request.

**Acceptance Criteria:**

**Given** a valid `MONGO_URI` environment variable is set
**When** the backend starts or a serverless function is invoked
**Then** Mongoose connects to MongoDB Atlas successfully
**And** the connection is cached at module level and reused on subsequent invocations
**And** connection errors are logged and the process exits with a non-zero code in development
**And** `GET /api/v1/health` returns `{ success: true, message: "OK" }` when DB is connected

---

### Story 1.4: Implement Centralized Error Handling and AppError

As a developer,
I want a centralized error handling system with a custom AppError class,
So that all API errors return a consistent `{ success, message, errors? }` response shape.

**Acceptance Criteria:**

**Given** any route handler throws an `AppError(message, statusCode)`
**When** the error reaches the centralized error middleware
**Then** the response returns `{ success: false, message }` with the correct HTTP status code
**And** unhandled errors return `{ success: false, message: "Internal server error" }` with status 500
**And** stack traces are never included in production responses
**And** `express-validator` validation errors are formatted as `{ success: false, message, errors: [{ field, message }] }`

---

### Story 1.5: Configure Vercel Serverless Deployment

As a developer,
I want the backend deployed as a Vercel Serverless Function and the frontend deployed as a Vercel static site,
So that both can be deployed to Vercel without a credit card.

**Acceptance Criteria:**

**Given** `api/index.ts` imports and exports the Express app from `backend/src/app.ts`
**When** the project is deployed to Vercel
**Then** `vercel.json` correctly routes all `/api/*` requests to the serverless function
**And** the frontend SPA is served as a static site with client-side routing fallback
**And** environment variables are configured in Vercel dashboard for both frontend and backend
**And** `GET /api/v1/health` returns 200 on the deployed Vercel URL

---

### Story 1.6: Configure Redux Toolkit Store and Axios Instance

As a developer,
I want a configured Redux Toolkit store with base slices and an Axios instance with JWT interceptors,
So that all frontend features can use consistent state management and API communication.

**Acceptance Criteria:**

**Given** the frontend is running
**When** the Redux store is initialized
**Then** `authSlice`, `cartSlice`, and `uiSlice` are registered in the root reducer
**And** `cartSlice` rehydrates from `localStorage` on app init
**And** the Axios instance includes a request interceptor that attaches the JWT access token from `authSlice`
**And** the Axios instance includes a response interceptor that attempts token refresh on 401 and retries the original request
**And** failed refresh redirects the user to the login page

---

## Epic 2: User Authentication & Account Management

Users can register, log in, log out, view and update their profile, and delete their account. Admins log in with elevated access. JWT + refresh token system and RBAC middleware are fully operational.

### Story 2.1: User Registration

As a new customer,
I want to register with my email and password,
So that I can create an account and start shopping.

**Acceptance Criteria:**

**Given** I am on the registration page
**When** I submit a valid email and password (min 8 chars)
**Then** a new User document is created in MongoDB with role `customer`
**And** the password is hashed with bcrypt (12 salt rounds)
**And** an access token (15min) and refresh token (7 days) are returned
**And** the refresh token is stored in an httpOnly cookie
**And** I am redirected to the homepage as an authenticated user
**And** submitting a duplicate email returns `{ success: false, message: "Email already in use" }` with status 409
**And** invalid input returns validation errors with status 400

---

### Story 2.2: User Login and Logout

As a registered customer,
I want to log in with my email and password and log out when done,
So that I can securely access my account and end my session.

**Acceptance Criteria:**

**Given** I am on the login page
**When** I submit valid credentials
**Then** I receive a new access token and refresh token
**And** `authSlice` is updated with `{ user, accessToken, isAuthenticated: true }`
**And** I am redirected to the homepage

**Given** I am logged in
**When** I click logout
**Then** the refresh token is invalidated in the database
**And** the httpOnly cookie is cleared
**And** `authSlice` is reset to unauthenticated state
**And** I am redirected to the login page

**Given** I submit incorrect credentials
**When** the login request is processed
**Then** I receive `{ success: false, message: "Invalid email or password" }` with status 401

---

### Story 2.3: JWT Refresh Token Flow

As an authenticated user,
I want my session to automatically refresh when my access token expires,
So that I don't get logged out unexpectedly during normal use.

**Acceptance Criteria:**

**Given** my access token has expired
**When** I make an API request
**Then** the Axios interceptor detects the 401 response
**And** automatically calls `POST /api/v1/auth/refresh` with the httpOnly refresh token cookie
**And** receives a new access token and updates `authSlice`
**And** retries the original request with the new token
**And** if the refresh token is also expired or invalid, I am redirected to login

---

### Story 2.4: View and Update Profile

As a logged-in customer,
I want to view and update my profile information,
So that I can keep my account details current.

**Acceptance Criteria:**

**Given** I am logged in and on the profile page
**When** the page loads
**Then** my current name and email are displayed

**Given** I submit updated profile information
**When** the update request is processed
**Then** my User document is updated in MongoDB
**And** a success message is displayed
**And** attempting to change email to one already in use returns a 409 error

---

### Story 2.5: Delete Account

As a logged-in customer,
I want to delete my account,
So that I can remove my data from the platform.

**Acceptance Criteria:**

**Given** I am on the profile page
**When** I click "Delete Account" and confirm the action
**Then** my User document is deleted from MongoDB
**And** all my refresh tokens are invalidated
**And** I am logged out and redirected to the homepage
**And** a confirmation modal is shown before deletion to prevent accidental deletion

---

### Story 2.6: Admin Login and RBAC Middleware

As an admin,
I want to log in and access admin-only routes,
So that I can manage the store securely.

**Acceptance Criteria:**

**Given** a user with `role: "admin"` logs in
**When** they access any `/api/v1/admin/*` route
**Then** the `auth.middleware` verifies the JWT and attaches `req.user`
**And** the `role.middleware` checks `req.user.role === "admin"` and allows access
**And** a customer attempting to access admin routes receives status 403
**And** an unauthenticated request to any protected route receives status 401
**And** `AdminRoute` component in the frontend redirects non-admin users to the homepage

---

## Epic 3: Product Catalog & Discovery

Customers can browse a paginated product catalog, search by keyword, filter by category, sort by price/newest/popularity, and view full product detail pages with images, description, price, and stock status.

### Story 3.1: Product Model and Seed Data

As a developer,
I want a Product Mongoose model with all required fields and indexes,
So that product data can be stored, queried, and retrieved efficiently.

**Acceptance Criteria:**

**Given** the backend is running
**When** the Product model is defined
**Then** it includes: `name`, `description`, `price`, `images` (array), `category`, `stockQuantity`, `ratings` (average + count), `createdAt`, `updatedAt`
**And** MongoDB indexes exist on `name` (text), `category`, and `price`
**And** `timestamps: true` is set on the schema
**And** at least 5 seed products can be inserted via a seed script for development

---

### Story 3.2: Product Catalog API

As a developer,
I want REST API endpoints for browsing, searching, filtering, and sorting products,
So that the frontend can display the product catalog.

**Acceptance Criteria:**

**Given** products exist in the database
**When** `GET /api/v1/products` is called
**Then** it returns paginated products with `{ success: true, data: [...], pagination: { page, pageSize, total, totalPages } }`
**And** `?search=keyword` filters by product name (case-insensitive text search)
**And** `?category=electronics` filters by category
**And** `?sortBy=price_asc|price_desc|newest|popularity` sorts results accordingly
**And** `?page=1&pageSize=12` controls pagination
**And** `GET /api/v1/products/:id` returns a single product or 404 if not found

---

### Story 3.3: Product Catalog Page (Frontend)

As a customer,
I want to browse all products with search, filter, and sort controls,
So that I can find products I'm interested in.

**Acceptance Criteria:**

**Given** I am on the products page
**When** the page loads
**Then** products are displayed in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
**And** each product card shows image, name, price, and average rating
**And** a search bar filters products as I type (debounced 300ms)
**And** category filter buttons narrow the product list
**And** sort dropdown changes the order of results
**And** pagination controls navigate between pages
**And** a loading spinner is shown while products are fetching

---

### Story 3.4: Product Detail Page (Frontend)

As a customer,
I want to view a full product detail page with all information,
So that I can make an informed purchase decision.

**Acceptance Criteria:**

**Given** I click on a product
**When** the product detail page loads
**Then** I see the product name, description, price, category, and stock status
**And** product images are displayed (with lazy loading)
**And** the average rating and review count are shown
**And** an "Add to Cart" button is visible (disabled if out of stock)
**And** the stock count is fetched on page load and refreshed when I add to cart
**And** React Helmet sets the page `<title>` and `<meta description>` to the product name and description

---

## Epic 4: Shopping Cart

Customers can add products to cart, update quantities, and remove items. Guest cart persists in localStorage. Cart merges with account on login.

### Story 4.1: Cart State Management (Redux)

As a developer,
I want a Redux cartSlice that persists to localStorage and merges on login,
So that cart state is consistent for both guest and authenticated users.

**Acceptance Criteria:**

**Given** the Redux store is initialized
**When** `cartSlice` is configured
**Then** it manages `items: [{ productId, name, price, image, quantity, stockQuantity }]`
**And** every state change is synced to `localStorage` via a store subscriber
**And** on app init, cart is rehydrated from `localStorage`
**And** when a user logs in, guest cart items are merged with any server-side cart (guest items take precedence for quantity)
**And** cart is cleared from `localStorage` on logout

---

### Story 4.2: Add to Cart, Update Quantity, Remove Item

As a customer,
I want to add products to my cart, change quantities, and remove items,
So that I can manage what I intend to purchase.

**Acceptance Criteria:**

**Given** I am on a product detail page
**When** I click "Add to Cart"
**Then** the product is added to `cartSlice` with quantity 1
**And** if the product is already in the cart, the quantity increments by 1
**And** quantity cannot exceed `stockQuantity`
**And** a toast notification confirms the item was added

**Given** I am on the cart page
**When** I change the quantity input for an item
**Then** `cartSlice` updates the quantity for that item
**And** setting quantity to 0 removes the item from the cart

**Given** I click "Remove" on a cart item
**When** the action is dispatched
**Then** the item is removed from `cartSlice` and `localStorage`

---

### Story 4.3: Cart Page

As a customer,
I want to view my cart with a summary and proceed to checkout,
So that I can review my order before paying.

**Acceptance Criteria:**

**Given** I navigate to the cart page
**When** the page loads
**Then** all cart items are displayed with image, name, price, and quantity controls
**And** the order subtotal is calculated and displayed
**And** an empty cart shows a message and a link to the products page
**And** a "Proceed to Checkout" button is visible (redirects to login if not authenticated)

---

## Epic 5: Checkout & Payment

Customers enter shipping details and complete payment via Stripe Payment Intents. Stock validated at order placement. Orders confirmed via Stripe webhook. Order confirmation email sent immediately.

### Story 5.1: Order and Stripe Models

As a developer,
I want Order and RefreshToken Mongoose models with all required fields,
So that orders and payment data can be stored and queried.

**Acceptance Criteria:**

**Given** the backend is running
**When** the Order model is defined
**Then** it includes: `userId`, `items` (array of `{ productId, name, price, quantity }`), `shippingAddress`, `totalAmount`, `status` (enum: `pending|processing|shipped|delivered|cancelled`), `stripePaymentIntentId`, `stripeChargeId`, `createdAt`, `updatedAt`
**And** MongoDB indexes exist on `userId`, `status`, and `createdAt`
**And** `timestamps: true` is set on the schema
**And** `RefreshToken` model stores `userId`, `token` (hashed), `expiresAt`

---

### Story 5.2: Checkout Flow — Shipping and Payment Intent

As a customer,
I want to enter my shipping details and initiate a Stripe payment,
So that I can complete my purchase securely.

**Acceptance Criteria:**

**Given** I am authenticated and have items in my cart
**When** I navigate to the checkout page
**Then** I see a shipping address form (name, address line 1, city, state, postal code, country)
**And** submitting the form calls `POST /api/v1/orders/create-payment-intent`
**And** the backend validates stock availability for all cart items atomically
**And** if stock is insufficient, a 409 error is returned with the affected product name
**And** if stock is available, a Stripe Payment Intent is created and the `clientSecret` is returned
**And** the Stripe payment form (Stripe Elements) is displayed for card entry

---

### Story 5.3: Stripe Webhook — Order Confirmation

As a developer,
I want an idempotent Stripe webhook handler that creates orders on successful payment,
So that orders are only created after payment is confirmed.

**Acceptance Criteria:**

**Given** Stripe sends a `payment_intent.succeeded` webhook event
**When** the webhook handler at `POST /api/v1/webhooks/stripe` processes it
**Then** the Stripe webhook signature is verified using `stripe.webhooks.constructEvent()`
**And** if the order for this `paymentIntentId` already exists, the handler returns 200 without creating a duplicate
**And** a new Order document is created with status `pending`
**And** stock quantities are decremented atomically using `findOneAndUpdate` with `$inc`
**And** the order confirmation email is sent via `email.service`
**And** the webhook handler returns 200 to Stripe within 30 seconds

---

### Story 5.4: Order Confirmation Email

As a customer,
I want to receive an order confirmation email immediately after my payment is confirmed,
So that I have a record of my purchase.

**Acceptance Criteria:**

**Given** a Stripe webhook confirms a successful payment
**When** the order is created
**Then** Nodemailer sends an email to the customer's registered email address
**And** the email includes: order ID, list of items with quantities and prices, shipping address, and total amount
**And** the email is sent using Gmail SMTP with app password authentication
**And** email sending failures are logged but do not cause the webhook handler to return an error to Stripe

---

## Epic 6: Order Management (Customer)

Customers view their full order history, individual order details, and order status updates via polling. Email notification sent when order ships.

### Story 6.1: Order History and Detail Pages

As a customer,
I want to view my order history and the details of each order,
So that I can track what I've purchased.

**Acceptance Criteria:**

**Given** I am logged in and navigate to my order history
**When** the page loads
**Then** `GET /api/v1/orders` returns my orders sorted by `createdAt` descending
**And** each order shows: order ID, date, status, total amount, and a link to the detail page
**And** an empty state is shown if I have no orders

**Given** I click on an order
**When** the order detail page loads
**Then** `GET /api/v1/orders/:id` returns the full order including items, shipping address, status, and timestamps
**And** a 403 is returned if I try to access another user's order

---

### Story 6.2: Order Status Polling

As a customer,
I want my order status to update automatically while I'm viewing my order,
So that I can see when my order is being processed or shipped without refreshing.

**Acceptance Criteria:**

**Given** I am on the order detail page
**When** the page is open
**Then** `GET /api/v1/orders/:id/status` is polled every 60 seconds
**And** the displayed status updates if the server returns a new status
**And** polling stops when I navigate away from the page (cleanup on unmount)
**And** `GET /api/v1/orders/:id/status` returns `{ success: true, data: { status } }`

---

### Story 6.3: Shipping Notification Email

As a customer,
I want to receive an email when my order status changes to "shipped",
So that I know my order is on its way.

**Acceptance Criteria:**

**Given** an admin updates an order status to `shipped`
**When** the status update is saved
**Then** Nodemailer sends a shipping notification email to the customer
**And** the email includes: order ID, list of items, and a message that the order has shipped
**And** the email is only sent once per order (not on subsequent status changes)
**And** email sending failures are logged but do not cause the status update to fail

---

## Epic 7: Product Reviews

Authenticated customers who have purchased a product can submit a rating and text review. All customers can view reviews and average rating on product detail pages.

### Story 7.1: Review Model and API

As a developer,
I want a Review Mongoose model and REST endpoints for creating and fetching reviews,
So that product reviews can be stored and displayed.

**Acceptance Criteria:**

**Given** the backend is running
**When** the Review model is defined
**Then** it includes: `productId`, `userId`, `rating` (1–5 integer), `comment` (string), `createdAt`, `updatedAt`
**And** a compound unique index on `{ productId, userId }` prevents duplicate reviews
**And** `GET /api/v1/products/:id/reviews` returns all reviews for a product with `{ success: true, data: [...] }`
**And** `POST /api/v1/products/:id/reviews` creates a review (authenticated customers only)
**And** submitting a review updates the product's `ratings.average` and `ratings.count` fields atomically

---

### Story 7.2: Review Submission (Frontend)

As a customer who has purchased a product,
I want to submit a star rating and written review,
So that I can share my experience with other shoppers.

**Acceptance Criteria:**

**Given** I am logged in and have a delivered order containing the product
**When** I visit the product detail page
**Then** a review form with a star rating selector (1–5) and text area is displayed
**And** submitting the form calls `POST /api/v1/products/:id/reviews`
**And** on success, my review appears in the review list immediately
**And** if I have already reviewed this product, the form is replaced with my existing review
**And** unauthenticated users see a "Log in to leave a review" message instead of the form
**And** customers who have not purchased the product see a "Purchase this product to leave a review" message

---

### Story 7.3: Review Display

As a customer,
I want to see all reviews and the average rating on a product detail page,
So that I can make an informed purchase decision.

**Acceptance Criteria:**

**Given** I am on a product detail page
**When** the page loads
**Then** the average star rating and total review count are displayed prominently
**And** all reviews are listed with: reviewer name (first name only), star rating, comment, and date
**And** reviews are sorted by most recent first
**And** if there are no reviews, a "No reviews yet" message is shown

---

## Epic 8: Admin Dashboard & Store Management

Admin views a real-time dashboard (polling every 30s), manages products (CRUD + images + inventory), manages orders (search, filter, view, update status, refund), and views income/expense summary.

### Story 8.1: Admin Product Management (CRUD)

As an admin,
I want to create, edit, and delete products with images,
So that I can manage the store's product catalog.

**Acceptance Criteria:**

**Given** I am logged in as admin and on the product management page
**When** I create a new product
**Then** `POST /api/v1/admin/products` creates a Product document with all fields
**And** images are uploaded to Cloudinary and the returned URLs are stored in `product.images`
**And** the new product appears in the product list immediately

**Given** I edit an existing product
**When** I submit the updated form
**Then** `PUT /api/v1/admin/products/:id` updates the product document
**And** existing images can be removed and new ones added

**Given** I delete a product
**When** I confirm the deletion
**Then** `DELETE /api/v1/admin/products/:id` removes the product document
**And** a confirmation modal prevents accidental deletion

---

### Story 8.2: Admin Inventory Management

As an admin,
I want to update stock levels for products,
So that inventory is accurate and customers see correct stock status.

**Acceptance Criteria:**

**Given** I am on the product management page
**When** I update the stock quantity for a product
**Then** `PATCH /api/v1/admin/products/:id/inventory` updates `stockQuantity`
**And** the updated stock is reflected on the product detail page within the next poll cycle
**And** setting stock to 0 marks the product as out of stock and disables "Add to Cart"

---

### Story 8.3: Admin Order Management

As an admin,
I want to view, search, filter, and update all orders,
So that I can manage fulfillment and resolve customer issues.

**Acceptance Criteria:**

**Given** I am on the admin orders page
**When** the page loads
**Then** `GET /api/v1/admin/orders` returns all orders paginated, sorted by `createdAt` descending
**And** I can search by customer email or order ID
**And** I can filter by order status
**And** I can filter by date range

**Given** I click on an order
**When** the order detail page loads
**Then** I see full order details: customer info, items, shipping address, payment info, and status history

**Given** I update an order status
**When** I select a new status and save
**Then** `PATCH /api/v1/admin/orders/:id/status` updates the order status
**And** if status is set to `shipped`, the shipping notification email is triggered

---

### Story 8.4: Admin Stripe Refund

As an admin,
I want to initiate a refund for an order via Stripe,
So that I can resolve payment issues for customers.

**Acceptance Criteria:**

**Given** I am viewing an order detail page as admin
**When** I click "Issue Refund" and confirm
**Then** `POST /api/v1/admin/orders/:id/refund` calls the Stripe refund API with the order's `stripeChargeId`
**And** the order status is updated to `cancelled`
**And** a success message confirms the refund was initiated
**And** if the Stripe refund fails, an error message is shown and the order status is not changed

---

### Story 8.5: Admin Dashboard with Polling

As an admin,
I want a dashboard showing today's orders, revenue, and pending fulfillments that updates automatically,
So that I can monitor store activity in real time.

**Acceptance Criteria:**

**Given** I am logged in as admin and on the dashboard
**When** the page loads and every 30 seconds thereafter
**Then** `GET /api/v1/admin/dashboard` is polled and returns: today's order count, today's revenue, pending order count, and recent orders (last 5)
**And** the dashboard displays these metrics prominently
**And** a new order notification toast appears when the order count increases between polls
**And** polling stops when I navigate away from the dashboard

---

### Story 8.6: Admin Income and Expense Summary

As an admin,
I want to view income and expense summaries by time period,
So that I can understand the financial health of the store.

**Acceptance Criteria:**

**Given** I am on the admin dashboard
**When** I select a time period (today, this week, this month, custom range)
**Then** `GET /api/v1/admin/summary?from=&to=` returns total revenue, total orders, and average order value for the period
**And** the summary is displayed in a clear, readable format
**And** revenue is calculated from orders with status `processing`, `shipped`, or `delivered` only

---

## Epic 9: SEO, Polish & Production Readiness

React Helmet Async for dynamic meta tags on product and category pages. Sitemap and robots.txt. Performance optimizations. Final accessibility pass.

### Story 9.1: SEO Meta Tags with React Helmet Async

As a customer or search engine,
I want product and category pages to have accurate meta titles and descriptions,
So that the store is discoverable via search engines and social sharing.

**Acceptance Criteria:**

**Given** I visit a product detail page
**When** the page renders
**Then** `<title>` is set to `{product.name} | simple-ecommerce`
**And** `<meta name="description">` is set to the first 160 characters of `product.description`
**And** Open Graph tags (`og:title`, `og:description`, `og:image`) are set for social sharing

**Given** I visit the products catalog page
**When** the page renders
**Then** `<title>` is set to `Shop | simple-ecommerce`
**And** `<meta name="description">` describes the store

---

### Story 9.2: Sitemap and Robots.txt

As a search engine,
I want to access a sitemap and robots.txt from the store,
So that I can crawl and index the store's pages correctly.

**Acceptance Criteria:**

**Given** the backend is running
**When** `GET /sitemap.xml` is requested
**Then** it returns a valid XML sitemap including the homepage, products page, and all product detail page URLs
**And** the sitemap is regenerated dynamically from the current product list

**Given** `GET /robots.txt` is requested
**Then** it returns a valid robots.txt allowing all crawlers and pointing to the sitemap URL

---

### Story 9.3: Image Optimization and Performance

As a customer,
I want product images to load quickly and not slow down the page,
So that I have a fast shopping experience on mobile and desktop.

**Acceptance Criteria:**

**Given** product images are uploaded by the admin
**When** they are stored in Cloudinary
**Then** images are served with Cloudinary's automatic format optimization (WebP for supported browsers)
**And** images are served at appropriate dimensions (thumbnail for catalog, full for detail page)

**Given** I am on the products catalog page
**When** the page loads
**Then** product images below the fold are lazy-loaded using the `loading="lazy"` attribute
**And** all product images have descriptive `alt` text set to the product name

---

### Story 9.4: Accessibility and Final Polish

As a customer with accessibility needs,
I want the store to be navigable by keyboard and screen reader,
So that I can shop regardless of how I interact with the web.

**Acceptance Criteria:**

**Given** I navigate the store using only a keyboard
**When** I tab through the checkout, login, and product browsing flows
**Then** all interactive elements are reachable and have visible focus indicators
**And** forms have proper `<label>` elements associated with inputs
**And** all images have `alt` text
**And** color contrast meets a minimum ratio of 4.5:1 for body text
**And** the cart item count in the navbar is announced to screen readers when it changes
