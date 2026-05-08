import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { OrdersStackParamList, MainTabParamList } from '../../navigation/types'
import { getMyOrdersApi } from '../../api/ordersApi'
import type { Order } from '../../types/order.types'
import { spacing, fontSize, fontWeight, radius, shadows } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { useAppSelector } from '../../store/hooks'
import { formatCurrency } from '../../utils/formatCurrency'
import { StatusBadge } from '../../components/ui/Badge'
import { Spinner } from '../../components/ui/Spinner'
import { Button } from '../../components/ui/Button'

type Props = NativeStackScreenProps<OrdersStackParamList, 'OrderHistory'>
type TabNav = BottomTabNavigationProp<MainTabParamList>

export default function OrderHistoryScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const tabNav = useNavigation<TabNav>()
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated)

  const [orders, setOrders]         = useState<Order[]>([])
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError]           = useState<string | null>(null)

  const fetchOrders = useCallback(async () => {
    setError(null)
    try {
      const res = await getMyOrdersApi()
      if (res.success && res.data) setOrders(res.data)
    } catch {
      setError('Failed to load orders. Pull down to retry.')
    }
  }, [])

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }
    fetchOrders().finally(() => setLoading(false))
  }, [fetchOrders, isAuthenticated])

  async function handleRefresh() {
    setRefreshing(true)
    await fetchOrders()
    setRefreshing(false)
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.authGate}>
          <View style={[styles.authIcon, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="receipt-outline" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.authTitle, { color: colors.text }]}>Your orders</Text>
          <Text style={[styles.authText, { color: colors.textSecondary }]}>
            Sign in to view your order history and track deliveries.
          </Text>
          <Button
            onPress={() => tabNav.navigate('ProfileTab')}
            size="lg"
            style={styles.authBtn}
          >
            Sign in
          </Button>
        </View>
      </SafeAreaView>
    )
  }

  if (loading) return <Spinner fullScreen />

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
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
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Ionicons name="alert-circle-outline" size={24} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No orders yet</Text>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                When you place an order it will appear here.
              </Text>
              <Button
                onPress={() => tabNav.navigate('ProductsTab')}
                variant="outline"
                size="md"
                style={{ marginTop: spacing.md }}
              >
                Start shopping
              </Button>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, shadows.sm]}
            onPress={() => navigation.navigate('OrderDetail', { id: item._id })}
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <View style={styles.cardLeft}>
                <Text style={[styles.orderId, { color: colors.text }]}>
                  #{item._id.slice(-8).toUpperCase()}
                </Text>
                <Text style={[styles.orderDate, { color: colors.textMuted }]}>
                  {new Date(item.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </Text>
                <Text style={[styles.orderItems, { color: colors.textSecondary }]}>
                  {item.items.length} item{item.items.length !== 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.cardRight}>
                <StatusBadge status={item.status} />
                <Text style={[styles.orderTotal, { color: colors.text }]}>
                  {formatCurrency(item.totalAmount)}
                </Text>
              </View>
            </View>
            <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
              <Text style={[styles.viewDetail, { color: colors.primary }]}>View details</Text>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  list: { padding: spacing.md, gap: spacing.md, flexGrow: 1 },

  authGate: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  authIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  authTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, textAlign: 'center' },
  authText:  { fontSize: fontSize.base, textAlign: 'center', lineHeight: 22, maxWidth: 260 },
  authBtn:   { width: '100%', marginTop: spacing.sm },

  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.md,
  },
  cardLeft:  { flex: 1, gap: 4 },
  cardRight: { alignItems: 'flex-end', gap: spacing.sm },
  orderId:   { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  orderDate: { fontSize: fontSize.xs },
  orderItems: { fontSize: fontSize.xs },
  orderTotal: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  viewDetail: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.xl,
    padding: spacing.lg,
    margin: spacing.md,
  },
  errorText: { fontSize: fontSize.sm, flex: 1 },

  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon:  { fontSize: 56 },
  emptyTitle: { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  emptyText:  { fontSize: fontSize.base, textAlign: 'center' },
})
