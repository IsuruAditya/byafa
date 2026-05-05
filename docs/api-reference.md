# API Reference

**Base URL:** `/api/v1`

All responses follow the standard shape:

```json
// Success
{ "success": true, "data": {}, "message": "Optional message" }

// Paginated
{ "success": true, "data": [], "pagination": { "page": 1, "pageSize": 10, "total": 100, "totalPages": 10 } }

// Error
{ "success": false, "message": "Human-readable error", "errors": [{ "field": "email", "message": "Invalid email" }] }
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Validation error / bad request |
| 401 | Unauthenticated |
| 403 | Unauthorized (wrong role) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

---

## Authentication

### POST `/auth/register`

Register a new customer account.

**Request body:**
```json
{ "name": "Jane Doe", "email": "jane@example.com", "password": "securepass123" }
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": { "id": "...", "name": "Jane Doe", "email": "jane@example.com", "role": "customer" },
    "accessToken": "eyJ..."
  }
}
```

Sets `refreshToken` httpOnly cookie (7 days).

---

### POST `/auth/login`

**Request body:**
```json
{ "email": "jane@example.com", "password": "securepass123" }
```

**Response (200):** Same as register.

---

### POST `/auth/refresh`

Exchange refresh token for a new access token.

- Web: reads `refreshToken` from httpOnly cookie automatically
- Mobile: send `{ "refreshToken": "..." }` in request body

**Response (200):**
```json
{ "success": true, "data": { "accessToken": "eyJ..." } }
```

---

### POST `/auth/logout`

Invalidates the refresh token. Clears the cookie.

---

### GET `/auth/me` 🔒

Returns the authenticated user's profile.

---

### PATCH `/auth/profile` 🔒

Update name and/or email.

**Request body:** `{ "name": "New Name", "email": "new@email.com" }`

---

### PATCH `/auth/password` 🔒

Change password.

**Request body:** `{ "currentPassword": "old", "newPassword": "new123456" }`

---

### DELETE `/auth/account` 🔒

Permanently deletes the account and all refresh tokens.

---

## Products

### GET `/products`

List products with pagination, search, filter, and sort.

**Query params:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `search` | string | — | Full-text search on name and description |
| `category` | string | — | Filter by category (lowercase) |
| `sortBy` | string | `newest` | `price_asc`, `price_desc`, `newest`, `popularity` |
| `page` | integer | `1` | Page number |
| `pageSize` | integer | `12` | Items per page (max 100) |

**Response (200):** Paginated list of products.

---

### GET `/products/:id`

Get a single product by ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Product Name",
    "description": "...",
    "price": 29.99,
    "images": ["https://..."],
    "category": "electronics",
    "stockQuantity": 50,
    "ratings": { "average": 4.5, "count": 23 },
    "createdAt": "2026-05-01T00:00:00.000Z",
    "updatedAt": "2026-05-01T00:00:00.000Z"
  }
}
```

---

## Orders

### POST `/orders/create-payment-intent` 🔒

Validates stock and creates a Stripe Payment Intent. The order is NOT created here — it is created by the webhook after payment succeeds.

**Request body:**
```json
{
  "items": [{ "productId": "...", "quantity": 2 }],
  "shippingAddress": {
    "fullName": "Jane Doe",
    "addressLine1": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response (200):**
```json
{ "success": true, "data": { "clientSecret": "pi_..._secret_...", "totalAmount": 59.98 } }
```

---

### GET `/orders` 🔒

Returns the authenticated user's orders, sorted by most recent.

---

### GET `/orders/:id` 🔒

Returns a single order. Returns 403 if the order belongs to a different user.

---

### GET `/orders/:id/status` 🔒

Lightweight polling endpoint. Returns only the current status.

**Response (200):**
```json
{ "success": true, "data": { "status": "shipped" } }
```

---

## Reviews

### GET `/reviews/product/:productId`

Returns all reviews for a product, sorted by most recent. Public endpoint.

---

### POST `/reviews` 🔒

Submit a review. Requires a valid `orderId` that belongs to the authenticated user and contains the product.

**Request body:**
```json
{ "productId": "...", "orderId": "...", "rating": 5, "comment": "Great product!" }
```

---

## Admin Endpoints 🔒👑

All admin endpoints require `Authorization: Bearer <token>` with an admin-role JWT.

### GET `/admin/products`

List all products with optional search and category filter.

### POST `/admin/products`

Create a product. Accepts `multipart/form-data` with up to 5 image files.

**Form fields:** `name`, `description`, `price`, `category`, `stockQuantity`, `images[]`, `existingImages` (JSON array of URLs to keep)

### PUT `/admin/products/:id`

Update a product. Same form fields as create.

### DELETE `/admin/products/:id`

Delete a product and its Cloudinary images.

### PATCH `/admin/products/:id/inventory`

Update stock quantity only.

**Request body:** `{ "stockQuantity": 100 }`

---

### GET `/admin/orders`

List all orders with pagination, search, and filter.

**Query params:** `search`, `status`, `from` (ISO date), `to` (ISO date), `page`, `pageSize`

### GET `/admin/orders/:id`

Get full order details with populated customer info.

### PATCH `/admin/orders/:id/status`

Update order status. Triggers shipping email when status is set to `shipped`.

**Request body:** `{ "status": "shipped" }`

### POST `/admin/orders/:id/refund`

Issue a full Stripe refund and cancel the order.

---

### GET `/admin/dashboard`

Returns today's stats for the dashboard polling.

**Response:**
```json
{
  "success": true,
  "data": {
    "todayOrderCount": 5,
    "todayRevenue": 249.95,
    "pendingOrderCount": 3,
    "recentOrders": [...]
  }
}
```

### GET `/admin/summary?from=&to=`

Revenue summary for a date range.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1249.95,
    "totalOrders": 42,
    "averageOrderValue": 29.76,
    "from": "2026-05-01T00:00:00.000Z",
    "to": "2026-05-31T23:59:59.000Z"
  }
}
```

---

## Webhooks

### POST `/webhooks/stripe`

Stripe webhook endpoint. Requires raw body (not JSON-parsed) and valid `Stripe-Signature` header.

**Handled events:**
- `payment_intent.succeeded` — creates order, decrements stock, sends confirmation email
- `payment_intent.payment_failed` — logs failure (no order created)

All other events are acknowledged with 200 and ignored.
