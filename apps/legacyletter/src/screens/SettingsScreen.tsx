import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: 'Free', color: SUBTEXT },
  pro_monthly: { label: 'Pro', color: '#3FB950' },
  vault_monthly: { label: 'Vault', color: ACCENT },
  lifetime: { label: 'Lifetime ♾️', color: '#D29922' },
};

function SettingsRow({ label, value, onPress, destructive }: {
  label: string;
  value?: string;
  onPress?: () => void;
  destructive?: boolean;
}) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      disabled={!onPress}
    >
      <Text style={[styles.rowLabel, destructive && { color: DANGER }]}>{label}</Text>
      {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
      {onPress && <Text style={styles.rowChevron}>›</Text>}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const setUser = useStore((s) => s.setUser);
  const tier = user?.subscription.tier ?? 'free';
  const tierInfo = TIER_LABELS[tier] ?? TIER_LABELS.free;

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          if (isDemoMode) {
            setUser(null);
            return;
          }
          // TODO: Firebase Auth signOut
        },
      },
    ]);
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This will permanently delete all your legacies and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (isDemoMode) {
              Alert.alert('Demo Mode', 'Account deletion is disabled in demo mode.');
              return;
            }
            // TODO: Firebase Auth delete + Firestore cleanup
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <View>
            <Text style={styles.displayName}>{user?.displayName ?? 'Anonymous'}</Text>
            <Text style={styles.email}>{user?.email ?? ''}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Subscription</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Current Plan"
              value={tierInfo.label}
            />
            <SettingsRow
              label="Upgrade Plan"
              onPress={() => nav.navigate('Paywall')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.card}>
            <SettingsRow label="Email" value={user?.email ?? ''} />
            <SettingsRow
              label="Change Password"
              onPress={() =>
                isDemoMode
                  ? Alert.alert('Demo Mode', 'Password change disabled.')
                  : Alert.alert('Coming soon', 'Password change pending implementation.')
              }
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Privacy & Data</Text>
          <View style={styles.card}>
            <SettingsRow
              label="Export My Data"
              onPress={() => Alert.alert('Coming soon', 'Data export pending implementation.')}
            />
            <SettingsRow
              label="Privacy Policy"
              onPress={() => Alert.alert('Coming soon', 'Privacy policy link pending.')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <SettingsRow label="Sign Out" onPress={handleSignOut} destructive />
            <SettingsRow label="Delete Account" onPress={handleDeleteAccount} destructive />
          </View>
        </View>

        <Text style={styles.version}>LegacyLetter v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  body: { padding: 20, gap: 20 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${ACCENT}33`,
    borderWidth: 2,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 24, fontWeight: '700', color: ACCENT },
  displayName: { fontSize: 18, fontWeight: '700', color: TEXT },
  email: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  section: { gap: 8 },
  sectionHeader: {
    fontSize: 12,
    color: SUBTEXT,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  rowLabel: { flex: 1, fontSize: 16, color: TEXT },
  rowValue: { fontSize: 15, color: SUBTEXT, marginRight: 8 },
  rowChevron: { color: SUBTEXT, fontSize: 20 },
  version: { fontSize: 12, color: SUBTEXT, textAlign: 'center', opacity: 0.5 },
});
