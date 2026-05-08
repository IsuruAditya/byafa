import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { StripeProvider, useStripe } from '@stripe/stripe-react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { CartStackParamList } from '../../navigation/types'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearCart } from '../../store/slices/cartSlice'
import { addToast } from '../../store/slices/uiSlice'
import { createPaymentIntentApi } from '../../api/ordersApi'
import type { ShippingAddress } from '../../types/order.types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { useTheme } from '../../hooks/useTheme'
import { formatCurrency } from '../../utils/formatCurrency'
import axios from 'axios'

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

const schema = z.object({
  fullName:     z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(1, 'City is required'),
  state:        z.string().min(1, 'State is required'),
  postalCode:   z.string().min(1, 'Postal code is required'),
  country:      z.string().min(1, 'Country is required'),
})

type FormValues = z.infer<typeof schema>
type Step = 'shipping' | 'payment'
type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step, colors }: { step: Step; colors: ReturnType<typeof useTheme>['colors'] }) {
  const steps: { key: Step; label: string }[] = [
    { key: 'shipping', label: 'Shipping' },
    { key: 'payment',  label: 'Payment' },
  ]
  const currentIdx = steps.findIndex((s) => s.key === step)

  return (
    <View style={stepStyles.row}>
      {steps.map((s, i) => {
        const done   = i < currentIdx
        const active = i === currentIdx
        return (
          <React.Fragment key={s.key}>
            <View style={stepStyles.item}>
              <View
                style={[
                  stepStyles.circle,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  done   && { backgroundColor: colors.primary, borderColor: colors.primary },
                  active && { borderColor: colors.primary },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={14} color="#fff" />
                ) : (
                  <Text style={[stepStyles.num, { color: active ? colors.primary : colors.textMuted }]}>
                    {i + 1}
                  </Text>
                )}
              </View>
              <Text style={[stepStyles.label, { color: active ? colors.text : colors.textMuted }]}>
                {s.label}
              </Text>
            </View>
            {i < steps.length - 1 && (
              <View
                style={[
                  stepStyles.line,
                  { backgroundColor: done ? colors.primary : colors.border },
                ]}
              />
            )}
          </React.Fragment>
        )
      })}
    </View>
  )
}

const stepStyles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm },
  item:   { alignItems: 'center', gap: 4 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold },
  label: { fontSize: fontSize.xs, fontWeight: fontWeight.medium },
  line:  { flex: 1, height: 2, marginBottom: 18, marginHorizontal: spacing.sm },
})

// ── Checkout form ─────────────────────────────────────────────────────────────

function CheckoutForm({ navigation }: Props) {
  const { colors } = useTheme()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [step, setStep]                     = useState<Step>('shipping')
  const [clientSecret, setClientSecret]     = useState<string | null>(null)
  const [totalAmount, setTotalAmount]       = useState(0)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [intentError, setIntentError]       = useState<string | null>(null)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const { control, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onShippingSubmit(values: FormValues) {
    setIsCreatingIntent(true)
    setIntentError(null)
    try {
      const res = await createPaymentIntentApi({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: values as ShippingAddress,
      })
      if (res.success && res.data) {
        const { clientSecret: cs, totalAmount: total } = res.data
        setClientSecret(cs)
        setTotalAmount(total)
        setShippingAddress(values as ShippingAddress)
        await initPaymentSheet({
          paymentIntentClientSecret: cs,
          merchantDisplayName: 'Byafa',
          style: 'automatic',
        })
        setStep('payment')
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setIntentError(err.response?.data?.message ?? 'Failed to initialise payment.')
      } else {
        setIntentError('Network error. Please try again.')
      }
    } finally {
      setIsCreatingIntent(false)
    }
  }

  async function handlePay() {
    if (!clientSecret) return
    setIsProcessingPayment(true)
    try {
      const { error } = await presentPaymentSheet()
      if (error) {
        dispatch(addToast({ message: error.message, type: 'error' }))
      } else {
        dispatch(clearCart())
        dispatch(addToast({ message: 'Payment successful! Order confirmed.', type: 'success' }))
        const paymentIntentId = clientSecret.split('_secret_')[0]
        navigation.replace('CheckoutComplete', { paymentIntentId })
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Step indicator */}
        <StepIndicator step={step} colors={colors} />

        {/* Order summary */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Order summary</Text>
          {items.map((item) => (
            <View key={item.productId} style={styles.summaryRow}>
              <Text style={[styles.summaryItem, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={[styles.summaryPrice, { color: colors.text }]}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={[styles.summaryTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.summaryTotalValue, { color: colors.text }]}>
              {formatCurrency(step === 'payment' ? totalAmount : subtotal)}
            </Text>
          </View>
        </View>

        {/* ── Shipping step ── */}
        {step === 'shipping' && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Shipping address</Text>

            {intentError && (
              <View style={[styles.errorBox, { backgroundColor: colors.errorBg, borderColor: colors.errorBorder }]}>
                <Ionicons name="alert-circle-outline" size={16} color={colors.error} />
                <Text style={[styles.errorText, { color: colors.error }]}>{intentError}</Text>
              </View>
            )}

            <Controller control={control} name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Full name" autoComplete="name" autoCapitalize="words"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.fullName?.message} />
              )}
            />
            <Controller control={control} name="addressLine1"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Address line 1"
                  onChangeText={onChange} onBlur={onBlur} value={value}
                  error={errors.addressLine1?.message} />
              )}
            />
            <Controller control={control} name="addressLine2"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Address line 2 (optional)"
                  onChangeText={onChange} onBlur={onBlur} value={value ?? ''}
                  error={errors.addressLine2?.message} />
              )}
            />
            <View style={styles.row2}>
              <View style={styles.half}>
                <Controller control={control} name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="City" onChangeText={onChange} onBlur={onBlur} value={value}
                      error={errors.city?.message} />
                  )}
                />
              </View>
              <View style={styles.half}>
                <Controller control={control} name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="State" onChangeText={onChange} onBlur={onBlur} value={value}
                      error={errors.state?.message} />
                  )}
                />
              </View>
            </View>
            <View style={styles.row2}>
              <View style={styles.half}>
                <Controller control={control} name="postalCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Postal code" keyboardType="numeric"
                      onChangeText={onChange} onBlur={onBlur} value={value}
                      error={errors.postalCode?.message} />
                  )}
                />
              </View>
              <View style={styles.half}>
                <Controller control={control} name="country"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Country" onChangeText={onChange} onBlur={onBlur} value={value}
                      error={errors.country?.message} />
                  )}
                />
              </View>
            </View>

            <Button
              onPress={handleSubmit(onShippingSubmit)}
              isLoading={isCreatingIntent}
              fullWidth
              size="lg"
              rightIcon={<Ionicons name="arrow-forward" size={18} color="#fff" />}
            >
              Continue to payment
            </Button>
          </View>
        )}

        {/* ── Payment step ── */}
        {step === 'payment' && shippingAddress && (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Payment</Text>

            {/* Shipping summary */}
            <View style={[styles.shippingSummary, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <View style={styles.shippingRow}>
                <Ionicons name="location-outline" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.shippingName, { color: colors.text }]}>
                    {shippingAddress.fullName}
                  </Text>
                  <Text style={[styles.shippingLine, { color: colors.textSecondary }]}>
                    {shippingAddress.addressLine1}
                    {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}
                  </Text>
                  <Text style={[styles.shippingLine, { color: colors.textSecondary }]}>
                    {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}, {shippingAddress.country}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => setStep('shipping')}>
                  <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Total due */}
            <View style={[styles.totalDue, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.totalDueLabel, { color: colors.textSecondary }]}>Total due today</Text>
              <Text style={[styles.totalDueValue, { color: colors.text }]}>
                {formatCurrency(totalAmount)}
              </Text>
            </View>

            {/* Trust badges */}
            <View style={styles.trustRow}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
              <Text style={[styles.trustText, { color: colors.textMuted }]}>
                Secured by Stripe · 256-bit SSL encryption
              </Text>
            </View>

            <Button
              onPress={handlePay}
              isLoading={isProcessingPayment}
              fullWidth
              size="lg"
              leftIcon={<Ionicons name="card-outline" size={18} color="#fff" />}
            >
              Pay {formatCurrency(totalAmount)}
            </Button>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

export default function CheckoutScreen(props: Props) {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <CheckoutForm {...props} />
    </StripeProvider>
  )
}

const styles = StyleSheet.create({
  safeArea:  { flex: 1 },
  flex:      { flex: 1 },
  container: { padding: spacing.md, gap: spacing.md },

  card: {
    borderRadius: radius.xxl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardTitle: { fontSize: fontSize.md, fontWeight: fontWeight.semibold },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
  summaryItem: { flex: 1, fontSize: fontSize.sm },
  summaryPrice: { fontSize: fontSize.sm, fontWeight: fontWeight.medium },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: spacing.sm,
  },
  summaryTotalLabel: { fontSize: fontSize.base, fontWeight: fontWeight.bold },
  summaryTotalValue: { fontSize: fontSize.base, fontWeight: fontWeight.bold },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  errorText: { flex: 1, fontSize: fontSize.sm },

  row2: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },

  shippingSummary: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  shippingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  shippingName: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },
  shippingLine: { fontSize: fontSize.sm, lineHeight: 20 },
  editLink: { fontSize: fontSize.sm, fontWeight: fontWeight.semibold },

  totalDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  totalDueLabel: { fontSize: fontSize.sm },
  totalDueValue: { fontSize: fontSize.lg, fontWeight: fontWeight.bold },

  trustRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, justifyContent: 'center' },
  trustText: { fontSize: fontSize.xs },
})
