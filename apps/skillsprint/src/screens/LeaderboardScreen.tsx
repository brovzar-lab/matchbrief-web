import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { getDoc, doc } from 'firebase/firestore';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { db } from '../lib/firebase';
import {
  DEMO_LEADERBOARD_GLOBAL,
  DEMO_LEADERBOARD_FRIENDS,
  type LeaderEntry,
} from '../lib/mockData';
import type { TabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Leaderboard'>;

function getLatestWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

const RANK_CONFIGS: Record<number, { bg: string; color: string; icon?: string }> = {
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

function LeaderRow({ entry, accent }: { entry: LeaderEntry; accent: string }) {
  const initials = entry.username.slice(0, 2).toUpperCase();
  const track = TRACKS[entry.trackId as keyof typeof TRACKS];
  const trackColor = track?.accent ?? '#8888AA';
  const trackLabel = track?.label ?? entry.trackId;

  return (
    <View
      style={[
        lr.row,
        entry.isCurrentUser && {
          borderColor: accent,
          borderWidth: 1.5,
          backgroundColor: accent + '18',
        },
      ]}
    >
      <RankChip rank={entry.rank} />
      <View style={lr.avatar}>
        <Text style={lr.initials}>{initials}</Text>
      </View>
      <View style={lr.info}>
        <Text style={[lr.username, entry.isCurrentUser && { color: '#FFFFFF' }]}>
          {entry.username}
        </Text>
        <View style={lr.trackRow}>
          <View style={[lr.trackDot, { backgroundColor: trackColor }]} />
          <Text style={[lr.trackLabel, { color: trackColor }]}>{trackLabel}</Text>
        </View>
      </View>
      <Text style={lr.score}>{entry.score.toLocaleString()}</Text>
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
  info: { flex: 1, gap: 3 },
  username: { fontSize: 14, fontWeight: '600', color: '#8888AA' },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  trackDot: { width: 6, height: 6, borderRadius: 3 },
  trackLabel: { fontSize: 11, fontWeight: '600' },
  score: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
});

interface FirestoreLeaderEntry {
  rank: number;
  username: string;
  score: number;
  trackId: string;
  uid: string;
}

interface FirestoreLeaderDoc {
  global?: FirestoreLeaderEntry[];
  friends?: FirestoreLeaderEntry[];
}

export default function LeaderboardScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const uid = useStore((s) => s.uid);
  const accent = TRACKS[track].accent;
  const [tab, setTab] = useState<'global' | 'friends'>('global');
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  const [liveGlobal, setLiveGlobal] = useState<LeaderEntry[] | null>(null);
  const [liveFriends, setLiveFriends] = useState<LeaderEntry[] | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    const firestore = db;
    if (isDemoMode || !firestore || !uid) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const weekStart = getLatestWeekStart();
        const snap = await getDoc(doc(firestore, 'leaderboardSnapshots', weekStart));
        if (cancelled) return;
        if (snap.exists()) {
          const data = snap.data() as FirestoreLeaderDoc;
          const toEntries = (arr: FirestoreLeaderEntry[] = []): LeaderEntry[] =>
            arr.map((e) => ({
              rank: e.rank,
              username: e.username,
              score: e.score,
              trackId: e.trackId as LeaderEntry['trackId'],
              isCurrentUser: e.uid === uid,
            }));
          setLiveGlobal(toEntries(data.global ?? []));
          setLiveFriends(toEntries(data.friends ?? []));
        } else {
          setLiveGlobal([]);
          setLiveFriends([]);
        }
      } catch {
        if (!cancelled) {
          setLiveGlobal([]);
          setLiveFriends([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  function switchTab(newTab: 'global' | 'friends') {
    setTab(newTab);
    Animated.spring(indicatorAnim, {
      toValue: newTab === 'global' ? 0 : 1,
      useNativeDriver: false,
      tension: 120,
      friction: 10,
    }).start();
  }

  const globalEntries = isDemoMode ? DEMO_LEADERBOARD_GLOBAL : (liveGlobal ?? []);
  const friendsEntries = isDemoMode ? DEMO_LEADERBOARD_FRIENDS : (liveFriends ?? []);
  const entries = tab === 'global' ? globalEntries : friendsEntries;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <View style={s.header}>
        <Text style={s.title}>Leaderboard</Text>
        <View style={s.tabBar}>
          {(['global', 'friends'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              style={s.tabBtn}
              onPress={() => switchTab(t)}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === t }}
            >
              <Text style={[s.tabText, tab === t && { color: accent }]}>
                {t === 'global' ? 'Global' : 'Friends'}
              </Text>
            </TouchableOpacity>
          ))}
          <Animated.View
            style={[
              s.tabIndicator,
              {
                backgroundColor: accent,
                left: indicatorAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '50%'],
                }),
              },
            ]}
          />
        </View>
      </View>
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={accent} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {entries.length === 0 ? (
            <Text style={s.empty}>No entries yet this week.</Text>
          ) : (
            entries.map((entry) => (
              <LeaderRow key={entry.rank} entry={entry} accent={accent} />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  header: { paddingHorizontal: 20, paddingTop: 16 },
  title: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginBottom: 12 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#8888AA' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '50%',
    height: 2,
    borderRadius: 1,
  },
  list: { padding: 16, gap: 8 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#8888AA', textAlign: 'center', marginTop: 24 },
});
