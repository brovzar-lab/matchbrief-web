import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import type { Recipient } from '../lib/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Recipients'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function RecipientsScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { legacy } = route.params;

  const allRecipients = useStore((s) => s.recipients);
  const addRecipient = useStore((s) => s.addRecipient);
  const updateLegacy = useStore((s) => s.updateLegacy);

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set(legacy.recipients.map((r) => r.id))
  );
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [showAddForm, setShowAddForm] = React.useState(false);

  function toggleRecipient(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleAddNew() {
    if (!newName.trim() || !newEmail.trim()) {
      Alert.alert('Required', 'Please enter both name and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      Alert.alert('Invalid email', 'Please enter a valid email address.');
      return;
    }
    const newR: Recipient = {
      id: Date.now().toString(),
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
    };
    addRecipient(newR);
    setSelectedIds((prev) => new Set([...prev, newR.id]));
    setNewName('');
    setNewEmail('');
    setShowAddForm(false);
  }

  function handleSave() {
    const selected = allRecipients.filter((r) => selectedIds.has(r.id));
    if (isDemoMode) {
      Alert.alert('Demo Mode', `Would assign ${selected.length} recipient(s) in the real app.`);
      nav.goBack();
      return;
    }
    updateLegacy(legacy.id, { recipients: selected });
    nav.goBack();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Recipients</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={allRecipients}
        keyExtractor={(r) => r.id}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <Text style={styles.listHeaderText}>
              Who should receive this legacy?
            </Text>
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowAddForm((v) => !v)}
            >
              <Text style={styles.addBtnText}>+ Add Recipient</Text>
            </TouchableOpacity>

            {showAddForm && (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={SUBTEXT}
                  value={newName}
                  onChangeText={setNewName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor={SUBTEXT}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity style={styles.confirmAddBtn} onPress={handleAddNew}>
                  <Text style={styles.confirmAddBtnText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.recipientRow, selectedIds.has(item.id) && styles.recipientRowSelected]}
            onPress={() => toggleRecipient(item.id)}
          >
            <View style={[styles.checkbox, selectedIds.has(item.id) && styles.checkboxChecked]}>
              {selectedIds.has(item.id) && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <View style={styles.recipientInfo}>
              <Text style={styles.recipientName}>{item.name}</Text>
              <Text style={styles.recipientEmail}>{item.email}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recipients yet. Add one above.</Text>
          </View>
        }
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backText: { color: SUBTEXT, fontSize: 16 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  doneText: { color: ACCENT, fontSize: 16, fontWeight: '600' },
  list: { padding: 16, gap: 8 },
  listHeader: { marginBottom: 16, gap: 12 },
  listHeaderText: { fontSize: 15, color: SUBTEXT },
  addBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  addBtnText: { color: ACCENT, fontWeight: '600', fontSize: 15 },
  addForm: { gap: 10, marginTop: 4 },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 10,
    padding: 12,
    color: TEXT,
    fontSize: 15,
  },
  confirmAddBtn: {
    backgroundColor: ACCENT,
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
  confirmAddBtnText: { color: '#fff', fontWeight: '700' },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    gap: 14,
  },
  recipientRowSelected: { borderColor: ACCENT },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: ACCENT, borderColor: ACCENT },
  checkmark: { color: '#fff', fontWeight: '700', fontSize: 14 },
  recipientInfo: { flex: 1 },
  recipientName: { fontSize: 16, fontWeight: '600', color: TEXT },
  recipientEmail: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  empty: { paddingTop: 40, alignItems: 'center' },
  emptyText: { color: SUBTEXT, fontSize: 15 },
});
