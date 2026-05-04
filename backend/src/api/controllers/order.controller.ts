import { Request, Response } from 'express'
import * as orderService from '../../services/order.service'
import type { IShippingAddress } from '../../models/Order.model'

export async function createPaymentIntent(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id as string
  const { items, shippingAddress } = req.body as {
    items: Array<{ productId: string; quantity: number }>
    shippingAddress: IShippingAddress
  }

  const result = await orderService.createPaymentIntent({
    userId,
    items,
    shippingAddress,
  })

  res.status(200).json({
    success: true,
    data: result,
  })
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id as string
  const orders = await orderService.getOrdersByUser(userId)

  res.status(200).json({
    success: true,
    data: orders,
  })
}

export async function getMyOrderStatus(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id as string
  const order = await orderService.getOrderById(
    req.params['id'] as string,
    userId
  )

  res.status(200).json({
    success: true,
    data: { status: order.status },
  })
}

export async function getMyOrderById(
  req: Request,
  res: Response
): Promise<void> {
  const userId = req.user!.id as string
  const order = await orderService.getOrderById(
    req.params['id'] as string,
    userId
  )

  res.status(200).json({
    success: true,
    data: order,
  })
}
