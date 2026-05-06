# Story 3.4: Product Detail Page (Frontend)

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to view a full product detail page with all information,
so that I can make an informed purchase decision.

## Acceptance Criteria

**AC1 — Product information:**
Given I navigate to a product detail page
When the page loads
Then I see the product name, description, price, category, and stock status
And product images are displayed with lazy loading
And the average rating and review count are shown

**AC2 — Add to cart:**
Given the product is in stock
When I click "Add to Cart"
Then the product is added to my cart
And a toast notification confirms the action
And if the product is out of stock, the button is disabled

**AC3 — Stock polling:**
Given I am on the product detail page
When the page loads
Then the current stock count is fetched
And when I add to cart, the stock count is refreshed

**AC4 — SEO meta tags:**
Given the page renders
When React Helmet processes the component
Then `<title>` is set to `{product.name} | simple-ecommerce`
And `<meta name="description">` is set to the first 160 characters of the description

## Tasks

- [x] `frontend/src/features/products/ProductDetailPage.tsx` — main page component
- [x] `frontend/src/features/products/useStockPolling.ts` — stock polling hook
- [x] `frontend/src/api/productsApi.ts` — `getProductByIdApi()` function
- [x] `frontend/src/components/ui/StarRating.tsx` — star rating display component

## Dev Notes

### Architecture references
- Stock polling: fetch on mount, refresh after add-to-cart action
- React Helmet Async: set title and meta description dynamically
- Image lazy loading: `loading="lazy"` attribute on `<img>` tags
- Toast notifications: use `uiSlice` to show success/error messages

### Key files
- `frontend/src/features/products/ProductDetailPage.tsx` — main component
- `frontend/src/features/products/useStockPolling.ts` — custom hook for stock updates
- `frontend/src/store/slices/cartSlice.ts` — `addToCart` action

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ProductDetailPage with full product info, images, rating, stock status
- ✅ Add to cart button disabled when out of stock
- ✅ Stock count refreshed after add-to-cart
- ✅ React Helmet Async for SEO meta tags
- ✅ StarRating component for visual rating display
- ✅ Toast notification on add-to-cart success

### File List
- `frontend/src/features/products/ProductDetailPage.tsx`
- `frontend/src/features/products/useStockPolling.ts`
- `frontend/src/api/productsApi.ts`
- `frontend/src/components/ui/StarRating.tsx`
