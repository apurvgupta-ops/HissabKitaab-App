/**
 * HissabKitaab — Proposal Detail Modal
 * Edit a proposal before approving
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import { Button, Badge } from '../../components';
import type { TransactionProposal } from './proposalStore';

interface ProposalDetailModalProps {
  visible: boolean;
  proposal: TransactionProposal | null;
  onClose: () => void;
  onConfirm: (id: string, updates: { merchant: string; amount: number; category: string; notes: string }) => void;
}

const CATEGORIES = [
  'Food & Drink',
  'Shopping',
  'Transportation',
  'Utilities',
  'Entertainment',
  'Health',
  'Housing',
  'Bills',
  'Education',
  'Travel',
  'Other',
];

export default function ProposalDetailModal({
  visible,
  proposal,
  onClose,
  onConfirm,
}: ProposalDetailModalProps) {
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');

  React.useEffect(() => {
    if (proposal) {
      setMerchant(proposal.merchant);
      setAmount(proposal.amount.toString());
      setCategory(proposal.category);
      setNotes(proposal.notes);
    }
  }, [proposal]);

  if (!proposal) {return null;}

  const handleConfirm = () => {
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {return;}
    onConfirm(proposal.id, {
      merchant: merchant.trim(),
      amount: parsedAmount,
      category,
      notes: notes.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} activeOpacity={0.7}>
            <Icon name="close" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Edit Proposal</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
          {/* Merchant */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Merchant</Text>
            <TextInput
              style={styles.textInput}
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Merchant name"
              placeholderTextColor={colors.textMuted}
            />
          </View>

          {/* Amount */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Amount ({proposal.currency})</Text>
            <TextInput
              style={styles.textInput}
              value={amount}
              onChangeText={setAmount}
              placeholder="0.00"
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />
          </View>

          {/* Category */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Category</Text>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.7}>
                  <Badge
                    label={cat}
                    variant={category === cat ? 'primary' : 'default'}
                    style={category === cat ? styles.selectedCategory : undefined}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Notes</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              placeholderTextColor={colors.textMuted}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Raw Data */}
          {proposal.rawData && (
            <View style={styles.rawDataSection}>
              <Text style={styles.rawDataLabel}>Original Message</Text>
              <View style={styles.rawDataBox}>
                <Text style={styles.rawDataText}>{proposal.rawData}</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Action */}
        <View style={styles.modalFooter}>
          <Button
            title="Confirm & Add as Expense"
            onPress={handleConfirm}
            icon={<Icon name="check-circle" size={20} color={colors.white} />}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  form: {
    flex: 1,
  },
  formContent: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  selectedCategory: {
    borderWidth: 1,
    borderColor: colors.primary,
  },
  rawDataSection: {
    gap: spacing.sm,
  },
  rawDataLabel: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  rawDataBox: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
  },
  rawDataText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    lineHeight: 18,
  },
  modalFooter: {
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
