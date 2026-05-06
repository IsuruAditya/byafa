import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrdersStackParamList } from '../../navigation/types'
import { getMyOrderByIdApi, getOrderStatusApi } from '../../api/ordersApi'
import type { Order, OrderStatus } from '../../types/order.types'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StatusBadge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>

const STATUS_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']

export default function OrderDetailScreen({ route }: Props) {
  const { id } = route.params
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(() => {
    return getMyOrderByIdApi(id)
      .then((res) => {
        if (res.success && res.data) setOrder(res.data)
      })
      .catch(() => setError('Failed to load order.'))
  }, [id])

  useEffect(() => {
    fetchOrder().finally(() => setLoading(false))
  }, [fetchOrder])

  // Poll for status updates every 60s until terminal state
  useEffect(() => {
    const TERMINAL = ['delivered', 'cancelled']
    if (!order || TERMINAL.includes(order.status)) return

    const interval = setInterval(async () => {
      try {
        const res = await getOrderStatusApi(id)
        if (res.success && res.data && res.data.status !== order.status) {
          setOrder((prev) =>
            prev ? { ...prev, status: res.data!.status as OrderStatus } : prev
          )
        }
      } catch {}
    }, 60000)

    return () => clearInterval(interval)
  }, [id, order?.status])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchOrder()
    setRefreshing(false)
  }

  if (loading) return <Spinner fullScreen />

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error ?? 'Order not found.'}</Text>
      </View>
    )
  }

  const addr = order.shippingAddress
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.orderId}>
              Order #{order._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={styles.orderDate}>
              Placed{' '}
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <View style={styles.card}>
            <View style={styles.progressRow}>
              {STATUS_STEPS.map((step, i) => (
                <React.Fragment key={step}>
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressCircle,
                        i <= currentStep && styles.progressCircleActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.progressNum,
                          i <= currentStep && styles.progressNumActive,
                        ]}
                      >
                        {i < currentStep ? '✓' : i + 1}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.progressLabel,
                        i <= currentStep && styles.progressLabelActive,
                      ]}
                    >
                      {step.charAt(0).toUpperCase() + step.slice(1)}
                    </Text>
                  </View>
                  {i < STATUS_STEPS.length - 1 && (
                    <View
                      style={[
                        styles.progressLine,
                        i < currentStep && styles.progressLineActive,
                      ]}
                    />
                  )}
                </React.Fragment>
              ))}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Items ordered</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.item}>
              <Image
                source={{
                  uri: item.image || 'https://placehold.co/56x56?text=?',
                }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Shipping address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping address</Text>
          <Text style={styles.addrName}>{addr.fullName}</Text>
          <Text style={styles.addrLine}>{addr.addressLine1}</Text>
          {addr.addressLine2 && (
            <Text style={styles.addrLine}>{addr.addressLine2}</Text>
          )}
          <Text style={styles.addrLine}>
            {addr.city}, {addr.state} {addr.postalCode}
          </Text>
          <Text style={styles.addrLine}>{addr.country}</Text>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Subtotal</Text>
            <Text style={styles.payValue}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
          <View style={styles.payRow}>
            <Text style={styles.payLabel}>Shipping</Text>
            <Text style={[styles.payValue, { color: colors.primary }]}>
              Free
            </Text>
          </View>
          <View style={[styles.payRow, styles.payTotal]}>
            <Text style={styles.payTotalLabel}>Total paid</Text>
            <Text style={styles.payTotalValue}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, gap: spacing.md },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: { color: colors.error, fontSize: fontSize.base },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  orderId: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  orderDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressStep: { alignItems: 'center', gap: 4 },
  progressCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  progressCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  progressNum: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  progressNumActive: { color: '#fff' },
  progressLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  progressLabelActive: { color: colors.primary },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
    marginHorizontal: 2,
  },
  progressLineActive: { backgroundColor: colors.primary },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  itemImage: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.borderLight,
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
    lineHeight: 18,
  },
  itemQty: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  divider: { height: 1, backgroundColor: colors.border },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  addrName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  addrLine: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  payRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  payLabel: { fontSize: fontSize.sm, color: colors.textSecondary },
  payValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium, color: colors.text },
  payTotal: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    marginTop: spacing.xs,
  },
  payTotalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  payTotalValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
})
