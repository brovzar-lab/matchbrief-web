import React from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Purchases from 'react-native-purchases';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER,
  isDemoMode, FREE_MEMO_LIMIT, RC_MONTHLY_ID, RC_ANNUAL_ID, RC_ENTITLEMENT_ID,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';

export default function SettingsScreen() {
  const user = useStore((s) => s.user);
  const rcPremiumActive = useStore((s) => s.rcPremiumActive);
  const setRcPremiumActive = useStore((s) => s.setRcPremiumActive);
  const signOut = useStore((s) => s.signOut);

  const isPremium = user?.isPremium || rcPremiumActive;
  const memoCount = user?.memoCountThisMonth ?? 0;
  const remaining = Math.max(0, FREE_MEMO_LIMIT - memoCount);

  async function handleUpgrade() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Upgrade not available in demo mode.');
      return;
    }
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.identifier === RC_MONTHLY_ID || p.identifier === RC_ANNUAL_ID,
      ) ?? offerings.current?.availablePackages[0];

      if (!pkg) {
        Alert.alert('Unavailable', 'No packages available right now.');
        return;
      }

      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[RC_ENTITLEMENT_ID]) {
        setRcPremiumActive(true);
        Alert.alert('Welcome to Premium!', 'Unlimited memos, forever.');
      }
    } catch (err: unknown) {
      if (!(err instanceof Error && (err as { userCancelled?: boolean }).userCancelled)) {
        Alert.alert('Purchase failed', err instanceof Error ? err.message : 'Please try again.');
      }
    }
  }

  function handleSignOut() {
    Alert.alert('Sign out', 'Your memos will stay on this device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          signOut();
          if (!isDemoMode) {
            import('../lib/firebase').then(({ getAuth }) => {
              getAuth().then((auth) => {
                if (auth) import('firebase/auth').then(({ signOut: fbSignOut }) => fbSignOut(auth));
              });
            });
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.title}>Settings</Text>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Name</Text>
              <Text style={styles.rowValue}>{user?.displayName ?? '—'}</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Email</Text>
              <Text style={styles.rowValue}>{user?.email ?? 'Anonymous'}</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Plan</Text>
              <Text style={[styles.rowValue, isPremium && { color: ACCENT, fontWeight: '700' }]}>
                {isPremium ? '⭐ Premium' : 'Free'}
              </Text>
            </View>
          </View>
        </View>

        {/* Usage */}
        {!isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>This Month</Text>
            <View style={styles.card}>
              <View style={styles.usageRow}>
                <View style={styles.usageBarWrap}>
                  <View
                    style={[
                      styles.usageBar,
                      { width: `${Math.min((memoCount / FREE_MEMO_LIMIT) * 100, 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.usageText}>
                  {memoCount} / {FREE_MEMO_LIMIT} memos · {remaining} remaining
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Premium */}
        {!isPremium && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Premium</Text>
            <View style={styles.premiumCard}>
              <Text style={styles.premiumTitle}>Unlimited Memos</Text>
              <Text style={styles.premiumBody}>
                Remove the 20/month limit. Capture as many thoughts as you want, whenever inspiration strikes.
              </Text>
              <TouchableOpacity style={styles.upgradeBtn} onPress={handleUpgrade} activeOpacity={0.85}>
                <Text style={styles.upgradeBtnText}>Upgrade to Premium — $2.99/mo</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* App info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Version</Text>
              <Text style={styles.rowValue}>1.0.0</Text>
            </View>
            <View style={[styles.row, styles.rowBorder]}>
              <Text style={styles.rowLabel}>Mode</Text>
              <Text style={styles.rowValue}>{isDemoMode ? 'Demo' : 'Live'}</Text>
            </View>
          </View>
        </View>

        {/* Sign out */}
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: TEXT, marginBottom: 24, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
  },
  card: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  rowBorder: { borderTopWidth: 1, borderTopColor: BORDER },
  rowLabel: { fontSize: 15, color: TEXT },
  rowValue: { fontSize: 15, color: SUBTEXT },
  usageRow: { padding: 14, gap: 10 },
  usageBarWrap: {
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  usageBar: { height: '100%', backgroundColor: ACCENT, borderRadius: 3 },
  usageText: { fontSize: 13, color: SUBTEXT },
  premiumCard: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: ACCENT + '44',
    borderRadius: 14,
    padding: 18,
    gap: 12,
  },
  premiumTitle: { fontSize: 18, fontWeight: '700', color: TEXT },
  premiumBody: { fontSize: 14, color: SUBTEXT, lineHeight: 20 },
  upgradeBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  signOutBtn: {
    borderWidth: 1,
    borderColor: DANGER + '66',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: DANGER + '08',
  },
  signOutText: { color: DANGER, fontWeight: '700', fontSize: 15 },
});
