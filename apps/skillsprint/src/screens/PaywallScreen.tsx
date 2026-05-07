import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, SPRINT_LIMIT_FREE, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import {
  purchaseMonthly,
  purchaseAnnual,
  restorePurchases,
} from '../lib/purchases';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

interface FeatureRow {
  label: string;
  free: boolean;
  premium: boolean;
}

const FEATURES: FeatureRow[] = [
  { label: 'Unlimited Sprints', free: false, premium: true },
  { label: 'Rival Matchups', free: false, premium: true },
  { label: 'Detailed Analytics', free: false, premium: true },
  { label: 'Export Progress', free: false, premium: true },
  { label: 'Skill Report Card', free: false, premium: true },
  { label: `${SPRINT_LIMIT_FREE} Sprints / Month`, free: true, premium: false },
];

export default function PaywallScreen({ navigation }: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const setIsPremium = useStore((s) => s.setIsPremium);
  const showToast = useStore((s) => s.showToast);
  const accent = TRACKS[track].accent;

  const [loading, setLoading] = useState<'monthly' | 'annual' | 'restore' | null>(null);

  async function handleSubscribe(plan: 'monthly' | 'annual') {
    if (isDemoMode) {
      showToast('Demo mode — purchase not available');
      return;
    }

    setLoading(plan);
    try {
      const purchased = plan === 'monthly'
        ? await purchaseMonthly()
        : await purchaseAnnual();

      if (purchased) {
        setIsPremium(true);
        showToast('Welcome to Premium!');
        navigation.goBack();
      } else {
        showToast('Purchase could not be completed. Try again.');
      }
    } finally {
      setLoading(null);
    }
  }

  async function handleRestore() {
    if (isDemoMode) {
      showToast('Demo mode — restore not available');
      return;
    }

    setLoading('restore');
    try {
      const restored = await restorePurchases();
      if (restored) {
        setIsPremium(true);
        showToast('Premium restored!');
        navigation.goBack();
      } else {
        showToast('No active subscription found.');
      }
    } finally {
      setLoading(null);
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>
        {/* Lock header */}
        <View style={s.lockSection}>
          <Text style={s.lockIcon}>🔒</Text>
          <Text style={s.lockTitle}>
            You've used your {SPRINT_LIMIT_FREE} free sprints this month
          </Text>
          <Text style={s.lockSub}>
            Upgrade to SkillSprint Premium for unlimited access
          </Text>
        </View>

        {/* Feature comparison table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.tableHeaderLabel} />
            <Text style={[s.tableHeaderCell, { color: '#8888AA' }]}>Free</Text>
            <Text style={[s.tableHeaderCell, { color: accent }]}>Premium</Text>
          </View>
          {FEATURES.map((f) => (
            <View key={f.label} style={s.tableRow}>
              <Text style={s.tableRowLabel}>{f.label}</Text>
              <Text style={s.tableRowCell}>{f.free ? '✓' : '–'}</Text>
              <Text style={[s.tableRowCell, { color: accent }]}>
                {f.premium ? '✓' : '–'}
              </Text>
            </View>
          ))}
        </View>

        {/* Monthly CTA */}
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: accent }, loading !== null && s.btnDisabled]}
          onPress={() => handleSubscribe('monthly')}
          disabled={loading !== null}
          accessibilityRole="button"
          accessibilityLabel="Subscribe monthly for $9.99"
        >
          {loading === 'monthly' ? (
            <ActivityIndicator color="#0F0F13" />
          ) : (
            <Text style={s.primaryBtnText}>$9.99 / month</Text>
          )}
        </TouchableOpacity>

        {/* Annual CTA */}
        <TouchableOpacity
          style={[s.secondaryBtn, { borderColor: accent + '66' }, loading !== null && s.btnDisabled]}
          onPress={() => handleSubscribe('annual')}
          disabled={loading !== null}
          accessibilityRole="button"
          accessibilityLabel="Subscribe annually for $79, save 34 percent"
        >
          {loading === 'annual' ? (
            <ActivityIndicator color={accent} />
          ) : (
            <Text style={[s.secondaryBtnText, { color: accent }]}>
              $79 / year — save 34%
            </Text>
          )}
        </TouchableOpacity>

        {/* Restore */}
        <TouchableOpacity
          style={s.dismissBtn}
          onPress={handleRestore}
          disabled={loading !== null}
          accessibilityRole="button"
          accessibilityLabel="Restore purchases"
        >
          {loading === 'restore' ? (
            <ActivityIndicator color="#8888AA" size="small" />
          ) : (
            <Text style={s.restoreText}>Restore purchases</Text>
          )}
        </TouchableOpacity>

        {/* Dismiss */}
        <TouchableOpacity
          style={s.dismissBtn}
          onPress={() => navigation.goBack()}
          disabled={loading !== null}
          accessibilityRole="button"
          accessibilityLabel="Maybe later"
        >
          <Text style={s.dismissText}>Maybe later</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  content: { padding: 24, gap: 20, alignItems: 'center' },
  lockSection: { alignItems: 'center', gap: 12, paddingTop: 16 },
  lockIcon: { fontSize: 48 },
  lockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  lockSub: { fontSize: 14, color: '#8888AA', textAlign: 'center' },
  table: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#252540',
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  tableHeaderLabel: { flex: 1 },
  tableHeaderCell: {
    width: 64,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  tableRowLabel: { flex: 1, fontSize: 14, color: '#8888AA' },
  tableRowCell: {
    width: 64,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '700',
    color: '#8888AA',
  },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 17, fontWeight: '700', color: '#0F0F13' },
  secondaryBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  secondaryBtnText: { fontSize: 15, fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  dismissBtn: { paddingVertical: 8 },
  restoreText: { fontSize: 13, color: '#8888AA' },
  dismissText: { fontSize: 14, color: '#8888AA' },
});
