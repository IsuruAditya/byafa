import { Product, IProduct } from '../models/Product.model'
import { AppError } from '../utils/AppError'

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popularity'

export interface CatalogQuery {
  search?: string
  category?: string
  sortBy?: SortOption
  page?: number
  pageSize?: number
}

export interface PaginatedProducts {
  data: IProduct[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

const SORT_MAP: Record<SortOption, Record<string, 1 | -1>> = {
  price_asc:   { price: 1 },
  price_desc:  { price: -1 },
  newest:      { createdAt: -1 },
  popularity:  { 'ratings.average': -1, 'ratings.count': -1 },
}

export async function getCatalog(query: CatalogQuery): Promise<PaginatedProducts> {
  const {
    search,
    category,
    sortBy = 'newest',
    page = 1,
    pageSize = 12,
  } = query

  // Clamp pagination values
  const safePage     = Math.max(1, page)
  const safePageSize = Math.min(Math.max(1, pageSize), 100)
  const skip         = (safePage - 1) * safePageSize

  // Build filter
  const filter: Record<string, unknown> = {}

  if (search?.trim()) {
    filter.$text = { $search: search.trim() }
  }

  if (category?.trim()) {
    filter.category = category.trim().toLowerCase()
  }

  const sort = SORT_MAP[sortBy] ?? SORT_MAP.newest

  const [data, total] = await Promise.all([
    Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(safePageSize)
      .lean(),
    Product.countDocuments(filter),
  ])

  return {
    data: data as unknown as IProduct[],
    pagination: {
      page: safePage,
      pageSize: safePageSize,
      total,
      totalPages: Math.ceil(total / safePageSize),
    },
  }
}

export async function getProductById(id: string): Promise<IProduct> {
  // Validate ObjectId format before hitting the DB
  if (!id.match(/^[a-f\d]{24}$/i)) {
    throw new AppError('Product not found', 404)
  }

  const product = await Product.findById(id).lean()
  if (!product) {
    throw new AppError('Product not found', 404)
  }

  return product as unknown as IProduct
}
