import type { ReactNode } from 'react'
import { useAuthInit } from '../features/auth/useAuthInit'

interface Props {
  children: ReactNode
}

/**
 * Runs auth rehydration on mount. Renders a minimal full-screen loader
 * until the auth check settles — prevents ProtectedRoute from flashing
 * the login page for authenticated users on hard refresh.
 */
export function AppInitializer({ children }: Props) {
  const { isInitializing } = useAuthInit()

  if (isInitializing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-white"
        aria-label="Loading"
        role="status"
      >
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-emerald-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="sr-only">Loading…</span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
