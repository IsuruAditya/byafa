/**
 * ThemeToggle — accessible sun/moon toggle button.
 *
 * UX decisions:
 * - Uses a single button with aria-label that describes the *action* ("Switch to dark mode")
 *   not the current state — this is the WCAG-recommended pattern.
 * - Animated icon swap with a smooth crossfade.
 * - Works in both the Navbar (icon-only) and any other context.
 */

import { useTheme } from '../../hooks/useTheme'

interface ThemeToggleProps {
  /** Show a text label alongside the icon (used in mobile drawer) */
  showLabel?: boolean
  className?: string
}

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z"
      />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.8}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
      />
    </svg>
  )
}

export function ThemeToggle({ showLabel = false, className = '' }: ThemeToggleProps) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={[
        'flex items-center gap-2 rounded-full transition-colors',
        showLabel
          ? 'px-3 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full'
          : 'h-10 w-10 items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400',
        className,
      ].join(' ')}
    >
      {/* Icon swap — sun in dark mode (to switch to light), moon in light mode */}
      <span className="relative flex h-5 w-5 items-center justify-center">
        <span
          className={[
            'absolute inset-0 flex items-center justify-center transition-all duration-200',
            isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-75',
          ].join(' ')}
        >
          <SunIcon />
        </span>
        <span
          className={[
            'absolute inset-0 flex items-center justify-center transition-all duration-200',
            isDark ? 'opacity-0 -rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100',
          ].join(' ')}
        >
          <MoonIcon />
        </span>
      </span>

      {showLabel && (
        <span>{isDark ? 'Light mode' : 'Dark mode'}</span>
      )}
    </button>
  )
}
