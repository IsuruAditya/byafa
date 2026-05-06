# Story 7.1: Review Model and API

**Status:** done
**Epic:** 7 — Product Reviews
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Review Mongoose model and REST endpoints for creating and fetching reviews,
so that product reviews can be stored and displayed.

## Acceptance Criteria

**AC1 — Review model:**
Given the backend is running
When the Review model is defined
Then it includes: `productId`, `userId`, `rating` (1–5 integer), `comment` (string), `createdAt`, `updatedAt`
And a compound unique index on `{ productId, userId }` prevents duplicate reviews

**AC2 — Get reviews:**
Given `GET /api/v1/products/:id/reviews` is called
When the request is processed
Then all reviews for the product are returned with `{ success: true, data: [...] }`
And each review includes the reviewer's first name (populated from User)

**AC3 — Create review:**
Given `POST /api/v1/products/:id/reviews` is called by an authenticated customer
When the review is created
Then the product's `ratings.average` and `ratings.count` are updated atomically
And if the user has already reviewed this product, a 409 error is returned

**AC4 — Purchase verification:**
Given a customer tries to submit a review
When the request is processed
Then the backend verifies the customer has a delivered order containing the product
And if not, a 403 error is returned: `{ success: false, message: "You must purchase this product to leave a review" }`

## Tasks

- [x] `backend/src/models/Review.model.ts` — Review schema with compound unique index
- [x] `backend/src/services/review.service.ts` — `getReviews()`, `createReview()`
- [x] `backend/src/api/controllers/review.controller.ts` — review handlers
- [x] `backend/src/api/routes/review.routes.ts` — review routes

## Dev Notes

### Architecture references
- Compound unique index: `reviewSchema.index({ productId: 1, userId: 1 }, { unique: true })`
- Rating update: use `$avg` aggregation or recalculate: `(currentAvg * count + newRating) / (count + 1)`
- Purchase check: `Order.findOne({ userId, 'items.productId': productId, status: 'delivered' })`
- Populate reviewer name: `.populate('userId', 'name')` then return only first name

### Key files
- `backend/src/models/Review.model.ts` — Review schema
- `backend/src/services/review.service.ts` — review business logic

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Review model with compound unique index
- ✅ Purchase verification before allowing review submission
- ✅ Product ratings.average and ratings.count updated atomically
- ✅ 409 on duplicate review attempt
- ✅ Reviewer first name populated in response

### File List
- `backend/src/models/Review.model.ts`
- `backend/src/services/review.service.ts`
- `backend/src/api/controllers/review.controller.ts`
- `backend/src/api/routes/review.routes.ts`
