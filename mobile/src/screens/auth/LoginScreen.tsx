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
import { loginApi } from '../../api/authApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Logo } from '../../components/ui/Logo'
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { Ionicons } from '@expo/vector-icons'
import axios from 'axios'

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>
type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>

export default function LoginScreen({ navigation }: Props) {
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
      const res = await loginApi({ email: values.email, password: values.password })
      if (res.success && res.data) {
        await setItem('refreshToken', res.data.refreshToken)
        dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message: string = err.response?.data?.message ?? 'Login failed. Please try again.'
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
          <Logo size={72} />
          <View style={styles.brandText}>
            <Text style={[styles.brandName, { color: colors.text }]}>Byafa</Text>
            <Text style={[styles.brandTagline, { color: colors.textSecondary }]}>
              Quality goods, delivered fast
            </Text>
          </View>
        </View>

        {/* ── Card ── */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Sign in to your account
            </Text>
          </View>

          <View style={styles.fields}>
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
                  autoComplete="password"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit(onSubmit)}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.password?.message}
                  placeholder="••••••••"
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

          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            fullWidth
            size="lg"
          >
            Sign in
          </Button>
        </View>

        {/* ── Footer ── */}
        <TouchableOpacity
          onPress={() => navigation.navigate('Register')}
          style={styles.footer}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={[styles.footerLink, { color: colors.primary }]}>
              Create one
            </Text>
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
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -100,
    right: -80,
    opacity: 0.6,
  },
  circle2: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    bottom: 60,
    left: -60,
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
    gap: spacing.md,
  },
  brandText: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  brandName: {
    fontSize: fontSize.xxxl,
    fontWeight: fontWeight.extrabold,
    letterSpacing: -0.5,
  },
  brandTagline: {
    fontSize: fontSize.sm,
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
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
  },
  subtitle: {
    fontSize: fontSize.sm,
  },
  fields: { gap: spacing.md },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },

  // Footer
  footer: { alignItems: 'center' },
  footerText: { fontSize: fontSize.sm },
  footerLink: { fontWeight: fontWeight.semibold },
})
