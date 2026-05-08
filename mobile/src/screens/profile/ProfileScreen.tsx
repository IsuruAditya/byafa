import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { getItem, deleteItem } from '../../utils/secureStorage'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProfileStackParamList } from '../../navigation/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCredentials, logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { updateProfileApi, deleteAccountApi, logoutApi } from '../../api/authApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import axios from 'axios'

const schema = z.object({
  name:  z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
})
type FormValues = z.infer<typeof schema>
type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>

// ── Unauthenticated view ──────────────────────────────────────────────────────

function GuestProfile() {
  const { colors } = useTheme()

  // The app's RootNavigator already handles auth state — if user is not
  // authenticated, they see AuthNavigator. This component only renders
  // when the user is browsing without being logged in (which shouldn't
  // happen in this app since RootNavigator gates it). Kept as a safety net.
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.guestContainer}>
        <View style={[styles.guestIcon, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="person-outline" size={48} color={colors.primary} />
        </View>
        <Text style={[styles.guestTitle, { color: colors.text }]}>Your profile</Text>
        <Text style={[styles.guestText, { color: colors.textSecondary }]}>
          Sign in to manage your profile, view orders, and more.
        </Text>
      </View>
    </SafeAreaView>
  )
}

// ── Authenticated view ────────────────────────────────────────────────────────

export default function ProfileScreen({ navigation }: Props) {
  const { colors } = useTheme()
  const dispatch = useAppDispatch()
  const { user, accessToken, isAuthenticated } = useAppSelector((s) => s.auth)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    control, handleSubmit, reset, setError,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  // Show guest view if not authenticated
  if (!isAuthenticated || !user) {
    return <GuestProfile />
  }

  async function onSubmit(values: FormValues) {
    try {
      const res = await updateProfileApi({ name: values.name, email: values.email })
      if (res.success && res.data) {
        dispatch(setCredentials({ user: res.data.user, accessToken: accessToken ?? '' }))
        reset({ name: res.data.user.name, email: res.data.user.email })
        dispatch(addToast({ message: 'Profile updated', type: 'success' }))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg: string = err.response?.data?.message ?? 'Update failed.'
        if (err.response?.status === 409) setError('email', { message: msg })
        else setError('root', { message: msg })
      }
    }
  }

  async function handleLogout() {
    try {
      const refreshToken = await getItem('refreshToken')
      if (refreshToken) await logoutApi(refreshToken)
    } catch {}
    await deleteItem('refreshToken')
    dispatch(logout())
    dispatch(clearCart())
  }

  function confirmDelete() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true)
            try {
              await deleteAccountApi()
              await deleteItem('refreshToken')
              dispatch(logout())
              dispatch(clearCart())
            } catch (err) {
              if (axios.isAxiosError(err)) {
                dispatch(addToast({
                  message: err.response?.data?.message ?? 'Failed to delete account.',
                  type: 'error',
                }))
              }
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    )
  }

  const MENU_ITEMS = [
    {
      icon: 'lock-closed-outline' as const,
      label: 'Change password',
      onPress: () => navigation.navigate('ChangePassword'),
    },
  ]

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Avatar card */}
        <View style={[styles.avatarCard, { backgroundColor: colors.primary }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{user.name}</Text>
            <Text style={styles.avatarEmail}>{user.email}</Text>
            {user.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>⚙️ Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit profile */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Edit profile</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full name"
                autoComplete="name"
                autoCapitalize="words"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.name?.message}
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
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          {errors.root && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{errors.root.message}</Text>
            </View>
          )}

          <Button
            onPress={handleSubmit(onSubmit)}
            isLoading={isSubmitting}
            disabled={!isDirty}
            fullWidth
          >
            Save changes
          </Button>
        </View>

        {/* Account menu */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Account</Text>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.label}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={item.icon} size={18} color={colors.primary} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign out */}
        <Button onPress={handleLogout} variant="secondary" fullWidth>
          Sign out
        </Button>

        {/* Danger zone */}
        <View style={[styles.dangerCard, { backgroundColor: colors.surface, borderColor: colors.errorBorder }]}>
          <Text style={[styles.dangerLabel, { color: colors.error }]}>Danger zone</Text>
          <Text style={[styles.dangerText, { color: colors.textSecondary }]}>
            Permanently delete your account and all associated data. This cannot be undone.
          </Text>
          <Button onPress={confirmDelete} variant="danger" size="sm" isLoading={isDeleting}>
            Delete account
          </Button>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },

  // ── Guest state ──────────────────────────────────────────────────────────
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
  },
  guestIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  guestTitle: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, textAlign: 'center' },
  guestText:  { fontSize: fontSize.base, textAlign: 'center', lineHeight: 22, maxWidth: 260 },

  // ── Authenticated state ──────────────────────────────────────────────────
  avatarCard: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: { fontSize: fontSize.xxl, fontWeight: fontWeight.bold, color: '#fff' },
  avatarInfo:   { flex: 1, gap: 2 },
  avatarName:   { fontSize: fontSize.lg, fontWeight: fontWeight.bold, color: '#fff' },
  avatarEmail:  { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)' },
  adminBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: { fontSize: fontSize.xs, fontWeight: fontWeight.semibold, color: '#fff' },

  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  errorBox: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md },
  errorText: { fontSize: fontSize.sm },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, fontSize: fontSize.base },

  dangerCard: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  dangerLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.5 },
  dangerText:  { fontSize: fontSize.sm, lineHeight: 20 },
})
