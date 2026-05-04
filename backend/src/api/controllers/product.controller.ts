import { Request, Response } from 'express'
import * as productService from '../../services/product.service'
import type { SortOption } from '../../services/product.service'

export async function getCatalog(req: Request, res: Response): Promise<void> {
  const {
    search,
    category,
    sortBy,
    page,
    pageSize,
  } = req.query as Record<string, string | undefined>

  const result = await productService.getCatalog({
    search,
    category,
    sortBy: sortBy as SortOption | undefined,
    page:     page     ? parseInt(page, 10)     : undefined,
    pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
  })

  res.status(200).json({
    success: true,
    data: result.data,
    pagination: result.pagination,
  })
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  const product = await productService.getProductById(req.params['id'] as string)

  res.status(200).json({
    success: true,
    data: product,
  })
}
