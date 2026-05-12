import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../lib/store';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, WARNING, DANGER } from '../../lib/config';
import type { Shift, SwapRequest } from '../../lib/types';

function formatTime(d: Date): string {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(d: Date): string {
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
}

function shiftDuration(shift: Shift): number {
  return (shift.end.getTime() - shift.start.getTime()) / 3600000;
}

export default function MyShiftsScreen() {
  const user = useStore((s) => s.user);
  const shifts = useStore((s) => s.shifts);
  const addSwapRequest = useStore((s) => s.addSwapRequest);

  const [postingShift, setPostingShift] = React.useState<Shift | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const myShifts = shifts.filter((s) => s.workerId === user?.uid).sort(
    (a, b) => a.start.getTime() - b.start.getTime()
  );

  async function handlePostSwap(shift: Shift) {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const newReq: SwapRequest = {
      id: `swap-demo-${Date.now()}`,
      shiftId: shift.id,
      requesterId: user!.uid,
      claimantId: null,
      status: 'open',
      overtimeWarning: false,
      createdAt: new Date(),
      resolvedAt: null,
      history: [{ action: 'created', agentId: user!.uid, at: new Date() }],
    };

    if (isDemoMode) {
      addSwapRequest(newReq);
      Alert.alert('Demo mode', 'Swap posted (not saved).');
    } else {
      try {
        const companyId = user!.companyId;
        const locationId = user!.locationId;
        await addDoc(
          collection(db!, `companies/${companyId}/locations/${locationId}/swapRequests`),
          {
            shiftId: shift.id,
            requesterId: user!.uid,
            claimantId: null,
            status: 'open',
            overtimeWarning: false,
            createdAt: serverTimestamp(),
            resolvedAt: null,
            history: [{ action: 'created', agentId: user!.uid, at: serverTimestamp() }],
          }
        );
        Alert.alert('Posted', 'Your swap request is now open.');
      } catch (e: unknown) {
        Alert.alert('Error', (e as Error).message);
      }
    }

    setIsSubmitting(false);
    setPostingShift(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo Mode</Text>
        </View>
      )}
      <Text style={styles.heading}>My Shifts</Text>
      <FlatList
        data={myShifts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No shifts scheduled this week.</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.shiftCard}>
            <View style={styles.shiftHeader}>
              <Text style={styles.shiftDate}>{formatDate(item.start)}</Text>
              {item.overtimeRisk && (
                <View style={styles.overtimeBadge}>
                  <Text style={styles.overtimeBadgeText}>OT Risk</Text>
                </View>
              )}
            </View>
            <Text style={styles.shiftTime}>
              {formatTime(item.start)} – {formatTime(item.end)}{' '}
              <Text style={styles.shiftDuration}>({shiftDuration(item)}h)</Text>
            </Text>
            <Text style={styles.shiftRole}>{item.role}</Text>
            <TouchableOpacity
              style={styles.cantMakeItBtn}
              onPress={() => setPostingShift(item)}
            >
              <Text style={styles.cantMakeItText}>Can't make it?</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={postingShift !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Post Swap Request</Text>
            {postingShift && (
              <Text style={styles.modalBody}>
                {formatDate(postingShift.start)}{'\n'}
                {formatTime(postingShift.start)} – {formatTime(postingShift.end)}{'\n'}
                {postingShift.role}
              </Text>
            )}
            <Text style={styles.modalHint}>
              Eligible coworkers with the same role will see this and can claim it.
              A manager will approve the final swap.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPostingShift(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, isSubmitting && { opacity: 0.6 }]}
                onPress={() => postingShift && handlePostSwap(postingShift)}
                disabled={isSubmitting}
              >
                <Text style={styles.confirmBtnText}>
                  {isSubmitting ? 'Posting…' : 'Post Swap'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  demoBanner: {
    backgroundColor: ACCENT,
    paddingVertical: 4,
    alignItems: 'center',
  },
  demoBannerText: { color: '#000', fontWeight: '700', fontSize: 12 },
  heading: { fontSize: 24, fontWeight: '700', color: TEXT, padding: 20, paddingBottom: 8 },
  list: { padding: 16, paddingTop: 0, gap: 12 },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 40 },
  shiftCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  shiftHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  shiftDate: { color: TEXT, fontWeight: '600', fontSize: 15 },
  overtimeBadge: { backgroundColor: `${WARNING}33`, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  overtimeBadgeText: { color: WARNING, fontSize: 11, fontWeight: '700' },
  shiftTime: { color: TEXT, fontSize: 14, marginBottom: 2 },
  shiftDuration: { color: SUBTEXT, fontSize: 13 },
  shiftRole: { color: SUBTEXT, fontSize: 13, marginBottom: 12 },
  cantMakeItBtn: {
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  cantMakeItText: { color: ACCENT, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: CARD,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: { color: TEXT, fontSize: 18, fontWeight: '700', marginBottom: 12 },
  modalBody: { color: TEXT, fontSize: 15, lineHeight: 22, marginBottom: 12 },
  modalHint: { color: SUBTEXT, fontSize: 13, marginBottom: 20, lineHeight: 18 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  cancelBtnText: { color: TEXT, fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: ACCENT,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  confirmBtnText: { color: '#000', fontWeight: '700' },
});
