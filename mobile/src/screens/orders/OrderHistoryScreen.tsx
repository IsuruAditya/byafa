import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrdersStackParamList } from '../../navigation/types'
import { getMyOrdersApi } from '../../api/ordersApi'
import type { Order } from '../../types/order.types'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import { StatusBadge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderHistory'>

export default function OrderHistoryScreen({ navigation }: Props) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function fetchOrders() {
    return getMyOrdersApi()
      .then((res) => {
        if (res.success && res.data) setOrders(res.data)
      })
      .catch(() => setError('Failed to load orders. Please try again.'))
  }

  useEffect(() => {
    fetchOrders().finally(() => setLoading(false))
  }, [])

  async function handleRefresh() {
    setRefreshing(true)
    setError(null)
    await fetchOrders()
    setRefreshing(false)
  }

  if (loading) return <Spinner fullScreen />

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptyText}>
                When you place an order it will appear here.
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={styles.orderId}>
                  Order #{item._id.slice(-8).toUpperCase()}
                </Text>
                <Text style={styles.orderDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.orderItems}>
                  {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <StatusBadge status={item.status} />
                <Text style={styles.orderTotal}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, gap: spacing.md },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardLeft: { flex: 1, gap: 3 },
  cardRight: { alignItems: 'flex-end', gap: spacing.sm },
  orderId: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  orderDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  orderItems: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },

  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radius.lg,
    padding: spacing.lg,
    margin: spacing.md,
    alignItems: 'center',
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
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
    textAlign: 'center',
  },
})
