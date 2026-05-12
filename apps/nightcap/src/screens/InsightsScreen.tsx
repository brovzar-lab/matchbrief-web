import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT, GRAD_START, GRAD_END,
} from '../lib/config';
import { isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { PatternCard } from '../lib/types';

type Range = '7d' | '30d';

function PatternCardView({ card }: { card: PatternCard }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <TouchableOpacity
      style={styles.patternCard}
      onPress={() => setExpanded((v) => !v)}
      activeOpacity={0.8}
    >
      <View style={styles.patternHeader}>
        <Text style={styles.patternEmoji}>{card.emoji}</Text>
        <Text style={styles.patternTitle}>{card.title}</Text>
      </View>
      {expanded && (
        <>
          <Text style={styles.patternBody}>{card.body}</Text>
          <Text style={styles.patternMeta}>
            {new Date(card.dataRange.from).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            {' – '}
            {new Date(card.dataRange.to).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

function PaywallGate({ onUnlock }: { onUnlock: () => void }) {
  return (
    <View style={styles.paywallOverlay}>
      <View style={styles.paywallCard}>
        <Text style={styles.paywallEmoji}>✨</Text>
        <Text style={styles.paywallTitle}>Unlock Your Patterns</Text>
        <Text style={styles.paywallBody}>
          After 14 days of journaling, NightCap detects recurring patterns in your energy, focus, and output.
          Upgrade to see what your data is telling you.
        </Text>
        <TouchableOpacity style={styles.paywallBtn} onPress={onUnlock}>
          <Text style={styles.paywallBtnText}>Start Free Trial — 14 days</Text>
        </TouchableOpacity>
        <Text style={styles.paywallSub}>$7.99/mo or $59.99/yr after trial · Cancel anytime</Text>
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const user = useStore((s) => s.user);
  const patterns = useStore((s) => s.patterns);
  const journals = useStore((s) => s.journals);
  const [range, setRange] = useState<Range>('7d');

  const entryCount = Object.keys(journals).length;
  const hasEnoughData = entryCount >= 14 || isDemoMode;
  const isPremium = user?.tier === 'premium' || isDemoMode;
  const showPaywall = hasEnoughData && !isPremium;

  function handleUpgrade() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'RevenueCat paywall would appear here. In demo mode, premium is unlocked by default.');
      return;
    }
    // Wire RevenueCat purchase in APPU-404
  }

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {isDemoMode && <DemoModeBadge />}
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>Insights</Text>

          {/* Range toggle */}
          <View style={styles.toggleRow}>
            {(['7d', '30d'] as Range[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.toggleBtn, range === r && styles.toggleBtnActive]}
                onPress={() => setRange(r)}
              >
                <Text style={[styles.toggleBtnText, range === r && styles.toggleBtnTextActive]}>
                  {r === '7d' ? 'Last 7 days' : 'Last 30 days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Entry progress */}
          {!hasEnoughData && (
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>Building your pattern baseline…</Text>
              <Text style={styles.progressBody}>
                {entryCount} / 14 days journaled. Pattern cards unlock after 14 days.
              </Text>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (entryCount / 14) * 100)}%` as any }]} />
              </View>
            </View>
          )}

          {/* Pattern Cards */}
          {hasEnoughData && (
            <View style={styles.patternSection}>
              <Text style={styles.sectionLabel}>Pattern Cards · {patterns.length} detected</Text>
              {patterns.map((card) => (
                <PatternCardView key={card.id} card={card} />
              ))}
              {patterns.length === 0 && (
                <View style={styles.emptyPatterns}>
                  <Text style={styles.emptyPatternsText}>
                    Patterns are generated periodically. Check back soon.
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Paywall overlay */}
          {showPaywall && <PaywallGate onUnlock={handleUpgrade} />}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 26, fontWeight: '700', color: TEXT, marginTop: 8, marginBottom: 20 },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
  },
  toggleBtnActive: { backgroundColor: ACCENT + '33', borderColor: ACCENT },
  toggleBtnText: { color: SUBTEXT, fontWeight: '600', fontSize: 14 },
  toggleBtnTextActive: { color: ACCENT_LIGHT },
  progressCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 20,
  },
  progressTitle: { fontSize: 16, fontWeight: '700', color: TEXT, marginBottom: 6 },
  progressBody: { fontSize: 14, color: SUBTEXT, marginBottom: 12 },
  progressTrack: { height: 4, backgroundColor: BORDER, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, backgroundColor: ACCENT, borderRadius: 2 },
  patternSection: { gap: 12 },
  sectionLabel: { fontSize: 12, fontWeight: '600', color: SUBTEXT, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  patternCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
  },
  patternHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  patternEmoji: { fontSize: 24 },
  patternTitle: { flex: 1, fontSize: 16, fontWeight: '700', color: TEXT },
  patternBody: { fontSize: 14, color: SUBTEXT, lineHeight: 22, marginTop: 14 },
  patternMeta: { fontSize: 12, color: ACCENT + 'AA', marginTop: 10 },
  paywallOverlay: { marginTop: 20 },
  paywallCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ACCENT + '44',
    padding: 28,
    alignItems: 'center',
  },
  paywallEmoji: { fontSize: 44, marginBottom: 14 },
  paywallTitle: { fontSize: 22, fontWeight: '700', color: TEXT, marginBottom: 10, textAlign: 'center' },
  paywallBody: { fontSize: 14, color: SUBTEXT, lineHeight: 21, textAlign: 'center', marginBottom: 24 },
  paywallBtn: { backgroundColor: ACCENT, borderRadius: 14, padding: 16, width: '100%', alignItems: 'center', marginBottom: 12 },
  paywallBtnText: { color: TEXT, fontWeight: '700', fontSize: 15 },
  paywallSub: { fontSize: 12, color: SUBTEXT, textAlign: 'center' },
  emptyPatterns: { backgroundColor: CARD, borderRadius: 12, borderWidth: 1, borderColor: BORDER, padding: 20 },
  emptyPatternsText: { color: SUBTEXT, fontSize: 14, textAlign: 'center' },
});
