import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT } from '../lib/config';
import { addCalendarEvent } from '../lib/firestoreService';
import type { CalendarEvent } from '../lib/types';
import { DEMO_CO_PARENT_NAME } from '../lib/mockData';

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function CalendarScreen() {
  const user = useStore((s) => s.user);
  const household = useStore((s) => s.household);
  const events = useStore((s) => s.events);
  const addEvent = useStore((s) => s.addEvent);
  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const sortedEvents = [...events].sort(
    (a, b) => a.startDate.getTime() - b.startDate.getTime()
  );

  function authorName(uid: string): string {
    if (uid === user?.uid) return 'You';
    return DEMO_CO_PARENT_NAME.split(' ')[0];
  }

  async function handleAdd() {
    if (!title.trim()) {
      Alert.alert('Title required', 'Give the event a name.');
      return;
    }
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (isDemoMode) {
      addEvent({
        id: `e-${Date.now()}`,
        title: title.trim(),
        startDate: tomorrow,
        endDate: tomorrow,
        allDay: true,
        createdBy: user?.uid ?? 'demo-parent1-uid',
      });
      setTitle('');
      setShowModal(false);
      return;
    }

    if (!household || !user) return;
    setIsSaving(true);
    try {
      const id = await addCalendarEvent(household.id, {
        title: title.trim(),
        startDate: tomorrow,
        endDate: tomorrow,
        allDay: true,
        createdBy: user.uid,
      });
      addEvent({
        id,
        title: title.trim(),
        startDate: tomorrow,
        endDate: tomorrow,
        allDay: true,
        createdBy: user.uid,
      });
      setTitle('');
      setShowModal(false);
    } catch {
      Alert.alert('Error', 'Could not save event.');
    } finally {
      setIsSaving(false);
    }
  }

  function renderEvent({ item }: { item: CalendarEvent }) {
    const isOwn = item.createdBy === user?.uid;
    return (
      <View style={[styles.eventCard, isOwn && styles.eventCardOwn]}>
        <View style={styles.eventDateBadge}>
          <Text style={styles.eventDay}>{item.startDate.getDate()}</Text>
          <Text style={styles.eventMonth}>
            {item.startDate.toLocaleString('en-US', { month: 'short' })}
          </Text>
        </View>
        <View style={styles.eventBody}>
          <Text style={styles.eventTitle}>{item.title}</Text>
          <Text style={styles.eventMeta}>
            {formatDate(item.startDate)}
            {item.endDate.getTime() !== item.startDate.getTime() &&
              ` — ${formatDate(item.endDate)}`}
            {' · '}added by {authorName(item.createdBy)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.header}>
        <Text style={styles.heading}>Calendar</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={sortedEvents}
        keyExtractor={(item) => item.id}
        renderItem={renderEvent}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No events yet. Add one to get started.</Text>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>New Event</Text>
            <TextInput
              style={styles.input}
              placeholder="Event title"
              placeholderTextColor={SUBTEXT}
              value={title}
              onChangeText={setTitle}
              autoFocus
            />
            <View style={styles.sheetActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => { setShowModal(false); setTitle(''); }}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={handleAdd}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  heading: { fontSize: 28, fontWeight: '800', color: TEXT },
  addBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, paddingTop: 8, gap: 10 },
  eventCard: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  eventCardOwn: { borderLeftColor: ACCENT, borderLeftWidth: 3 },
  eventDateBadge: {
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventDay: { fontSize: 22, fontWeight: '800', color: TEXT },
  eventMonth: { fontSize: 11, color: SUBTEXT, fontWeight: '600' },
  eventBody: { flex: 1 },
  eventTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 4 },
  eventMeta: { fontSize: 12, color: SUBTEXT },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 60, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 16 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  input: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    color: TEXT,
    fontSize: 16,
  },
  sheetActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  cancelBtnText: { color: SUBTEXT, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: ACCENT, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
