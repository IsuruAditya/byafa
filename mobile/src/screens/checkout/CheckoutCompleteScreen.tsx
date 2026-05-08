import React, { useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Animated } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native'
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import type { MainTabParamList } from '../../navigation/types'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'

type TabNav = BottomTabNavigationProp<MainTabParamList>

export default function CheckoutCompleteScreen() {
  const { colors } = useTheme()
  const tabNav = useNavigation<TabNav>()
  const scale = useRef(new Animated.Value(0)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.container}>
        <Animated.View style={[styles.iconWrap, { transform: [{ scale }], opacity }]}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="checkmark-circle" size={72} color={colors.primary} />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textBlock, { opacity }]}>
          <Text style={[styles.title, { color: colors.text }]}>Order confirmed!</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Thank you for your purchase. You'll receive a confirmation email shortly.
          </Text>
        </Animated.View>

        {/* Trust badges */}
        <View style={[styles.trustCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {[
            { icon: 'mail-outline', text: 'Confirmation email sent' },
            { icon: 'car-outline',  text: 'Shipping updates via email' },
            { icon: 'shield-checkmark-outline', text: 'Secure payment processed' },
          ].map((item) => (
            <View key={item.text} style={styles.trustRow}>
              <Ionicons name={item.icon as any} size={18} color={colors.primary} />
              <Text style={[styles.trustText, { color: colors.textSecondary }]}>{item.text}</Text>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <Button onPress={() => tabNav.navigate('OrdersTab')} fullWidth size="lg">
            View my orders
          </Button>
          <Button onPress={() => tabNav.navigate('ProductsTab')} variant="secondary" fullWidth size="lg">
            Continue shopping
          </Button>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  iconWrap: { alignItems: 'center' },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { alignItems: 'center', gap: spacing.sm },
  title: { fontSize: fontSize.xxxl, fontWeight: fontWeight.extrabold, textAlign: 'center' },
  subtitle: { fontSize: fontSize.base, textAlign: 'center', lineHeight: 24, maxWidth: 280 },

  trustCard: {
    width: '100%',
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  trustText: { fontSize: fontSize.sm },

  actions: { width: '100%', gap: spacing.sm },
})
