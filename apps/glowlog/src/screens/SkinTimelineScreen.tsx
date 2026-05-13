import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, DANGER, isDemoMode,
  FREE_SKIN_CHECK_LIMIT,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function SkinTimelineScreen() {
  const nav = useNavigation<Nav>();
  const { skinChecks, addSkinCheck, user, isDemo, rcPremiumActive } = useStore();

  const [showAdd, setShowAdd] = useState(false);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const isPremium = rcPremiumActive || user?.isPremium;
  const hitFreeLimit = !isPremium && skinChecks.length >= FREE_SKIN_CHECK_LIMIT;

  function handleAddPress() {
    if (hitFreeLimit) {
      nav.navigate('Paywall');
      return;
    }
    setShowAdd(true);
  }

  async function handleSaveCheck() {
    const check = {
      id: `check-${Date.now()}`,
      photoUrl: null,
      date: new Date().toISOString().split('T')[0],
      notes: notes.trim(),
    };

    if (isDemo) {
      showToast('Demo mode — not saved');
      addSkinCheck(check);
      setShowAdd(false);
      setNotes('');
      return;
    }

    setSaving(true);
    try {
      const { getFirestore: getDbInstance } = await import('../lib/firebase');
      const db = await getDbInstance();
      if (!db || !user) return;

      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid, 'skinChecks', check.id), check);
      addSkinCheck(check);
      setShowAdd(false);
      setNotes('');
    } catch {
      Alert.alert('Error', 'Could not save skin check.');
    } finally {
      setSaving(false);
    }
  }

  const sorted = [...skinChecks].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {isDemoMode && <DemoModeBadge />}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Skin Timeline</Text>
          <TouchableOpacity style={styles.addBtn} onPress={handleAddPress}>
            <Text style={styles.addBtnText}>+ This Week</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitle}>
          {isPremium
            ? `${skinChecks.length} skin check${skinChecks.length !== 1 ? 's' : ''} logged`
            : `${skinChecks.length} / ${FREE_SKIN_CHECK_LIMIT} free`}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {sorted.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📸</Text>
            <Text style={styles.emptyText}>No skin checks yet.</Text>
            <Text style={styles.emptySub}>Log your first one to start tracking your glow journey.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={handleAddPress}>
              <Text style={styles.ctaBtnText}>Add First Check</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {sorted.map((check, index) => {
              const isLocked = !isPremium && index >= FREE_SKIN_CHECK_LIMIT;
              return (
                <View key={check.id} style={styles.gridItem}>
                  {isLocked ? (
                    <View style={[styles.photoPlaceholder, styles.lockedPhoto]}>
                      <Text style={styles.lockIcon}>🔒</Text>
                      <Text style={styles.lockText}>Premium</Text>
                    </View>
                  ) : check.photoUrl ? (
                    <Image
                      source={{ uri: check.photoUrl }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.photoPlaceholder}>
                      <Text style={styles.photoEmoji}>📸</Text>
                    </View>
                  )}
                  <Text style={styles.checkDate}>
                    {new Date(check.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </Text>
                  {check.notes ? (
                    <Text style={styles.checkNotes} numberOfLines={2}>{check.notes}</Text>
                  ) : null}
                </View>
              );
            })}
          </View>
        )}

        {/* Paywall upsell if near limit */}
        {!isPremium && skinChecks.length >= FREE_SKIN_CHECK_LIMIT - 1 && (
          <TouchableOpacity
            style={styles.upsellBanner}
            onPress={() => nav.navigate('Paywall')}
          >
            <Text style={styles.upsellTitle}>🌟 Unlock Unlimited Skin Checks</Text>
            <Text style={styles.upsellSub}>
              Upgrade to GlowLog Premium for unlimited tracking + product reports.
            </Text>
            <Text style={styles.upsellCta}>See Premium →</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Add check modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>This Week's Check</Text>
            <TouchableOpacity onPress={handleSaveCheck} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.btnDisabled]}>
                {saving ? 'Saving…' : 'Log'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.photoUploadArea}>
              <Text style={styles.photoUploadEmoji}>📷</Text>
              <Text style={styles.photoUploadText}>Photo upload coming soon</Text>
              <Text style={styles.photoUploadSub}>For now, add notes about your skin this week.</Text>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Notes</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="How does your skin look and feel this week?"
                placeholderTextColor={MUTED}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: TEXT },
  subtitle: { fontSize: 13, color: SUBTEXT },
  addBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  scroll: { padding: 20, paddingBottom: 40 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 18, fontWeight: '700', color: TEXT },
  emptySub: { fontSize: 14, color: SUBTEXT, textAlign: 'center', lineHeight: 20 },
  ctaBtn: { backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  ctaBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { width: '47%', gap: 6 },
  photo: { width: '100%', aspectRatio: 1, borderRadius: 12 },
  photoPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  lockedPhoto: { backgroundColor: MUTED + '33' },
  photoEmoji: { fontSize: 32 },
  lockIcon: { fontSize: 28 },
  lockText: { fontSize: 11, color: MUTED, fontWeight: '600' },
  checkDate: { fontSize: 12, fontWeight: '700', color: TEXT },
  checkNotes: { fontSize: 11, color: SUBTEXT, lineHeight: 16 },
  upsellBanner: {
    marginTop: 24,
    backgroundColor: ACCENT_DIM,
    borderRadius: 16,
    padding: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: ACCENT,
  },
  upsellTitle: { fontSize: 15, fontWeight: '700', color: TEXT },
  upsellSub: { fontSize: 13, color: SUBTEXT, lineHeight: 20 },
  upsellCta: { fontSize: 14, fontWeight: '700', color: ACCENT },
  modalSafe: { flex: 1, backgroundColor: BG },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalCancel: { fontSize: 15, color: SUBTEXT },
  modalTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  modalSave: { fontSize: 15, fontWeight: '700', color: ACCENT },
  btnDisabled: { opacity: 0.5 },
  modalScroll: { padding: 20, gap: 24 },
  photoUploadArea: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  photoUploadEmoji: { fontSize: 40 },
  photoUploadText: { fontSize: 15, fontWeight: '600', color: TEXT },
  photoUploadSub: { fontSize: 12, color: SUBTEXT, textAlign: 'center' },
  formGroup: { gap: 10 },
  formLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT,
  },
  notesInput: { minHeight: 100, textAlignVertical: 'top' },
});
