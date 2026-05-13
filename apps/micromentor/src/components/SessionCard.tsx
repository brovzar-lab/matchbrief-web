import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Session } from '../lib/types';
import { CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, MUTED } from '../lib/config';

interface Props {
  session: Session;
  onPress?: () => void;
  variant?: 'today' | 'history';
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Text key={n} style={{ fontSize: 12, color: n <= rating ? '#F59E0B' : MUTED }}>
          ★
        </Text>
      ))}
    </View>
  );
}

export default function SessionCard({ session, onPress, variant = 'history' }: Props) {
  const isToday = variant === 'today';
  const isCompleted = !!session.completedAt;

  const dateLabel = new Date(session.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity
      style={[styles.card, isToday && styles.todayCard]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      {isToday && (
        <View style={styles.todayBadge}>
          <Text style={styles.todayBadgeText}>TODAY'S SESSION</Text>
        </View>
      )}

      <View style={styles.row}>
        <View style={styles.coachAvatar}>
          <Text style={styles.coachEmoji}>🧠</Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={2}>
            {session.title}
          </Text>
          <Text style={styles.date}>{dateLabel}</Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      {isToday && !isCompleted && (
        <View style={styles.ctaRow}>
          <View style={styles.timerChip}>
            <Text style={styles.timerText}>⏱ 5 min</Text>
          </View>
          <Text style={styles.ctaText}>Start Today's Session →</Text>
        </View>
      )}

      {isCompleted && session.rating !== null && (
        <View style={styles.ratingRow}>
          <StarRating rating={session.rating} />
          {session.resonatedText ? (
            <Text style={styles.resonated} numberOfLines={1}>
              "{session.resonatedText}"
            </Text>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    gap: 12,
  },
  todayCard: {
    borderColor: ACCENT,
    borderWidth: 1.5,
  },
  todayBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(245,158,11,0.15)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: ACCENT,
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachEmoji: { fontSize: 22 },
  meta: { flex: 1 },
  title: { fontSize: 15, fontWeight: '600', color: TEXT, lineHeight: 21, marginBottom: 4 },
  date: { fontSize: 12, color: SUBTEXT },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: SUCCESS + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  completedText: { fontSize: 12, color: SUCCESS, fontWeight: '700' },
  ctaRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  timerChip: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  timerText: { fontSize: 12, color: ACCENT, fontWeight: '600' },
  ctaText: { fontSize: 14, color: ACCENT, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stars: { flexDirection: 'row', gap: 1 },
  resonated: { flex: 1, fontSize: 12, color: SUBTEXT, fontStyle: 'italic' },
});
