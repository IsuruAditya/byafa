# Story 3.2: Product Catalog API

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want REST API endpoints for browsing, searching, filtering, and sorting products,
so that the frontend can display the product catalog.

## Acceptance Criteria

**AC1 — List products:**
Given `GET /api/v1/products` is called
Then it returns `{ success: true, data: [...], pagination: { page, pageSize, total, totalPages } }`
And `?search=keyword` filters by name + description (MongoDB `$text` search)
And `?category=electronics` filters by category (case-insensitive)
And `?sortBy=price_asc|price_desc|newest|popularity` sorts accordingly
And `?page=1&pageSize=12` controls pagination (pageSize clamped to max 100)

**AC2 — Single product:**
Given `GET /api/v1/products/:id` is called with a valid ObjectId
Then it returns `{ success: true, data: { product } }`
And an invalid ObjectId or missing product returns 404

**AC3 — Input validation:**
Given invalid query params (e.g. `page=abc`, `sortBy=invalid`)
Then `{ success: false, message: "Validation failed", errors: [...] }` with status 400

## Tasks

- [x] `backend/src/services/product.service.ts` — `getCatalog()`, `getProductById()`
- [x] `backend/src/api/controllers/product.controller.ts` — `getCatalog()`, `getProductById()`
- [x] `backend/src/api/routes/product.routes.ts` — `GET /`, `GET /:id` with express-validator

## Dev Notes

### Sort map
```ts
const SORT_MAP = {
  price_asc:  { price: 1 },
  price_desc: { price: -1 },
  newest:     { createdAt: -1 },
  popularity: { 'ratings.average': -1, 'ratings.count': -1 },
}
```

### Pagination
```ts
const safePage = Math.max(1, page)
const safePageSize = Math.min(Math.max(1, pageSize), 100)
const skip = (safePage - 1) * safePageSize
```

### ObjectId validation
```ts
if (!id.match(/^[a-f\d]{24}$/i)) throw new AppError('Product not found', 404)
```
Prevents Mongoose CastError from reaching error middleware.

### Text search filter
```ts
if (search?.trim()) filter.$text = { $search: search.trim() }
```
Requires the `{ name: 'text', description: 'text' }` index to exist.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `getCatalog()` — filter, sort, skip/limit, parallel count query
- ✅ `getProductById()` — ObjectId regex validation before DB query
- ✅ express-validator on query params, `validate` middleware
- ✅ `.lean()` on list queries for performance

### File List
- `backend/src/services/product.service.ts`
- `backend/src/api/controllers/product.controller.ts`
- `backend/src/api/routes/product.routes.ts`
