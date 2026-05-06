# Story 3.2: Product Catalog API

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want REST API endpoints for browsing, searching, filtering, and sorting products,
so that the frontend can display the product catalog.

## Acceptance Criteria

**AC1 — Paginated product list:**
Given products exist in the database
When `GET /api/v1/products` is called
Then it returns `{ success: true, data: [...], pagination: { page, pageSize, total, totalPages } }`
And default pagination is `page=1, pageSize=12`

**AC2 — Search by keyword:**
Given `?search=keyword` is provided
When the request is processed
Then products are filtered by name using MongoDB text search (case-insensitive)

**AC3 — Filter by category:**
Given `?category=electronics` is provided
When the request is processed
Then only products with matching category are returned

**AC4 — Sort options:**
Given `?sortBy=price_asc|price_desc|newest|popularity` is provided
When the request is processed
Then results are sorted accordingly:
- `price_asc`: price ascending
- `price_desc`: price descending
- `newest`: createdAt descending
- `popularity`: ratings.count descending

**AC5 — Get single product:**
Given `GET /api/v1/products/:id` is called with a valid product ID
When the request is processed
Then the full product document is returned
And if the product does not exist, status 404 is returned

## Tasks

- [x] `backend/src/services/product.service.ts` — `getProducts()`, `getProductById()`
- [x] `backend/src/api/controllers/product.controller.ts` — `getProducts()`, `getProductById()` handlers
- [x] `backend/src/api/routes/product.routes.ts` — `GET /api/v1/products`, `GET /api/v1/products/:id`

## Dev Notes

### Architecture references
- MongoDB text index on `name` field for search
- Query builder pattern: start with base query, conditionally add filters
- Pagination: `skip = (page - 1) * pageSize`, `limit = pageSize`
- Total count: `Product.countDocuments(query)` for pagination metadata

### Key files
- `backend/src/models/Product.model.ts` — text index on name
- `backend/src/services/product.service.ts` — query logic
- `backend/src/api/routes/product.routes.ts` — public routes (no auth required)

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ `getProducts()` service with search, filter, sort, pagination
- ✅ Text index on Product.name for efficient search
- ✅ Pagination metadata calculated and returned
- ✅ `getProductById()` returns 404 if not found
- ✅ All routes public (no auth middleware)

### File List
- `backend/src/services/product.service.ts`
- `backend/src/api/controllers/product.controller.ts`
- `backend/src/api/routes/product.routes.ts`
