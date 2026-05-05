/**
 * Utility for conditionally joining class names.
 * A lightweight alternative to the `clsx` / `classnames` packages.
 *
 * Usage:
 *   cn('base-class', condition && 'conditional-class', 'another-class')
 *   cn(['base', isActive && 'active', isBig && 'big'])
 */
export function cn(
  ...classes: Array<string | boolean | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}
