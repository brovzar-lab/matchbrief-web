import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT,
  CATEGORY_COLORS, CATEGORY_LABELS, CATEGORIES, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';
import type { MemoCategory } from '../lib/config';

const SCREEN_W = Dimensions.get('window').width;
const BAR_AREA_W = SCREEN_W - 64;

function BarChart({ counts }: { counts: Record<MemoCategory, number> }) {
  const maxVal = Math.max(...Object.values(counts), 1);
  const barH = 120;
  const barW = Math.floor((BAR_AREA_W - 48) / 4);

  return (
    <Svg width={BAR_AREA_W} height={barH + 40}>
      {CATEGORIES.map((cat, i) => {
        const count = counts[cat];
        const fillH = maxVal > 0 ? (count / maxVal) * barH : 0;
        const x = i * (barW + 12);
        const y = barH - fillH;
        return (
          <React.Fragment key={cat}>
            <Rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(fillH, 2)}
              rx={6}
              fill={CATEGORY_COLORS[cat]}
              opacity={0.9}
            />
            <SvgText
              x={x + barW / 2}
              y={barH + 16}
              textAnchor="middle"
              fill={SUBTEXT}
              fontSize={11}
              fontWeight="600"
            >
              {CATEGORY_LABELS[cat].slice(0, 4)}
            </SvgText>
            <SvgText
              x={x + barW / 2}
              y={y - 6}
              textAnchor="middle"
              fill={count > 0 ? TEXT : 'transparent'}
              fontSize={12}
              fontWeight="700"
            >
              {count}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

export default function WeeklyReviewScreen() {
  const memos = useStore((s) => s.memos);
  const weeklySummary = useStore((s) => s.weeklySummary);

  const weekCounts = useMemo(() => {
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = memos.filter((m) => new Date(m.createdAt).getTime() > cutoff);
    return CATEGORIES.reduce(
      (acc, cat) => ({ ...acc, [cat]: recent.filter((m) => m.category === cat).length }),
      {} as Record<MemoCategory, number>,
    );
  }, [memos]);

  const counts = weeklySummary?.counts ?? weekCounts;
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const conversionRate = weeklySummary?.conversionRate ?? (() => {
    const actionable = (counts.task ?? 0) + (counts.reminder ?? 0);
    if (actionable === 0) return 0;
    const withDate = memos.filter(
      (m) => (m.category === 'task' || m.category === 'reminder') && m.extractedDate,
    ).length;
    return Math.round((withDate / actionable) * 100);
  })();

  async function handleRefresh() {
    if (isDemoMode) return;
    // getWeeklySummary CF call wired in Firebase integration phase
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.title}>Weekly Review</Text>
        <Text style={styles.subtitle}>
          {new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          {' — '}
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{total}</Text>
            <Text style={styles.statLabel}>Memos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{conversionRate}%</Text>
            <Text style={styles.statLabel}>Date extracted</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{counts.idea ?? 0}</Text>
            <Text style={styles.statLabel}>Ideas</Text>
          </View>
        </View>

        {/* Bar chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>By Category</Text>
          <View style={styles.chartWrap}>
            <BarChart counts={counts} />
          </View>
        </View>

        {/* Category breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.chartTitle}>Breakdown</Text>
          {CATEGORIES.map((cat) => {
            const count = counts[cat] ?? 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            const color = CATEGORY_COLORS[cat];
            return (
              <View key={cat} style={styles.breakdownRow}>
                <View style={styles.breakdownLeft}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={styles.breakdownLabel}>{CATEGORY_LABELS[cat]}</Text>
                </View>
                <View style={styles.breakdownBarWrap}>
                  <View style={[styles.breakdownBar, { width: `${pct}%`, backgroundColor: color }]} />
                </View>
                <Text style={styles.breakdownCount}>{count}</Text>
              </View>
            );
          })}
        </View>

        {!isDemoMode && (
          <TouchableOpacity style={styles.refreshBtn} onPress={handleRefresh}>
            <Text style={styles.refreshBtnText}>Refresh Summary</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG_SECONDARY },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: TEXT, marginTop: 4 },
  subtitle: { fontSize: 14, color: SUBTEXT, marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 26, fontWeight: '800', color: ACCENT },
  statLabel: { fontSize: 11, color: SUBTEXT, marginTop: 2, textAlign: 'center' },
  chartCard: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 16,
  },
  chartWrap: { alignItems: 'center' },
  breakdownCard: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    gap: 14,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: 80,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  breakdownLabel: { fontSize: 13, color: TEXT, fontWeight: '500' },
  breakdownBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: BORDER,
    borderRadius: 4,
    overflow: 'hidden',
  },
  breakdownBar: { height: '100%', borderRadius: 4 },
  breakdownCount: { fontSize: 13, fontWeight: '700', color: TEXT, width: 24, textAlign: 'right' },
  refreshBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  refreshBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
