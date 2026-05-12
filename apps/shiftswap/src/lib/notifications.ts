import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { isDemoMode } from './config';

/**
 * Requests push-notification permissions (iOS), obtains the device push token
 * (APNs on iOS, FCM registration token on Android), and writes it to the
 * worker's Firestore document so Cloud Functions can dispatch FCM pushes.
 *
 * Called on every app open via initAuthListener so tokens that rotate between
 * launches are always current. Silently no-ops when permissions are denied —
 * the app must never crash because the user declined push notifications.
 */
export async function registerAndSaveFcmToken(
  uid: string,
  companyId: string,
  locationId: string,
): Promise<void> {
  if (isDemoMode || !db) return;

  try {
    if (Platform.OS === 'ios') {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
    }

    // Required on Android 8+ — creates the default channel that FCM
    // messages will be posted to if no explicit channel is specified.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Shift notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
      });
    }

    // getDevicePushTokenAsync returns the platform-native token:
    //   iOS  → APNs device token (hex string)
    //   Android → FCM registration token
    const { data: token } = await Notifications.getDevicePushTokenAsync();

    await updateDoc(
      doc(db, 'companies', companyId, 'locations', locationId, 'workers', uid),
      { fcmToken: token },
    );
  } catch {
    // Push notifications are non-critical — swallow all errors silently.
  }
}
