import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ShippingAddress } from '../../types/order.types'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

const schema = z.object({
  fullName:     z.string().min(1, 'Full name is required'),
  addressLine1: z.string().min(1, 'Address is required'),
  addressLine2: z.string().optional(),
  city:         z.string().min(1, 'City is required'),
  state:        z.string().min(1, 'State is required'),
  postalCode:   z.string().min(1, 'Postal code is required'),
  country:      z.string().min(1, 'Country is required'),
})

export type ShippingFormValues = z.infer<typeof schema>

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void
  isLoading: boolean
}

export function ShippingForm({ onSubmit, isLoading }: ShippingFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({ resolver: zodResolver(schema) })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4"
    >
      <Input
        label="Full name"
        autoComplete="name"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <Input
        label="Address line 1"
        autoComplete="address-line1"
        error={errors.addressLine1?.message}
        {...register('addressLine1')}
      />
      <Input
        label="Address line 2 (optional)"
        autoComplete="address-line2"
        error={errors.addressLine2?.message}
        {...register('addressLine2')}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          autoComplete="address-level2"
          error={errors.city?.message}
          {...register('city')}
        />
        <Input
          label="State / Province"
          autoComplete="address-level1"
          error={errors.state?.message}
          {...register('state')}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Postal code"
          autoComplete="postal-code"
          error={errors.postalCode?.message}
          {...register('postalCode')}
        />
        <Input
          label="Country"
          autoComplete="country-name"
          error={errors.country?.message}
          {...register('country')}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
        Continue to payment
      </Button>
    </form>
  )
}
