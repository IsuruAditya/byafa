/**
 * Formats an ISO date string into a human-readable date.
 * Uses the browser's Intl API for locale-aware formatting.
 */
export function formatDate(
  iso: string,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  },
  locale = 'en-US'
): string {
  return new Date(iso).toLocaleDateString(locale, options)
}

/**
 * Formats an ISO date string into a short date (e.g. "May 5, 2026").
 */
export function formatShortDate(iso: string): string {
  return formatDate(iso, { year: 'numeric', month: 'short', day: 'numeric' })
}

/**
 * Formats an ISO date string into a relative time string (e.g. "2 days ago").
 * Falls back to formatShortDate for dates older than 30 days.
 */
export function formatRelativeDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`

  return formatShortDate(iso)
}
