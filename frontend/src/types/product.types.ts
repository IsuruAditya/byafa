export interface Product {
  _id: string
  name: string
  description: string
  price: number
  costPrice: number
  images: string[]
  category: string
  stockQuantity: number
  lowStockThreshold: number
  ratings: {
    average: number
    count: number
  }
  createdAt: string
  updatedAt: string
}

export type SortOption = 'price_asc' | 'price_desc' | 'newest' | 'popularity'

export interface CatalogFilters {
  search: string
  category: string
  sortBy: SortOption
  page: number
}
