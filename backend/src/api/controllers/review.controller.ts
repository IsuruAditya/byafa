import { Request, Response } from 'express'
import * as reviewService from '../../services/review.service'

export async function createReview(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id as string
  const { productId, orderId, rating, comment } = req.body as {
    productId: string
    orderId: string
    rating: number
    comment: string
  }

  const review = await reviewService.createReview({
    productId,
    userId,
    orderId,
    rating,
    comment,
  })

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: review,
  })
}

export async function getProductReviews(
  req: Request,
  res: Response
): Promise<void> {
  const reviews = await reviewService.getReviewsByProduct(
    req.params['productId'] as string
  )

  res.status(200).json({
    success: true,
    data: reviews,
  })
}
