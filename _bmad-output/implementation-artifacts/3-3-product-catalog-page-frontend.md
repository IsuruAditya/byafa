# Story 3.3: Product Catalog Page (Frontend)

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to browse all products with search, filter, and sort controls,
so that I can find products I'm interested in.

## Acceptance Criteria

**AC1 — Product grid:**
Given I am on `/products`
Then products are displayed in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
And each ProductCard shows image, name, price, and star rating
And a loading skeleton is shown while fetching

**AC2 — Search:**
Given I type in the search bar (in Navbar)
Then results are debounced 300ms before the API call fires
And the URL updates with `?search=...` for shareability

**AC3 — Category filter:**
Given I click a category pill
Then products are filtered to that category
And the URL updates with `?category=...`

**AC4 — Sort:**
Given I select a sort option
Then products re-sort: newest | popularity | price_asc | price_desc

**AC5 — Pagination:**
Given there are more products than `pageSize=12`
Then pagination controls appear
And clicking a page number fetches that page

**AC6 — Empty state:**
Given no products match the filters
Then a "No products found" message with a "Clear filters" button is shown

## Tasks

- [x] `frontend/src/features/products/ProductsPage.tsx` — full catalog page
- [x] `frontend/src/features/products/ProductCard.tsx` — reusable product card
- [x] `frontend/src/components/ui/Pagination.tsx` — pagination component
- [x] `frontend/src/components/ui/ProductCardSkeleton.tsx` — loading skeleton
- [x] `frontend/src/hooks/useDebounce.ts` — 300ms debounce hook
- [x] `frontend/src/api/productsApi.ts` — `getProductsApi()`

## Dev Notes

### URL state sync
Filters are stored in URL params via `useSearchParams` — makes filters bookmarkable and shareable.
```ts
const [searchParams, setSearchParams] = useSearchParams()
setSearchParams(params, { replace: true }) // replace to avoid polluting history
```

### Search bar location
Search input lives in `Navbar.tsx` — submits via `navigate('/products?search=...')`.
`ProductsPage` reads `searchParams.get('search')` on mount to initialize state.

### ProductCard
- `priority` prop on first card sets `fetchPriority="high"` on the image (LCP optimization)
- Cloudinary URL transformation via `cloudinaryThumb(url, 400, 300)` for catalog thumbnails
- `loading="lazy"` on all non-priority images

### Skeleton
`ProductGridSkeleton` renders N animated placeholder cards matching the grid layout.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ProductsPage — URL-synced filters, debounced search, category pills, sort dropdown
- ✅ ProductCard — image, name, price, StarRating, link to detail page
- ✅ Pagination — page numbers, prev/next, ellipsis for large ranges
- ✅ ProductCardSkeleton — animated pulse placeholders
- ✅ useDebounce — generic typed hook

### File List
- `frontend/src/features/products/ProductsPage.tsx`
- `frontend/src/features/products/ProductCard.tsx`
- `frontend/src/components/ui/Pagination.tsx`
- `frontend/src/components/ui/ProductCardSkeleton.tsx`
- `frontend/src/hooks/useDebounce.ts`
- `frontend/src/api/productsApi.ts`
