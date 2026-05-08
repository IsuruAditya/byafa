import { useColorScheme } from 'react-native'
import { lightColors, darkColors } from '../constants/theme'

/**
 * Returns the correct color palette based on the device's color scheme.
 * Automatically switches between light and dark mode.
 */
export function useTheme() {
  const scheme = useColorScheme()
  const isDark = scheme === 'dark'
  const colors = isDark ? darkColors : lightColors
  return { colors, isDark, scheme }
}
