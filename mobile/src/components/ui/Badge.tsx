import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { fontSize, radius, spacing } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import type { OrderStatus } from '../../types/order.types'

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const { colors } = useTheme()

  const statusColors = {
    pending:    colors.statusPending,
    processing: colors.statusProcessing,
    shipped:    colors.statusShipped,
    delivered:  colors.statusDelivered,
    cancelled:  colors.statusCancelled,
  }

  const c = statusColors[status]

  const labels: Record<OrderStatus, string> = {
    pending:    'Pending',
    processing: 'Processing',
    shipped:    'Shipped',
    delivered:  'Delivered',
    cancelled:  'Cancelled',
  }

  const icons: Record<OrderStatus, string> = {
    pending:    '⏳',
    processing: '⚙️',
    shipped:    '🚚',
    delivered:  '✅',
    cancelled:  '✕',
  }

  return (
    <View style={[styles.badge, { backgroundColor: c.bg, borderColor: c.border }]}>
      <Text style={[styles.text, { color: c.text }]}>
        {icons[status]} {labels[status]}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
})
