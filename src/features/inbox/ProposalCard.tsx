/**
 * HissabKitaab — Proposal Card component
 * Individual proposal with source badge, merchant, amount, and action buttons
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Card, Badge } from '../../components';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import type { TransactionProposal } from './proposalStore';

interface ProposalCardProps {
  proposal: TransactionProposal;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (proposal: TransactionProposal) => void;
}

const confidenceConfig = {
  high: { label: 'High', variant: 'success' as const },
  medium: { label: 'Medium', variant: 'warning' as const },
  low: { label: 'Low', variant: 'error' as const },
};

export default function ProposalCard({
  proposal,
  onApprove,
  onReject,
  onEdit,
}: ProposalCardProps) {
  const conf = confidenceConfig[proposal.confidence];
  const isPending = proposal.status === 'pending';

  return (
    <Card elevated={isPending} style={[styles.card, !isPending && styles.processedCard]}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View style={styles.sourceIcon}>
          <Icon
            name={proposal.sourceIcon}
            size={18}
            color={proposal.source === 'sms' ? colors.info : colors.accent}
          />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.merchant} numberOfLines={1}>
            {proposal.merchant}
          </Text>
          <Text style={styles.date}>{proposal.date}</Text>
        </View>
        <Text style={styles.amount}>
          {proposal.currency} {proposal.amount.toFixed(2)}
        </Text>
      </View>

      {/* Tags Row */}
      <View style={styles.tagsRow}>
        <Badge label={proposal.category} variant="primary" />
        <Badge label={conf.label} variant={conf.variant} />
        {proposal.status !== 'pending' && (
          <Badge
            label={proposal.status}
            variant={proposal.status === 'approved' ? 'success' : proposal.status === 'rejected' ? 'error' : 'info'}
          />
        )}
      </View>

      {/* Notes */}
      {proposal.notes ? (
        <Text style={styles.notes} numberOfLines={1}>
          {proposal.notes}
        </Text>
      ) : null}

      {/* Action Buttons — only for pending */}
      {isPending && (
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => onApprove(proposal.id)}
            activeOpacity={0.7}>
            <Icon name="check" size={18} color={colors.white} />
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.editBtn]}
            onPress={() => onEdit(proposal)}
            activeOpacity={0.7}>
            <Icon name="edit" size={16} color={colors.primary} />
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
            onPress={() => onReject(proposal.id)}
            activeOpacity={0.7}>
            <Icon name="close" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  processedCard: {
    opacity: 0.6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sourceIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  merchant: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  amount: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
    flexWrap: 'wrap',
  },
  notes: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
  },
  approveBtn: {
    backgroundColor: colors.success,
    flex: 1,
    justifyContent: 'center',
  },
  approveBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.white,
  },
  editBtn: {
    backgroundColor: colors.primaryMuted,
  },
  editBtnText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.primary,
  },
  rejectBtn: {
    backgroundColor: colors.errorMuted,
    paddingHorizontal: spacing.md,
  },
});
