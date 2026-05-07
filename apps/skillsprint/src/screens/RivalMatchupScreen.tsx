import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { db } from '../lib/firebase';
import { DEMO_RIVAL } from '../lib/mockData';
import type { Difficulty } from '../lib/mockData';
import type { TabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Rival'>;

function getThisMonday(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().slice(0, 10);
}

interface RivalData {
  weekRange: string;
  userScore: number;
  rivalName: string;
  rivalScore: number;
  userWins: number;
  userLosses: number;
  rivalWins: number;
  rivalLosses: number;
  sharedChallenge?: { title: string; difficulty: Difficulty };
}

interface FirestoreRivalDoc {
  userA: string;
  userB: string;
  usernameA: string;
  usernameB: string;
  scoreA: number;
  scoreB: number;
  winsA: number;
  winsB: number;
  weekStart: string;
  sharedChallenge?: { title: string; difficulty: string };
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  Easy: '#00C8FF',
  Medium: '#F59E0B',
  Hard: '#EF4444',
};

export default function RivalMatchupScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const uid = useStore((s) => s.uid);
  const accent = TRACKS[track].accent;

  const [rivalData, setRivalData] = useState<RivalData | null>(
    isDemoMode ? DEMO_RIVAL : null,
  );
  const [loading, setLoading] = useState(!isDemoMode);

  useEffect(() => {
    const firestore = db;
    if (isDemoMode || !firestore || !uid) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const weekStart = getThisMonday();

        // Firestore doesn't support OR across different fields in one query,
        // so we run two and take whichever returns a result.
        const [snapA, snapB] = await Promise.all([
          getDocs(
            query(
              collection(firestore, 'rivals'),
              where('userA', '==', uid),
              where('weekStart', '==', weekStart),
            ),
          ),
          getDocs(
            query(
              collection(firestore, 'rivals'),
              where('userB', '==', uid),
              where('weekStart', '==', weekStart),
            ),
          ),
        ]);

        if (cancelled) return;

        const docSnap = !snapA.empty ? snapA.docs[0] : !snapB.empty ? snapB.docs[0] : null;

        if (docSnap) {
          const d = docSnap.data() as FirestoreRivalDoc;
          const isUserA = d.userA === uid;
          const weekDate = new Date(d.weekStart + 'T00:00:00');
          const endDate = new Date(weekDate);
          endDate.setDate(weekDate.getDate() + 6);
          const fmt = (dt: Date) =>
            dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          setRivalData({
            weekRange: `${fmt(weekDate)} – ${fmt(endDate)}, ${weekDate.getFullYear()}`,
            userScore: isUserA ? d.scoreA : d.scoreB,
            rivalName: isUserA ? d.usernameB : d.usernameA,
            rivalScore: isUserA ? d.scoreB : d.scoreA,
            userWins: isUserA ? d.winsA : d.winsB,
            userLosses: isUserA ? d.winsB : d.winsA,
            rivalWins: isUserA ? d.winsB : d.winsA,
            rivalLosses: isUserA ? d.winsA : d.winsB,
            sharedChallenge: d.sharedChallenge
              ? {
                  title: d.sharedChallenge.title,
                  difficulty: d.sharedChallenge.difficulty as Difficulty,
                }
              : undefined,
          });
        } else {
          setRivalData(null);
        }
      } catch {
        if (!cancelled) setRivalData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uid]);

  const data = rivalData;
  const maxScore = data ? Math.max(data.userScore, data.rivalScore, 1) : 1;
  const userPct = data ? Math.round((data.userScore / maxScore) * 100) : 0;
  const rivalPct = data ? Math.round((data.rivalScore / maxScore) * 100) : 0;

  const delta = data ? data.userScore - data.rivalScore : 0;
  const statusLabel = delta > 0 ? 'Leading' : delta < 0 ? 'Trailing' : 'Tied';
  const statusColor = delta > 0 ? '#00FF88' : delta < 0 ? '#FF4444' : '#8888AA';
  const statusBg = delta > 0 ? '#00FF8820' : delta < 0 ? '#FF444420' : '#88888820';
  const statusBorder = delta > 0 ? '#00FF8840' : delta < 0 ? '#FF444440' : '#88888840';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      {loading ? (
        <View style={s.loader}>
          <ActivityIndicator color={accent} />
        </View>
      ) : !data ? (
        <View style={s.loader}>
          <Text style={s.empty}>No rival matchup this week.</Text>
          <Text style={s.emptySub}>Complete sprints to get matched!</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={s.content}>
          <Text style={s.title}>This Week's Rival</Text>
          <Text style={s.dateRange}>Week of {data.weekRange}</Text>

          {/* Head-to-head matchup card */}
          <View style={s.matchupCard}>
            {/* You */}
            <View style={s.side}>
              <View style={[s.avatar, { borderColor: accent }]}>
                <Text style={s.avatarInitials}>ME</Text>
              </View>
              <Text style={s.sideUsername}>You</Text>
              <Text style={[s.sideScore, { color: accent }]}>
                {data.userScore.toLocaleString()}
              </Text>
              <View style={s.progressTrack}>
                <View
                  style={[s.progressFill, { width: `${userPct}%`, backgroundColor: accent }]}
                />
              </View>
            </View>

            <Text style={s.vs}>VS</Text>

            {/* Rival */}
            <View style={s.side}>
              <View style={[s.avatar, { borderColor: '#252540' }]}>
                <Text style={s.avatarInitials}>
                  {data.rivalName.slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <Text style={s.sideUsername}>{data.rivalName}</Text>
              <Text style={s.sideScore}>{data.rivalScore.toLocaleString()}</Text>
              <View style={s.progressTrack}>
                <View
                  style={[s.progressFill, { width: `${rivalPct}%`, backgroundColor: '#8888AA' }]}
                />
              </View>
            </View>
          </View>

          {/* Status badge */}
          <View
            style={[s.statusBadge, { backgroundColor: statusBg, borderColor: statusBorder }]}
          >
            <Text style={[s.statusText, { color: statusColor }]}>
              {statusLabel}
              {delta !== 0 && ` · ${Math.abs(delta).toLocaleString()} pts`}
            </Text>
          </View>

          {/* Head-to-head record */}
          <View style={s.recordCard}>
            <Text style={s.recordLabel}>Head-to-Head</Text>
            <Text style={s.recordValue}>
              You {data.userWins} – {data.rivalWins} {data.rivalName}
            </Text>
          </View>

          {/* Shared challenge card */}
          {data.sharedChallenge && (
            <View style={s.challengeCard}>
              <View style={s.challengeHeader}>
                <Text style={s.challengeLabel}>Shared Challenge</Text>
                <View
                  style={[
                    s.difficultyBadge,
                    {
                      backgroundColor:
                        DIFFICULTY_COLORS[data.sharedChallenge.difficulty] + '22',
                    },
                  ]}
                >
                  <Text
                    style={[
                      s.difficultyText,
                      { color: DIFFICULTY_COLORS[data.sharedChallenge.difficulty] },
                    ]}
                  >
                    {data.sharedChallenge.difficulty}
                  </Text>
                </View>
              </View>
              <Text style={s.challengeTitle}>{data.sharedChallenge.title}</Text>
            </View>
          )}

          {/* Stats row */}
          <View style={s.statsCard}>
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: '#00FF88' }]}>{data.userWins}</Text>
              <Text style={s.statLabel}>Your Wins</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: '#FF4444' }]}>{data.userLosses}</Text>
              <Text style={s.statLabel}>Your Losses</Text>
            </View>
            <View style={s.statDivider} />
            <View style={s.statItem}>
              <Text style={[s.statValue, { color: '#FFFFFF' }]}>
                {data.userWins + data.userLosses}
              </Text>
              <Text style={s.statLabel}>Total Weeks</Text>
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  content: { padding: 24, gap: 16, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  dateRange: { fontSize: 13, color: '#8888AA' },
  matchupCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: '#252540',
  },
  side: { flex: 1, alignItems: 'center', gap: 8 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarInitials: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sideUsername: { fontSize: 14, fontWeight: '600', color: '#8888AA' },
  sideScore: { fontSize: 26, fontWeight: '900', color: '#FFFFFF' },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: '#252540',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3 },
  vs: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  statusText: { fontSize: 15, fontWeight: '700' },
  recordCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#252540',
  },
  recordLabel: { fontSize: 11, fontWeight: '600', color: '#8888AA', letterSpacing: 0.5 },
  recordValue: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  challengeCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: '#252540',
  },
  challengeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  challengeLabel: { fontSize: 11, fontWeight: '600', color: '#8888AA', letterSpacing: 0.5 },
  difficultyBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  difficultyText: { fontSize: 11, fontWeight: '700' },
  challengeTitle: { fontSize: 15, fontWeight: '700', color: '#FFFFFF', lineHeight: 22 },
  statsCard: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#252540',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#8888AA' },
  statDivider: { width: 1, backgroundColor: '#252540', marginVertical: 4 },
  empty: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  emptySub: { fontSize: 13, color: '#8888AA' },
});
