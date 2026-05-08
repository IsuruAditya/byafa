import React from 'react'
import { View, TouchableOpacity, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../hooks/useTheme'

interface StarRatingProps {
  rating: number
  maxStars?: number
  size?: number
  interactive?: boolean
  onRate?: (rating: number) => void
}

export function StarRating({
  rating,
  maxStars = 5,
  size = 16,
  interactive = false,
  onRate,
}: StarRatingProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.row}>
      {Array.from({ length: maxStars }, (_, i) => {
        const filled = i < Math.round(rating)
        const star = (
          <Ionicons
            key={i}
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={filled ? '#f59e0b' : colors.textMuted}
          />
        )
        if (interactive && onRate) {
          return (
            <TouchableOpacity
              key={i}
              onPress={() => onRate(i + 1)}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
            >
              {star}
            </TouchableOpacity>
          )
        }
        return star
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
})
