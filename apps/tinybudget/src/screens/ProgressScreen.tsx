import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useStore, useUnallocated } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { colors } from '../lib/colors';
import type { Category } from '../lib/types';

function formatCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function daysRemainingInMonth(): number {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return lastDay - now.getDate();
}

interface DonutProps {
  categories: Category[];
  income: number;
  size?: number;
}

function DonutChart({ categories, income, size = 180 }: DonutProps) {
  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  const allocated = categories.filter((c) => c.allocated > 0);
  const totalAlloc = allocated.reduce((s, c) => s + c.allocated, 0);
  const unallocated = Math.max(0, income - totalAlloc);

  const segments: Array<{ color: string; pct: number; label: string }> = [
    ...allocated.map((c) => ({
      color: c.color,
      pct: income > 0 ? c.allocated / income : 0,
      label: c.name,
    })),
  ];
  if (unallocated > 0 && income > 0) {
    segments.push({ color: colors.unallocated, pct: unallocated / income, label: 'Unallocated' });
  }

  let runningOffset = 0;
  const segmentsWithOffsets = segments.map((seg) => {
    const dash = seg.pct * circumference;
    const gap = circumference - dash;
    const dashOffset = -runningOffset * circumference;
    runningOffset += seg.pct;
    return { ...seg, dash, gap, dashOffset };
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${cx},${cy}`}>
          {segmentsWithOffsets.map((seg, i) => (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={22}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={seg.dashOffset}
            />
          ))}
          {/* Center hole white fill */}
          <Circle cx={cx} cy={cy} r={r - 22} fill={colors.bg} />
        </G>
        <G>
          <Circle cx={cx} cy={cy} r={r - 11} fill="none" stroke={colors.border} strokeWidth={0.5} />
        </G>
      </Svg>
    </View>
  );
}

export default function ProgressScreen() {
  const budget = useStore((s) => s.budget);
  const categories = useStore((s) => s.categories);
  const unallocated = useUnallocated();

  const totalAllocated = budget.income - unallocated;
  const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
  const allocatedPct = budget.income > 0 ? Math.round((totalAllocated / budget.income) * 100) : 0;
  const spentPct = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;
  const daysLeft = daysRemainingInMonth();

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO MODE</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.monthTitle}>{budget.monthYear || 'Progress'}</Text>

        {/* Donut + center stats */}
        <View style={styles.chartSection}>
          <DonutChart categories={categories} income={budget.income} />

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{allocatedPct}%</Text>
              <Text style={styles.statLabel}>Allocated</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={[styles.statValue, spentPct > 90 && styles.statValueWarn]}>{spentPct}%</Text>
              <Text style={styles.statLabel}>Spent</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{daysLeft}</Text>
              <Text style={styles.statLabel}>Days left</Text>
            </View>
          </View>
        </View>

        {/* Summary row */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryValue}>{formatCurrency(budget.income)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Allocated</Text>
            <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatCurrency(totalAllocated)}</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Spent</Text>
            <Text style={[styles.summaryValue, { color: spentPct > 90 ? colors.warning : colors.text }]}>{formatCurrency(totalSpent)}</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>BY CATEGORY</Text>

        {categories.map((cat) => {
          const pct = cat.allocated > 0 ? Math.min((cat.spent / cat.allocated) * 100, 100) : 0;
          const isOver = cat.spent > cat.allocated;
          return (
            <View key={cat.id} style={styles.catCard}>
              <View style={styles.catHeader}>
                <Text style={styles.catEmoji}>{cat.emoji}</Text>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={[styles.catPct, isOver && styles.catPctOver]}>{Math.round(pct)}%</Text>
              </View>
              <View style={styles.catBar}>
                <View
                  style={[
                    styles.catFill,
                    { width: `${pct}%` as `${number}%`, backgroundColor: isOver ? colors.danger : cat.color },
                  ]}
                />
              </View>
              <View style={styles.catFooter}>
                <Text style={styles.catSpent}>{formatCurrency(cat.spent)} spent</Text>
                <Text style={styles.catAlloc}>{formatCurrency(cat.allocated)} budgeted</Text>
              </View>
            </View>
          );
        })}

        {/* Legend */}
        {categories.length > 0 && (
          <View style={styles.legend}>
            {categories.map((c) => (
              <View key={c.id} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: c.color }]} />
                <Text style={styles.legendLabel}>{c.name}</Text>
              </View>
            ))}
            {unallocated > 0 && (
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: colors.unallocated }]} />
                <Text style={styles.legendLabel}>Unallocated</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  demoBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  monthTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 16 },
  chartSection: { alignItems: 'center', marginBottom: 20 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: { fontSize: 24, fontWeight: '800', color: colors.text },
  statValueWarn: { color: colors.warning },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2, fontWeight: '600' },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', marginBottom: 4 },
  summaryValue: { fontSize: 17, fontWeight: '800', color: colors.text },
  summaryDivider: { width: 1, height: 36, backgroundColor: colors.border },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textLight, letterSpacing: 0.8, marginBottom: 10 },
  catCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  catHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  catEmoji: { fontSize: 18 },
  catName: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  catPct: { fontSize: 13, fontWeight: '700', color: colors.primary },
  catPctOver: { color: colors.danger },
  catBar: { height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  catFill: { height: '100%', borderRadius: 4 },
  catFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  catSpent: { fontSize: 12, color: colors.textMuted },
  catAlloc: { fontSize: 12, color: colors.textLight },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontSize: 12, color: colors.textMuted },
});
