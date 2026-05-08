/**
 * Shared Tailwind class tokens for the emerald theme.
 * Import these in components to ensure consistency across
 * storefront and backoffice in both light and dark modes.
 *
 * Usage: import { tw } from '../styles/theme'
 *        className={tw.card}
 */

export const tw = {
  // ── Surfaces ──────────────────────────────────────────────────────────────
  /** Standard card / panel */
  card: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm',
  /** Page background (applied on layout) */
  pageBg: 'bg-gray-50 dark:bg-gray-950',
  /** Subtle inset background (table headers, filter bars) */
  subtleBg: 'bg-gray-50 dark:bg-gray-800/60',

  // ── Text ──────────────────────────────────────────────────────────────────
  textPrimary:   'text-gray-900 dark:text-gray-100',
  textSecondary: 'text-gray-600 dark:text-gray-400',
  textMuted:     'text-gray-400 dark:text-gray-500',
  textAccent:    'text-emerald-600 dark:text-emerald-400',

  // ── Borders ───────────────────────────────────────────────────────────────
  border:        'border-gray-200 dark:border-gray-700',
  divider:       'divide-gray-100 dark:divide-gray-700',

  // ── Interactive ───────────────────────────────────────────────────────────
  hoverRow:      'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
  hoverLink:     'hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors',

  // ── Form controls ─────────────────────────────────────────────────────────
  input: [
    'block w-full rounded-md border px-3 py-2 text-sm shadow-sm',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'placeholder:text-gray-400 dark:placeholder:text-gray-500',
    'border-gray-300 dark:border-gray-600',
    'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
  ].join(' '),

  select: [
    'rounded-md border px-3 py-2 text-sm shadow-sm',
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'border-gray-300 dark:border-gray-600',
    'focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500',
  ].join(' '),

  // ── Status badges ─────────────────────────────────────────────────────────
  statusBadge: {
    pending:    'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
    processing: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
    shipped:    'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    delivered:  'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    cancelled:  'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
  } as Record<string, string>,

  // ── Table ─────────────────────────────────────────────────────────────────
  tableWrapper: 'rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden',
  thead:        'bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700',
  th:           'px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-400 text-sm',
  td:           'px-4 py-3 text-sm text-gray-700 dark:text-gray-300',
  tbodyDivide:  'divide-y divide-gray-100 dark:divide-gray-700',
  trHover:      'hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors',
} as const
