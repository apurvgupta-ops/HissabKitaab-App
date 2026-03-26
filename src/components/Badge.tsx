/**
 * HissabKitaab — Badge / pill component
 */
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../theme/typography';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

const variantColors: Record<BadgeVariant, { bg: string; text: string }> = {
  default: { bg: colors.surfaceElevated, text: colors.textSecondary },
  success: { bg: 'rgba(34, 197, 94, 0.15)', text: colors.success },
  warning: { bg: 'rgba(245, 158, 11, 0.15)', text: colors.warning },
  error: { bg: colors.errorMuted, text: colors.error },
  info: { bg: 'rgba(59, 130, 246, 0.15)', text: colors.info },
  primary: { bg: colors.primaryMuted, text: colors.primary },
};

export default function Badge({ label, variant = 'default', style }: BadgeProps) {
  const v = variantColors[variant];
  return (
    <View style={[styles.badge, { backgroundColor: v.bg }, style]}>
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
