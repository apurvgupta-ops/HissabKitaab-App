/**
 * HissabKitaab — Premium dark/light theme color tokens
 */

export const palette = {
  // Primary — rich teal/emerald
  primary: '#10B981',
  primaryLight: '#34D399',
  primaryDark: '#059669',
  primaryMuted: 'rgba(16, 185, 129, 0.15)',

  // Accent — warm amber
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Semantic
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  errorMuted: 'rgba(239, 68, 68, 0.12)',
  info: '#3B82F6',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
};

export const darkTheme = {
  ...palette,
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  surface: '#1E293B',
  surfaceElevated: '#334155',
  border: '#334155',
  borderLight: '#475569',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shimmer: '#334155',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
};

export const lightTheme = {
  ...palette,
  background: '#F8FAFC',
  backgroundSecondary: '#F1F5F9',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#CBD5E1',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#F8FAFC',
  overlay: 'rgba(0, 0, 0, 0.3)',
  shimmer: '#E2E8F0',
  cardShadow: 'rgba(0, 0, 0, 0.08)',
};

export type Theme = typeof darkTheme;

// Default to dark theme
export const colors = darkTheme;
