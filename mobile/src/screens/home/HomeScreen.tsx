import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { HomeStackParamList, MainTabParamList } from '../../navigation/types'
import { getProductsApi } from '../../api/productsApi'
import type { Product } from '../../types/product.types'
import { useAppSelector } from '../../store/hooks'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'
import { Logo } from '../../components/ui/Logo'

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>
type TabNav = BottomTabNavigationProp<MainTabParamList>

const { width } = Dimensions.get('window')

const CATEGORIES = [
  { key: 'all',         label: 'All',         icon: '🛍️' },
  { key: 'electronics', label: 'Electronics', icon: '📱' },
  { key: 'clothing',    label: 'Clothing',    icon: '👕' },
  { key: 'home',        label: 'Home',        icon: '🏠' },
  { key: 'books',       label: 'Books',       icon: '📚' },
  { key: 'sports',      label: 'Sports',      icon: '⚽' },
]

export default function HomeScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme()
  const tabNav = useNavigation<TabNav>()
  const user = useAppSelector((s) => s.auth.user)
  const cartCount = useAppSelector((s) =>
    s.cart.items.reduce((sum, i) => sum + i.quantity, 0)
  )
  const [featured, setFeatured] = useState<Product[]>([])
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getProductsApi({ sortBy: 'popularity', pageSize: 8 }),
      getProductsApi({ sortBy: 'newest', pageSize: 6 }),
    ])
      .then(([pop, newest]) => {
        setFeatured(pop.data)
        setNewArrivals(newest.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { backgroundColor: colors.background }]}>
        <View style={styles.topLeft}>
          <Logo size={32} />
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              {greeting()}, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </Text>
            <Text style={[styles.topTitle, { color: colors.text }]}>Byafa</Text>
          </View>
        </View>
        <View style={styles.topActions}>
          {/* Search — navigates to Shop tab */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => tabNav.navigate('ProductsTab')}
            accessibilityLabel="Search products"
          >
            <Ionicons name="search-outline" size={20} color={colors.text} />
          </TouchableOpacity>
          {/* Cart */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => tabNav.navigate('CartTab')}
            accessibilityLabel={`Cart, ${cartCount} items`}
          >
            <Ionicons name="bag-outline" size={20} color={colors.text} />
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>{cartCount > 9 ? '9+' : cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

        {/* ── Hero banner ── */}
        <View style={[styles.hero, { backgroundColor: colors.primary }]}>
          <View style={styles.heroContent}>
            <View style={[styles.heroBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.heroBadgeText}>🚚 Free shipping over $50</Text>
            </View>
            <Text style={styles.heroTitle}>New arrivals{'\n'}just dropped</Text>
            <Text style={styles.heroSub}>Discover the latest trends</Text>
            <TouchableOpacity
              style={styles.heroBtn}
              onPress={() => tabNav.navigate('ProductsTab')}
              activeOpacity={0.85}
            >
              <Text style={[styles.heroBtnText, { color: colors.primary }]}>Shop now</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.heroCircle1} />
          <View style={styles.heroCircle2} />
        </View>

        {/* ── Categories ── */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.catList}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.catChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                activeOpacity={0.75}
                onPress={() => tabNav.navigate('ProductsTab')}
              >
                <Text style={styles.catIcon}>{cat.icon}</Text>
                <Text style={[styles.catLabel, { color: colors.text }]}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Popular picks ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Popular picks</Text>
            <TouchableOpacity onPress={() => tabNav.navigate('ProductsTab')}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />
          ) : (
            <FlatList
              data={featured}
              keyExtractor={(item) => item._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.productList}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.productCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    shadows.sm,
                  ]}
                  onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: item.images[0] ?? 'https://placehold.co/200x200?text=?' }}
                    style={[styles.productImage, { backgroundColor: colors.borderLight }]}
                    resizeMode="cover"
                  />
                  {item.stockQuantity === 0 && (
                    <View style={styles.outOfStockBadge}>
                      <Text style={styles.outOfStockText}>Out of stock</Text>
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <Text style={[styles.productName, { color: colors.text }]} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <StarRating rating={item.ratings.average} size={11} />
                    <Text style={[styles.productPrice, { color: colors.primary }]}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* ── New arrivals ── */}
        {!loading && newArrivals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>New arrivals</Text>
              <TouchableOpacity onPress={() => tabNav.navigate('ProductsTab')}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all →</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.gridList}>
              {newArrivals.slice(0, 4).map((item) => (
                <TouchableOpacity
                  key={item._id}
                  style={[
                    styles.gridCard,
                    { backgroundColor: colors.surface, borderColor: colors.border },
                    shadows.sm,
                  ]}
                  onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: item.images[0] ?? 'https://placehold.co/200x200?text=?' }}
                    style={[styles.gridImage, { backgroundColor: colors.borderLight }]}
                    resizeMode="cover"
                  />
                  <View style={styles.gridInfo}>
                    <Text style={[styles.gridName, { color: colors.text }]} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={[styles.gridPrice, { color: colors.primary }]}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* ── Trust badges ── */}
        <View style={[styles.trustRow, { borderTopColor: colors.border }]}>
          {[
            { icon: '🚚', label: 'Free shipping', sub: 'On orders over $50' },
            { icon: '🔒', label: 'Secure payment', sub: 'Powered by Stripe' },
            { icon: '↩️', label: 'Easy returns', sub: '30-day policy' },
          ].map((t) => (
            <View key={t.label} style={styles.trustItem}>
              <Text style={styles.trustIcon}>{t.icon}</Text>
              <Text style={[styles.trustLabel, { color: colors.text }]}>{t.label}</Text>
              <Text style={[styles.trustSub, { color: colors.textMuted }]}>{t.sub}</Text>
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  scroll: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  greeting: { fontSize: fontSize.sm },
  topTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold, marginTop: 2 },
  topActions: { flexDirection: 'row', gap: spacing.sm },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700' },

  hero: {
    margin: spacing.lg,
    borderRadius: radius.xxl,
    padding: spacing.xl,
    overflow: 'hidden',
    minHeight: 180,
  },
  heroContent: { gap: spacing.sm, zIndex: 1 },
  heroBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  heroBadgeText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  heroTitle: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    color: '#fff',
    lineHeight: 36,
  },
  heroSub: { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  heroBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: '#fff',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  heroBtnText: { fontWeight: fontWeight.bold, fontSize: fontSize.sm },
  heroCircle1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    right: -40,
    top: -40,
  },
  heroCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    right: 40,
    bottom: -30,
  },

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  seeAll: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  catList: { paddingRight: spacing.lg, gap: spacing.sm },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  catIcon:  { fontSize: 16 },
  catLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  productList: { paddingRight: spacing.lg, gap: spacing.md },
  productCard: {
    width: 160,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  productImage: { width: '100%', height: 150 },
  outOfStockBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  outOfStockText: { color: '#fff', fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  productInfo: { padding: spacing.sm + 2, gap: 4 },
  productName: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 },
  productPrice: { fontSize: fontSize.base, fontWeight: fontWeight.bold },

  gridList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  gridCard: {
    width: (width - spacing.lg * 2 - spacing.md) / 2,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImage: { width: '100%', height: 120 },
  gridInfo: { padding: spacing.sm, gap: 2 },
  gridName:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  gridPrice: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },

  trustRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    marginHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    marginBottom: spacing.md,
  },
  trustItem: { flex: 1, alignItems: 'center', gap: 2 },
  trustIcon:  { fontSize: 22, marginBottom: 2 },
  trustLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, textAlign: 'center' },
  trustSub:   { fontSize: 10, textAlign: 'center' },
})
