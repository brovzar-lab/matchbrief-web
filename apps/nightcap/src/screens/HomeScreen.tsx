import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT,
  GRAD_START, GRAD_END, DIM_COLORS, DIMENSIONS,
} from '../lib/config';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/config';
import DemoModeBadge from '../components/DemoModeBadge';
import RadarChart from '../components/RadarChart';
import type { TabParamList } from '../navigation/RootNavigator';
import type { Ratings } from '../lib/types';

const SCREEN_W = Dimensions.get('window').width;

const EMPTY_RATINGS: Ratings = { energy: 0, mood: 0, focus: 0, social: 0, output: 0 };

const DIM_LABELS: Record<keyof Ratings, string> = {
  energy: 'Energy', mood: 'Mood', focus: 'Focus', social: 'Social', output: 'Output',
};

function Sparkline({ values, color }: { values: number[]; color: string }) {
  const w = 64, h = 28;
  const max = 10, min = 0;
  if (values.length < 2) return null;
  const step = w / (values.length - 1);
  const pts = values
    .map((v, i) => `${i * step},${h - ((v - min) / (max - min)) * h}`)
    .join(' ');
  const { Svg, Polyline } = require('react-native-svg');
  return (
    <Svg width={w} height={h}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function HomeScreen() {
  const journals = useStore((s) => s.journals);
  const user = useStore((s) => s.user);
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();

  const today = new Date().toISOString().split('T')[0];
  const todayEntry = journals[today];

  const last7 = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }
    return days.map((d) => journals[d] ?? null);
  }, [journals]);

  const hasToday = !!todayEntry;
  const displayRatings = todayEntry?.ratings ?? EMPTY_RATINGS;

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {isDemoMode && <DemoModeBadge />}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Good evening, {user?.displayName?.split(' ')[0] ?? 'there'}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
          </View>

          {/* Radar Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{hasToday ? "Today's Balance" : "No entry yet today"}</Text>
            <View style={styles.radarWrap}>
              <RadarChart ratings={displayRatings} size={220} />
            </View>
            {!hasToday && (
              <Text style={styles.noEntryHint}>Record tonight's debrief to see your radar</Text>
            )}
          </View>

          {/* 7-Day Sparklines */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>This Week</Text>
            <View style={styles.sparkGrid}>
              {DIMENSIONS.map((dim) => {
                const vals = last7.map((e) => e?.ratings[dim] ?? 0);
                return (
                  <View key={dim} style={styles.sparkCell}>
                    <View style={styles.sparkRow}>
                      <Sparkline values={vals} color={DIM_COLORS[dim]} />
                    </View>
                    <Text style={[styles.sparkLabel, { color: DIM_COLORS[dim] }]}>
                      {DIM_LABELS[dim]}
                    </Text>
                    <Text style={styles.sparkAvg}>
                      avg {(vals.reduce((a, b) => a + b, 0) / vals.filter(Boolean).length || 0).toFixed(1)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, hasToday && styles.ctaBtnDone]}
            onPress={() => nav.navigate('Record')}
          >
            <Text style={styles.ctaBtnText}>
              {hasToday ? '✓  Tonight\'s Debrief Done' : '🎙  Start Tonight\'s Debrief'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 20, marginTop: 8 },
  greeting: { fontSize: 24, fontWeight: '700', color: TEXT },
  date: { fontSize: 14, color: SUBTEXT, marginTop: 4 },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: SUBTEXT, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.8 },
  radarWrap: { alignItems: 'center', paddingVertical: 8 },
  noEntryHint: { textAlign: 'center', color: SUBTEXT, fontSize: 13, marginTop: 8 },
  sparkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sparkCell: { width: (SCREEN_W - 88) / 3, alignItems: 'flex-start' },
  sparkRow: { marginBottom: 4 },
  sparkLabel: { fontSize: 12, fontWeight: '600' },
  sparkAvg: { fontSize: 11, color: SUBTEXT },
  ctaBtn: {
    backgroundColor: ACCENT,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 4,
  },
  ctaBtnDone: { backgroundColor: '#22C55E33', borderWidth: 1, borderColor: '#22C55E' },
  ctaBtnText: { color: TEXT, fontWeight: '700', fontSize: 17 },
});
