/**
 * HissabKitaab — Automation Config Card component
 * Shows status of an automation source (SMS / Notifications)
 */
import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Badge } from '../../components';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing } from '../../theme/typography';

interface AutomationConfigCardProps {
  title: string;
  description: string;
  iconName: string;
  status: 'active' | 'inactive' | 'blocked' | 'unavailable';
  lastSync?: string;
  enabled: boolean;
  onToggle: (value: boolean) => void;
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  inactive: { label: 'Inactive', variant: 'default' as const },
  blocked: { label: 'Blocked', variant: 'error' as const },
  unavailable: { label: 'N/A', variant: 'warning' as const },
};

export default function AutomationConfigCard({
  title,
  description,
  iconName,
  status,
  lastSync,
  enabled,
  onToggle,
}: AutomationConfigCardProps) {
  const cfg = statusConfig[status];
  const isAvailable = status !== 'unavailable';

  return (
    <Card elevated style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name={iconName} size={24} color={colors.primary} />
        </View>
        <View style={styles.titleArea}>
          <Text style={styles.title}>{title}</Text>
          <Badge label={cfg.label} variant={cfg.variant} />
        </View>
        <Switch
          value={enabled && isAvailable}
          onValueChange={onToggle}
          disabled={!isAvailable}
          trackColor={{ false: colors.border, true: colors.primaryMuted }}
          thumbColor={enabled && isAvailable ? colors.primary : colors.textMuted}
        />
      </View>

      <Text style={styles.description}>{description}</Text>

      {lastSync && (
        <View style={styles.syncRow}>
          <Icon name="sync" size={14} color={colors.textMuted} />
          <Text style={styles.syncText}>Last synced: {lastSync}</Text>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  titleArea: {
    flex: 1,
    gap: spacing.xs,
  },
  title: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  description: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  syncText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
});
