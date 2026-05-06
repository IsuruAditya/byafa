export const colors = {
  primary: '#059669',       // emerald-600
  primaryDark: '#047857',   // emerald-700
  primaryLight: '#d1fae5',  // emerald-100
  primaryText: '#065f46',   // emerald-800

  background: '#f9fafb',    // gray-50
  surface: '#ffffff',
  border: '#e5e7eb',        // gray-200
  borderLight: '#f3f4f6',   // gray-100

  text: '#111827',          // gray-900
  textSecondary: '#6b7280', // gray-500
  textMuted: '#9ca3af',     // gray-400

  error: '#dc2626',         // red-600
  errorBg: '#fef2f2',       // red-50
  errorBorder: '#fecaca',   // red-200

  warning: '#d97706',       // amber-600
  warningBg: '#fffbeb',
  warningBorder: '#fde68a',

  success: '#059669',
  successBg: '#ecfdf5',
  successBorder: '#a7f3d0',

  info: '#2563eb',
  infoBg: '#eff6ff',
  infoBorder: '#bfdbfe',
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
}

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
}

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}
