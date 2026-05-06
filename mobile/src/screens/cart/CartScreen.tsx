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
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { CartStackParamList } from '../../navigation/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateQuantity, removeFromCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import type { CartItem } from '../../store/slices/cartSlice'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { Button } from '../../components/ui/Button'

type Props = NativeStackScreenProps<CartStackParamList, 'Cart'>

export default function CartScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  function renderItem({ item }: { item: CartItem }) {
    return (
      <View style={styles.item}>
        <Image
          source={{ uri: item.image || 'https://placehold.co/80x80?text=?' }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.itemPrice}>{formatCurrency(item.price)}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() =>
                dispatch(
                  updateQuantity({ productId: item.productId, quantity: item.quantity - 1 })
                )
              }
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() =>
                dispatch(
                  updateQuantity({ productId: item.productId, quantity: item.quantity + 1 })
                )
              }
              disabled={item.quantity >= item.stockQuantity}
            >
              <Ionicons
                name="add"
                size={16}
                color={
                  item.quantity >= item.stockQuantity
                    ? colors.textMuted
                    : colors.text
                }
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.itemRight}>
          <Text style={styles.itemTotal}>
            {formatCurrency(item.price * item.quantity)}
          </Text>
          <TouchableOpacity
            onPress={() => dispatch(removeFromCart(item.productId))}
            style={styles.removeBtn}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Add some products to get started
          </Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                Free
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>

            <Button
              onPress={() => {
                if (!isAuthenticated) {
                  dispatch(addToast({ message: 'Please sign in to checkout', type: 'info' }))
                  return
                }
                navigation.navigate('Checkout')
              }}
              fullWidth
              size="lg"
              style={{ marginTop: spacing.md }}
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
  safe: { flex: 1, backgroundColor: colors.background },

  list: { padding: spacing.md },
  separator: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },

  item: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
  },
  itemInfo: { flex: 1, gap: 4 },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 18,
  },
  itemPrice: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: 4,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  qtyText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.text,
    minWidth: 20,
    textAlign: 'center',
  },
  itemRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  removeBtn: {
    padding: spacing.xs,
  },

  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
  summaryValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  totalLabel: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emptyIcon: { fontSize: 56 },
  emptyTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
  },
})
