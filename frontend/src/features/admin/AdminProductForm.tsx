import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { getProductByIdApi } from '../../api/productsApi'
import { adminCreateProductApi, adminUpdateProductApi } from '../../api/adminApi'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { useAppDispatch } from '../../store/hooks'
import { addToast } from '../../store/slices/uiSlice'
import axios from 'axios'

// Schema is only used for the type — validation is done manually in onSubmit
// to avoid the Zod resolver / React Hook Form generic mismatch with numeric fields
const schema = z.object({
  name:               z.string().min(1, 'Name is required'),
  description:        z.string().min(1, 'Description is required'),
  price:              z.number().min(0, 'Price must be positive'),
  costPrice:          z.number().min(0, 'Cost price must be non-negative'),
  category:           z.string().min(1, 'Category is required'),
  stockQuantity:      z.number().int().min(0, 'Stock must be non-negative'),
  lowStockThreshold:  z.number().int().min(0, 'Threshold must be non-negative'),
})

type FormValues = z.infer<typeof schema>

export default function AdminProductForm() {
  const { id } = useParams<{ id?: string }>()
  const isEdit = !!id
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [existingImages, setExistingImages] = useState<string[]>([])
  const [newFiles, setNewFiles] = useState<File[]>([])
  const [newPreviews, setNewPreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    // No zodResolver — use native HTML validation + valueAsNumber
    defaultValues: { name: '', description: '', price: 0, costPrice: 0, category: '', stockQuantity: 0, lowStockThreshold: 5 },
  })

  useEffect(() => {
    if (!isEdit || !id) return
    getProductByIdApi(id).then((res) => {
      if (res.success && res.data) {
        const p = res.data
        reset({
          name:               p.name,
          description:        p.description,
          price:              p.price,
          costPrice:          p.costPrice ?? 0,
          category:           p.category,
          stockQuantity:      p.stockQuantity,
          lowStockThreshold:  p.lowStockThreshold ?? 5,
        })
        setExistingImages(p.images)
      }
    })
  }, [id, isEdit, reset])

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    setNewFiles((prev) => [...prev, ...files])
    setNewPreviews((prev) => [
      ...prev,
      ...files.map((f) => URL.createObjectURL(f)),
    ])
  }

  function removeExisting(url: string) {
    setExistingImages((prev) => prev.filter((u) => u !== url))
  }

  function removeNew(index: number) {
    setNewFiles((prev) => prev.filter((_, i) => i !== index))
    setNewPreviews((prev) => {
      URL.revokeObjectURL(prev[index] ?? '')
      return prev.filter((_, i) => i !== index)
    })
  }

  async function onSubmit(values: FormValues) {
    const formData = new FormData()
    formData.append('name',              values.name)
    formData.append('description',       values.description)
    formData.append('price',             String(values.price))
    formData.append('costPrice',         String(values.costPrice))
    formData.append('category',          values.category)
    formData.append('stockQuantity',     String(values.stockQuantity))
    formData.append('lowStockThreshold', String(values.lowStockThreshold))
    formData.append('existingImages',    JSON.stringify(existingImages))
    newFiles.forEach((f) => formData.append('images', f))

    try {
      if (isEdit && id) {
        await adminUpdateProductApi(id, formData)
        dispatch(addToast({ message: 'Product updated', type: 'success' }))
      } else {
        await adminCreateProductApi(formData)
        dispatch(addToast({ message: 'Product created', type: 'success' }))
      }
      navigate('/admin/products')
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string ?? 'Failed to save product')
        : 'Failed to save product'
      dispatch(addToast({ message, type: 'error' }))
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        {isEdit ? 'Edit product' : 'New product'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <Input label="Name" error={errors.name?.message} {...register('name', { required: 'Name is required' })} />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea
            rows={4}
            className="block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            {...register('description', { required: 'Description is required' })}
          />
          {errors.description && (
            <p className="text-xs text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Selling price ($)"
            type="number"
            step="0.01"
            min="0"
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true, required: 'Price is required', min: { value: 0, message: 'Price must be positive' } })}
          />
          <Input
            label="Cost price / COGS ($)"
            type="number"
            step="0.01"
            min="0"
            error={errors.costPrice?.message}
            {...register('costPrice', { valueAsNumber: true, min: { value: 0, message: 'Cost must be non-negative' } })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Stock quantity"
            type="number"
            min="0"
            error={errors.stockQuantity?.message}
            {...register('stockQuantity', { valueAsNumber: true, required: 'Stock is required', min: { value: 0, message: 'Stock must be non-negative' } })}
          />
          <Input
            label="Low stock alert threshold"
            type="number"
            min="0"
            error={errors.lowStockThreshold?.message}
            {...register('lowStockThreshold', { valueAsNumber: true, min: { value: 0, message: 'Threshold must be non-negative' } })}
          />
        </div>

        <Input label="Category" error={errors.category?.message} {...register('category', { required: 'Category is required' })} />

        {/* Image management */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Images</p>
          <div className="flex flex-wrap gap-2">
            {existingImages.map((url) => (
              <div key={url} className="relative h-20 w-20">
                <img src={url} alt="" className="h-full w-full rounded-lg object-cover border border-gray-200" />
                <button
                  type="button"
                  onClick={() => removeExisting(url)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
                  aria-label="Remove image"
                >✕</button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div key={i} className="relative h-20 w-20">
                <img src={src} alt="" className="h-full w-full rounded-lg object-cover border border-emerald-300" />
                <button
                  type="button"
                  onClick={() => removeNew(i)}
                  className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center hover:bg-red-700"
                  aria-label="Remove new image"
                >✕</button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-20 w-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-emerald-400 hover:text-emerald-500 transition-colors text-2xl"
              aria-label="Add image"
            >+</button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" isLoading={isSubmitting}>
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/admin/products')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
