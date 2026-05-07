import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import {
  DEMO_LEADERBOARD_GLOBAL,
  DEMO_LEADERBOARD_FRIENDS,
  type LeaderEntry,
} from '../lib/mockData';
import type { TabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Leaderboard'>;

const RANK_CONFIGS: Record<
  number,
  { bg: string; color: string; icon?: string }
> = {
  1: { bg: '#FFD700', color: '#0F0F13', icon: '🏆' },
  2: { bg: '#C0C0C0', color: '#0F0F13' },
  3: { bg: '#CD7F32', color: '#0F0F13' },
};

function RankChip({ rank }: { rank: number }) {
  const cfg = RANK_CONFIGS[rank];
  if (cfg) {
    return (
      <View style={[rc.chip, { backgroundColor: cfg.bg }]}>
        {cfg.icon ? (
          <Text style={rc.icon}>{cfg.icon}</Text>
        ) : (
          <Text style={[rc.text, { color: cfg.color }]}>#{rank}</Text>
        )}
      </View>
    );
  }
  return (
    <View style={[rc.chip, { backgroundColor: '#252540' }]}>
      <Text style={rc.textDefault}>#{rank}</Text>
    </View>
  );
}

const rc = StyleSheet.create({
  chip: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: { fontSize: 18 },
  text: { fontSize: 12, fontWeight: '800' },
  textDefault: { fontSize: 12, fontWeight: '700', color: '#8888AA' },
});

function LeaderRow({
  entry,
  accent,
}: {
  entry: LeaderEntry;
  accent: string;
}) {
  const initials = entry.username.slice(0, 2).toUpperCase();
  const trackColor =
    TRACKS[entry.trackId as keyof typeof TRACKS]?.accent ?? '#8888AA';

  return (
    <View
      style={[
        lr.row,
        entry.isCurrentUser && { borderColor: accent, borderWidth: 1.5 },
      ]}
    >
      <RankChip rank={entry.rank} />
      <View style={lr.avatar}>
        <Text style={lr.initials}>{initials}</Text>
      </View>
      <Text
        style={[lr.username, entry.isCurrentUser && { color: '#FFFFFF' }]}
      >
        {entry.username}
      </Text>
      <Text style={lr.score}>{entry.score.toLocaleString()}</Text>
      <View style={[lr.trackDot, { backgroundColor: trackColor }]} />
    </View>
  );
}

const lr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 13, fontWeight: '700', color: '#8888AA' },
  username: { flex: 1, fontSize: 14, fontWeight: '600', color: '#8888AA' },
  score: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  trackDot: { width: 8, height: 8, borderRadius: 4 },
});

export default function LeaderboardScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[track].accent;
  const [tab, setTab] = useState<'global' | 'friends'>('global');
  const entries =
    tab === 'global' ? DEMO_LEADERBOARD_GLOBAL : DEMO_LEADERBOARD_FRIENDS;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <View style={s.header}>
        <Text style={s.title}>Leaderboard</Text>
        <View style={s.tabBar}>
          {(['global', 'friends'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={[
                s.tabBtn,
                tab === t && {
                  borderBottomColor: accent,
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => setTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
            >
              <Text
                style={[s.tabText, tab === t && { color: accent }]}
              >
                {t === 'global' ? 'Global' : 'Friends'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <ScrollView contentContainerStyle={s.list}>
        {entries.map((entry) => (
          <LeaderRow key={entry.rank} entry={entry} accent={accent} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: { fontSize: 15, fontWeight: '600', color: '#8888AA' },
  list: { padding: 16, gap: 8 },
});
