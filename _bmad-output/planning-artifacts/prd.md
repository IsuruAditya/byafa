---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
releaseMode: phased
inputDocuments: []
workflowType: 'prd'
classification:
  projectType: web_app
  domain: ecommerce
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document — simple-ecommerce

**Author:** Aditya
**Date:** May 3, 2026

---

## Executive Summary

simple-ecommerce is a production-quality MERN stack e-commerce storefront for selling physical goods online. The platform serves two audiences: customers who browse, add to cart, and complete purchases via Stripe; and an owner-operator (Aditya) who acts as both admin and seller — managing product listings, inventory, and order fulfillment from a unified dashboard.

The project is greenfield, intended for real launch, built to portfolio-quality standards: real Stripe integration (test mode), secure JWT-based authentication, proper error handling, and a customer-facing storefront ready to share publicly.

This is not a tutorial clone or a mock store. It is a working storefront built by its first seller, with production concerns treated as first-class requirements from day one. The seller/admin experience is purpose-built for a single owner-operator — not a generic multi-vendor marketplace — keeping the UX focused and the architecture clean. The codebase is designed for future extensibility (multi-seller support) without premature complexity in the initial build.

**Project Type:** React SPA + Node.js/Express REST API + MongoDB
**Domain:** E-commerce — physical goods retail
**Complexity:** Medium — three user roles, real payment integration, inventory and order lifecycle management
**Context:** Greenfield

---

## Success Criteria

### User Success

- Customers find the exact product they're looking for via search and category filtering within 3 clicks from the homepage
- Checkout completes in under 2 minutes from cart to order confirmation
- Customers receive order confirmation email immediately after purchase and track order status from their account dashboard
- Customers can leave product reviews after a confirmed purchase
- All pages load in under 3 seconds on a standard mobile connection

### Business Success

- First real paid order processed within 1 week of launch
- 50+ orders processed within 3 months with zero payment failures
- Admin dashboard provides real-time visibility into income, expenses, and order volume at a glance
- Platform stable enough that Aditya actively directs customers to it as the primary purchase channel

### Technical Success

- Zero Stripe payment failures due to application errors (network/card failures are acceptable)
- 99.5%+ uptime post-launch
- LCP < 3 seconds on mobile and desktop
- Fully mobile-responsive across iOS Safari, Android Chrome, and desktop browsers
- JWT authentication with secure token handling — no auth bypass vulnerabilities
- All API endpoints return proper error responses; no unhandled exceptions in production
- HTTPS enforced; sensitive data never logged

### Measurable Outcomes

- 100% of orders have a trackable status visible to the customer
- Admin dashboard shows income/expense summary updated in real time
- Product search returns relevant results — customers find what they searched for

---

## Product Scope

### Phase 1 — MVP (Launch)

**MVP Approach:** Revenue MVP — capable of taking real paid orders from day one. Every feature supports a complete, trustworthy purchase experience for customers and a functional management experience for the owner-operator.

**Core customer journey:** browse → search → product detail → cart → checkout → order confirmation → order tracking → review

**Core admin/seller journey:** dashboard → product management → order management → income/expense visibility

**Must-have capabilities:**
- Product catalog with search and category filtering
- Product detail pages (images, description, price, stock status, reviews)
- Shopping cart (add, update quantity, remove); guest cart persists and merges on login
- Stripe checkout (test mode, card payments, webhook-confirmed orders)
- Customer accounts: register, login, order history
- Order tracking: real-time status push via Socket.io (pending → processing → shipped → delivered)
- Product reviews: post-purchase, authenticated customers only
- Admin dashboard: product CRUD, inventory management, order management, income/expense summary
- Real-time admin notifications on new orders (Socket.io)
- Live stock count updates on product pages (Socket.io)
- Email notifications: order confirmation and shipping update
- Mobile-responsive UI, JWT auth, role-based access control (customer vs admin/seller)

### Phase 2 — Growth (Post-MVP)

- Discount codes and coupon system
- Wishlist / saved items
- Social login (Google, Facebook)
- Product recommendations (related products, recently viewed)
- Advanced sales analytics and reporting
- Customer support / contact system

### Phase 3 — Vision

- Multi-seller marketplace with seller onboarding and independent storefronts
- Subscription / recurring orders
- Mobile app (React Native)
- AI-powered product search and recommendations

### Risk Mitigation

- **Real-time complexity:** Socket.io scoped to three specific events (new order, stock update, order status) — not a broad pub/sub system. Can be replaced with polling if timeline is constrained.
- **Image hosting:** Cloudinary preferred; multer local storage is a valid MVP fallback (Cloudinary is a drop-in swap later).
- **Stripe reliability:** Idempotent webhook handlers mitigate duplicate delivery. Atomic stock decrement at checkout prevents overselling.

---

## User Journeys

### Journey 1 — Priya: First-Time Customer (Happy Path)

Priya discovers the store via a social media link. She browses the catalog, uses search to find exactly what she wants, reads the product description and reviews, and adds it to her cart. At checkout she creates an account, enters shipping details, and pays via Stripe. She receives an order confirmation email immediately. Days later a shipping update arrives. She logs in to check her order status — it's on the way. After delivery she leaves a review and becomes a repeat customer.

**Capabilities:** Product catalog, search, filtering, product detail pages, reviews, cart, Stripe checkout, customer accounts, order history, order tracking, email notifications.

### Journey 2 — Priya: Something Goes Wrong

Priya's card is declined at checkout. She sees a clear, specific error message (not a generic crash), updates her payment method, and retries successfully. In an alternate scenario, an item goes out of stock after she places her order — she receives an email notification and a refund is initiated.

**Capabilities:** Payment error handling, stock validation at checkout, refund flow, user-facing error messaging.

### Journey 3 — Aditya: Admin/Seller on a Good Day

Aditya logs into the admin dashboard and sees today's orders, total revenue, and pending fulfillments at a glance. He adds a new product with images, description, price, and stock quantity. An order comes in — a real-time notification fires. He updates the order status to "shipped"; the customer receives an email automatically. He reviews the monthly income/expense summary.

**Capabilities:** Admin dashboard (orders, revenue, expenses), product management (CRUD + images), inventory management, order status management, real-time notifications, automated email triggers.

### Journey 4 — Aditya: Managing a Problem Order

A customer reports a missing order. Aditya searches the dashboard by customer name or order ID, reviews the full order history and status, and updates the status manually. He initiates a refund via the dashboard if needed.

**Capabilities:** Order search/filter, order detail view, manual status override, refund management.

### Journey Requirements Summary

| Capability Area | Revealed By |
|---|---|
| Product catalog, search, filtering | J1 |
| Product detail pages + reviews | J1 |
| Shopping cart | J1 |
| Stripe checkout + error handling | J1, J2 |
| Customer accounts + order history | J1 |
| Order tracking (customer-facing, real-time) | J1 |
| Email notifications | J1, J4 |
| Stock validation + refund flow | J2 |
| Admin dashboard (revenue, orders, real-time) | J3 |
| Product management (CRUD) | J3 |
| Order status management + notifications | J3, J4 |
| Order search + detail view | J4 |

---

## Domain-Specific Requirements

### Compliance & Regulatory

- Collect only necessary customer data; provide account deletion capability (GDPR/privacy)
- Stripe handles PCI-DSS compliance — raw card numbers never stored or transmitted through the application
- Cookie consent notice required if targeting EU customers

### Technical Constraints

- Payment flows must use Stripe webhooks for order confirmation — client-side redirect alone is insufficient
- Inventory decremented atomically at order placement to prevent overselling
- Passwords hashed with bcrypt; JWTs short-lived with refresh token pattern
- All API routes over HTTPS; admin routes protected by server-side role middleware

### Integration Requirements

- Stripe: payments, webhooks, refund management
- Email service (Nodemailer or SendGrid): transactional emails
- Image hosting: Cloudinary (or multer for MVP fallback)

### Risk Mitigations

- Race condition on stock: atomic DB operations or optimistic locking at checkout
- Failed webhook delivery: idempotent handlers with retry tolerance
- Admin route exposure: strict server-side role middleware; no client-side role trust

---

## Web Application Specific Requirements

### Architecture Overview

React SPA served from a Node.js/Express backend. Frontend communicates with the REST API over HTTPS. Real-time features via Socket.io. Product pages use React Helmet for basic SEO meta tags. No SSR/SSG required.

### Technical Decisions

- **Rendering:** Client-side rendering (CSR) — React Helmet for meta tags
- **State management:** Redux Toolkit or React Context + useReducer for cart, auth, and real-time state
- **Real-time (Socket.io):**
  - Admin dashboard: live notification + sound on new order
  - Product pages: live stock count updates on inventory change
  - Customer order detail: order status pushed without page refresh
- **API:** RESTful JSON (Express.js), HTTPS only, role-based middleware on protected routes

### Browser & Device Support

- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile: iOS Safari, Android Chrome
- No IE11 or legacy browser support

### Responsive Design

- Mobile-first layout; breakpoints: mobile < 768px, tablet 768–1024px, desktop > 1024px
- Touch-friendly tap targets ≥ 44px

### SEO

- React Helmet: dynamic `<title>`, `<meta description>`, Open Graph tags on product and category pages
- Semantic HTML (heading hierarchy, alt text on all images)
- Sitemap and robots.txt served from Express

### Accessibility

- Keyboard navigability on core flows (checkout, login, product browsing)
- Sufficient color contrast; alt text on all images
- Not targeting strict WCAG 2.1 AA compliance

### Implementation Notes

- Socket.io integrated with Express HTTP server
- Cart state persisted in localStorage for guests; synced to DB on login
- Image uploads via Cloudinary SDK (or multer for local MVP)

---

## Functional Requirements

### User Authentication & Account Management

- FR1: Customers can register with email and password
- FR2: Customers can log in and log out securely
- FR3: Customers can view and update their profile information
- FR4: Customers can delete their account
- FR5: Admin/Seller can log in with elevated role access
- FR6: The system enforces role-based access control (customer vs admin/seller)
- FR7: The system invalidates sessions on logout

### Product Catalog & Discovery

- FR8: Customers can browse all available products in a paginated catalog
- FR9: Customers can search products by name and keyword
- FR10: Customers can filter products by category
- FR11: Customers can sort products by price, newest, and popularity
- FR12: Customers can view a product detail page with images, description, price, and stock status
- FR13: The system displays real-time stock count updates on product pages
- FR14: Customers can view all reviews and average rating for a product

### Shopping Cart & Checkout

- FR15: Customers can add products to a cart
- FR16: Customers can update item quantities in the cart
- FR17: Customers can remove items from the cart
- FR18: Guest users can maintain a cart that persists across page refreshes
- FR19: Cart contents are preserved when a guest user logs in
- FR20: Customers can proceed to checkout and enter shipping details
- FR21: Customers can complete payment via Stripe (card payments)
- FR22: The system validates stock availability at the point of order placement
- FR23: The system confirms orders via Stripe webhook before marking them as placed

### Order Management (Customer)

- FR24: Customers can view their full order history
- FR25: Customers can view the details of a specific order
- FR26: Customers receive real-time order status updates without page refresh
- FR27: Customers receive an email confirmation immediately after placing an order
- FR28: Customers receive an email notification when their order status changes to shipped

### Product Reviews

- FR29: Authenticated customers can submit a rating and text review on a product they have purchased
- FR30: Customers can view all reviews and average rating on a product detail page

### Admin/Seller Dashboard

- FR31: Admin can view a real-time dashboard showing today's orders, total revenue, and pending fulfillments
- FR32: Admin receives a real-time notification when a new order is placed
- FR33: Admin can view income and expense summary by time period
- FR34: Admin can create, edit, and delete products (images, description, price, stock quantity, category)
- FR35: Admin can update product inventory (stock levels)
- FR36: Admin can view all orders with search and filter by customer, status, and date
- FR37: Admin can view full details of any order
- FR38: Admin can update order status (pending → processing → shipped → delivered)
- FR39: Admin can manually override order status
- FR40: Admin can initiate a refund for an order via Stripe

### Notifications & Communication

- FR41: The system sends a transactional email on order confirmation
- FR42: The system sends a transactional email when order status changes to shipped
- FR43: The system pushes real-time order status updates to the relevant customer via Socket.io
- FR44: The system pushes real-time new order notifications to the admin dashboard via Socket.io

### SEO & Discoverability

- FR45: Product and category pages have dynamic meta titles and descriptions
- FR46: The application serves a sitemap and robots.txt

---

## Non-Functional Requirements

### Performance

- LCP < 3 seconds on mobile (4G connection)
- TTI < 4 seconds on mobile
- API response time < 500ms for standard queries (product listing, order fetch)
- Stripe checkout completes without timeout under normal network conditions
- Product images lazy-loaded and served in optimized format (WebP preferred)
- Socket.io real-time events delivered within 1 second of trigger under normal load

### Security

- Passwords hashed with bcrypt (minimum 10 salt rounds)
- JWT access tokens short-lived (15–60 min); refresh token pattern for session continuity
- JWT stored in httpOnly cookies or localStorage with XSS mitigation
- All routes over HTTPS; HTTP redirects to HTTPS
- Admin/seller routes protected by server-side role middleware — no client-side role trust
- Raw card data never stored or transmitted — Stripe handles PCI-DSS
- Stripe webhook signatures verified on every incoming event
- Sensitive data (passwords, tokens, card info) never logged
- Input validation and sanitization on all API endpoints
- CORS configured to allow only trusted origins

### Scalability

- API layer stateless to support horizontal scaling
- MongoDB indexes on frequently queried fields (product name, category, order status, customer ID)
- Socket.io rooms scoped to order ID and admin channel only
- Image storage externalized (Cloudinary) to keep application server stateless

### Reliability

- 99.5%+ uptime post-launch
- Stripe webhook handlers idempotent — duplicate delivery does not create duplicate orders
- Stock decrement atomic at order placement — concurrent checkouts cannot oversell
- Graceful error handling on all API routes — no unhandled exceptions in production
- Failed payment attempts return clear, user-friendly error messages

### Integration

- Stripe: payment intents, webhook event handling, refund API
- Email service (Nodemailer/SendGrid): transactional emails with retry on failure
- Cloudinary (or multer fallback): product image upload and delivery
- Socket.io: real-time event delivery for order status, stock updates, admin notifications
