import { ReactNode } from 'react'
import { useAuthInit } from '../features/auth/useAuthInit'

interface Props {
  children: ReactNode
}

/**
 * Runs auth rehydration on mount without blocking the initial render.
 * The app renders immediately — auth state updates reactively once resolved.
 */
export function AppInitializer({ children }: Props) {
  useAuthInit() // fire-and-forget — does not block render
  return <>{children}</>
}
