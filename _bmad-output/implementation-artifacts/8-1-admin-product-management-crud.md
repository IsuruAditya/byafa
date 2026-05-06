# Story 8.1: Admin Product Management (CRUD)

**Status:** done
**Epic:** 8 — Admin Dashboard & Store Management
**Project context:** `_bmad-output/project-context.md`

## Story

As an admin,
I want to create, edit, and delete products with images,
so that I can manage the store's product catalog.

## Acceptance Criteria

**AC1 — Create product:**
Given I am logged in as admin and on the product management page
When I fill in the product form and submit
Then `POST /api/v1/admin/products` creates a Product document with all fields
And images are uploaded to Cloudinary and the returned URLs are stored in `product.images`
And the new product appears in the product list immediately

**AC2 — Edit product:**
Given I click "Edit" on a product
When I submit the updated form
Then `PUT /api/v1/admin/products/:id` updates the product document
And existing images can be removed and new ones added

**AC3 — Delete product:**
Given I click "Delete" on a product
When I confirm the deletion in the modal
Then `DELETE /api/v1/admin/products/:id` removes the product document
And a confirmation modal prevents accidental deletion

**AC4 — Admin product list:**
Given I am on the admin product management page
When the page loads
Then `GET /api/v1/admin/products` returns all products with pagination and search
And I can search by product name

## Tasks

- [x] `backend/src/services/admin.service.ts` — `createProduct()`, `updateProduct()`, `deleteProduct()`, `getAdminProducts()`
- [x] `backend/src/api/controllers/admin.controller.ts` — admin product handlers
- [x] `backend/src/api/routes/admin.routes.ts` — admin product routes
- [x] `backend/src/services/cloudinary.service.ts` — image upload to Cloudinary
- [x] `frontend/src/features/admin/AdminProductList.tsx` — product list with CRUD actions
- [x] `frontend/src/features/admin/AdminProductForm.tsx` — create/edit product form
- [x] `frontend/src/api/adminApi.ts` — admin product API functions

## Dev Notes

### Architecture references
- Image upload: multer middleware for local temp storage, then upload to Cloudinary
- Cloudinary: `cloudinary.uploader.upload(filePath, { folder: 'products', transformation: [{ quality: 'auto', fetch_format: 'auto' }] })`
- Delete: also delete images from Cloudinary using stored public IDs
- Admin product list: `GET /api/v1/admin/products?page=1&pageSize=20&search=keyword`

### Key files
- `backend/src/services/cloudinary.service.ts` — Cloudinary upload/delete
- `backend/src/services/admin.service.ts` — product CRUD
- `frontend/src/features/admin/AdminProductForm.tsx` — form with image upload

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Full CRUD for products via admin routes
- ✅ Cloudinary image upload with automatic format optimization
- ✅ AdminProductList with search, pagination, edit/delete actions
- ✅ AdminProductForm for create and edit with image upload
- ✅ Confirmation modal before deletion
- ✅ GET /api/v1/admin/products endpoint added (post-MVP improvement)

### File List
- `backend/src/services/admin.service.ts`
- `backend/src/services/cloudinary.service.ts`
- `backend/src/api/controllers/admin.controller.ts`
- `backend/src/api/routes/admin.routes.ts`
- `frontend/src/features/admin/AdminProductList.tsx`
- `frontend/src/features/admin/AdminProductForm.tsx`
- `frontend/src/api/adminApi.ts`
