import React, { forwardRef, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TouchableOpacity,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { fontSize, fontWeight, radius, spacing } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'

interface InputProps extends TextInputProps {
  label?: string
  error?: string
  hint?: string
  containerStyle?: ViewStyle
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, hint, containerStyle, leftIcon, secureTextEntry, ...props }, ref) => {
    const { colors } = useTheme()
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = secureTextEntry

    return (
      <View style={[styles.container, containerStyle]}>
        {label && (
          <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        )}
        <View
          style={[
            styles.inputWrapper,
            {
              borderColor: error ? colors.error : colors.border,
              backgroundColor: colors.surface,
            },
          ]}
        >
          {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              { color: colors.text },
              leftIcon ? styles.inputWithLeft : null,
              isPassword ? styles.inputWithRight : null,
            ]}
            placeholderTextColor={colors.textMuted}
            secureTextEntry={isPassword && !showPassword}
            {...props}
          />
          {isPassword && (
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
        {error && (
          <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
        )}
        {hint && !error && (
          <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
        )}
      </View>
    )
  }
)

Input.displayName = 'Input'

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.md,
    minHeight: 48,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: fontSize.base,
  },
  inputWithLeft:  { paddingLeft: spacing.xs },
  inputWithRight: { paddingRight: spacing.xs },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: { fontSize: fontSize.xs },
  hint:  { fontSize: fontSize.xs },
})
