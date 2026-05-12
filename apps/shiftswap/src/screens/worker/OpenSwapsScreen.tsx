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
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, WARNING } from '../../lib/config';
import type { Shift, SwapRequest } from '../../lib/types';

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function formatDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

interface ClaimableSwap {
  request: SwapRequest;
  shift: Shift;
}

export default function OpenSwapsScreen() {
  const user = useStore((s) => s.user);
  const shifts = useStore((s) => s.shifts);
  const swapRequests = useStore((s) => s.swapRequests);
  const workers = useStore((s) => s.workers);
  const updateSwapRequest = useStore((s) => s.updateSwapRequest);
  const [claiming, setClaiming] = React.useState<string | null>(null);

  const myWorker = workers.find((w) => w.id === user?.uid);

  const claimable: ClaimableSwap[] = swapRequests
    .filter(
      (req) =>
        req.status === 'open' &&
        req.requesterId !== user?.uid
    )
    .map((req) => ({ request: req, shift: shifts.find((s) => s.id === req.shiftId)! }))
    .filter(
      (item): item is ClaimableSwap =>
        item.shift !== undefined &&
        // eligibility: role must match
        item.shift.role === myWorker?.role
    )
    .sort((a, b) => a.shift.start.getTime() - b.shift.start.getTime());

  async function handleClaim(req: SwapRequest) {
    if (claiming) return;
    setClaiming(req.id);

    if (isDemoMode) {
      updateSwapRequest(req.id, {
        claimantId: user!.uid,
        status: 'claimed',
        history: [
          ...req.history,
          { action: 'claimed', agentId: user!.uid, at: new Date() },
        ],
      });
      Alert.alert('Demo mode', 'Shift claimed (not saved). Manager will be notified.');
    } else {
      try {
        const companyId = user!.companyId;
        const locationId = user!.locationId;
        await updateDoc(
          doc(db!, `companies/${companyId}/locations/${locationId}/swapRequests/${req.id}`),
          {
            claimantId: user!.uid,
            status: 'claimed',
            history: arrayUnion({ action: 'claimed', agentId: user!.uid, at: serverTimestamp() }),
          }
        );
        Alert.alert('Claimed', 'The manager has been notified for approval.');
      } catch (e: unknown) {
        Alert.alert('Error', (e as Error).message);
      }
    }

    setClaiming(null);
  }

  const requesterName = (req: SwapRequest) =>
    workers.find((w) => w.id === req.requesterId)?.name ?? 'Unknown';

  return (
    <SafeAreaView style={styles.safe}>
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo Mode</Text>
        </View>
      )}
      <Text style={styles.heading}>Open Swaps</Text>
      <Text style={styles.sub}>
        Shifts you're eligible to pick up (matching your role: {myWorker?.role ?? '—'})
      </Text>
      <FlatList
        data={claimable}
        keyExtractor={(item) => item.request.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No open swaps available for your role right now.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardDate}>{formatDate(item.shift.start)}</Text>
              <Text style={styles.cardRole}>{item.shift.role}</Text>
            </View>
            <Text style={styles.cardTime}>
              {formatTime(item.shift.start)} – {formatTime(item.shift.end)}
            </Text>
            <Text style={styles.cardPoster}>Posted by {requesterName(item.request)}</Text>
            <TouchableOpacity
              style={[styles.claimBtn, claiming === item.request.id && { opacity: 0.6 }]}
              onPress={() => handleClaim(item.request)}
              disabled={claiming === item.request.id}
            >
              <Text style={styles.claimBtnText}>
                {claiming === item.request.id ? 'Claiming…' : 'Claim This Shift'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  demoBanner: { backgroundColor: ACCENT, paddingVertical: 4, alignItems: 'center' },
  demoBannerText: { color: '#000', fontWeight: '700', fontSize: 12 },
  heading: { fontSize: 24, fontWeight: '700', color: TEXT, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 4 },
  sub: { color: SUBTEXT, fontSize: 13, paddingHorizontal: 20, marginBottom: 12 },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 40 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  cardDate: { color: TEXT, fontWeight: '600', fontSize: 15 },
  cardRole: { color: ACCENT, fontSize: 13, fontWeight: '600' },
  cardTime: { color: TEXT, fontSize: 14, marginBottom: 4 },
  cardPoster: { color: SUBTEXT, fontSize: 13, marginBottom: 12 },
  claimBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  claimBtnText: { color: '#000', fontWeight: '700' },
});
