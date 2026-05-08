import React from 'react'
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native'
import { radius, fontSize, fontWeight, spacing } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
type Size = 'xs' | 'sm' | 'md' | 'lg'

interface ButtonProps {
  onPress?: () => void
  children: React.ReactNode
  variant?: Variant
  size?: Size
  isLoading?: boolean
  disabled?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export function Button({
  onPress,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = false,
  leftIcon,
  rightIcon,
}: ButtonProps) {
  const { colors } = useTheme()
  const isDisabled = disabled || isLoading

  const variantStyles: Record<Variant, ViewStyle> = {
    primary:   { backgroundColor: colors.primary,   borderColor: colors.primary },
    secondary: { backgroundColor: colors.surface,   borderColor: colors.border },
    danger:    { backgroundColor: '#dc2626',         borderColor: '#dc2626' },
    ghost:     { backgroundColor: 'transparent',    borderColor: 'transparent' },
    outline:   { backgroundColor: 'transparent',    borderColor: colors.primary },
  }

  const textColors: Record<Variant, string> = {
    primary:   '#fff',
    secondary: colors.text,
    danger:    '#fff',
    ghost:     colors.primary,
    outline:   colors.primary,
  }

  const sizeStyles: Record<Size, ViewStyle> = {
    xs: { paddingHorizontal: spacing.sm,  paddingVertical: spacing.xs,      minHeight: 28 },
    sm: { paddingHorizontal: spacing.md,  paddingVertical: spacing.xs + 2,  minHeight: 36 },
    md: { paddingHorizontal: spacing.lg,  paddingVertical: spacing.sm + 2,  minHeight: 44 },
    lg: { paddingHorizontal: spacing.xl,  paddingVertical: spacing.md - 2,  minHeight: 52 },
  }

  const textSizes: Record<Size, number> = {
    xs: fontSize.xs,
    sm: fontSize.sm,
    md: fontSize.base,
    lg: fontSize.md,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      style={[
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'danger' ? '#fff' : colors.primary}
        />
      ) : (
        <View style={styles.inner}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              { color: textColors[variant], fontSize: textSizes[size] },
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.45 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: fontWeight.semibold,
    letterSpacing: 0.1,
  },
  iconLeft:  { marginRight: spacing.xs },
  iconRight: { marginLeft: spacing.xs },
})
