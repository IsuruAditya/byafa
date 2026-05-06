import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../../navigation/types'
import { Button } from '../../components/ui/Button'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'

// Navigate directly to the tab navigator (two levels up: CartStack → Tab)
type TabNav = BottomTabNavigationProp<MainTabParamList>

export default function CheckoutCompleteScreen() {
  // useNavigation gives us the nearest navigator; getParent() reaches the tab bar
  const tabNav = useNavigation<TabNav>()

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>Order confirmed!</Text>
        <Text style={styles.subtitle}>
          Thank you for your purchase. You'll receive a confirmation email shortly.
        </Text>

        <View style={styles.actions}>
          <Button
            onPress={() => tabNav.navigate('OrdersTab')}
            fullWidth
            size="lg"
          >
            View my orders
          </Button>
          <Button
            onPress={() => tabNav.navigate('ProductsTab')}
            variant="secondary"
            fullWidth
            size="lg"
          >
            Continue shopping
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 36,
    color: colors.primary,
    fontWeight: fontWeight.bold,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: fontWeight.bold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    width: '100%',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
})
