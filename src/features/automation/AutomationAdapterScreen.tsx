/**
 * HissabKitaab — Automation Adapter Settings Screen
 * Shows permission status for SMS and Notification access
 * Permission-first UX: explains WHY before requesting
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme';
import { fontSize, fontWeight, spacing, borderRadius } from '../../theme/typography';
import { Card, Button } from '../../components';
import AutomationConfigCard from './AutomationConfigCard';
import {
  checkSmsPermission,
  requestSmsPermission,
  checkNotificationPermission,
  requestNotificationPermission,
  openNotificationListenerSettings,
  openAppSettings,
  type PermissionStatus,
} from './permissions';

export default function AutomationAdapterScreen() {
  const [smsStatus, setSmsStatus] = useState<PermissionStatus>('denied');
  const [notifStatus, setNotifStatus] = useState<PermissionStatus>('denied');
  const [smsEnabled, setSmsEnabled] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);

  const refreshPermissions = useCallback(async () => {
    const sms = await checkSmsPermission();
    const notif = await checkNotificationPermission();
    setSmsStatus(sms);
    setNotifStatus(notif);
    setSmsEnabled(sms === 'granted');
    setNotifEnabled(notif === 'granted');
  }, []);

  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshPermissions();
    }, [refreshPermissions]),
  );

  const handleSmsToggle = async (value: boolean) => {
    if (value) {
      if (smsStatus === 'blocked') {
        Alert.alert(
          'Permission Blocked',
          'SMS permission was previously denied. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ],
        );
        return;
      }
      const result = await requestSmsPermission();
      setSmsStatus(result);
      setSmsEnabled(result === 'granted');
    } else {
      setSmsEnabled(false);
    }
  };

  const handleNotifToggle = async (value: boolean) => {
    if (value) {
      if (notifStatus === 'blocked') {
        Alert.alert(
          'Permission Blocked',
          'Notification permission was previously denied. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: openAppSettings },
          ],
        );
        return;
      }
      const result = await requestNotificationPermission();
      setNotifStatus(result);
      setNotifEnabled(result === 'granted');
    } else {
      setNotifEnabled(false);
    }
  };

  const isAndroid = Platform.OS === 'android';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Automation</Text>
        <Text style={styles.subtitle}>
          Automatically detect transactions from SMS and notifications
        </Text>
      </View>

      {/* Platform Notice */}
      {!isAndroid && (
        <Card style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Icon name="info-outline" size={20} color={colors.info} />
            <Text style={styles.noticeText}>
              Automation features require Android. On iOS, you can manually scan
              receipts using the Capture tab.
            </Text>
          </View>
        </Card>
      )}

      {/* Why Section */}
      <Card style={styles.whyCard}>
        <View style={styles.whyHeader}>
          <Icon name="security" size={20} color={colors.accent} />
          <Text style={styles.whyTitle}>Why we need permissions</Text>
        </View>
        <Text style={styles.whyDesc}>
          HissabKitaab can read bank transaction SMS messages to automatically
          create expense proposals for your review. Your messages are processed
          locally on your device — nothing is sent to our servers without your
          explicit approval.
        </Text>
      </Card>

      {/* SMS Config */}
      <AutomationConfigCard
        title="SMS Reader"
        description="Reads incoming bank transaction SMS to detect debits and credits automatically."
        iconName="sms"
        status={isAndroid ? (smsStatus === 'granted' ? 'active' : smsStatus === 'blocked' ? 'blocked' : 'inactive') : 'unavailable'}
        enabled={smsEnabled}
        onToggle={handleSmsToggle}
      />

      {/* Notification Config */}
      <AutomationConfigCard
        title="Notification Listener"
        description="Reads payment app notifications (Google Pay, PhonePe, Paytm) for transaction detection."
        iconName="notifications"
        status={isAndroid ? (notifStatus === 'granted' ? 'active' : notifStatus === 'blocked' ? 'blocked' : 'inactive') : 'unavailable'}
        enabled={notifEnabled}
        onToggle={handleNotifToggle}
      />

      {/* Notification Listener Settings (Advanced) */}
      {isAndroid && (
        <View style={styles.advancedSection}>
          <Text style={styles.advancedTitle}>Advanced</Text>
          <Button
            title="Open Notification Listener Settings"
            onPress={openNotificationListenerSettings}
            variant="secondary"
            icon={<Icon name="settings" size={18} color={colors.textPrimary} />}
          />
          <Text style={styles.advancedNote}>
            Enable HissabKitaab in Android's notification listener settings to
            read payment notifications from other apps.
          </Text>
        </View>
      )}

      {/* Native Bridge Notice */}
      <Card style={styles.scaffoldCard}>
        <View style={styles.scaffoldRow}>
          <Icon name="build" size={18} color={colors.textMuted} />
          <Text style={styles.scaffoldText}>
            Native SMS BroadcastReceiver bridge is scaffolded but not yet wired.
            SMS parsing patterns are ready for SBI, HDFC, ICICI, Axis, and more.
          </Text>
        </View>
      </Card>
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
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  noticeCard: {
    marginBottom: spacing.base,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  noticeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.info,
    lineHeight: 20,
  },
  whyCard: {
    marginBottom: spacing.xl,
    backgroundColor: 'rgba(245, 158, 11, 0.06)',
    borderColor: 'rgba(245, 158, 11, 0.15)',
  },
  whyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  whyTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.accent,
  },
  whyDesc: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  advancedSection: {
    marginTop: spacing.base,
    gap: spacing.md,
  },
  advancedTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    color: colors.textSecondary,
  },
  advancedNote: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  scaffoldCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.backgroundSecondary,
  },
  scaffoldRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  scaffoldText: {
    flex: 1,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
});
