import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { collection, doc, getDocs, getDoc, query, where } from 'firebase/firestore';
import { DemoBanner } from '../components/DemoBanner';
import { XPBar } from '../components/XPBar';
import { isDemoMode, TRACKS, type TrackId } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_PROFILE, DEMO_HOME } from '../lib/mockData';
import { db } from '../lib/firebase';
import type { TabParamList } from '../navigation/RootNavigator';

interface LiveProfile {
  username: string;
  streak: number;
  xp: number;
  nextLevelXp: number;
  level: number;
  skills: { speed: number; accuracy: number; depth: number; consistency: number };
  completedDays: string[];
  weeklySkipsRemaining: number;
}

type Props = BottomTabScreenProps<TabParamList, 'Profile'>;

const SKILL_DEFS: Array<{ label: string; key: keyof LiveProfile['skills'] }> = [
  { label: 'Speed', key: 'speed' },
  { label: 'Accuracy', key: 'accuracy' },
  { label: 'Depth', key: 'depth' },
  { label: 'Consistency', key: 'consistency' },
];

export default function ProfileScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const setTrack = useStore((s) => s.setTrack);
  const uid = useStore((s) => s.uid);
  const accent = TRACKS[track].accent;

  const [liveProfile, setLiveProfile] = useState<LiveProfile | null>(null);
  const [loading, setLoading] = useState(!isDemoMode);

  const animVals = useRef(SKILL_DEFS.map(() => new Animated.Value(0)));
  const profileReady = isDemoMode || liveProfile !== null;

  // Derive display values
  const username = isDemoMode ? DEMO_PROFILE.username : (liveProfile?.username ?? 'User');
  const streak = isDemoMode ? DEMO_PROFILE.streak : (liveProfile?.streak ?? 0);
  const skills = isDemoMode
    ? DEMO_PROFILE.skills
    : (liveProfile?.skills ?? { speed: 0, accuracy: 0, depth: 0, consistency: 0 });
  const completedDays = isDemoMode ? DEMO_PROFILE.completedDays : (liveProfile?.completedDays ?? []);
  const weeklySkipsRemaining = isDemoMode ? 1 : (liveProfile?.weeklySkipsRemaining ?? 0);
  const xp = isDemoMode ? DEMO_HOME.xp : (liveProfile?.xp ?? 0);
  const nextLevelXp = isDemoMode ? DEMO_HOME.nextLevelXp : (liveProfile?.nextLevelXp ?? 2000);
  const level = isDemoMode ? DEMO_HOME.level : (liveProfile?.level ?? 1);

  // 30-day calendar: oldest first, today last
  const today = new Date();
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const key = d.toISOString().slice(0, 10);
    return { key, completed: completedDays.includes(key) };
  });

  // Animate skill bars in on mount / when live data arrives
  useEffect(() => {
    if (!profileReady) return;
    const skillVals = isDemoMode
      ? SKILL_DEFS.map((sk) => DEMO_PROFILE.skills[sk.key])
      : liveProfile
        ? SKILL_DEFS.map((sk) => liveProfile.skills[sk.key])
        : SKILL_DEFS.map(() => 0);

    animVals.current.forEach((v) => v.setValue(0));
    Animated.stagger(
      80,
      skillVals.map((val, i) =>
        Animated.timing(animVals.current[i], {
          toValue: val / 100,
          duration: 600,
          useNativeDriver: false,
        }),
      ),
    ).start();
  }, [profileReady, liveProfile]);

  // Live mode: fetch user doc + derive completedDays from submissions
  useEffect(() => {
    if (isDemoMode || !uid || !db) {
      setLoading(false);
      return;
    }
    const firestore = db; // narrow Firestore | null → Firestore for async closure
    let cancelled = false;
    (async () => {
      try {
        const userSnap = await getDoc(doc(firestore, 'users', uid));
        const userData = (userSnap.exists() ? userSnap.data() : {}) as Record<string, unknown>;

        const subsSnap = await getDocs(
          query(collection(firestore, 'users', uid, 'submissions'), where('completedAt', '!=', null)),
        );
        const daysSet = new Set<string>();
        subsSnap.forEach((d) => {
          const data = d.data();
          const ts = data.completedAt as { toDate?: () => Date } | string | null;
          try {
            const dateStr =
              ts && typeof ts === 'object' && ts.toDate
                ? ts.toDate().toISOString().slice(0, 10)
                : new Date(ts as string).toISOString().slice(0, 10);
            daysSet.add(dateStr);
          } catch {
            // skip malformed timestamps
          }
        });

        if (!cancelled) {
          setLiveProfile({
            username: ((userData.username ?? userData.displayName ?? 'User') as string),
            streak: (userData.streak as number) ?? 0,
            xp: (userData.xp as number) ?? 0,
            nextLevelXp: (userData.nextLevelXp as number) ?? 2000,
            level: (userData.level as number) ?? 1,
            skills: (userData.skills as LiveProfile['skills']) ?? {
              speed: 0,
              accuracy: 0,
              depth: 0,
              consistency: 0,
            },
            completedDays: Array.from(daysSet),
            weeklySkipsRemaining: (userData.weeklySkipsRemaining as number) ?? 1,
          });
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  if (!isDemoMode && loading) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.loadingWrap}>
          <Text style={s.loadingText}>Loading profile…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const skipAvailable = weeklySkipsRemaining > 0;
  const totalSprints = completedDays.length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>

        {/* 1. Header: username + track + streak flame */}
        <View style={s.profileHeader}>
          <View style={[s.avatarCircle, { borderColor: accent }]}>
            <Text style={s.avatarInitials}>{username.slice(0, 2).toUpperCase()}</Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.username}>{username}</Text>
            <View
              style={[
                s.trackBadge,
                { backgroundColor: accent + '22', borderColor: accent + '44' },
              ]}
            >
              <Text style={[s.trackBadgeText, { color: accent }]}>
                {TRACKS[track].emoji} {TRACKS[track].label}
              </Text>
            </View>
            <View style={s.streakRow}>
              <Text style={s.streakFlame}>🔥</Text>
              <Text style={s.streakText}>{streak} day streak</Text>
            </View>
          </View>
        </View>

        {/* 2. XP / Level */}
        <View style={s.card}>
          <XPBar xp={xp} nextLevelXp={nextLevelXp} level={level} accentColor={accent} />
        </View>

        {/* 3. Skill bars (animated) */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Skill Breakdown</Text>
          <View style={s.skillsList}>
            {SKILL_DEFS.map((sk, i) => (
              <View key={sk.label} style={s.skillRow}>
                <Text style={s.skillLabel}>{sk.label}</Text>
                <View style={s.skillTrack}>
                  <Animated.View
                    style={[
                      s.skillFill,
                      {
                        width: animVals.current[i].interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        }),
                        backgroundColor: accent,
                      },
                    ]}
                  />
                </View>
                <Text style={[s.skillPct, { color: accent }]}>{skills[sk.key]}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekly skip badge (above calendar per spec) */}
        <View
          style={[
            s.skipBadge,
            {
              backgroundColor: skipAvailable ? '#16A34A22' : '#25254022',
              borderColor: skipAvailable ? '#16A34A66' : '#252540',
            },
          ]}
        >
          <Text style={[s.skipText, { color: skipAvailable ? '#4ADE80' : '#8888AA' }]}>
            {skipAvailable ? '✅  Skip available this week' : '⏭️  Skip used'}
          </Text>
        </View>

        {/* 4. Habit calendar — 30-day grid, filled circles for completed days */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Last 30 Days</Text>
          <View style={s.calendarGrid}>
            {calendarDays.map((d) => (
              <View
                key={d.key}
                style={[
                  s.calendarDot,
                  d.completed
                    ? { backgroundColor: accent }
                    : { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: '#252540' },
                ]}
                accessibilityLabel={d.completed ? `${d.key} completed` : `${d.key} missed`}
              />
            ))}
          </View>
        </View>

        {/* 5. Stats row */}
        <View style={s.statsCard}>
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accent }]}>🔥 {streak}</Text>
            <Text style={s.statLabel}>Day Streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accent }]}>{totalSprints}</Text>
            <Text style={s.statLabel}>Total Sprints</Text>
          </View>
        </View>

        {/* Track switcher */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Switch Track</Text>
          <View style={s.trackChips}>
            {(Object.entries(TRACKS) as [TrackId, (typeof TRACKS)[TrackId]][]).map(([id, t]) => (
              <TouchableOpacity
                key={id}
                style={[
                  s.trackChip,
                  id === track && { backgroundColor: t.accent + '22', borderColor: t.accent },
                ]}
                onPress={() => setTrack(id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: id === track }}
                accessibilityLabel={`Switch to ${t.label} track`}
              >
                <Text style={s.trackChipEmoji}>{t.emoji}</Text>
                <Text style={[s.trackChipText, id === track && { color: t.accent }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#8888AA', fontSize: 14 },
  content: { padding: 20, gap: 16 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1A1A2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  avatarInitials: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  profileInfo: { flex: 1, gap: 6 },
  username: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  trackBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  trackBadgeText: { fontSize: 12, fontWeight: '700' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  streakFlame: { fontSize: 14 },
  streakText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#252540',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  skillsList: { gap: 12 },
  skillRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  skillLabel: { width: 90, fontSize: 13, color: '#8888AA' },
  skillTrack: {
    flex: 1,
    height: 6,
    backgroundColor: '#252540',
    borderRadius: 3,
    overflow: 'hidden',
  },
  skillFill: { height: '100%', borderRadius: 3 },
  skillPct: { width: 34, fontSize: 13, fontWeight: '700', textAlign: 'right' },
  skipBadge: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  skipText: { fontSize: 13, fontWeight: '700' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  calendarDot: { width: 18, height: 18, borderRadius: 9 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252540',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#8888AA' },
  statDivider: { width: 1, backgroundColor: '#252540' },
  trackChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  trackChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#252540',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1.5,
    borderColor: '#252540',
  },
  trackChipEmoji: { fontSize: 14 },
  trackChipText: { fontSize: 13, fontWeight: '600', color: '#8888AA' },
});
