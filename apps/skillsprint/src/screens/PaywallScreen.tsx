import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
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
  { label: '3 Sprints / Day', free: true, premium: false },
];

export default function PaywallScreen({ navigation }: Props) {
  const track = useStore((s) => s.track);
  const showToast = useStore((s) => s.showToast);
  const accent = TRACKS[track].accent;

  function handleSubscribe(_plan: 'monthly' | 'annual') {
    if (isDemoMode) {
      showToast('Demo mode — purchase not available');
      return;
    }
    // real purchase flow goes here
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>
        {/* Lock header */}
        <View style={s.lockSection}>
          <Text style={s.lockIcon}>🔒</Text>
          <Text style={s.lockTitle}>
            You've used your 3 free sprints today
          </Text>
          <Text style={s.lockSub}>
            Upgrade to SkillSprint Premium for unlimited access
          </Text>
        </View>

        {/* Feature comparison table */}
        <View style={s.table}>
          <View style={s.tableHeader}>
            <Text style={s.tableHeaderLabel} />
            <Text style={[s.tableHeaderCell, { color: '#8888AA' }]}>
              Free
            </Text>
            <Text style={[s.tableHeaderCell, { color: accent }]}>
              Premium
            </Text>
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

        {/* Pricing CTAs */}
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: accent }]}
          onPress={() => handleSubscribe('monthly')}
          accessibilityRole="button"
          accessibilityLabel="Subscribe monthly for $9.99"
        >
          <Text style={s.primaryBtnText}>$9.99 / month</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.secondaryBtn, { borderColor: accent + '66' }]}
          onPress={() => handleSubscribe('annual')}
          accessibilityRole="button"
          accessibilityLabel="Subscribe annually for $59.99, save 50 percent"
        >
          <Text style={[s.secondaryBtnText, { color: accent }]}>
            $59.99 / year — save 50%
          </Text>
        </TouchableOpacity>

        {/* Dismiss */}
        <TouchableOpacity
          style={s.dismissBtn}
          onPress={() => navigation.goBack()}
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
  dismissBtn: { paddingVertical: 8 },
  dismissText: { fontSize: 14, color: '#8888AA' },
});
