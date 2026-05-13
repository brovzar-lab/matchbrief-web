import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CARD, BORDER, TEXT, SUBTEXT, CATEGORY_COLORS } from '../lib/config';
import { Memo } from '../lib/types';
import CategoryChip from './CategoryChip';

interface Props {
  memo: Memo;
  onPress: () => void;
}

function formatRelative(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function MemoCard({ memo, onPress }: Props) {
  const accent = CATEGORY_COLORS[memo.category];

  return (
    <TouchableOpacity style={[styles.card, { borderLeftColor: accent }]} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <CategoryChip category={memo.category} size="sm" />
        <Text style={styles.time}>{formatRelative(memo.createdAt)}</Text>
      </View>
      <Text style={styles.text} numberOfLines={3}>
        {memo.text}
      </Text>
      {memo.extractedDate && (
        <Text style={styles.dueDate}>
          ⏰ {new Date(memo.extractedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    borderLeftWidth: 3,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: TEXT,
    lineHeight: 20,
  },
  time: {
    fontSize: 11,
    color: SUBTEXT,
  },
  dueDate: {
    fontSize: 12,
    color: SUBTEXT,
    fontWeight: '500',
  },
});
