import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { StatusBar } from 'expo-status-bar'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProductsStackParamList } from '../../navigation/types'
import { getProductByIdApi } from '../../api/productsApi'
import { getProductReviewsApi } from '../../api/reviewsApi'
import type { Product } from '../../types/product.types'
import type { Review } from '../../types/review.types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

const { width } = Dimensions.get('window')
type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>

export default function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params
  const { colors, isDark } = useTheme()
  const insets = useSafeAreaInsets()
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((s) => s.cart.items)

  const [product, setProduct]       = useState<Product | null>(null)
  const [reviews, setReviews]       = useState<Review[]>([])
  const [loading, setLoading]       = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity]     = useState(1)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    Promise.all([getProductByIdApi(id), getProductReviewsApi(id)])
      .then(([pRes, rRes]) => {
        if (pRes.success && pRes.data) setProduct(pRes.data)
        if (rRes.success && rRes.data) setReviews(rRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  function handleAddToCart() {
    if (!product) return
    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? '',
        quantity: 1,
        stockQuantity: product.stockQuantity,
      }))
    }
    dispatch(addToast({ message: `Added ${quantity} to cart`, type: 'success' }))
  }

  const inCart = cartItems.find((i) => i.productId === id)

  if (loading) return <Spinner fullScreen />

  if (!product) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>Product not found.</Text>
      </View>
    )
  }

  const images = product.images.length > 0 ? product.images : ['https://placehold.co/400x400?text=?']
  const isOutOfStock = product.stockQuantity === 0
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 5

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Back button overlay — positioned using safe area insets */}
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.surface, top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        accessibilityLabel="Go back"
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image carousel */}
        <View style={styles.imageContainer}>
          <FlatList
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              setActiveImage(Math.round(e.nativeEvent.contentOffset.x / width))
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={[styles.image, { backgroundColor: colors.borderLight }]}
                resizeMode="cover"
              />
            )}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    { backgroundColor: i === activeImage ? '#fff' : 'rgba(255,255,255,0.4)' },
                    i === activeImage && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category + name */}
          <Text style={[styles.category, { color: colors.primary }]}>
            {product.category.toUpperCase()}
          </Text>
          <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>

          {/* Rating row */}
          <View style={styles.ratingRow}>
            <StarRating rating={product.ratings.average} size={16} />
            <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
              {product.ratings.average.toFixed(1)} · {product.ratings.count} reviews
            </Text>
          </View>

          {/* Price + stock */}
          <View style={styles.priceRow}>
            <Text style={[styles.price, { color: colors.text }]}>
              {formatCurrency(product.price)}
            </Text>
            {isOutOfStock ? (
              <View style={[styles.stockBadge, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                <Text style={[styles.stockText, { color: colors.error }]}>Out of stock</Text>
              </View>
            ) : isLowStock ? (
              <View style={[styles.stockBadge, { backgroundColor: colors.warningBg, borderColor: colors.warningBorder }]}>
                <Text style={[styles.stockText, { color: colors.warning }]}>
                  Only {product.stockQuantity} left
                </Text>
              </View>
            ) : (
              <View style={[styles.stockBadge, { backgroundColor: colors.successBg, borderColor: colors.successBorder }]}>
                <Text style={[styles.stockText, { color: colors.success }]}>In stock</Text>
              </View>
            )}
          </View>

          {/* Quantity selector */}
          {!isOutOfStock && (
            <View style={[styles.qtyRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.qtyLabel, { color: colors.textSecondary }]}>Quantity</Text>
              <View style={styles.qtyControls}>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: colors.border }]}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color={quantity <= 1 ? colors.textMuted : colors.text} />
                </TouchableOpacity>
                <Text style={[styles.qtyValue, { color: colors.text }]}>{quantity}</Text>
                <TouchableOpacity
                  style={[styles.qtyBtn, { borderColor: colors.border }]}
                  onPress={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                  disabled={quantity >= product.stockQuantity}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={quantity >= product.stockQuantity ? colors.textMuted : colors.text}
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Description */}
          <View style={[styles.section, { borderTopColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <Text style={[styles.description, { color: colors.textSecondary }]}>
              {product.description}
            </Text>
          </View>

          {/* Reviews */}
          {reviews.length > 0 && (
            <View style={[styles.section, { borderTopColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Reviews ({reviews.length})
              </Text>
              {reviews.slice(0, 5).map((review) => (
                <View
                  key={review._id}
                  style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <View style={styles.reviewHeader}>
                    <View style={[styles.reviewAvatar, { backgroundColor: colors.primaryLight }]}>
                      <Text style={[styles.reviewAvatarText, { color: colors.primaryText }]}>
                        {(typeof review.userId === 'object' ? review.userId.name : 'C').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.reviewMeta}>
                      <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                        {typeof review.userId === 'object' ? review.userId.name : 'Customer'}
                      </Text>
                      <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                        {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </Text>
                    </View>
                    <StarRating rating={review.rating} size={12} />
                  </View>
                  <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                    {review.comment}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* ── Sticky footer ── */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }, shadows.lg]}>
        <View style={styles.footerPrice}>
          <Text style={[styles.footerPriceLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.footerPriceValue, { color: colors.text }]}>
            {formatCurrency(product.price * quantity)}
          </Text>
        </View>
        <Button
          onPress={handleAddToCart}
          disabled={isOutOfStock}
          size="lg"
          style={styles.addBtn}
          leftIcon={<Ionicons name="bag-add-outline" size={18} color="#fff" />}
        >
          {inCart ? `In cart (${inCart.quantity})` : 'Add to cart'}
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  errorText: { fontSize: fontSize.base },

  backBtn: {
    position: 'absolute',
    left: spacing.md,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },

  imageContainer: { position: 'relative' },
  image: { width, height: 340 },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotActive: { width: 20 },

  content: { padding: spacing.lg, gap: spacing.md },

  category: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    lineHeight: 30,
    marginTop: -spacing.xs,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ratingText: { fontSize: fontSize.sm },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  price: { fontSize: fontSize.xxxl, fontWeight: fontWeight.extrabold },
  stockBadge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
  },
  stockText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold },

  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
  },
  qtyLabel: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold, minWidth: 24, textAlign: 'center' },

  section: { borderTopWidth: 1, paddingTop: spacing.md, gap: spacing.sm },
  sectionTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },
  description: { fontSize: fontSize.base, lineHeight: 24 },

  reviewCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewAvatarText: { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  reviewMeta: { flex: 1 },
  reviewAuthor: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  reviewDate:   { fontSize: fontSize.xs },
  reviewComment: { fontSize: fontSize.sm, lineHeight: 20 },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: { fontSize: fontSize.xs },
  footerPriceValue: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  addBtn: { flex: 2 },
})
