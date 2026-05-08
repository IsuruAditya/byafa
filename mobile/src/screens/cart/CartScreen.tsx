import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { CartStackParamList, MainTabParamList } from '../../navigation/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice'
import type { CartItem } from '../../store/slices/cartSlice'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'

type Props = NativeStackScreenProps<CartStackParamList, 'Cart'>
type TabNav = BottomTabNavigationProp<MainTabParamList>

export default function CartScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const tabNav = useNavigation<TabNav>()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Image
          source={{ uri: item.image || 'https://placehold.co/80x80?text=?' }}
          style={[styles.itemImage, { backgroundColor: colors.borderLight }]}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>
            {formatCurrency(item.price)} each
          </Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity - 1 }))}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => dispatch(updateQuantity({ productId: item.productId, quantity: item.quantity + 1 }))}
              disabled={item.quantity >= item.stockQuantity}
            >
              <Ionicons
                name="add"
                size={16}
                color={item.quantity >= item.stockQuantity ? colors.textMuted : colors.text}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={[styles.itemTotal, { color: colors.text }]}>
            {formatCurrency(item.price * item.quantity)}
          </Text>
          <TouchableOpacity
            onPress={() => dispatch(removeFromCart(item.productId))}
            style={styles.removeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Your cart is empty</Text>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Add some products to get started
          </Text>
          <Button
            onPress={() => tabNav.navigate('ProductsTab')}
            variant="outline"
            size="md"
            style={{ marginTop: spacing.sm }}
            leftIcon={<Ionicons name="bag-outline" size={16} color={colors.primary} />}
          >
            Browse products
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListFooterComponent={
          <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.md]}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
                Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>Free</Text>
            </View>
            <View style={[styles.totalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>{formatCurrency(subtotal)}</Text>
            </View>
            <Button
              onPress={() => {
                if (!isAuthenticated) {
                  // Navigate to Profile tab which shows the sign-in screen
                  tabNav.navigate('ProfileTab')
                  return
                }
                navigation.navigate('Checkout')
              }}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.sm }}
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            >
              {isAuthenticated ? 'Proceed to checkout' : 'Sign in to checkout'}
            </Button>
          </View>
        }
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.md },

  item: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
  },
  itemImage: { width: 80, height: 80, borderRadius: radius.md },
  itemInfo:  { flex: 1, gap: 4 },
  itemName:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 },
  itemPrice: { fontSize: fontSize.xs },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 4 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: { fontSize: fontSize.base, fontWeight: fontWeight.semibold, minWidth: 20, textAlign: 'center' },
  itemRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  itemTotal: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  removeBtn: { padding: spacing.xs },

  summary: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { fontSize: fontSize.base },
  summaryValue: { fontSize: fontSize.base, fontWeight: fontWeight.medium },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },
  totalValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  emptyIcon:  { fontSize: 56 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  emptyText:  { fontSize: fontSize.base },
})
