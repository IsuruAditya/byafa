import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { removeToast } from '../../store/slices/uiSlice'
import type { Toast as ToastItem, ToastType } from '../../store/slices/uiSlice'

const AUTO_DISMISS_MS = 4000

const styles: Record<ToastType, string> = {
  success: 'bg-green-600 text-white',
  error:   'bg-red-600 text-white',
  info:    'bg-indigo-600 text-white',
  warning: 'bg-amber-500 text-white',
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
}

function ToastItem({ toast }: { toast: ToastItem }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(
      () => dispatch(removeToast(toast.id)),
      AUTO_DISMISS_MS
    )
    return () => clearTimeout(timer)
  }, [toast.id, dispatch])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={[
        'flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg text-sm font-medium',
        'animate-in slide-in-from-right-4 duration-200',
        styles[toast.type],
      ].join(' ')}
    >
      <span aria-hidden="true" className="text-base leading-none">
        {icons[toast.type]}
      </span>
      <span>{toast.message}</span>
      <button
        onClick={() => dispatch(removeToast(toast.id))}
        className="ml-auto opacity-80 hover:opacity-100 transition-opacity"
        aria-label="Dismiss notification"
      >
        ✕
      </button>
    </div>
  )
}

export function ToastContainer() {
  const toasts = useAppSelector((s) => s.ui.toasts)

  if (toasts.length === 0) return null

  return createPortal(
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>,
    document.body
  )
}
