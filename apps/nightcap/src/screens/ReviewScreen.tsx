import React, { useState } from 'react';
import {
  View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet,
  Alert, ToastAndroid, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT, GRAD_START, GRAD_END, SUCCESS,
} from '../lib/config';
import { isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { TabParamList } from '../navigation/RootNavigator';

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function ReviewScreen() {
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const journals = useStore((s) => s.journals);
  const upsertJournal = useStore((s) => s.upsertJournal);
  const clearPending = useStore((s) => s.clearPending);

  const today = new Date().toISOString().split('T')[0];
  const entry = journals[today];

  const [transcript, setTranscript] = useState(entry?.transcript ?? '');
  const [tags, setTags] = useState<string[]>(entry?.tags ?? []);
  const [newTag, setNewTag] = useState('');
  const [saved, setSaved] = useState(false);

  function addTag() {
    const t = newTag.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setNewTag('');
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleSave() {
    if (!entry) return;
    if (isDemoMode) {
      upsertJournal({ ...entry, transcript, tags });
      clearPending();
      setSaved(true);
      showToast('Demo mode — not saved to backend');
      setTimeout(() => nav.navigate('Home'), 800);
      return;
    }
    // Real Firestore save wired in APPU-403
    try {
      upsertJournal({ ...entry, transcript, tags });
      clearPending();
      setSaved(true);
      setTimeout(() => nav.navigate('Home'), 800);
    } catch (err: any) {
      Alert.alert('Save failed', err.message ?? 'Please try again.');
    }
  }

  if (!entry) {
    return (
      <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
          {isDemoMode && <DemoModeBadge />}
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>No entry yet</Text>
            <Text style={styles.emptyBody}>Record tonight's debrief first, then rate your day.</Text>
            <TouchableOpacity style={styles.ctaBtn} onPress={() => nav.navigate('Record')}>
              <Text style={styles.ctaBtnText}>Start Recording →</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {isDemoMode && <DemoModeBadge />}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Review</Text>
          <Text style={styles.subtitle}>Edit your transcript and tags before saving</Text>

          {/* Transcript */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Transcript</Text>
            <TextInput
              style={styles.transcriptInput}
              value={transcript}
              onChangeText={setTranscript}
              multiline
              placeholderTextColor={SUBTEXT}
              placeholder="Your spoken debrief will appear here…"
            />
          </View>

          {/* Tags */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>AI Tags</Text>
            <View style={styles.tagWrap}>
              {tags.map((tag) => (
                <TouchableOpacity key={tag} onPress={() => removeTag(tag)} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag} ×</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.tagInputRow}>
              <TextInput
                style={styles.tagInput}
                value={newTag}
                onChangeText={setNewTag}
                onSubmitEditing={addTag}
                placeholder="Add tag…"
                placeholderTextColor={SUBTEXT}
                returnKeyType="done"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={addTag} style={styles.addTagBtn}>
                <Text style={styles.addTagBtnText}>+ Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ratings summary */}
          {entry.ratings && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Ratings</Text>
              <View style={styles.ratingRow}>
                {(['energy', 'mood', 'focus', 'social', 'output'] as const).map((d) => (
                  <View key={d} style={styles.ratingCell}>
                    <Text style={styles.ratingVal}>{entry.ratings[d]}</Text>
                    <Text style={styles.ratingDim}>{d.charAt(0).toUpperCase() + d.slice(1)}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>

        <TouchableOpacity
          style={[styles.saveBtn, saved && styles.saveBtnDone]}
          onPress={saved ? undefined : handleSave}
        >
          <Text style={styles.saveBtnText}>{saved ? '✓  Saved' : 'Save Entry'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  scroll: { paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: TEXT, marginTop: 8 },
  subtitle: { fontSize: 14, color: SUBTEXT, marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 14,
  },
  cardLabel: { fontSize: 12, fontWeight: '600', color: SUBTEXT, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  transcriptInput: {
    color: TEXT,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  tag: {
    backgroundColor: ACCENT + '22',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ACCENT + '55',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  tagText: { color: ACCENT_LIGHT, fontSize: 13 },
  tagInputRow: { flexDirection: 'row', gap: 8 },
  tagInput: {
    flex: 1,
    backgroundColor: BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 10,
    color: TEXT,
    fontSize: 14,
  },
  addTagBtn: {
    backgroundColor: ACCENT + '33',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: ACCENT,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  addTagBtnText: { color: ACCENT_LIGHT, fontWeight: '600', fontSize: 13 },
  ratingRow: { flexDirection: 'row', justifyContent: 'space-between' },
  ratingCell: { alignItems: 'center' },
  ratingVal: { fontSize: 22, fontWeight: '700', color: ACCENT_LIGHT },
  ratingDim: { fontSize: 11, color: SUBTEXT, marginTop: 2 },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 18, alignItems: 'center' },
  saveBtnDone: { backgroundColor: '#22C55E33', borderWidth: 1, borderColor: SUCCESS },
  saveBtnText: { color: TEXT, fontWeight: '700', fontSize: 16 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  emptyEmoji: { fontSize: 52, marginBottom: 16 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 8 },
  emptyBody: { fontSize: 15, color: SUBTEXT, textAlign: 'center', marginBottom: 28 },
  ctaBtn: { backgroundColor: ACCENT, borderRadius: 12, padding: 16, alignItems: 'center' },
  ctaBtnText: { color: TEXT, fontWeight: '700', fontSize: 15 },
});
