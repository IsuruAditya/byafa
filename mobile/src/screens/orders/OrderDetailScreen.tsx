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
import { Ionicons } from '@expo/vector-icons'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrdersStackParamList } from '../../navigation/types'
import { getMyOrderByIdApi, getOrderStatusApi } from '../../api/ordersApi'
import type { Order, OrderStatus } from '../../types/order.types'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StatusBadge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderDetail'>

const STATUS_STEPS: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered']
const STEP_ICONS: Record<string, string> = {
  pending: 'time-outline', processing: 'settings-outline',
  shipped: 'car-outline', delivered: 'checkmark-circle-outline',
}

export default function OrderDetailScreen({ route }: Props) {
  const { id } = route.params
  const { colors } = useTheme()
  const [order, setOrder]         = useState<Order | null>(null)
  const [loading, setLoading]     = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  const fetchOrder = useCallback(() =>
    getMyOrderByIdApi(id)
      .then((res) => { if (res.success && res.data) setOrder(res.data) })
      .catch(() => setError('Failed to load order.')),
    [id]
  )

  useEffect(() => { fetchOrder().finally(() => setLoading(false)) }, [fetchOrder])

  useEffect(() => {
    if (!order || ['delivered', 'cancelled'].includes(order.status)) return
    const interval = setInterval(async () => {
      try {
        const res = await getOrderStatusApi(id)
        if (res.success && res.data && res.data.status !== order.status) {
          setOrder((prev) => prev ? { ...prev, status: res.data!.status as OrderStatus } : prev)
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
      <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <Ionicons name="alert-circle-outline" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error }]}>{error ?? 'Order not found.'}</Text>
      </View>
    )
  }

  const addr = order.shippingAddress
  const currentStep = STATUS_STEPS.indexOf(order.status)

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.orderId, { color: colors.text }]}>
              #{order._id.slice(-8).toUpperCase()}
            </Text>
            <Text style={[styles.orderDate, { color: colors.textMuted }]}>
              {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
          <StatusBadge status={order.status} />
        </View>

        {/* Progress tracker */}
        {order.status !== 'cancelled' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Order progress</Text>
            <View style={styles.progressRow}>
              {STATUS_STEPS.map((step, i) => {
                const done   = i < currentStep
                const active = i === currentStep
                return (
                  <React.Fragment key={step}>
                    <View style={styles.progressStep}>
                      <View
                        style={[
                          styles.progressCircle,
                          { borderColor: colors.border, backgroundColor: colors.surface },
                          done   && { backgroundColor: colors.primary, borderColor: colors.primary },
                          active && { borderColor: colors.primary, borderWidth: 2 },
                        ]}
                      >
                        {done ? (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        ) : (
                          <Ionicons
                            name={STEP_ICONS[step] as any}
                            size={14}
                            color={active ? colors.primary : colors.textMuted}
                          />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.progressLabel,
                          { color: (done || active) ? colors.primary : colors.textMuted },
                        ]}
                      >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </Text>
                    </View>
                    {i < STATUS_STEPS.length - 1 && (
                      <View
                        style={[
                          styles.progressLine,
                          { backgroundColor: i < currentStep ? colors.primary : colors.border },
                        ]}
                      />
                    )}
                  </React.Fragment>
                )
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Items ordered</Text>
          {order.items.map((item, i) => (
            <View key={i} style={styles.item}>
              <Image
                source={{ uri: item.image || 'https://placehold.co/56x56?text=?' }}
                style={[styles.itemImage, { backgroundColor: colors.borderLight }]}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </Text>
                <Text style={[styles.itemQty, { color: colors.textMuted }]}>
                  Qty: {item.quantity} × {formatCurrency(item.price)}
                </Text>
              </View>
              <Text style={[styles.itemTotal, { color: colors.text }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.text }]}>
              {formatCurrency(order.totalAmount)}
            </Text>
          </View>
        </View>

        {/* Shipping */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Shipping address</Text>
          <View style={styles.addrBlock}>
            <Ionicons name="location-outline" size={16} color={colors.primary} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.addrName, { color: colors.text }]}>{addr.fullName}</Text>
              <Text style={[styles.addrLine, { color: colors.textSecondary }]}>{addr.addressLine1}</Text>
              {addr.addressLine2 && (
                <Text style={[styles.addrLine, { color: colors.textSecondary }]}>{addr.addressLine2}</Text>
              )}
              <Text style={[styles.addrLine, { color: colors.textSecondary }]}>
                {addr.city}, {addr.state} {addr.postalCode}
              </Text>
              <Text style={[styles.addrLine, { color: colors.textSecondary }]}>{addr.country}</Text>
            </View>
          </View>
        </View>

        {/* Payment summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Payment summary</Text>
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: colors.textSecondary }]}>Subtotal</Text>
            <Text style={[styles.payValue, { color: colors.text }]}>{formatCurrency(order.totalAmount)}</Text>
          </View>
          <View style={styles.payRow}>
            <Text style={[styles.payLabel, { color: colors.textSecondary }]}>Shipping</Text>
            <Text style={[styles.payValue, { color: colors.primary }]}>Free</Text>
          </View>
          <View style={[styles.payRow, styles.payTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.payTotalLabel, { color: colors.text }]}>Total paid</Text>
            <Text style={[styles.payTotalValue, { color: colors.text }]}>
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
  safe: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },

  errorContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { fontSize: fontSize.base },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  orderId:   { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  orderDate: { fontSize: fontSize.sm, marginTop: 2 },

  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardTitle: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  progressRow: { flexDirection: 'row', alignItems: 'center' },
  progressStep: { alignItems: 'center', gap: 6 },
  progressCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressLabel: { fontSize: 10, fontWeight: fontWeight.medium, textTransform: 'capitalize' },
  progressLine: { flex: 1, height: 2, marginBottom: 20, marginHorizontal: 2 },

  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  itemImage: { width: 56, height: 56, borderRadius: radius.md },
  itemInfo:  { flex: 1 },
  itemName:  { fontSize: fontSize.sm, fontWeight: fontWeight.medium, lineHeight: 18 },
  itemQty:   { fontSize: fontSize.xs, marginTop: 2 },
  itemTotal: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  divider: { height: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  totalValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold },

  addrBlock: { flexDirection: 'row', gap: spacing.sm },
  addrName:  { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  addrLine:  { fontSize: fontSize.sm, lineHeight: 20 },

  payRow: { flexDirection: 'row', justifyContent: 'space-between' },
  payLabel: { fontSize: fontSize.sm },
  payValue: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  payTotal: { borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.xs },
  payTotalLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  payTotalValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
})
