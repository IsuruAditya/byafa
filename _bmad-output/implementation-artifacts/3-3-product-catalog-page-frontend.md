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
Given I am on the products page
When the page loads
Then products are displayed in a responsive grid (3 cols desktop, 2 tablet, 1 mobile)
And each product card shows image, name, price, and average rating
And clicking a card navigates to the product detail page

**AC2 — Search:**
Given I type in the search bar
When I stop typing for 300ms (debounced)
Then the product list is filtered by the search term
And the URL query string is updated with `?search=...`

**AC3 — Category filter:**
Given I click a category filter button
When the filter is applied
Then only products in that category are shown
And the URL query string is updated with `?category=...`

**AC4 — Sort dropdown:**
Given I select a sort option
When the sort is applied
Then products are reordered accordingly
And the URL query string is updated with `?sortBy=...`

**AC5 — Pagination:**
Given there are more products than fit on one page
When I click "Next" or a page number
Then the next page of products is loaded
And the URL query string is updated with `?page=...`

**AC6 — Loading state:**
Given products are being fetched
When the request is in flight
Then a loading spinner or skeleton is shown

## Tasks

- [x] `frontend/src/features/products/ProductsPage.tsx` — main page component
- [x] `frontend/src/features/products/ProductCard.tsx` — product card component
- [x] `frontend/src/api/productsApi.ts` — `getProductsApi()` function
- [x] `frontend/src/hooks/useDebounce.ts` — debounce hook for search
- [x] `frontend/src/components/ui/Pagination.tsx` — pagination component
- [x] `frontend/src/components/ui/ProductCardSkeleton.tsx` — loading skeleton

## Dev Notes

### Architecture references
- URL state management: use `useSearchParams` to sync filters with URL
- Debounce: 300ms delay on search input to avoid excessive API calls
- Responsive grid: Tailwind `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Loading state: show skeletons during fetch, empty state if no results

### Key files
- `frontend/src/features/products/ProductsPage.tsx` — orchestrates filters, search, pagination
- `frontend/src/api/productsApi.ts` — API client
- `frontend/src/hooks/useDebounce.ts` — custom debounce hook

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ProductsPage with search, category filter, sort dropdown, pagination
- ✅ URL query params synced with filters
- ✅ Debounced search input (300ms)
- ✅ ProductCard component with image, name, price, rating
- ✅ ProductCardSkeleton for loading state
- ✅ Responsive grid layout

### File List
- `frontend/src/features/products/ProductsPage.tsx`
- `frontend/src/features/products/ProductCard.tsx`
- `frontend/src/api/productsApi.ts`
- `frontend/src/hooks/useDebounce.ts`
- `frontend/src/components/ui/Pagination.tsx`
- `frontend/src/components/ui/ProductCardSkeleton.tsx`
