import { Request, Response } from 'express'
import * as adminService from '../../services/admin.service'
import type { OrderStatus } from '../../models/Order.model'

// ── Products ────────────────────────────────────────────────────────────────

export async function createProduct(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[]) ?? []
  const existingImages = req.body['existingImages']
    ? (JSON.parse(req.body['existingImages'] as string) as string[])
    : []

  const product = await adminService.createProduct({
    name:          req.body['name'] as string,
    description:   req.body['description'] as string,
    price:         parseFloat(req.body['price'] as string),
    category:      req.body['category'] as string,
    stockQuantity: parseInt(req.body['stockQuantity'] as string, 10),
    imageFiles:    files,
    existingImages,
  })

  res.status(201).json({ success: true, data: product })
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  const files = (req.files as Express.Multer.File[]) ?? []
  const existingImages = req.body['existingImages']
    ? (JSON.parse(req.body['existingImages'] as string) as string[])
    : []

  const product = await adminService.updateProduct(req.params['id'] as string, {
    name:          req.body['name'] as string,
    description:   req.body['description'] as string,
    price:         parseFloat(req.body['price'] as string),
    category:      req.body['category'] as string,
    stockQuantity: parseInt(req.body['stockQuantity'] as string, 10),
    imageFiles:    files,
    existingImages,
  })

  res.status(200).json({ success: true, data: product })
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  await adminService.deleteProduct(req.params['id'] as string)
  res.status(200).json({ success: true, message: 'Product deleted' })
}

export async function updateInventory(req: Request, res: Response): Promise<void> {
  const { stockQuantity } = req.body as { stockQuantity: number }
  const product = await adminService.updateInventory(
    req.params['id'] as string,
    stockQuantity
  )
  res.status(200).json({ success: true, data: product })
}

// ── Orders ──────────────────────────────────────────────────────────────────

export async function getAdminOrderById(req: Request, res: Response): Promise<void> {
  const order = await adminService.getAdminOrderById(req.params['id'] as string)
  res.status(200).json({ success: true, data: order })
}

export async function getAdminOrders(req: Request, res: Response): Promise<void> {
  const { search, status, from, to, page, pageSize } =
    req.query as Record<string, string | undefined>

  const result = await adminService.getAdminOrders({
    search,
    status,
    from,
    to,
    page:     page     ? parseInt(page, 10)     : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  })

  res.status(200).json({ success: true, ...result })
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  const { status } = req.body as { status: OrderStatus }
  const order = await adminService.adminUpdateOrderStatus(
    req.params['id'] as string,
    status
  )
  res.status(200).json({ success: true, data: order })
}

export async function issueRefund(req: Request, res: Response): Promise<void> {
  const order = await adminService.issueRefund(req.params['id'] as string)
  res.status(200).json({ success: true, message: 'Refund issued', data: order })
}

// ── Dashboard ────────────────────────────────────────────────────────────────

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const stats = await adminService.getDashboardStats()
  res.status(200).json({ success: true, data: stats })
}

export async function getRevenueSummary(req: Request, res: Response): Promise<void> {
  const { from, to } = req.query as { from?: string; to?: string }

  if (!from || !to) {
    res.status(400).json({ success: false, message: 'from and to query params are required' })
    return
  }

  const summary = await adminService.getRevenueSummary(from, to)
  res.status(200).json({ success: true, data: summary })
}
