import React, { useEffect } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removeToast } from '../../store/slices/uiSlice'
import type { Toast as ToastType } from '../../store/slices/uiSlice'
import { colors, radius, spacing, fontSize } from '../../constants/theme'

function ToastItem({ toast }: { toast: ToastType }) {
  const dispatch = useAppDispatch()
  const opacity = new Animated.Value(0)

  useEffect(() => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(2800),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dispatch(removeToast(toast.id))
    })
  }, [])

  const bgColor = {
    success: colors.primary,
    error: colors.error,
    info: colors.info,
    warning: colors.warning,
  }[toast.type]

  return (
    <Animated.View style={[styles.toast, { backgroundColor: bgColor, opacity }]}>
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
    bottom: 90,
    left: spacing.md,
    right: spacing.md,
    zIndex: 9999,
    gap: spacing.sm,
  },
  toast: {
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  text: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '500',
    textAlign: 'center',
  },
})
