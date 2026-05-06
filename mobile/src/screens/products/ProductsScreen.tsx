import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProductsStackParamList } from '../../navigation/types'
import { getProductsApi } from '../../api/productsApi'
import type { Product, SortOption } from '../../types/product.types'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'
import { Spinner } from '../../components/ui/Spinner'

type Props = NativeStackScreenProps<ProductsStackParamList, 'Products'>

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Popular', value: 'popularity' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price ↑', value: 'price_asc' },
  { label: 'Price ↓', value: 'price_desc' },
]

export default function ProductsScreen({ navigation }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('popularity')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(
    async (opts: { page?: number; reset?: boolean; searchVal?: string; sort?: SortOption }) => {
      const { page: p = 1, reset = false, searchVal = search, sort = sortBy } = opts
      try {
        const res = await getProductsApi({
          page: p,
          pageSize: 12,
          search: searchVal || undefined,
          sortBy: sort,
        })
        if (reset) {
          setProducts(res.data)
        } else {
          setProducts((prev) => [...prev, ...res.data])
        }
        setTotalPages(res.pagination.totalPages)
        setPage(p)
      } catch {}
    },
    [search, sortBy]
  )

  useEffect(() => {
    setLoading(true)
    fetchProducts({ page: 1, reset: true }).finally(() => setLoading(false))
  }, [sortBy])

  function handleSearchChange(text: string) {
    setSearch(text)
    if (searchTimeout) clearTimeout(searchTimeout)
    const t = setTimeout(() => {
      setLoading(true)
      fetchProducts({ page: 1, reset: true, searchVal: text }).finally(() =>
        setLoading(false)
      )
    }, 400)
    setSearchTimeout(t)
  }

  async function handleRefresh() {
    setRefreshing(true)
    await fetchProducts({ page: 1, reset: true })
    setRefreshing(false)
  }

  async function handleLoadMore() {
    if (loadingMore || page >= totalPages) return
    setLoadingMore(true)
    await fetchProducts({ page: page + 1 })
    setLoadingMore(false)
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Search bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearchChange}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearchChange('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sort chips */}
      <View style={styles.sortRow}>
        {SORT_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sortChip, sortBy === opt.value && styles.sortChipActive]}
            onPress={() => setSortBy(opt.value)}
          >
            <Text
              style={[
                styles.sortChipText,
                sortBy === opt.value && styles.sortChipTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <Spinner fullScreen />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try a different search or filter</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
              activeOpacity={0.85}
            >
              <Image
                source={{
                  uri: item.images[0] ?? 'https://placehold.co/200x200?text=?',
                }}
                style={styles.cardImage}
                resizeMode="cover"
              />
              {item.stockQuantity === 0 && (
                <View style={styles.outOfStock}>
                  <Text style={styles.outOfStockText}>Out of stock</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardName} numberOfLines={2}>
                  {item.name}
                </Text>
                <StarRating rating={item.ratings.average} size={12} />
                <Text style={styles.cardPrice}>{formatCurrency(item.price)}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  searchRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: fontSize.base,
    color: colors.text,
  },

  sortRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  sortChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  sortChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortChipText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: '#fff',
  },

  list: {
    padding: spacing.md,
    paddingTop: spacing.sm,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 150,
    backgroundColor: colors.borderLight,
  },
  outOfStock: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
  },
  cardBody: {
    padding: spacing.sm + 2,
    gap: 4,
  },
  cardName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 18,
  },
  cardPrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
})
