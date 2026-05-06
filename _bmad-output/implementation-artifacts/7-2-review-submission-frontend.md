# Story 7.2: Review Submission (Frontend)

**Status:** done
**Epic:** 7 — Product Reviews
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer who has purchased a product,
I want to submit a star rating and written review,
so that I can share my experience with other shoppers.

## Acceptance Criteria

**AC1 — Review form for eligible customers:**
Given I am logged in and have a delivered order containing the product
When I visit the product detail page
Then a review form with a star rating selector (1–5) and text area is displayed

**AC2 — Review submission:**
Given I fill in the review form
When I submit it
Then `POST /api/v1/products/:id/reviews` is called
And on success, my review appears in the review list immediately

**AC3 — Already reviewed:**
Given I have already reviewed this product
When I visit the product detail page
Then the form is replaced with my existing review (read-only)

**AC4 — Unauthenticated state:**
Given I am not logged in
When I visit the product detail page
Then a "Log in to leave a review" message is shown instead of the form

**AC5 — Not purchased:**
Given I am logged in but have not purchased the product
When I visit the product detail page
Then a "Purchase this product to leave a review" message is shown

## Tasks

- [x] `frontend/src/features/reviews/ReviewForm.tsx` — review form component
- [x] `frontend/src/api/reviewsApi.ts` — `createReviewApi()` function

## Dev Notes

### Architecture references
- Star rating selector: interactive star component using `StarRating` with click handlers
- Form state: React Hook Form with Zod validation (rating required 1-5, comment min 10 chars)
- Optimistic update: add review to local list immediately on success
- Eligibility check: call `GET /api/v1/orders` and check for delivered order with this product

### Key files
- `frontend/src/features/reviews/ReviewForm.tsx` — form component
- `frontend/src/components/ui/StarRating.tsx` — reusable star rating component
- `frontend/src/api/reviewsApi.ts` — API client

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ReviewForm with interactive star rating and text area
- ✅ Eligibility check before showing form
- ✅ Optimistic update adds review to list on success
- ✅ Appropriate messages for unauthenticated and non-purchaser states
- ✅ Existing review shown read-only if already submitted

### File List
- `frontend/src/features/reviews/ReviewForm.tsx`
- `frontend/src/api/reviewsApi.ts`
