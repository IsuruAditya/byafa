// ── Palette ───────────────────────────────────────────────────────────────────

const palette = {
  emerald50:  '#ecfdf5',
  emerald100: '#d1fae5',
  emerald200: '#a7f3d0',
  emerald500: '#10b981',
  emerald600: '#059669',
  emerald700: '#047857',
  emerald800: '#065f46',

  gray50:  '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',

  red50:   '#fef2f2',
  red200:  '#fecaca',
  red600:  '#dc2626',
  red900:  '#7f1d1d',

  amber50:  '#fffbeb',
  amber200: '#fde68a',
  amber600: '#d97706',

  blue50:   '#eff6ff',
  blue200:  '#bfdbfe',
  blue600:  '#2563eb',

  violet50:  '#f5f3ff',
  violet200: '#ddd6fe',
  violet700: '#6d28d9',

  white: '#ffffff',
  black: '#000000',
}

// ── Light theme ───────────────────────────────────────────────────────────────

export const lightColors = {
  primary:      palette.emerald600,
  primaryDark:  palette.emerald700,
  primaryLight: palette.emerald100,
  primaryText:  palette.emerald800,

  background:   palette.gray50,
  surface:      palette.white,
  surfaceRaised: palette.white,
  border:       palette.gray200,
  borderLight:  palette.gray100,

  text:          palette.gray900,
  textSecondary: palette.gray500,
  textMuted:     palette.gray400,
  textInverse:   palette.white,

  tabBar:        palette.white,
  tabBarBorder:  palette.gray200,

  error:        palette.red600,
  errorBg:      palette.red50,
  errorBorder:  palette.red200,

  warning:       palette.amber600,
  warningBg:     palette.amber50,
  warningBorder: palette.amber200,

  success:       palette.emerald600,
  successBg:     palette.emerald50,
  successBorder: palette.emerald200,

  info:       palette.blue600,
  infoBg:     palette.blue50,
  infoBorder: palette.blue200,

  // Status badge colors
  statusPending:    { bg: palette.amber50,   text: '#92400e',       border: palette.amber200 },
  statusProcessing: { bg: palette.blue50,    text: '#1e40af',       border: palette.blue200 },
  statusShipped:    { bg: palette.violet50,  text: palette.violet700, border: palette.violet200 },
  statusDelivered:  { bg: palette.emerald50, text: palette.emerald800, border: palette.emerald200 },
  statusCancelled:  { bg: palette.red50,     text: '#991b1b',       border: palette.red200 },

  // Skeleton / shimmer
  shimmerBase:     palette.gray200,
  shimmerHighlight: palette.gray100,

  // Overlay
  overlay: 'rgba(0,0,0,0.5)',
  overlayLight: 'rgba(0,0,0,0.3)',
}

// ── Dark theme ────────────────────────────────────────────────────────────────

export const darkColors = {
  primary:      palette.emerald500,
  primaryDark:  palette.emerald600,
  primaryLight: 'rgba(16,185,129,0.15)',
  primaryText:  palette.emerald200,

  background:   '#0f172a',   // slate-900
  surface:      '#1e293b',   // slate-800
  surfaceRaised: '#263348',
  border:       '#334155',   // slate-700
  borderLight:  '#1e293b',

  text:          '#f1f5f9',  // slate-100
  textSecondary: '#94a3b8',  // slate-400
  textMuted:     '#64748b',  // slate-500
  textInverse:   palette.gray900,

  tabBar:       '#1e293b',
  tabBarBorder: '#334155',

  error:        '#f87171',   // red-400
  errorBg:      'rgba(220,38,38,0.15)',
  errorBorder:  'rgba(220,38,38,0.3)',

  warning:       '#fbbf24',
  warningBg:     'rgba(217,119,6,0.15)',
  warningBorder: 'rgba(217,119,6,0.3)',

  success:       palette.emerald500,
  successBg:     'rgba(16,185,129,0.15)',
  successBorder: 'rgba(16,185,129,0.3)',

  info:       '#60a5fa',
  infoBg:     'rgba(37,99,235,0.15)',
  infoBorder: 'rgba(37,99,235,0.3)',

  statusPending:    { bg: 'rgba(217,119,6,0.15)',   text: '#fbbf24',       border: 'rgba(217,119,6,0.3)' },
  statusProcessing: { bg: 'rgba(37,99,235,0.15)',   text: '#60a5fa',       border: 'rgba(37,99,235,0.3)' },
  statusShipped:    { bg: 'rgba(109,40,217,0.15)',  text: '#a78bfa',       border: 'rgba(109,40,217,0.3)' },
  statusDelivered:  { bg: 'rgba(16,185,129,0.15)',  text: palette.emerald200, border: 'rgba(16,185,129,0.3)' },
  statusCancelled:  { bg: 'rgba(220,38,38,0.15)',   text: '#f87171',       border: 'rgba(220,38,38,0.3)' },

  shimmerBase:      '#334155',
  shimmerHighlight: '#475569',

  overlay: 'rgba(0,0,0,0.7)',
  overlayLight: 'rgba(0,0,0,0.5)',
}

// ── Default export (light — screens import via useTheme hook) ─────────────────
// Kept for backward compat during migration; new code uses useTheme()
export const colors = lightColors

// ── Spacing ───────────────────────────────────────────────────────────────────

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
}

// ── Border radius ─────────────────────────────────────────────────────────────

export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   20,
  xxl:  28,
  full: 9999,
}

// ── Typography ────────────────────────────────────────────────────────────────

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   16,
  lg:   18,
  xl:   20,
  xxl:  24,
  xxxl: 30,
  hero: 36,
}

export const fontWeight = {
  normal:   '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
  extrabold:'800' as const,
}

export const lineHeight = {
  tight:  1.2,
  normal: 1.5,
  relaxed: 1.7,
}

// ── Shadows ───────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
}
