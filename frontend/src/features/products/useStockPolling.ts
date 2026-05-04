import { useState, useCallback } from 'react'
import { getProductByIdApi } from '../../api/productsApi'

/**
 * Returns the latest stockQuantity for a product and a `refresh` function.
 * Call `refresh()` after add-to-cart to get the updated count from the server.
 * Initial stock is seeded from the already-loaded product to avoid an extra request.
 */
export function useStockPolling(productId: string, initialStock: number) {
  const [stock, setStock] = useState(initialStock)
  const [refreshing, setRefreshing] = useState(false)

  const refresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const res = await getProductByIdApi(productId)
      if (res.success && res.data) {
        setStock(res.data.stockQuantity)
      }
    } catch {
      // Non-critical — keep showing last known stock
    } finally {
      setRefreshing(false)
    }
  }, [productId])

  return { stock, refreshing, refresh }
}
