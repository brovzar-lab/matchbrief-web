import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, DANGER, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

function SettingRow({
  icon,
  label,
  value,
  onPress,
  destructive,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.settingRow}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={[styles.settingLabel, destructive && styles.destructiveText]}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {onPress && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const { user, signOut, rcPremiumActive } = useStore();

  const isPremium = rcPremiumActive || user?.isPremium;

  async function handleSignOut() {
    if (isDemoMode) {
      signOut();
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            const { getAuth: getAuthInstance } = await import('../lib/firebase');
            const auth = await getAuthInstance();
            if (auth) {
              const { signOut: firebaseSignOut } = await import('firebase/auth');
              await firebaseSignOut(auth);
            }
            signOut();
          } catch {
            Alert.alert('Error', 'Could not sign out.');
          }
        },
      },
    ]);
  }

  function handleExportData() {
    if (!isPremium) {
      nav.navigate('Paywall');
      return;
    }
    if (isDemoMode) {
      showToast('Demo mode — export not available');
      return;
    }
    Alert.alert('Export Data', 'Your data export will be emailed to you within a few minutes.');
  }

  function handleNotifications() {
    Alert.alert(
      'Notifications',
      'Weekly skin check reminders are sent every Sunday at 10am. Enable notifications in your device settings to receive them.',
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.title}>Settings</Text>

        {/* Profile section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🌸</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.displayName ?? 'Glow User'}</Text>
              <Text style={styles.profileEmail}>{user?.email ?? 'demo@glowlog.app'}</Text>
              {isPremium && (
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⭐ Premium</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Subscription section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          {!isPremium ? (
            <TouchableOpacity
              style={styles.upgradeCard}
              onPress={() => nav.navigate('Paywall')}
            >
              <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
              <Text style={styles.upgradePrice}>$7.99/mo · $49.99/yr</Text>
              <Text style={styles.upgradeFeatures}>
                Unlimited skin checks · Product reports · Data export
              </Text>
              <View style={styles.upgradeCta}>
                <Text style={styles.upgradeCtaText}>See Plans →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.card}>
              <SettingRow icon="⭐" label="GlowLog Premium" value="Active" />
            </View>
          )}
        </View>

        {/* Preferences section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <SettingRow
              icon="🔔"
              label="Weekly Reminders"
              onPress={handleNotifications}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="📁"
              label="Export Data"
              value={isPremium ? undefined : '🔒 Premium'}
              onPress={handleExportData}
            />
          </View>
        </View>

        {/* About section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingRow icon="🌸" label="GlowLog" value="v1.0.0" />
            <View style={styles.divider} />
            <SettingRow icon="🔥" label="Current Streak" value={`${user?.streakDays ?? 0} days`} />
          </View>
        </View>

        {/* Sign out */}
        <View style={styles.section}>
          <View style={styles.card}>
            <SettingRow
              icon="🚪"
              label="Sign Out"
              onPress={handleSignOut}
              destructive
            />
          </View>
        </View>

        <Text style={styles.footer}>
          {isDemoMode ? 'Running in demo mode — no data is saved.' : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, gap: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: TEXT },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  profileCard: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT_DIM,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 17, fontWeight: '700', color: TEXT },
  profileEmail: { fontSize: 13, color: SUBTEXT },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_DIM,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  premiumBadgeText: { fontSize: 11, fontWeight: '700', color: ACCENT },
  upgradeCard: {
    backgroundColor: ACCENT_DIM,
    borderRadius: 16,
    padding: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  upgradeTitle: { fontSize: 17, fontWeight: '800', color: TEXT },
  upgradePrice: { fontSize: 13, color: ACCENT, fontWeight: '700' },
  upgradeFeatures: { fontSize: 12, color: SUBTEXT, lineHeight: 18 },
  upgradeCta: { marginTop: 4 },
  upgradeCtaText: { fontSize: 14, fontWeight: '700', color: ACCENT },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  settingIcon: { fontSize: 18, width: 24, textAlign: 'center' },
  settingLabel: { flex: 1, fontSize: 15, color: TEXT },
  settingValue: { fontSize: 13, color: MUTED },
  chevron: { fontSize: 20, color: MUTED },
  destructiveText: { color: DANGER },
  divider: { height: 1, backgroundColor: BORDER, marginLeft: 52 },
  footer: { fontSize: 12, color: MUTED, textAlign: 'center' },
});
