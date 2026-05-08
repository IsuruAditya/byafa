import React from 'react'
import { ActivityIndicator, View, StyleSheet } from 'react-native'
import { useTheme } from '../../hooks/useTheme'

interface SpinnerProps {
  size?: 'small' | 'large'
  color?: string
  fullScreen?: boolean
}

export function Spinner({ size = 'large', color, fullScreen = false }: SpinnerProps) {
  const { colors } = useTheme()
  const spinnerColor = color ?? colors.primary

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: 'transparent' }]}>
        <ActivityIndicator size={size} color={spinnerColor} />
      </View>
    )
  }
  return <ActivityIndicator size={size} color={spinnerColor} />
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
