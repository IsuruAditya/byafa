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
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProductsStackParamList } from '../../navigation/types'
import { getProductByIdApi } from '../../api/productsApi'
import { getProductReviewsApi } from '../../api/reviewsApi'
import type { Product } from '../../types/product.types'
import type { Review } from '../../types/review.types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addToCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'
import { Button } from '../../components/ui/Button'
import { Spinner } from '../../components/ui/Spinner'

const { width } = Dimensions.get('window')

type Props = NativeStackScreenProps<ProductsStackParamList, 'ProductDetail'>

export default function ProductDetailScreen({ route }: Props) {
  const { id } = route.params
  const dispatch = useAppDispatch()
  const cartItems = useAppSelector((s) => s.cart.items)

  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
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
    dispatch(
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0] ?? '',
        quantity: 1,
        stockQuantity: product.stockQuantity,
      })
    )
    dispatch(addToast({ message: 'Added to cart', type: 'success' }))
  }

  const inCart = cartItems.find((i) => i.productId === id)

  if (loading) return <Spinner fullScreen />

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Product not found.</Text>
      </View>
    )
  }

  const images =
    product.images.length > 0
      ? product.images
      : ['https://placehold.co/400x400?text=?']

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
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
              const idx = Math.round(e.nativeEvent.contentOffset.x / width)
              setActiveImage(idx)
            }}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
          />
          {images.length > 1 && (
            <View style={styles.dots}>
              {images.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === activeImage && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.content}>
          {/* Category */}
          <Text style={styles.category}>{product.category}</Text>

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <StarRating rating={product.ratings.average} size={16} />
            <Text style={styles.ratingText}>
              {product.ratings.average.toFixed(1)} ({product.ratings.count} reviews)
            </Text>
          </View>

          {/* Price */}
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>

          {/* Stock */}
          <Text
            style={[
              styles.stock,
              product.stockQuantity === 0 && styles.stockOut,
            ]}
          >
            {product.stockQuantity === 0
              ? 'Out of stock'
              : product.stockQuantity <= 5
              ? `Only ${product.stockQuantity} left`
              : 'In stock'}
          </Text>

          {/* Description */}
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Reviews */}
          {reviews.length > 0 && (
            <>
              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>
                Reviews ({reviews.length})
              </Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review._id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewAuthor}>
                      {typeof review.userId === 'object'
                        ? review.userId.name
                        : 'Customer'}
                    </Text>
                    <StarRating rating={review.rating} size={12} />
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              ))}
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Add to cart button */}
      <View style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerPriceLabel}>Price</Text>
          <Text style={styles.footerPriceValue}>{formatCurrency(product.price)}</Text>
        </View>
        <Button
          onPress={handleAddToCart}
          disabled={product.stockQuantity === 0}
          size="lg"
          style={styles.addBtn}
        >
          {inCart ? `In cart (${inCart.quantity})` : 'Add to cart'}
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.error, fontSize: fontSize.base },

  imageContainer: { position: 'relative' },
  image: { width, height: 320, backgroundColor: colors.borderLight },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  dotActive: { backgroundColor: '#fff', width: 18 },

  content: { padding: spacing.lg, gap: spacing.sm },
  category: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  name: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    lineHeight: 30,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  price: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
  stock: {
    fontSize: fontSize.sm,
    color: colors.primary,
    fontWeight: fontWeight.medium,
  },
  stockOut: { color: colors.error },

  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  description: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  reviewCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewAuthor: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  reviewComment: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reviewDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.lg,
  },
  footerPrice: { flex: 1 },
  footerPriceLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  footerPriceValue: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  addBtn: { flex: 2 },
})
