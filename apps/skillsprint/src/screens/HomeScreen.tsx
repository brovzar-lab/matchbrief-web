import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { XPBar } from '../components/XPBar';
import { useStore } from '../lib/store';
import { isDemoMode, TRACKS } from '../lib/config';
import { DEMO_HOME } from '../lib/mockData';
import type { TabParamList, RootStackParamList } from '../navigation/RootNavigator';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export default function HomeScreen({ navigation }: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[track].accent;
  const data = DEMO_HOME;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView style={s.scroll} contentContainerStyle={s.content}>
        <View style={s.header}>
          <Text style={s.greeting}>Good morning 👋</Text>
          <XPBar
            xp={data.xp}
            nextLevelXp={data.nextLevelXp}
            level={data.level}
            accentColor={accent}
          />
        </View>

        <View style={s.streakRow}>
          <Text style={s.streakFlame}>🔥</Text>
          <Text style={s.streakCount}>{data.streak} day streak</Text>
        </View>

        {/* Today's Sprint card */}
        <View style={s.sprintCard}>
          <View style={s.cardHeader}>
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
            <View style={s.difficultyBadge}>
              <Text style={s.difficultyText}>{data.challenge.difficulty}</Text>
            </View>
          </View>
          <Text style={s.challengeTitle}>{data.challenge.title}</Text>
          <Text style={s.challengeDesc}>{data.challenge.description}</Text>
          <TouchableOpacity
            style={[s.startBtn, { backgroundColor: accent }]}
            onPress={() => navigation.navigate('ActiveSprint')}
            accessibilityRole="button"
            accessibilityLabel="Start Sprint"
          >
            <Text style={s.startBtnText}>Start Sprint →</Text>
          </TouchableOpacity>
        </View>

        {/* Your Stats row */}
        <View style={s.statsCard}>
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accent }]}>{data.sprintsToday}</Text>
            <Text style={s.statLabel}>Today</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accent }]}>{data.streak}</Text>
            <Text style={s.statLabel}>Streak</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={[s.statValue, { color: accent }]}>
              {data.xp.toLocaleString()}
            </Text>
            <Text style={s.statLabel}>Total XP</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16 },
  header: { gap: 12 },
  greeting: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  streakRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  streakFlame: { fontSize: 20 },
  streakCount: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  sprintCard: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  cardHeader: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  trackBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  trackBadgeText: { fontSize: 12, fontWeight: '700' },
  difficultyBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#252540',
  },
  difficultyText: { fontSize: 11, color: '#8888AA', fontWeight: '600' },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 24,
  },
  challengeDesc: { fontSize: 14, color: '#8888AA', lineHeight: 20 },
  startBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  startBtnText: { fontSize: 16, fontWeight: '700', color: '#0F0F13' },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#252540',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12, color: '#8888AA' },
  statDivider: { width: 1, backgroundColor: '#252540' },
});
