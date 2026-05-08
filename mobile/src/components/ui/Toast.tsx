import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removeToast } from '../../store/slices/uiSlice'
import type { Toast as ToastType } from '../../store/slices/uiSlice'
import { radius, spacing, fontSize, fontWeight } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error:   'close-circle',
  info:    'information-circle',
  warning: 'warning',
}

function ToastItem({ toast }: { toast: ToastType }) {
  const dispatch = useAppDispatch()
  const { colors, isDark } = useTheme()
  const opacity = useRef(new Animated.Value(0)).current
  const translateY = useRef(new Animated.Value(20)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start()

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 10, duration: 200, useNativeDriver: true }),
      ]).start(() => dispatch(removeToast(toast.id)))
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const bgColors = {
    success: isDark ? 'rgba(16,185,129,0.95)' : colors.primary,
    error:   isDark ? 'rgba(220,38,38,0.95)'  : '#dc2626',
    info:    isDark ? 'rgba(37,99,235,0.95)'  : '#2563eb',
    warning: isDark ? 'rgba(217,119,6,0.95)'  : '#d97706',
  }

  return (
    <Animated.View
      style={[
        styles.toast,
        { backgroundColor: bgColors[toast.type], opacity, transform: [{ translateY }] },
      ]}
    >
      <Ionicons name={ICONS[toast.type]} size={18} color="#fff" />
      <Text style={styles.text}>{toast.message}</Text>
    </Animated.View>
  )
}

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts)
  if (toasts.length === 0) return null

  return (
    <View style={styles.container} pointerEvents="none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  text: {
    flex: 1,
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
})
