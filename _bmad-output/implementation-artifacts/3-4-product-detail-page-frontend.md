# Story 3.4: Product Detail Page (Frontend)

**Status:** done
**Epic:** 3 — Product Catalog & Discovery
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to view a full product detail page with all information,
so that I can make an informed purchase decision.

## Acceptance Criteria

**AC1 — Product info:**
Given I navigate to `/products/:id`
Then I see name, description, price, category, stock status, and average rating
And product images are displayed with a thumbnail strip and lightbox on click
And React Helmet sets `<title>{product.name} | Byafa</title>` and `<meta description>`

**AC2 — Stock status:**
Then stock shows "In Stock" (green) / "Only X left" (amber, ≤5) / "Out of Stock" (red)
And "Add to Cart" is disabled when out of stock
And stock count is refreshed after add-to-cart via `useStockPolling`

**AC3 — Add to cart:**
Given I click "Add to Cart"
Then the product is added to `cartSlice`
And a success toast fires
And stock is re-fetched from the server

**AC4 — Related products:**
Given the product has a category
Then up to 4 products from the same category are shown below (excluding current product)

**AC5 — Reviews:**
Then all reviews for the product are displayed below the product info
And if the user has a qualifying order, the ReviewForm is shown

**AC6 — Mobile sticky bar:**
On mobile, a sticky "Add to Cart" bar is fixed to the bottom of the screen

## Tasks

- [x] `frontend/src/features/products/ProductDetailPage.tsx`
- [x] `frontend/src/features/products/useStockPolling.ts`
- [x] `frontend/src/utils/cloudinaryImage.ts` — `cloudinaryFull()`, `cloudinaryThumb()`
- [x] `frontend/src/components/ui/StarRating.tsx`

## Dev Notes

### useStockPolling
Not a timer — fetches on demand. Returns `{ stock, refreshing, refresh }`.
`refresh()` is called after add-to-cart to get updated count from server.
Initial stock seeded from already-loaded product to avoid extra request on mount.

### Lightbox
Keyboard: Escape closes, ArrowLeft/ArrowRight navigates.
`document.body.style.overflow = 'hidden'` when open — restored on close.
`role="dialog" aria-modal="true"` for accessibility.

### Review eligibility check
```ts
getMyOrdersApi().then(res => {
  const order = res.data.find(o =>
    o.status !== 'cancelled' &&
    o.items.some(item => item.productId === id)
  )
  if (order) setEligibleOrderId(order._id)
})
```
Only runs when `isAuthenticated === true`.

### Cloudinary transforms
- Catalog thumbnail: `cloudinaryThumb(url, 400, 300)` → `w_400,h_300,c_fill,f_auto,q_auto`
- Detail main image: `cloudinaryFull(url, 800)` → `w_800,c_limit,f_auto,q_auto`
- Lightbox full: `cloudinaryFull(url, 1200)`

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Split layout: image gallery left, purchase panel right (sticky on desktop)
- ✅ Lightbox with keyboard navigation and scroll lock
- ✅ Breadcrumb navigation: Home / Category / Product
- ✅ useStockPolling — on-demand refresh, not interval-based
- ✅ Related products from same category (max 4, excludes self)
- ✅ Mobile sticky Add to Cart bar with spacer div
- ✅ React Helmet with OG tags

### File List
- `frontend/src/features/products/ProductDetailPage.tsx`
- `frontend/src/features/products/useStockPolling.ts`
- `frontend/src/utils/cloudinaryImage.ts`
- `frontend/src/components/ui/StarRating.tsx`
