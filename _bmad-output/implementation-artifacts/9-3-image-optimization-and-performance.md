# Story 9.3: Image Optimization and Performance

**Status:** done
**Epic:** 9 — SEO, Polish & Production Readiness
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want product images to load quickly and not slow down the page,
so that I have a fast shopping experience on mobile and desktop.

## Acceptance Criteria

**AC1 — Cloudinary optimization:**
Given product images are uploaded by the admin
When they are stored in Cloudinary
Then images are served with automatic format optimization (WebP for supported browsers)
And images are served at appropriate dimensions (thumbnail for catalog, full for detail page)

**AC2 — Lazy loading:**
Given I am on the products catalog page
When the page loads
Then product images below the fold are lazy-loaded using `loading="lazy"`
And all product images have descriptive `alt` text set to the product name

## Tasks

- [x] `backend/src/services/cloudinary.service.ts` — upload with `fetch_format: 'auto'`, `quality: 'auto'`
- [x] `frontend/src/features/products/ProductCard.tsx` — `loading="lazy"` and `alt` text
- [x] `frontend/src/features/products/ProductDetailPage.tsx` — optimized image display

## Dev Notes

### Architecture references
- Cloudinary transformation: `{ quality: 'auto', fetch_format: 'auto', width: 400, crop: 'limit' }` for thumbnails
- Cloudinary transformation: `{ quality: 'auto', fetch_format: 'auto', width: 800, crop: 'limit' }` for detail
- Lazy loading: `<img loading="lazy" alt={product.name} src={product.images[0]} />`
- LCP optimization: eager load the first visible image (hero/featured product)

### Key files
- `backend/src/services/cloudinary.service.ts` — upload transformations
- `frontend/src/features/products/ProductCard.tsx` — lazy loading
- `frontend/src/features/products/ProductDetailPage.tsx` — full-size images

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Cloudinary upload with auto quality and format optimization
- ✅ Thumbnail transformations for catalog (400px)
- ✅ Full-size transformations for detail page (800px)
- ✅ loading="lazy" on catalog images
- ✅ Descriptive alt text on all product images

### File List
- `backend/src/services/cloudinary.service.ts`
- `frontend/src/features/products/ProductCard.tsx`
- `frontend/src/features/products/ProductDetailPage.tsx`
