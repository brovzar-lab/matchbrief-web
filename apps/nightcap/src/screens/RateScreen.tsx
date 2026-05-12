import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, GRAD_START, GRAD_END,
  DIM_COLORS, DIMENSIONS,
} from '../lib/config';
import { isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { TabParamList } from '../navigation/RootNavigator';
import type { Ratings } from '../lib/types';

const DIM_LABELS: Record<keyof Ratings, string> = {
  energy: 'Energy', mood: 'Mood', focus: 'Focus', social: 'Social', output: 'Output',
};
const DIM_EMOJI: Record<keyof Ratings, string> = {
  energy: '⚡', mood: '😊', focus: '🎯', social: '🤝', output: '🚀',
};
const DIM_HINTS: Record<keyof Ratings, [string, string]> = {
  energy: ['Drained', 'Charged'],
  mood: ['Low', 'Thriving'],
  focus: ['Scattered', 'Locked in'],
  social: ['Isolated', 'Connected'],
  output: ['Blocked', 'Flowing'],
};

function HapticSlider({ dim, value, onChange }: { dim: keyof Ratings; value: number; onChange: (v: number) => void }) {
  const color = DIM_COLORS[dim];
  const TICKS = Array.from({ length: 10 }, (_, i) => i + 1);

  async function tap(v: number) {
    if (Platform.OS !== 'web') {
      try {
        const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
        await impactAsync(ImpactFeedbackStyle.Light);
      } catch {}
    }
    onChange(v);
  }

  return (
    <View style={styles.sliderCard}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderEmoji}>{DIM_EMOJI[dim]}</Text>
        <Text style={styles.sliderLabel}>{DIM_LABELS[dim]}</Text>
        <Text style={[styles.sliderValue, { color }]}>{value || '—'}</Text>
      </View>
      <View style={styles.tickRow}>
        {TICKS.map((t) => (
          <TouchableOpacity key={t} onPress={() => tap(t)} style={styles.tickWrap}>
            <View
              style={[
                styles.tick,
                t <= value && { backgroundColor: color, transform: [{ scaleY: 1 + (t / 10) * 0.6 }] },
                t === value && styles.tickActive,
              ]}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.hintRow}>
        <Text style={styles.hint}>{DIM_HINTS[dim][0]}</Text>
        <Text style={styles.hint}>{DIM_HINTS[dim][1]}</Text>
      </View>
    </View>
  );
}

export default function RateScreen() {
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const upsertJournal = useStore((s) => s.upsertJournal);
  const pendingTranscript = useStore((s) => s.pendingTranscript);
  const pendingTags = useStore((s) => s.pendingTags);

  const [ratings, setRatings] = useState<Ratings>({ energy: 0, mood: 0, focus: 0, social: 0, output: 0 });

  const allRated = DIMENSIONS.every((d) => ratings[d] > 0);

  function setDim(dim: keyof Ratings, v: number) {
    setRatings((prev) => ({ ...prev, [dim]: v }));
  }

  function handleNext() {
    if (!allRated) return;
    // Store ratings temporarily — ReviewScreen will finalize the entry
    useStore.setState({ pendingTranscript: pendingTranscript, pendingTags: pendingTags });
    // Pass ratings via navigation state isn't great — store them directly
    useStore.setState((s) => ({
      journals: {
        ...s.journals,
        [new Date().toISOString().split('T')[0]]: {
          date: new Date().toISOString().split('T')[0],
          transcript: pendingTranscript,
          tags: pendingTags,
          ratings,
          createdAt: new Date().toISOString(),
        },
      },
    }));
    nav.navigate('Review');
  }

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {isDemoMode && <DemoModeBadge />}
        <Text style={styles.title}>Rate Your Day</Text>
        <Text style={styles.subtitle}>How did today feel across 5 dimensions?</Text>
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {DIMENSIONS.map((dim) => (
            <HapticSlider key={dim} dim={dim} value={ratings[dim]} onChange={(v) => setDim(dim, v)} />
          ))}
          <View style={{ height: 24 }} />
        </ScrollView>
        <TouchableOpacity
          style={[styles.nextBtn, !allRated && styles.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!allRated}
        >
          <Text style={styles.nextBtnText}>Next: Review →</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, padding: 20 },
  title: { fontSize: 26, fontWeight: '700', color: TEXT, marginTop: 8 },
  subtitle: { fontSize: 14, color: SUBTEXT, marginTop: 4, marginBottom: 20 },
  scroll: { flex: 1 },
  scrollContent: { gap: 12 },
  sliderCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  sliderHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sliderEmoji: { fontSize: 20 },
  sliderLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: TEXT },
  sliderValue: { fontSize: 22, fontWeight: '700', minWidth: 28, textAlign: 'right' },
  tickRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 36 },
  tickWrap: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'flex-end' },
  tick: { width: '100%', height: 14, borderRadius: 3, backgroundColor: BORDER },
  tickActive: { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },
  hintRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  hint: { fontSize: 11, color: SUBTEXT },
  nextBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 12 },
  nextBtnDisabled: { opacity: 0.4 },
  nextBtnText: { color: TEXT, fontWeight: '700', fontSize: 16 },
});
