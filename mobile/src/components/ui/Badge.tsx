import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, fontSize, radius, spacing } from '../../constants/theme'
import type { OrderStatus } from '../../types/order.types'

const STATUS_COLORS: Record<
  OrderStatus,
  { bg: string; text: string; border: string }
> = {
  pending: { bg: '#fffbeb', text: '#92400e', border: '#fde68a' },
  processing: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
  shipped: { bg: '#f5f3ff', text: '#5b21b6', border: '#ddd6fe' },
  delivered: { bg: '#ecfdf5', text: '#065f46', border: '#a7f3d0' },
  cancelled: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
}

interface StatusBadgeProps {
  status: OrderStatus
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const c = STATUS_COLORS[status]
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: c.bg, borderColor: c.border },
      ]}
    >
      <Text style={[styles.text, { color: c.text }]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
})
