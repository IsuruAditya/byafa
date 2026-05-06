# Story 8.2: Admin Inventory Management

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to update stock levels for products,
so that inventory is accurate and customers see correct stock status.

## Acceptance Criteria

**AC1 — Update stock:**
Given I am on the product management page
When I update the stock quantity for a product
Then `PATCH /api/v1/admin/products/:id/inventory` updates `stockQuantity`
And the updated stock is reflected on the product detail page within the next poll cycle

**AC2 — Out of stock:**
Given I set stock to 0
When the update is saved
Then the product is marked as out of stock
And "Add to Cart" is disabled on the product detail page

## Tasks

- [x] `backend/src/services/admin.service.ts` — `updateInventory()` function
- [x] `backend/src/api/controllers/admin.controller.ts` — `updateInventory()` handler
- [x] `backend/src/api/routes/admin.routes.ts` — `PATCH /api/v1/admin/products/:id/inventory`

## Dev Notes

### Architecture references
- Endpoint: `PATCH /api/v1/admin/products/:id/inventory` with body `{ stockQuantity: number }`
- Validation: stockQuantity must be >= 0 (integer)
- Stock polling on frontend: `useStockPolling` hook fetches stock on mount and after add-to-cart

### Key files
- `backend/src/services/admin.service.ts` — updateInventory
- `backend/src/api/routes/admin.routes.ts` — inventory route

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ PATCH /api/v1/admin/products/:id/inventory endpoint
- ✅ Validation: stockQuantity >= 0
- ✅ Out of stock (0) disables Add to Cart on frontend

### File List
- `backend/src/services/admin.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
