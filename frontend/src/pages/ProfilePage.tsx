import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setCredentials, logout } from '../store/slices/authSlice'
import { clearCart } from '../store/slices/cartSlice'
import { updateProfileApi, deleteAccountApi } from '../api/authApi'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import axios from 'axios'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email'),
})

type FormValues = z.infer<typeof schema>

export default function ProfilePage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { user, accessToken } = useAppSelector((s) => s.auth)

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting, isDirty, isSubmitSuccessful },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
  })

  // Keep form in sync if user changes (e.g. after auth init)
  useEffect(() => {
    if (user) reset({ name: user.name, email: user.email })
  }, [user, reset])

  async function onSubmit(values: FormValues) {
    try {
      const res = await updateProfileApi({ name: values.name, email: values.email })
      if (res.success && res.data) {
        dispatch(
          setCredentials({
            user: res.data.user,
            accessToken: accessToken ?? '',
          })
        )
        reset({ name: res.data.user.name, email: res.data.user.email })
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

  async function handleDeleteAccount() {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      await deleteAccountApi()
      dispatch(logout())
      dispatch(clearCart())
      navigate('/', { replace: true })
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setDeleteError(
          err.response?.data?.message ?? 'Failed to delete account. Please try again.'
        )
      }
      setIsDeleting(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update your name and email address.
        </p>
      </div>

      {/* Account info card */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xl font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-base font-semibold text-gray-900 truncate">{user?.name}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            {user?.role === 'admin' && (
              <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                Admin
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <Input
            label="Full name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          {errors.root && (
            <p
              className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
              role="alert"
            >
              {errors.root.message}
            </p>
          )}

          {isSubmitSuccessful && !isDirty && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              Profile updated successfully.
            </p>
          )}

          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!isDirty}
            className="w-full"
          >
            Save changes
          </Button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 shadow-sm p-6 space-y-3">
        <p className="text-xs font-medium text-red-500 uppercase tracking-wide">
          Danger zone
        </p>
        <p className="text-sm text-gray-600">
          Permanently delete your account and all associated data. This cannot
          be undone.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={() => setShowDeleteModal(true)}
        >
          Delete account
        </Button>
      </div>

      {/* Confirmation modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          if (!isDeleting) {
            setShowDeleteModal(false)
            setDeleteError(null)
          }
        }}
        title="Delete account"
      >
        <p className="text-sm text-gray-600">
          Are you sure you want to delete your account? All your data will be
          permanently removed. This action cannot be undone.
        </p>

        {deleteError && (
          <p
            className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2"
            role="alert"
          >
            {deleteError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false)
              setDeleteError(null)
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            isLoading={isDeleting}
          >
            Yes, delete my account
          </Button>
        </div>
      </Modal>
    </div>
  )
}
