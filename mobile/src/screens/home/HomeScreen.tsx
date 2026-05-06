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
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { HomeStackParamList } from '../../navigation/types'
import { getProductsApi } from '../../api/productsApi'
import type { Product } from '../../types/product.types'
import { useAppSelector } from '../../store/hooks'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StarRating } from '../../components/ui/StarRating'

type Props = NativeStackScreenProps<HomeStackParamList, 'Home'>

const CATEGORIES = ['all', 'electronics', 'clothing', 'books', 'home', 'sports']

export default function HomeScreen({ navigation }: Props) {
  const user = useAppSelector((s) => s.auth.user)
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getProductsApi({ sortBy: 'popularity', pageSize: 6 })
      .then((res) => setFeatured(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Hello, {user?.name?.split(' ')[0] ?? 'there'} 👋
            </Text>
            <Text style={styles.tagline}>What are you shopping for?</Text>
          </View>
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>B</Text>
          </View>
        </View>

        {/* Hero banner */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>New arrivals{'\n'}just dropped</Text>
          <Text style={styles.heroSub}>Free shipping on all orders</Text>
          <TouchableOpacity
            style={styles.heroBtn}
            onPress={() => {
              if (featured[0]?._id) {
                navigation.navigate('ProductDetail', { id: featured[0]._id })
              }
            }}
          >
            <Text style={styles.heroBtnText}>Shop now →</Text>
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Browse categories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={styles.catChip}
                onPress={() => {
                  // Navigate to products tab with category filter
                }}
              >
                <Text style={styles.catText}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured products */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Popular picks</Text>
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
                  style={styles.productCard}
                  onPress={() => navigation.navigate('ProductDetail', { id: item._id })}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{
                      uri: item.images[0] ?? 'https://placehold.co/200x200?text=?',
                    }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName} numberOfLines={2}>
                      {item.name}
                    </Text>
                    <StarRating rating={item.ratings.average} size={12} />
                    <Text style={styles.productPrice}>
                      {formatCurrency(item.price)}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greeting: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  brandBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    color: '#fff',
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },

  hero: {
    margin: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  heroTitle: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: '#fff',
    lineHeight: 32,
  },
  heroSub: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  heroBtn: {
    marginTop: spacing.sm,
    backgroundColor: '#fff',
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    alignSelf: 'flex-start',
  },
  heroBtnText: {
    color: colors.primary,
    fontWeight: fontWeight.semibold,
    fontSize: fontSize.sm,
  },

  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.md,
  },

  catScroll: { marginHorizontal: -spacing.lg, paddingHorizontal: spacing.lg },
  catChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    marginRight: spacing.sm,
  },
  catText: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: fontWeight.medium,
  },

  productList: {
    paddingRight: spacing.lg,
    gap: spacing.md,
  },
  productCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.borderLight,
  },
  productInfo: {
    padding: spacing.sm + 2,
    gap: 4,
  },
  productName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 18,
  },
  productPrice: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.primary,
  },
})
