/**
 * HissabKitaab — Inbox Screen
 * FlatList of pending transaction proposals with approve/reject actions
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import { Badge, Button } from '../../components';
import ProposalCard from './ProposalCard';
import ProposalDetailModal from './ProposalDetailModal';
import {
  type TransactionProposal,
  loadProposals,
  getProposals,
  getPendingProposals,
  approveProposal,
  rejectProposal,
  editProposal,
  subscribe,
  seedMockProposals,
} from './proposalStore';

type FilterTab = 'pending' | 'all';

export default function InboxScreen() {
  const [proposals, setProposals] = useState<TransactionProposal[]>([]);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<TransactionProposal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    await loadProposals();
    updateList();
  }, []);

  const updateList = () => {
    setProposals(filter === 'pending' ? getPendingProposals() : getProposals());
  };

  useEffect(() => {
    loadData().then(() => {
      // Seed mock data if empty
      seedMockProposals();
    });

    const unsubscribe = subscribe(() => {
      updateList();
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    updateList();
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      updateList();
    }, [filter]),
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleApprove = (id: string) => {
    approveProposal(id);
    updateList();
  };

  const handleReject = (id: string) => {
    Alert.alert('Reject Proposal', 'Are you sure you want to reject this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          rejectProposal(id);
          updateList();
        },
      },
    ]);
  };

  const handleEdit = (proposal: TransactionProposal) => {
    setSelectedProposal(proposal);
    setModalVisible(true);
  };

  const handleConfirmEdit = (
    id: string,
    updates: { merchant: string; amount: number; category: string; notes: string },
  ) => {
    editProposal(id, updates);
    approveProposal(id);
    setModalVisible(false);
    setSelectedProposal(null);
    updateList();
    Alert.alert('Success', 'Proposal edited and approved!');
  };

  const handleBatchApprove = () => {
    const pending = getPendingProposals();
    if (pending.length === 0) {return;}

    Alert.alert(
      'Batch Approve',
      `Approve all ${pending.length} pending proposals?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve All',
          onPress: () => {
            pending.forEach(p => approveProposal(p.id));
            updateList();
          },
        },
      ],
    );
  };

  const pendingCount = getPendingProposals().length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Inbox</Text>
          <Text style={styles.subtitle}>
            {pendingCount} pending proposal{pendingCount !== 1 ? 's' : ''}
          </Text>
        </View>
        {pendingCount > 1 && filter === 'pending' && (
          <TouchableOpacity
            style={styles.batchButton}
            onPress={handleBatchApprove}
            activeOpacity={0.7}>
            <Icon name="done-all" size={18} color={colors.primary} />
            <Text style={styles.batchText}>Approve All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'pending' && styles.activeTab]}
          onPress={() => setFilter('pending')}
          activeOpacity={0.7}>
          <Text style={[styles.filterText, filter === 'pending' && styles.activeFilterText]}>
            Pending
          </Text>
          {pendingCount > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{pendingCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeTab]}
          onPress={() => setFilter('all')}
          activeOpacity={0.7}>
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={proposals}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProposalCard
            proposal={item}
            onApprove={handleApprove}
            onReject={handleReject}
            onEdit={handleEdit}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIconWrap}>
              <Icon name="inbox" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {filter === 'pending' ? 'All caught up!' : 'No proposals yet'}
            </Text>
            <Text style={styles.emptyDesc}>
              {filter === 'pending'
                ? 'No pending proposals to review'
                : 'Enable automation in Settings to start receiving proposals'}
            </Text>
          </View>
        }
      />

      {/* Edit Modal */}
      <ProposalDetailModal
        visible={modalVisible}
        proposal={selectedProposal}
        onClose={() => {
          setModalVisible(false);
          setSelectedProposal(null);
        }}
        onConfirm={handleConfirmEdit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.xl,
    paddingBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  batchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primaryMuted,
    borderRadius: borderRadius.full,
  },
  batchText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: colors.primary,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTab: {
    backgroundColor: colors.primaryMuted,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    color: colors.textSecondary,
  },
  activeFilterText: {
    color: colors.primary,
  },
  countBadge: {
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    color: colors.white,
  },
  listContent: {
    padding: spacing.xl,
    paddingTop: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  emptyTitle: {
    fontSize: fontSize.md,
    fontWeight: fontWeight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  emptyDesc: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 280,
  },
});
