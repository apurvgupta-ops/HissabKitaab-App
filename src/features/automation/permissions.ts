/**
 * HissabKitaab — Android permission utilities for SMS and Notification access
 * Permission-first approach: check → explain → request
 */
import { Platform, Linking, Alert } from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  openSettings,
} from 'react-native-permissions';

export type PermissionStatus = 'granted' | 'denied' | 'blocked' | 'unavailable' | 'limited';

/**
 * Check READ_SMS permission on Android.
 * Returns 'unavailable' on iOS.
 */
export async function checkSmsPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }
  const result = await check(PERMISSIONS.ANDROID.READ_SMS);
  return mapResult(result);
}

/**
 * Request READ_SMS permission on Android.
 * Shows rationale dialog before requesting.
 */
export async function requestSmsPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }

  const result = await request(PERMISSIONS.ANDROID.READ_SMS, {
    title: 'SMS Access Required',
    message:
      'HissabKitaab needs to read your SMS messages to automatically detect bank transactions and create expense proposals for you.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  } as any);

  return mapResult(result);
}

/**
 * Check RECEIVE_SMS permission on Android.
 */
export async function checkReceiveSmsPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }
  const result = await check(PERMISSIONS.ANDROID.RECEIVE_SMS);
  return mapResult(result);
}

/**
 * Request RECEIVE_SMS permission on Android.
 */
export async function requestReceiveSmsPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }
  const result = await request(PERMISSIONS.ANDROID.RECEIVE_SMS);
  return mapResult(result);
}

/**
 * Check POST_NOTIFICATIONS permission (Android 13+).
 */
export async function checkNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }
  try {
    // POST_NOTIFICATIONS is Android 13+ (API 33)
    const perm = 'android.permission.POST_NOTIFICATIONS' as any;
    const result = await check(perm);
    return mapResult(result);
  } catch {
    return 'unavailable';
  }
}

/**
 * Request POST_NOTIFICATIONS permission (Android 13+).
 */
export async function requestNotificationPermission(): Promise<PermissionStatus> {
  if (Platform.OS !== 'android') {
    return 'unavailable';
  }
  try {
    const perm = 'android.permission.POST_NOTIFICATIONS' as any;
    const result = await request(perm);
    return mapResult(result);
  } catch {
    return 'unavailable';
  }
}

/**
 * Open Android Notification Listener settings.
 * This is needed for reading notifications from other apps.
 */
export async function openNotificationListenerSettings(): Promise<void> {
  if (Platform.OS !== 'android') {
    Alert.alert('Not Available', 'Notification listener is only available on Android.');
    return;
  }

  try {
    await Linking.openURL('android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS');
  } catch {
    // Fallback: open general app settings
    await openSettings();
  }
}

/**
 * Open app settings (for when permission is permanently denied).
 */
export async function openAppSettings(): Promise<void> {
  await openSettings();
}

function mapResult(result: string): PermissionStatus {
  switch (result) {
    case RESULTS.GRANTED:
      return 'granted';
    case RESULTS.DENIED:
      return 'denied';
    case RESULTS.BLOCKED:
      return 'blocked';
    case RESULTS.UNAVAILABLE:
      return 'unavailable';
    case RESULTS.LIMITED:
      return 'limited';
    default:
      return 'denied';
  }
}
