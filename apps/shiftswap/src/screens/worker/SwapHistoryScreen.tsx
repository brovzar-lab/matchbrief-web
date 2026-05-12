import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, DANGER, WARNING } from '../../lib/config';
import type { SwapRequest, SwapStatus } from '../../lib/types';

function formatDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}
function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const STATUS_COLOR: Record<SwapStatus, string> = {
  open: '#7FA3C8',
  claimed: WARNING,
  approved: SUCCESS,
  denied: DANGER,
};

const STATUS_LABEL: Record<SwapStatus, string> = {
  open: 'Open',
  claimed: 'Awaiting Approval',
  approved: 'Approved',
  denied: 'Denied',
};

export default function SwapHistoryScreen() {
  const user = useStore((s) => s.user);
  const shifts = useStore((s) => s.shifts);
  const swapRequests = useStore((s) => s.swapRequests);
  const workers = useStore((s) => s.workers);

  const myRequests = swapRequests
    .filter((r) => r.requesterId === user?.uid || r.claimantId === user?.uid)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  function renderItem({ item }: { item: SwapRequest }) {
    const shift = shifts.find((s) => s.id === item.shiftId);
    const requester = workers.find((w) => w.id === item.requesterId);
    const claimant = item.claimantId ? workers.find((w) => w.id === item.claimantId) : null;
    const isMyPost = item.requesterId === user?.uid;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.cardRole}>{shift?.role ?? '—'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: `${STATUS_COLOR[item.status]}22` }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.status] }]}>
              {STATUS_LABEL[item.status]}
            </Text>
          </View>
        </View>
        {shift && (
          <Text style={styles.shiftLine}>
            {formatDate(shift.start)}  {formatTime(shift.start)}–{formatTime(shift.end)}
          </Text>
        )}
        <Text style={styles.parties}>
          {isMyPost ? `You posted · ${claimant ? `Claimed by ${claimant.name}` : 'No claimant yet'}` : `Posted by ${requester?.name ?? '?'} · You claimed`}
        </Text>
        {item.overtimeWarning && (
          <View style={styles.otWarning}>
            <Text style={styles.otWarningText}>Overtime Warning</Text>
          </View>
        )}
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
      <Text style={styles.heading}>Swap History</Text>
      <FlatList
        data={myRequests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No swap activity yet.</Text>
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
    padding: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardRole: { color: TEXT, fontWeight: '600', fontSize: 15 },
  statusBadge: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  shiftLine: { color: SUBTEXT, fontSize: 13, marginBottom: 4 },
  parties: { color: SUBTEXT, fontSize: 13, marginBottom: 8 },
  otWarning: {
    backgroundColor: '#2D1B00',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  otWarningText: { color: WARNING, fontSize: 12, fontWeight: '700' },
});
