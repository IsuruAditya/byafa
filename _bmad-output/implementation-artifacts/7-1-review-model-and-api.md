# Story 7.1: Review Model and API

**Status:** done
**Epic:** 7 — Product Reviews
**Project context:** `_bmad-output/project-context.md`

## Story

As a developer,
I want a Review Mongoose model and REST endpoints for creating and fetching reviews,
so that product reviews can be stored and displayed.

## Acceptance Criteria

**AC1 — Review schema:**
Given the Review model is defined
Then it includes: `productId`, `userId`, `orderId`, `rating` (1–5), `comment` (max 1000 chars), `createdAt`, `updatedAt`
And a compound unique index `{ productId: 1, userId: 1 }` prevents duplicate reviews
And `timestamps: true` is set

**AC2 — Create review:**
Given `POST /api/v1/reviews` is called by an authenticated customer
Then the backend verifies the `orderId` belongs to the user and contains the product
And if the user already reviewed this product, returns 409
And on success, updates `product.ratings.average` and `product.ratings.count` atomically

**AC3 — Get reviews:**
Given `GET /api/v1/reviews/product/:productId` is called
Then it returns all reviews sorted by `createdAt` descending
And each review includes the reviewer's name (populated from User)

## Tasks

- [x] `backend/src/models/Review.model.ts`
- [x] `backend/src/services/review.service.ts` — `createReview()`, `getReviewsByProduct()`
- [x] `backend/src/api/controllers/review.controller.ts`
- [x] `backend/src/api/routes/review.routes.ts`

## Dev Notes

### Purchase verification
```ts
const order = await Order.findOne({
  _id: orderId,
  userId,
  'items.productId': new mongoose.Types.ObjectId(productId),
})
if (!order) throw new AppError('You can only review products from your own orders', 403)
```
Checks order belongs to user AND contains the product. `orderId` is required in the request body.

### syncProductRatings
Called after every review creation. Uses aggregation:
```ts
const [result] = await Review.aggregate([
  { $match: { productId: new ObjectId(productId) } },
  { $group: { _id: null, average: { $avg: '$rating' }, count: { $sum: 1 } } },
])
await Product.findByIdAndUpdate(productId, {
  'ratings.average': Math.round(result.average * 10) / 10,
  'ratings.count': result.count,
})
```
Rounds average to 1 decimal place.

### Populate reviewer name
```ts
Review.find({ productId }).sort({ createdAt: -1 }).populate('userId', 'name').lean()
```
Only `name` is populated — no email or other PII exposed.

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ Review model with compound unique index, orderId field
- ✅ `createReview()` — purchase verification, duplicate check, syncProductRatings
- ✅ `getReviewsByProduct()` — sorted, populated reviewer name
- ✅ Routes: GET public, POST authenticated

### File List
- `backend/src/models/Review.model.ts`
- `backend/src/services/review.service.ts`
- `backend/src/api/controllers/review.controller.ts`
- `backend/src/api/routes/review.routes.ts`
