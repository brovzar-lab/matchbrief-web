import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const rcPremiumActive = useStore((s) => s.rcPremiumActive);
  const signOut = useStore((s) => s.signOut);

  const isPremium = user?.isPremium || rcPremiumActive;

  async function handleSignOut() {
    if (isDemoMode) {
      showToast('Demo mode — signed out locally');
      signOut();
      return;
    }

    Alert.alert('Sign out?', 'You will need to sign back in to access your account.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            const { getAuth: getAuthFn } = await import('../lib/firebase');
            const auth = await getAuthFn();
            if (auth) {
              const { signOut: firebaseSignOut } = await import('firebase/auth');
              await firebaseSignOut(auth);
            }
          } catch {
            // Proceed regardless
          }
          signOut();
        },
      },
    ]);
  }

  const streak = user?.currentStreak ?? 0;
  const sessions = useStore((s) => s.sessions);
  const completed = sessions.filter((s) => s.completedAt).length;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.pageTitle}>Settings</Text>

        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>🧠</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>{user?.displayName ?? 'Coach Student'}</Text>
            <Text style={styles.email}>{user?.email ?? 'demo@micromentor.app'}</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{streak}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{completed}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{isPremium ? '⭐' : 'Free'}</Text>
            <Text style={styles.statLabel}>Plan</Text>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUBSCRIPTION</Text>
          <View style={styles.subCard}>
            {isPremium ? (
              <>
                <View style={styles.premiumBadge}>
                  <Text style={styles.premiumBadgeText}>⭐ Premium Active</Text>
                </View>
                <Text style={styles.subDetail}>
                  Unlimited coaching sessions, full radar, priority AI.
                </Text>
                <TouchableOpacity style={styles.manageBtn}>
                  <Text style={styles.manageBtnText}>Manage Subscription</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.subDetail}>
                  You're on the free plan. Upgrade for unlimited sessions and the full coaching experience.
                </Text>
                <TouchableOpacity
                  style={styles.upgradeBtn}
                  onPress={() => nav.navigate('Paywall')}
                >
                  <Text style={styles.upgradeBtnText}>Upgrade to Premium →</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Account actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.actionList}>
            <TouchableOpacity style={styles.actionRow} onPress={handleSignOut}>
              <Text style={styles.actionText}>Sign Out</Text>
              <Text style={styles.actionChevron}>→</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App info */}
        <Text style={styles.appVersion}>MicroMentor v1.0.0{isDemoMode ? ' (Demo)' : ''}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: TEXT },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  avatarWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 28 },
  profileInfo: { flex: 1 },
  displayName: { fontSize: 18, fontWeight: '700', color: TEXT },
  email: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statChip: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 12,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: ACCENT },
  statLabel: { fontSize: 11, color: SUBTEXT },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  subCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 12,
  },
  premiumBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  premiumBadgeText: { fontSize: 13, fontWeight: '700', color: ACCENT },
  subDetail: { fontSize: 14, color: SUBTEXT, lineHeight: 21 },
  manageBtn: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  manageBtnText: { fontSize: 14, color: SUBTEXT },
  upgradeBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  upgradeBtnText: { fontSize: 14, fontWeight: '700', color: '#000' },
  actionList: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  actionText: { fontSize: 15, color: DANGER },
  actionChevron: { fontSize: 14, color: MUTED },
  appVersion: { fontSize: 12, color: MUTED, textAlign: 'center' },
});
