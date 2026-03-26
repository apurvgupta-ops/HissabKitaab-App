/**
 * HissabKitaab — Receipt OCR Result Screen
 * Shows parsed receipt data with merchant, items, total, and action buttons
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Alert,
} from 'react-native';
import { useRoute, useNavigation, type RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import { Button, Card, Badge } from '../../components';
import type { ReceiptUploadResponse } from '../../api/uploads';
import type { CaptureStackParamList } from '../../navigation/AppNavigator';

type Route = RouteProp<CaptureStackParamList, 'ReceiptResult'>;

export default function ReceiptResultScreen() {
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { result } = route.params;
  const { receipt, upload } = result;

  const handleAddExpense = () => {
    // TODO: navigate to expense creation with pre-filled data
    Alert.alert(
      'Add as Expense',
      `Would add expense of ${receipt.currency} ${receipt.total.toFixed(2)} at ${receipt.merchant}`,
      [{ text: 'OK', onPress: () => navigation.goBack() }],
    );
  };

  const handleDiscard = () => {
    navigation.goBack();
  };

  const formatCurrency = (amount: number) =>
    `${receipt.currency} ${amount.toFixed(2)}`;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Success Header */}
      <View style={styles.successHeader}>
        <View style={styles.successIcon}>
          <Icon name="check-circle" size={40} color={colors.success} />
        </View>
        <Text style={styles.successTitle}>Receipt Scanned!</Text>
        <Text style={styles.successDesc}>
          We extracted the following data from your receipt
        </Text>
      </View>

      {/* Merchant & Total Card */}
      <Card elevated style={styles.mainCard}>
        <View style={styles.merchantRow}>
          <View style={styles.merchantIcon}>
            <Icon name="store" size={24} color={colors.primary} />
          </View>
          <View style={styles.merchantInfo}>
            <Text style={styles.merchantName}>{receipt.merchant}</Text>
            {receipt.date && (
              <Text style={styles.merchantDate}>{receipt.date}</Text>
            )}
          </View>
        </View>

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(receipt.total)}
          </Text>
        </View>

        {receipt.category && (
          <View style={styles.categoryRow}>
            <Badge label={receipt.category} variant="primary" />
          </View>
        )}
      </Card>

      {/* Line Items */}
      {receipt.items.length > 0 && (
        <Card style={styles.itemsCard}>
          <Text style={styles.sectionTitle}>
            <Icon name="list" size={18} color={colors.textSecondary} />{' '}
            Line Items ({receipt.items.length})
          </Text>
          {receipt.items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemAmount}>
                {formatCurrency(item.amount)}
              </Text>
            </View>
          ))}
        </Card>
      )}

      {/* File Info */}
      <Card style={styles.fileCard}>
        <View style={styles.fileRow}>
          <Icon name="attach-file" size={18} color={colors.textMuted} />
          <Text style={styles.fileName} numberOfLines={1}>
            {upload.filename}
          </Text>
          <Text style={styles.fileSize}>
            {(upload.size / 1024).toFixed(0)} KB
          </Text>
        </View>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button
          title="Add as Expense"
          onPress={handleAddExpense}
          icon={<Icon name="add-circle" size={20} color={colors.white} />}
        />
        <Button
          title="Discard"
          onPress={handleDiscard}
          variant="ghost"
          icon={<Icon name="delete-outline" size={20} color={colors.textSecondary} />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing['4xl'],
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successIcon: {
    marginBottom: spacing.md,
  },
  successTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  successDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    marginBottom: spacing.base,
  },
  merchantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  merchantIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  merchantDate: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.extrabold,
    color: colors.primary,
  },
  categoryRow: {
    marginTop: spacing.md,
  },
  itemsCard: {
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textPrimary,
    marginRight: spacing.md,
  },
  itemAmount: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
  },
  fileCard: {
    marginBottom: spacing.xl,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  fileSize: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  actions: {
    gap: spacing.md,
  },
});
