import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { setItem } from '../../utils/secureStorage'
import { StatusBar } from 'expo-status-bar'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { AuthStackParamList } from '../../navigation/types'
import { useAppDispatch } from '../../store/hooks'
import { setCredentials } from '../../store/slices/authSlice'
import { registerApi } from '../../api/authApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/ui/Logo'
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'

const schema = z.object({
  name:     z.string().min(1, 'Name is required'),
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

type FormValues = z.infer<typeof schema>
type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const { colors, isDark } = useTheme()

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit(values: FormValues) {
    try {
      const res = await registerApi(values)
      if (res.success && res.data) {
        await setItem('refreshToken', res.data.refreshToken)
        dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message: string = err.response?.data?.message ?? 'Registration failed. Please try again.'
        setError('root', { message })
      } else {
        setError('root', { message: 'Network error. Check your connection.' })
      }
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Decorative background circles */}
      <View style={[styles.circle1, { backgroundColor: colors.primaryLight }]} />
      <View style={[styles.circle2, { backgroundColor: colors.primaryLight }]} />

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Brand ── */}
        <View style={styles.brand}>
          <Logo size={64} />
          <Text style={[styles.brandName, { color: colors.text }]}>Byafa</Text>
        </View>

        {/* ── Card ── */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.title, { color: colors.text }]}>Create account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join thousands of happy shoppers
            </Text>
          </View>

          <View style={styles.fields}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full name"
                  autoComplete="name"
                  autoCapitalize="words"
                  returnKeyType="next"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.name?.message}
                  placeholder="John Doe"
                  leftIcon={<Ionicons name="person-outline" size={18} color={colors.textMuted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email address"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  returnKeyType="next"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.email?.message}
                  placeholder="you@example.com"
                  leftIcon={<Ionicons name="mail-outline" size={18} color={colors.textMuted} />}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  secureTextEntry
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  placeholder="Min. 8 characters"
                  hint="At least 8 characters"
                  leftIcon={<Ionicons name="lock-closed-outline" size={18} color={colors.textMuted} />}
                />
              )}
            />
          </View>

          {errors.root && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>
                {errors.root.message}
              </Text>
            </View>
          )}

          <Button onPress={handleSubmit(onSubmit)} isLoading={isSubmitting} fullWidth size="lg">
            Create account
          </Button>

          <Text style={[styles.terms, { color: colors.textMuted }]}>
            By creating an account you agree to our{' '}
            <Text style={{ color: colors.primary }}>Terms of Service</Text>
            {' '}and{' '}
            <Text style={{ color: colors.primary }}>Privacy Policy</Text>.
          </Text>
        </View>

        {/* ── Footer ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={styles.footer}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Already have an account?{' '}
            <Text style={[styles.footerLink, { color: colors.primary }]}>Sign in</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // Decorative background
  circle1: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    top: -80,
    right: -70,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    bottom: 80,
    left: -50,
    opacity: 0.4,
  },

  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    gap: spacing.xl,
  },

  // Brand
  brand: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.5,
  },

  // Card
  card: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  cardHeader: {
    gap: spacing.xs,
  },
  title:    { fontSize: fontSize.xl, fontWeight: fontWeight.bold },
  subtitle: { fontSize: fontSize.sm },
  fields:   { gap: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },
  terms: { fontSize: fontSize.xs, textAlign: 'center', lineHeight: 18 },

  // Footer
  footer: { alignItems: 'center' },
  footerText: { fontSize: fontSize.sm },
  footerLink: { fontWeight: fontWeight.semibold },
})
