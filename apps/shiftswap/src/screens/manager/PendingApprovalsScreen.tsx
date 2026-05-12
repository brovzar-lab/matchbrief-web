import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../lib/store';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, DANGER, WARNING, WARN_BG } from '../../lib/config';
import type { SwapRequest } from '../../lib/types';

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function PendingApprovalsScreen() {
  const user = useStore((s) => s.user);
  const shifts = useStore((s) => s.shifts);
  const swapRequests = useStore((s) => s.swapRequests);
  const workers = useStore((s) => s.workers);
  const updateSwapRequest = useStore((s) => s.updateSwapRequest);
  const [acting, setActing] = React.useState<string | null>(null);

  const pending = swapRequests
    .filter((r) => r.status === 'claimed')
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  async function handleDecision(req: SwapRequest, decision: 'approved' | 'denied') {
    if (acting) return;
    setActing(req.id);

    if (isDemoMode) {
      updateSwapRequest(req.id, {
        status: decision,
        resolvedAt: new Date(),
        history: [
          ...req.history,
          { action: decision, agentId: user!.uid, at: new Date() },
        ],
      });
      Alert.alert('Demo mode', `Swap ${decision} (not saved).`);
    } else {
      try {
        const companyId = user!.companyId;
        const locationId = user!.locationId;
        await updateDoc(
          doc(db!, `companies/${companyId}/locations/${locationId}/swapRequests/${req.id}`),
          {
            status: decision,
            resolvedAt: serverTimestamp(),
            history: arrayUnion({
              action: decision,
              agentId: user!.uid,
              at: serverTimestamp(),
            }),
          }
        );
      } catch (e: unknown) {
        Alert.alert('Error', (e as Error).message);
      }
    }

    setActing(null);
  }

  function renderItem({ item }: { item: SwapRequest }) {
    const shift = shifts.find((s) => s.id === item.shiftId);
    const requester = workers.find((w) => w.id === item.requesterId);
    const claimant = item.claimantId ? workers.find((w) => w.id === item.claimantId) : null;
    const isActing = acting === item.id;

    return (
      <View style={styles.card}>
        {item.overtimeWarning && (
          <View style={styles.otBanner}>
            <Text style={styles.otBannerText}>⚠️  Overtime Warning — claimant may exceed 40h/week</Text>
          </View>
        )}
        <View style={styles.cardTop}>
          <Text style={styles.cardRole}>{shift?.role ?? '—'}</Text>
          {shift && (
            <Text style={styles.cardDate}>{formatDate(shift.start)}</Text>
          )}
        </View>
        {shift && (
          <Text style={styles.cardTime}>
            {formatTime(shift.start)} – {formatTime(shift.end)}
          </Text>
        )}
        <View style={styles.workerRow}>
          <View style={styles.workerChip}>
            <Text style={styles.workerChipLabel}>Off</Text>
            <Text style={styles.workerChipName}>{requester?.name ?? '?'}</Text>
          </View>
          <Text style={styles.arrow}>→</Text>
          <View style={styles.workerChip}>
            <Text style={styles.workerChipLabel}>Covering</Text>
            <Text style={styles.workerChipName}>{claimant?.name ?? '?'}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.denyBtn, isActing && { opacity: 0.5 }]}
            onPress={() => handleDecision(item, 'denied')}
            disabled={isActing}
          >
            <Text style={styles.denyBtnText}>Deny</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.approveBtn, isActing && { opacity: 0.5 }]}
            onPress={() => handleDecision(item, 'approved')}
            disabled={isActing}
          >
            <Text style={styles.approveBtnText}>Approve</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo Mode</Text>
        </View>
      )}
      <Text style={styles.heading}>Pending Approvals</Text>
      <FlatList
        data={pending}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No pending swap requests.</Text>
        }
        renderItem={renderItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  demoBanner: { backgroundColor: ACCENT, paddingVertical: 4, alignItems: 'center' },
  demoBannerText: { color: '#000', fontWeight: '700', fontSize: 12 },
  heading: { fontSize: 24, fontWeight: '700', color: TEXT, padding: 20, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  otBanner: {
    backgroundColor: WARN_BG,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: `${WARNING}44`,
  },
  otBannerText: { color: WARNING, fontSize: 13, fontWeight: '600' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, paddingBottom: 4 },
  cardRole: { color: TEXT, fontWeight: '700', fontSize: 16 },
  cardDate: { color: SUBTEXT, fontSize: 13 },
  cardTime: { color: SUBTEXT, fontSize: 14, paddingHorizontal: 16, marginBottom: 12 },
  workerRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 16, gap: 8 },
  workerChip: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  workerChipLabel: { color: SUBTEXT, fontSize: 11, marginBottom: 2 },
  workerChipName: { color: TEXT, fontWeight: '600', fontSize: 14 },
  arrow: { color: SUBTEXT, fontSize: 18 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: BORDER },
  denyBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  denyBtnText: { color: DANGER, fontWeight: '700', fontSize: 15 },
  approveBtn: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    backgroundColor: `${SUCCESS}15`,
  },
  approveBtnText: { color: SUCCESS, fontWeight: '700', fontSize: 15 },
});
