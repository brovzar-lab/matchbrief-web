import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import RadarChart from '../components/RadarChart';
import SessionCard from '../components/SessionCard';
import DemoModeBadge from '../components/DemoModeBadge';

export default function ProgressScreen() {
  const user = useStore((s) => s.user);
  const sessions = useStore((s) => s.sessions);

  const completedSessions = sessions.filter((s) => s.completedAt);

  const avgRating =
    completedSessions.length > 0
      ? (
          completedSessions.reduce((sum, s) => sum + (s.rating ?? 0), 0) /
          completedSessions.length
        ).toFixed(1)
      : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.pageTitle}>Your Progress</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.currentStreak ?? 0}</Text>
            <Text style={styles.statLabel}>Day Streak 🔥</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedSessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          {avgRating && (
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{avgRating}</Text>
              <Text style={styles.statLabel}>Avg Rating ★</Text>
            </View>
          )}
        </View>

        {/* Radar chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CAREER DIMENSIONS</Text>
          <View style={styles.radarCard}>
            {user?.dimensions ? (
              <RadarChart dimensions={user.dimensions} />
            ) : (
              <View style={styles.radarPlaceholder}>
                <Text style={styles.radarPlaceholderText}>
                  Complete onboarding to see your dimensions
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Session history */}
        {completedSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SESSION HISTORY</Text>
            <View style={styles.sessionList}>
              {completedSessions.map((s) => (
                <SessionCard key={s.id} session={s} variant="history" />
              ))}
            </View>
          </View>
        )}

        {completedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🌱</Text>
            <Text style={styles.emptyText}>
              Your progress radar will populate as you complete sessions. Start your first one on the Today tab.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  pageTitle: { fontSize: 24, fontWeight: '800', color: TEXT },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 26, fontWeight: '800', color: ACCENT },
  statLabel: { fontSize: 11, color: SUBTEXT, textAlign: 'center' },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  radarCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    alignItems: 'center',
  },
  radarPlaceholder: { padding: 40, alignItems: 'center' },
  radarPlaceholderText: { fontSize: 14, color: SUBTEXT, textAlign: 'center' },
  sessionList: { gap: 10 },
  emptyState: { alignItems: 'center', paddingTop: 20, gap: 12 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: SUBTEXT, textAlign: 'center', lineHeight: 22 },
});
