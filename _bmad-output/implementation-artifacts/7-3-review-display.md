# Story 7.3: Review Display

**Status:** done
**Epic:** 7 — Product Reviews
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer,
I want to see all reviews and the average rating on a product detail page,
so that I can make an informed purchase decision.

## Acceptance Criteria

**AC1 — Average rating display:**
Given I am on a product detail page
When the page loads
Then the average star rating and total review count are displayed prominently

**AC2 — Review list:**
Given reviews exist for the product
When the review list renders
Then all reviews are listed with: reviewer first name, star rating, comment, and formatted date
And reviews are sorted by most recent first

**AC3 — Empty state:**
Given no reviews exist for the product
When the review list renders
Then a "No reviews yet. Be the first to review!" message is shown

## Tasks

- [x] `frontend/src/features/reviews/ReviewList.tsx` — review list component
- [x] `frontend/src/api/reviewsApi.ts` — `getReviewsApi()` function
- [x] `frontend/src/components/ui/StarRating.tsx` — star rating display component

## Dev Notes

### Architecture references
- Average rating: display as filled/half/empty stars using StarRating component
- Date formatting: use `formatRelativeDate()` from `frontend/src/utils/formatDate.ts`
- Sort: reviews returned from API sorted by `createdAt` descending
- Reviewer name: show first name only for privacy

### Key files
- `frontend/src/features/reviews/ReviewList.tsx` — list component
- `frontend/src/components/ui/StarRating.tsx` — star display

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ReviewList displays all reviews with name, stars, comment, date
- ✅ Average rating shown with StarRating component
- ✅ Empty state message when no reviews
- ✅ Reviews sorted by most recent first

### File List
- `frontend/src/features/reviews/ReviewList.tsx`
- `frontend/src/api/reviewsApi.ts`
- `frontend/src/components/ui/StarRating.tsx`
