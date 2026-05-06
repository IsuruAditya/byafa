# Story 9.2: Sitemap and Robots.txt

**Status:** done
**Epic:** 9 — SEO, Polish & Production Readiness
**Project context:** `_bmad-output/project-context.md`

## Story

As a search engine,
I want to access a sitemap and robots.txt from the store,
so that I can crawl and index the store's pages correctly.

## Acceptance Criteria

**AC1 — Sitemap:**
Given the backend is running
When `GET /sitemap.xml` is requested
Then it returns a valid XML sitemap including the homepage, products page, and all product detail page URLs
And the sitemap is generated dynamically from the current product list

**AC2 — Robots.txt:**
Given `GET /robots.txt` is requested
Then it returns a valid robots.txt allowing all crawlers
And it includes a `Sitemap:` directive pointing to the sitemap URL

## Tasks

- [x] `backend/src/api/routes/seo.routes.ts` — sitemap and robots.txt routes
- [x] `backend/src/app.ts` — register SEO routes

## Dev Notes

### Architecture references
- Sitemap XML format: `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">...</urlset>`
- Product URLs: `${FRONTEND_URL}/products/${product._id}`
- Static URLs: homepage `/`, products page `/products`
- Robots.txt: `User-agent: *\nAllow: /\nSitemap: ${BACKEND_URL}/sitemap.xml`
- Cache: set `Cache-Control: public, max-age=3600` on sitemap response

### Key files
- `backend/src/api/routes/seo.routes.ts` — sitemap and robots routes
- `backend/src/app.ts` — route registration

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ GET /sitemap.xml returns valid XML with all product URLs
- ✅ GET /robots.txt returns valid robots.txt with sitemap reference
- ✅ Sitemap generated dynamically from Product collection
- ✅ Cache-Control header set on sitemap

### File List
- `backend/src/api/routes/seo.routes.ts`
- `backend/src/app.ts`
