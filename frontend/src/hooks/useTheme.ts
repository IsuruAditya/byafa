/**
 * useTheme — manages light/dark mode preference.
 *
 * Strategy:
 *  1. On first visit, respect the OS-level `prefers-color-scheme` setting.
 *  2. Once the user explicitly toggles, persist their choice to localStorage.
 *  3. Apply the `dark` class to <html> so Tailwind's `dark:` variants activate.
 *
 * This hook is intentionally NOT in Redux — theme preference is a local UI
 * concern, not shared application state. localStorage is the right store.
 */

import { useState, useEffect, useCallback } from 'react'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function getInitialTheme(): Theme {
  // 1. Respect an explicit user choice stored in localStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // localStorage may be unavailable in some environments
  }

  // 2. Fall back to OS preference
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(getInitialTheme)

  // Apply on mount and whenever theme changes
  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  // Listen for OS preference changes (e.g. user switches system theme)
  // Only applies if the user hasn't made an explicit choice
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    function handleChange(e: MediaQueryListEvent) {
      const hasExplicitChoice = localStorage.getItem(STORAGE_KEY) !== null
      if (!hasExplicitChoice) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }
    mq.addEventListener('change', handleChange)
    return () => mq.removeEventListener('change', handleChange)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch { /* ignore */ }
    setThemeState(next)
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' }
}
