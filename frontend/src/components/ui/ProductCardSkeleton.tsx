/**
 * Skeleton placeholder for ProductCard — shown while products are loading.
 * Matches the exact dimensions of ProductCard to prevent layout shift.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-4/3 bg-gray-200 dark:bg-gray-700" />
      {/* Info placeholder */}
      <div className="flex flex-col gap-2 p-4">
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded-md" />
        <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded-full mt-1" />
        <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded-md mt-2" />
      </div>
    </div>
  )
}

interface ProductGridSkeletonProps {
  count?: number
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <ul
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Loading products"
      aria-busy="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <li key={i}>
          <ProductCardSkeleton />
        </li>
      ))}
    </ul>
  )
}
