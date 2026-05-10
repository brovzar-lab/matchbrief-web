import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, SUCCESS } from '../lib/config';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const household = useStore((s) => s.household);
  const setUser = useStore((s) => s.setUser);
  const setHousehold = useStore((s) => s.setHousehold);

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          if (isDemoMode) {
            setUser(null);
            setHousehold(null);
            return;
          }
          try {
            await signOut(auth!);
          } catch (e: unknown) {
            Alert.alert('Error', (e as Error).message);
          }
        },
      },
    ]);
  }

  async function handleShareInvite() {
    if (!household) return;
    const code = household.inviteCode;
    try {
      await Share.share({
        message: `Join me on NestSync! Enter invite code: ${code} when signing up. Download the app at nestsync.app`,
        title: 'NestSync Invite Code',
      });
    } catch {
      // user cancelled
    }
  }

  const isConnected = !!household?.parent2Uid;
  const isSubscribed = household?.subscriptionActive ?? false;

  function Row({
    label,
    value,
    onPress,
    danger,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
  }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
        {value !== undefined && <Text style={styles.rowValue}>{value}</Text>}
        {onPress && <Text style={styles.rowChevron}>›</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.heading}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <Row label="Name" value={user?.displayName ?? '—'} />
            <View style={styles.divider} />
            <Row label="Email" value={user?.email ?? '—'} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Household</Text>
          <View style={styles.card}>
            <Row
              label="Status"
              value={isConnected ? '✓ Both parents connected' : '⚠ Waiting for co-parent'}
            />
            {!isConnected && (
              <>
                <View style={styles.divider} />
                <View style={styles.inviteRow}>
                  <Text style={styles.rowLabel}>Invite Code</Text>
                  <View style={styles.codeChip}>
                    <Text style={styles.codeText}>{household?.inviteCode ?? '——'}</Text>
                  </View>
                  <TouchableOpacity style={styles.shareBtn} onPress={handleShareInvite}>
                    <Text style={styles.shareBtnText}>Share</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>
          <View style={styles.card}>
            <Row
              label="Plan"
              value={isSubscribed ? '✓ NestSync Family — $9.99/mo' : 'Free — features locked'}
            />
            <View style={styles.divider} />
            <Row
              label={isSubscribed ? 'Manage Subscription' : 'Upgrade to Family Plan'}
              onPress={() => nav.navigate('Paywall')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.card}>
            <Row label="Sign Out" onPress={handleSignOut} danger />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  body: { padding: 16, paddingBottom: 40 },
  heading: { fontSize: 28, fontWeight: '800', color: TEXT, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: SUBTEXT, letterSpacing: 0.5, marginBottom: 8, marginLeft: 4 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 8,
  },
  rowLabel: { flex: 1, fontSize: 16, color: TEXT },
  rowLabelDanger: { color: DANGER },
  rowValue: { fontSize: 14, color: SUBTEXT, maxWidth: '55%', textAlign: 'right' },
  rowChevron: { color: SUBTEXT, fontSize: 22, marginRight: -4 },
  divider: { height: 1, backgroundColor: BORDER, marginHorizontal: 16 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 10,
  },
  codeChip: {
    backgroundColor: `${ACCENT}15`,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  codeText: { color: ACCENT, fontWeight: '800', fontSize: 16, letterSpacing: 2 },
  shareBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginLeft: 'auto',
  },
  shareBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
