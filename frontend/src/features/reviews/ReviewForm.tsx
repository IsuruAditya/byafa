import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppSelector } from '../../store/hooks'
import { createReviewApi } from '../../api/reviewsApi'
import type { Review } from '../../types/review.types'
import { Button } from '../../components/ui/Button'
import axios from 'axios'

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment cannot exceed 1000 characters'),
})

type FormValues = z.infer<typeof schema>

interface ReviewFormProps {
  productId: string
  /** The orderId to associate the review with — passed from order detail */
  orderId: string
  onReviewSubmitted: (review: Review) => void
}

export function ReviewForm({ productId, orderId, onReviewSubmitted }: ReviewFormProps) {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const [hovered, setHovered] = useState(0)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rating: 0, comment: '' },
  })

  const rating = watch('rating')

  async function onSubmit(values: FormValues) {
    try {
      const res = await createReviewApi({
        productId,
        orderId,
        rating: values.rating,
        comment: values.comment,
      })
      if (res.success && res.data) {
        onReviewSubmitted(res.data)
        reset()
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError('root', {
          message: err.response?.data?.message ?? 'Failed to submit review.',
        })
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <p className="text-sm text-gray-500">
        Please <a href="/login" className="text-indigo-600 hover:underline">sign in</a> to leave a review.
      </p>
    )
  }

  if (isSubmitSuccessful) {
    return (
      <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
        ✓ Your review has been submitted. Thank you!
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      {/* Star picker */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-1">Your rating</p>
        <div
          className="flex gap-1"
          role="group"
          aria-label="Select rating"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star !== 1 ? 's' : ''}`}
              aria-pressed={rating === star}
              onClick={() => setValue('rating', star, { shouldValidate: true })}
              onMouseEnter={() => setHovered(star)}
              className="text-2xl leading-none transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
            >
              <span className={(hovered || rating) >= star ? 'text-amber-400' : 'text-gray-200'}>
                ★
              </span>
            </button>
          ))}
        </div>
        {errors.rating && (
          <p className="text-xs text-red-600 mt-1">Please select a rating.</p>
        )}
      </div>

      {/* Comment */}
      <div className="flex flex-col gap-1">
        <label htmlFor="review-comment" className="text-sm font-medium text-gray-700">
          Your review
        </label>
        <textarea
          id="review-comment"
          rows={4}
          placeholder="Share your experience with this product…"
          className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          aria-invalid={!!errors.comment}
          aria-describedby={errors.comment ? 'comment-error' : undefined}
          {...register('comment')}
        />
        {errors.comment && (
          <p id="comment-error" className="text-xs text-red-600" role="alert">
            {errors.comment.message}
          </p>
        )}
      </div>

      {errors.root && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2" role="alert">
          {errors.root.message}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting}>
        Submit review
      </Button>
    </form>
  )
}
