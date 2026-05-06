import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
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
import { colors, spacing, fontSize, fontWeight, radius } from '../../constants/theme'
import { formatCurrency } from '../../utils/formatCurrency'
import axios from 'axios'

const STRIPE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''

const schema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
})

type FormValues = z.infer<typeof schema>
type Step = 'shipping' | 'payment'

type Props = NativeStackScreenProps<CartStackParamList, 'Checkout'>

function CheckoutForm({ navigation }: Props) {
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.cart.items)
  const { initPaymentSheet, presentPaymentSheet } = useStripe()

  const [step, setStep] = useState<Step>('shipping')
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [totalAmount, setTotalAmount] = useState(0)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(false)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [intentError, setIntentError] = useState<string | null>(null)

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

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
        setIntentError(
          err.response?.data?.message ?? 'Failed to initialise payment. Please try again.'
        )
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
        // Extract payment intent ID from client secret
        const paymentIntentId = clientSecret.split('_secret_')[0]
        navigation.replace('CheckoutComplete', { paymentIntentId })
      }
    } finally {
      setIsProcessingPayment(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Step indicator */}
        <View style={styles.steps}>
          {(['shipping', 'payment'] as Step[]).map((s, i) => {
            const isCompleted = s === 'shipping' && step === 'payment'
            const isActive = step === s
            return (
              <React.Fragment key={s}>
                <View style={styles.stepItem}>
                  <View
                    style={[
                      styles.stepCircle,
                      isCompleted && styles.stepCircleCompleted,
                      isActive && styles.stepCircleActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.stepNum,
                        (isCompleted || isActive) && styles.stepNumActive,
                      ]}
                    >
                      {isCompleted ? '✓' : i + 1}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isActive && styles.stepLabelActive,
                    ]}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Text>
                </View>
                {i < 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      isCompleted && styles.stepLineCompleted,
                    ]}
                  />
                )}
              </React.Fragment>
            )
          })}
        </View>

        {/* Order summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order summary</Text>
          {items.map((item) => (
            <View key={item.productId} style={styles.summaryRow}>
              <Text style={styles.summaryItem} numberOfLines={1}>
                {item.name} × {item.quantity}
              </Text>
              <Text style={styles.summaryPrice}>
                {formatCurrency(item.price * item.quantity)}
              </Text>
            </View>
          ))}
          <View style={styles.summaryTotal}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>
              {formatCurrency(step === 'payment' ? totalAmount : subtotal)}
            </Text>
          </View>
        </View>

        {/* Shipping form */}
        {step === 'shipping' && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Shipping address</Text>

            {intentError && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{intentError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="fullName"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Full name"
                  autoComplete="name"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.fullName?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="addressLine1"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Address line 1"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                  error={errors.addressLine1?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="addressLine2"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Address line 2 (optional)"
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value ?? ''}
                  error={errors.addressLine2?.message}
                />
              )}
            />
            <View style={styles.row2}>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="City"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={errors.city?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="State"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={errors.state?.message}
                    />
                  )}
                />
              </View>
            </View>
            <View style={styles.row2}>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="postalCode"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Postal code"
                      keyboardType="numeric"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={errors.postalCode?.message}
                    />
                  )}
                />
              </View>
              <View style={styles.half}>
                <Controller
                  control={control}
                  name="country"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input
                      label="Country"
                      onChangeText={onChange}
                      onBlur={onBlur}
                      value={value}
                      error={errors.country?.message}
                    />
                  )}
                />
              </View>
            </View>

            <Button
              onPress={handleSubmit(onShippingSubmit)}
              isLoading={isCreatingIntent}
              fullWidth
              size="lg"
            >
              Continue to payment
            </Button>
          </View>
        )}

        {/* Payment step */}
        {step === 'payment' && shippingAddress && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Payment</Text>

            {/* Shipping summary */}
            <View style={styles.shippingSummary}>
              <Text style={styles.shippingName}>{shippingAddress.fullName}</Text>
              <Text style={styles.shippingLine}>{shippingAddress.addressLine1}</Text>
              {shippingAddress.addressLine2 && (
                <Text style={styles.shippingLine}>{shippingAddress.addressLine2}</Text>
              )}
              <Text style={styles.shippingLine}>
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
              </Text>
              <Text style={styles.shippingLine}>{shippingAddress.country}</Text>
            </View>

            <View style={styles.totalDue}>
              <Text style={styles.totalDueLabel}>Total due today</Text>
              <Text style={styles.totalDueValue}>{formatCurrency(totalAmount)}</Text>
            </View>

            <Button
              onPress={handlePay}
              isLoading={isProcessingPayment}
              fullWidth
              size="lg"
            >
              Pay {formatCurrency(totalAmount)}
            </Button>

            <Button
              onPress={() => setStep('shipping')}
              variant="ghost"
              fullWidth
              size="sm"
            >
              ← Edit shipping
            </Button>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.md, gap: spacing.md },

  steps: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stepItem: { alignItems: 'center', gap: 4 },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  stepCircleActive: { borderColor: colors.primary },
  stepCircleCompleted: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepNum: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.bold,
    color: colors.textMuted,
  },
  stepNumActive: { color: colors.primary },
  stepLabel: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontWeight: fontWeight.medium,
    textTransform: 'capitalize',
  },
  stepLabelActive: { color: colors.text },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: 16,
    marginHorizontal: spacing.sm,
  },
  stepLineCompleted: { backgroundColor: colors.primary },

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

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  summaryItem: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  summaryPrice: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.text,
  },
  summaryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  summaryTotalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
  summaryTotalValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
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

  row2: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },

  shippingSummary: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: 2,
  },
  shippingName: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.text,
  },
  shippingLine: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },

  totalDue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  totalDueLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  totalDueValue: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    color: colors.text,
  },
})
