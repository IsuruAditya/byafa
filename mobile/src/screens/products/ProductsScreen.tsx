import React, { useEffect, useState, useCallback, useRef } from 'react'
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
  ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProductsStackParamList } from '../../navigation/types'
import { getProductsApi } from '../../api/productsApi'
import type { Product, SortOption } from '../../types/product.types'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'
import { Spinner } from '../../components/ui/Spinner'

type Props = NativeStackScreenProps<ProductsStackParamList, 'Products'>

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Popular',  value: 'popularity' },
  { label: 'Newest',   value: 'newest' },
  { label: 'Price ↑',  value: 'price_asc' },
  { label: 'Price ↓',  value: 'price_desc' },
]

const CATEGORIES = [
  { key: '',            label: 'All' },
  { key: 'electronics', label: 'Electronics' },
  { key: 'clothing',    label: 'Clothing' },
  { key: 'home',        label: 'Home' },
  { key: 'books',       label: 'Books' },
  { key: 'sports',      label: 'Sports' },
]

export default function ProductsScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme()
  const [products, setProducts]       = useState<Product[]>([])
  const [loading, setLoading]         = useState(true)
  const [refreshing, setRefreshing]   = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch]           = useState('')
  const [sortBy, setSortBy]           = useState<SortOption>('popularity')
  const [category, setCategory]       = useState('')
  const [page, setPage]               = useState(1)
  const [totalPages, setTotalPages]   = useState(1)
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchProducts = useCallback(
    async (opts: { page?: number; reset?: boolean; q?: string; sort?: SortOption; cat?: string }) => {
      const { page: p = 1, reset = false, q = search, sort = sortBy, cat = category } = opts
      try {
        const res = await getProductsApi({
          page: p, pageSize: 12,
          search: q || undefined,
          sortBy: sort,
          category: cat || undefined,
        })
        setProducts((prev) => reset ? res.data : [...prev, ...res.data])
        setTotalPages(res.pagination.totalPages)
        setPage(p)
      } catch {}
    },
    [search, sortBy, category]
  )

  useEffect(() => {
    setLoading(true)
    fetchProducts({ page: 1, reset: true }).finally(() => setLoading(false))
  }, [sortBy, category])

  function handleSearch(text: string) {
    setSearch(text)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setLoading(true)
      fetchProducts({ page: 1, reset: true, q: text }).finally(() => setLoading(false))
    }, 400)
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
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Header ── */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Shop</Text>

        {/* Search */}
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search products…"
            placeholderTextColor={colors.textMuted}
            value={search}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.catList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.catChip,
                {
                  backgroundColor: category === cat.key ? colors.primary : colors.surface,
                  borderColor: category === cat.key ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setCategory(cat.key)}
            >
              <Text
                style={[
                  styles.catText,
                  { color: category === cat.key ? '#fff' : colors.textSecondary },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sortList}
        >
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sortBy === opt.value ? colors.primaryLight : 'transparent',
                  borderColor: sortBy === opt.value ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSortBy(opt.value)}
            >
              <Text
                style={[
                  styles.sortText,
                  { color: sortBy === opt.value ? colors.primaryText : colors.textSecondary },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Product grid ── */}
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
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={
            loadingMore
              ? <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.lg }} />
              : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No products found</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Try a different search or filter
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: colors.border },
                shadows.sm,
              ]}
              onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
              activeOpacity={0.85}
            >
              <Image
                source={{ uri: item.images[0] ?? 'https://placehold.co/200x200?text=?' }}
                style={[styles.cardImage, { backgroundColor: colors.borderLight }]}
                resizeMode="cover"
              />
              {item.stockQuantity === 0 && (
                <View style={styles.outOfStock}>
                  <Text style={styles.outOfStockText}>Out of stock</Text>
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={[styles.cardName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <StarRating rating={item.ratings.average} size={11} />
                <Text style={[styles.cardPrice, { color: colors.primary }]}>
                  {formatCurrency(item.price)}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: { paddingBottom: spacing.sm, gap: spacing.sm },
  headerTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },

  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    height: 46,
    marginHorizontal: spacing.lg,
  },
  searchInput: { flex: 1, fontSize: fontSize.base },

  catList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  catChip: {
    borderWidth: 1.5,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 1,
  },
  catText: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  sortList: { paddingHorizontal: spacing.lg, gap: spacing.sm },
  sortChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  sortText: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },

  list: { padding: spacing.md, paddingTop: spacing.sm },
  row:  { gap: spacing.md, marginBottom: spacing.md },

  card: {
    flex: 1,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 160 },
  outOfStock: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  outOfStockText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  cardBody: { padding: spacing.sm + 2, gap: 4 },
  cardName:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 },
  cardPrice: { fontSize: fontSize.base, fontWeight: fontWeight.bold },

  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.sm },
  emptyIcon:  { fontSize: 48 },
  emptyTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  emptyText:  { fontSize: fontSize.sm },
})
