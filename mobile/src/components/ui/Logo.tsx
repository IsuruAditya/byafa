/**
 * Byafa brand logo mark — used on auth screens and wherever a logo is needed.
 * Renders using pure RN primitives, compatible with both native and web.
 */
import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../hooks/useTheme'
import { fontWeight } from '../../constants/theme'

interface LogoProps {
  size?: number
  /** Show the wordmark "Byafa" next to the mark */
  showWordmark?: boolean
  /** Override the primary color */
  color?: string
}

export function Logo({ size = 56, showWordmark = false, color }: LogoProps) {
  const { colors } = useTheme()
  const bg = color ?? colors.primary
  const borderRadius = size * 0.28
  const fontSize = size * 0.5

  return (
    <View style={[styles.row, showWordmark && { gap: 10 }]}>
      {/* ── Mark ── */}
      <View
        style={{
          width: size,
          height: size,
          borderRadius,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* White "B" — use explicit width/height centering, no lineHeight tricks */}
        <Text
          style={{
            color: '#fff',
            fontSize,
            fontWeight: fontWeight.extrabold,
            includeFontPadding: false,
            textAlign: 'center',
          }}
          numberOfLines={1}
        >
          B
        </Text>

        {/* Accent dot — bottom-right, inside the mark */}
        <View
          style={{
            position: 'absolute',
            width: size * 0.2,
            height: size * 0.2,
            borderRadius: size * 0.1,
            backgroundColor: 'rgba(255,255,255,0.4)',
            bottom: size * 0.08,
            right: size * 0.08,
          }}
        />
      </View>

      {/* ── Optional wordmark ── */}
      {showWordmark && (
        <Text
          style={{
            color: bg,
            fontSize: size * 0.58,
            fontWeight: fontWeight.extrabold,
            letterSpacing: -0.5,
            includeFontPadding: false,
          }}
        >
          byafa
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
})
