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
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as SecureStore from 'expo-secure-store'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ProfileStackParamList } from '../../navigation/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { setCredentials, logout } from '../../store/slices/authSlice'
import { clearCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { updateProfileApi, deleteAccountApi, logoutApi } from '../../api/authApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import axios from 'axios'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>
type Props = NativeStackScreenProps<ProfileStackParamList, 'Profile'>

export default function ProfileScreen({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const { user, accessToken } = useAppSelector((s) => s.auth)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  async function onSubmit(values: FormValues) {
    try {
      const res = await updateProfileApi({ name: values.name, email: values.email })
      if (res.success && res.data) {
        dispatch(
          setCredentials({ user: res.data.user, accessToken: accessToken ?? '' })
        )
        reset({ name: res.data.user.name, email: res.data.user.email })
        dispatch(addToast({ message: 'Profile updated', type: 'success' }))
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const message: string =
          err.response?.data?.message ?? 'Update failed. Please try again.'
        if (err.response?.status === 409) {
          setError('email', { message })
        } else {
          setError('root', { message })
        }
      }
    }
  }

  async function handleLogout() {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken')
      if (refreshToken) await logoutApi(refreshToken)
    } catch {}
    await SecureStore.deleteItemAsync('refreshToken')
    dispatch(logout())
    dispatch(clearCart())
  }

  function confirmDeleteAccount() {
    Alert.alert(
      'Delete account',
      'Are you sure you want to permanently delete your account? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true)
            try {
              await deleteAccountApi()
              await SecureStore.deleteItemAsync('refreshToken')
              dispatch(logout())
              dispatch(clearCart())
            } catch (err) {
              if (axios.isAxiosError(err)) {
                dispatch(
                  addToast({
                    message:
                      err.response?.data?.message ?? 'Failed to delete account.',
                    type: 'error',
                  })
                )
              }
            } finally {
              setIsDeleting(false)
            }
          },
        },
      ]
    )
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Avatar card */}
        <View style={styles.avatarCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </Text>
          </View>
          <View style={styles.avatarInfo}>
            <Text style={styles.avatarName}>{user?.name}</Text>
            <Text style={styles.avatarEmail}>{user?.email}</Text>
            {user?.role === 'admin' && (
              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>Admin</Text>
              </View>
            )}
          </View>
        </View>

        {/* Edit form */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Edit profile</Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Full name"
                autoComplete="name"
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
                label="Email"
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
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{errors.root.message}</Text>
            </View>
          )}

          {isSubmitSuccessful && !isDirty && (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Profile updated successfully.</Text>
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

        {/* Security */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Security</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <Text style={styles.menuItemText}>Change password</Text>
            <Text style={styles.menuItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign out */}
        <Button onPress={handleLogout} variant="secondary" fullWidth>
          Sign out
        </Button>

        {/* Danger zone */}
        <View style={styles.dangerCard}>
          <Text style={styles.dangerLabel}>Danger zone</Text>
          <Text style={styles.dangerText}>
            Permanently delete your account and all associated data. This cannot
            be undone.
          </Text>
          <Button
            onPress={confirmDeleteAccount}
            variant="danger"
            size="sm"
            isLoading={isDeleting}
          >
            Delete account
          </Button>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, gap: spacing.md },

  avatarCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.primaryText,
  },
  avatarInfo: { flex: 1, gap: 2 },
  avatarName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  avatarEmail: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  adminBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  adminBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primaryText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },

  errorBox: {
    backgroundColor: colors.errorBg,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  errorText: { color: colors.error, fontSize: fontSize.sm },
  successBox: {
    backgroundColor: colors.successBg,
    borderWidth: 1,
    borderColor: colors.successBorder,
    borderRadius: radius.md,
    padding: spacing.sm + 2,
  },
  successText: { color: colors.success, fontSize: fontSize.sm },

  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  menuItemText: {
    fontSize: fontSize.base,
    color: colors.text,
  },
  menuItemArrow: {
    fontSize: fontSize.xl,
    color: colors.textMuted,
  },

  dangerCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.errorBorder,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  dangerLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.error,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
})
