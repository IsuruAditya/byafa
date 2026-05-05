import type { Review } from '../../types/review.types'
import { StarRating } from '../../components/ui/StarRating'

interface ReviewListProps {
  reviews: Review[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getReviewerName(userId: Review['userId']): string {
  if (typeof userId === 'object' && userId !== null) return userId.name
  return 'Customer'
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) return null

  return (
    <ul className="space-y-4">
      {reviews.map((review) => (
        <li
          key={review._id}
          className="rounded-xl border border-gray-200 bg-white p-5 space-y-2"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">
                {getReviewerName(review.userId)}
              </span>
              <StarRating average={review.rating} count={0} size="sm" />
            </div>
            <span className="text-xs text-gray-400 shrink-0">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>
        </li>
      ))}
    </ul>
  )
}
