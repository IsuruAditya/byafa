# Story 9.1: SEO Meta Tags with React Helmet Async

**Status:** done
**Epic:** 9 — SEO, Polish & Production Readiness
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer or search engine,
I want product and category pages to have accurate meta titles and descriptions,
so that the store is discoverable via search engines and social sharing.

## Acceptance Criteria

**AC1 — Product detail page meta:**
Given I visit a product detail page
When the page renders
Then `<title>` is set to `{product.name} | simple-ecommerce`
And `<meta name="description">` is set to the first 160 characters of `product.description`
And Open Graph tags (`og:title`, `og:description`, `og:image`) are set for social sharing

**AC2 — Products catalog page meta:**
Given I visit the products catalog page
When the page renders
Then `<title>` is set to `Shop | simple-ecommerce`
And `<meta name="description">` describes the store

**AC3 — Default meta:**
Given I visit any other page
When the page renders
Then a default title and description are set via `HelmetProvider` in `App.tsx`

## Tasks

- [x] `frontend/src/App.tsx` — wrap app in `HelmetProvider`
- [x] `frontend/src/features/products/ProductDetailPage.tsx` — add `Helmet` with product meta
- [x] `frontend/src/features/products/ProductsPage.tsx` — add `Helmet` with catalog meta

## Dev Notes

### Architecture references
- Package: `react-helmet-async` (already in dependencies)
- HelmetProvider: wrap root in `<HelmetProvider>` in `App.tsx` or `main.tsx`
- Description truncation: `product.description.slice(0, 160)`
- OG image: use first image from `product.images[0]`

### Key files
- `frontend/src/App.tsx` — HelmetProvider wrapper
- `frontend/src/features/products/ProductDetailPage.tsx` — product Helmet
- `frontend/src/features/products/ProductsPage.tsx` — catalog Helmet

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ HelmetProvider added to App.tsx
- ✅ Product detail page sets title, description, og:title, og:description, og:image
- ✅ Products catalog page sets title and description
- ✅ Description truncated to 160 characters

### File List
- `frontend/src/App.tsx`
- `frontend/src/features/products/ProductDetailPage.tsx`
- `frontend/src/features/products/ProductsPage.tsx`
