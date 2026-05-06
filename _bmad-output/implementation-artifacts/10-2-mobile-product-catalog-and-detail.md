# Story 10.2: Mobile Product Catalog and Detail

**Status:** done
**Epic:** 10 — Mobile App (React Native + Expo)
**Project context:** `_bmad-output/project-context.md`

## Story

As a mobile customer,
I want to browse products and view product details on my phone,
so that I can shop from anywhere.

## Acceptance Criteria

**AC1 — Product catalog:**
Given I am on the Products tab
When the screen loads
Then products are displayed in a 2-column FlatList grid
And each product card shows image, name, price, and average rating
And I can search products using a search bar at the top
And I can filter by category using horizontal scroll chips

**AC2 — Product detail:**
Given I tap on a product
When the product detail screen loads
Then I see the product name, description, price, stock status, and images
And an "Add to Cart" button is visible (disabled if out of stock)
And the average rating and review count are shown

**AC3 — Performance:**
Given I scroll through the product list
When images load
Then images are lazy-loaded using `FastImage` or `Image` with `resizeMode`
And a loading skeleton is shown while products are fetching

## Tasks

- [x] `mobile/src/screens/products/ProductsScreen.tsx` — product catalog screen
- [x] `mobile/src/screens/products/ProductDetailScreen.tsx` — product detail screen
- [x] `mobile/src/components/ProductCard.tsx` — product card component
- [x] `mobile/src/api/productsApi.ts` — products API client

## Dev Notes

### Architecture references
- FlatList: `numColumns={2}` for 2-column grid
- Search: debounced 300ms, updates query param
- Category filter: horizontal `ScrollView` with `TouchableOpacity` chips
- Image: `<Image source={{ uri: product.images[0] }} style={{ width: '100%', aspectRatio: 1 }} />`

### Key files
- `mobile/src/screens/products/ProductsScreen.tsx` — catalog
- `mobile/src/screens/products/ProductDetailScreen.tsx` — detail
- `mobile/src/api/productsApi.ts` — API client

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ProductsScreen with 2-column FlatList grid
- ✅ Search bar with 300ms debounce
- ✅ Category filter chips
- ✅ ProductDetailScreen with full product info
- ✅ Add to Cart button with stock check

### File List
- `mobile/src/screens/products/ProductsScreen.tsx`
- `mobile/src/screens/products/ProductDetailScreen.tsx`
- `mobile/src/components/ProductCard.tsx`
- `mobile/src/api/productsApi.ts`
