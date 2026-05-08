# Story 7.2: Review Submission (Frontend)

**Status:** done
**Epic:** 7 — Product Reviews
**Project context:** `_bmad-output/project-context.md`

## Story

As a customer who has purchased a product,
I want to submit a star rating and written review,
so that I can share my experience with other shoppers.

## Acceptance Criteria

**AC1 — Review form shown to eligible users:**
Given I am logged in and have an order containing the product (any non-cancelled status)
When I visit the product detail page
Then a review form with a star rating selector (1–5) and text area is displayed

**AC2 — Unauthenticated state:**
Given I am not logged in
When I visit the product detail page
Then a "Sign in to leave a review" message is shown instead of the form

**AC3 — Not purchased:**
Given I am logged in but have no qualifying order for this product
When I visit the product detail page
Then the review form is not shown (no message needed — form simply absent)

**AC4 — Submit review:**
Given I select a rating and write a comment (min 10 chars)
When I submit the form
Then `POST /api/v1/reviews` is called with `{ productId, orderId, rating, comment }`
And on success, my review appears in the review list immediately (optimistic prepend)
And the form is replaced with a success message

**AC5 — Already reviewed:**
Given I have already submitted a review for this product
Then the form is not shown (eligibleOrderId is cleared after submission)

**AC6 — Validation:**
Given I submit without selecting a rating
Then "Please select a rating" error is shown
Given the comment is under 10 characters
Then "Comment must be at least 10 characters" error is shown

## Tasks

- [x] `frontend/src/features/reviews/ReviewForm.tsx` — star picker + textarea + submit
- [x] `frontend/src/features/products/ProductDetailPage.tsx` — eligibility check + form integration
- [x] `frontend/src/api/reviewsApi.ts` — `createReviewApi()`

## Dev Notes

### Eligibility check (ProductDetailPage)
```ts
useEffect(() => {
  if (!isAuthenticated || !id) return
  getMyOrdersApi().then(res => {
    const order = res.data?.find(o =>
      o.status !== 'cancelled' &&
      o.items.some(item => item.productId === id)
    )
    if (order) setEligibleOrderId(order._id)
  }).catch(() => {})
}, [isAuthenticated, id])
```
`eligibleOrderId` is passed to `ReviewForm` as the `orderId` prop.
After successful submission, `setEligibleOrderId(null)` hides the form.

### Star picker interaction
```tsx
const [hovered, setHovered] = useState(0)
// Each star button:
onMouseEnter={() => setHovered(star)}
onMouseLeave={() => setHovered(0)}  // on container
onClick={() => setValue('rating', star, { shouldValidate: true })}
// Fill: (hovered || rating) >= star ? amber : grey
```
`setValue` from React Hook Form updates the `rating` field.
`shouldValidate: true` clears the "please select a rating" error immediately on click.

### Optimistic review prepend
```ts
onReviewSubmitted={(review) => {
  setReviews(prev => [review, ...prev])  // prepend to list
  setEligibleOrderId(null)               // hide form
}}
```
The review returned from the API already has `userId` populated with `{ _id, name }`.

### Form reset after success
`isSubmitSuccessful` from React Hook Form drives the success state.
The form is replaced with a success message — no re-render of the form needed.

### Accessibility
- Star buttons: `aria-label="{n} star(s)"`, `aria-pressed={rating === star}`
- Textarea: `id="review-comment"`, `<label htmlFor="review-comment">`
- Error: `aria-invalid`, `aria-describedby="comment-error"`, `role="alert"` on error paragraph

## Dev Agent Record

### Agent Model Used
Claude (Kiro)

### Completion Notes
- ✅ ReviewForm — star picker with hover state, textarea, Zod validation
- ✅ Eligibility check in ProductDetailPage — orders API call on mount when authenticated
- ✅ Optimistic prepend to review list on success
- ✅ Form hidden after submission (eligibleOrderId cleared)
- ✅ Accessible star buttons with aria-label and aria-pressed
- ✅ `createReviewApi()` in reviewsApi.ts

### File List
- `frontend/src/features/reviews/ReviewForm.tsx`
- `frontend/src/features/products/ProductDetailPage.tsx` (eligibility check + form integration)
- `frontend/src/api/reviewsApi.ts`
