import React from 'react';
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
import { isDemoMode, TRACKS, type TrackId } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_PROFILE } from '../lib/mockData';
import type { TabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Profile'>;

export default function ProfileScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const setTrack = useStore((s) => s.setTrack);
  const accent = TRACKS[track].accent;
  const data = DEMO_PROFILE;

  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (29 - i));
    const dayStr = d.toISOString().slice(0, 10);
    return { date: dayStr, completed: data.completedDays.includes(dayStr) };
  });

  const skills: Array<{ label: string; value: number }> = [
    { label: 'Speed', value: data.skills.speed },
    { label: 'Accuracy', value: data.skills.accuracy },
    { label: 'Depth', value: data.skills.depth },
    { label: 'Consistency', value: data.skills.consistency },
  ];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>
        {/* Header */}
        <View style={s.profileHeader}>
          <View style={[s.avatarCircle, { borderColor: accent }]}>
            <Text style={s.avatarInitials}>
              {data.username.slice(0, 2).toUpperCase()}
            </Text>
          </View>
          <View style={s.profileInfo}>
            <Text style={s.username}>{data.username}</Text>
            <View
              style={[
                s.trackBadge,
                {
                  backgroundColor: accent + '22',
                  borderColor: accent + '44',
                },
              ]}
            >
              <Text style={[s.trackBadgeText, { color: accent }]}>
                {TRACKS[track].emoji} {TRACKS[track].label}
              </Text>
            </View>
          </View>
        </View>

        {/* Streak calendar — last 30 days */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Last 30 Days</Text>
          <View style={s.calendarGrid}>
            {days.map((d) => (
              <View
                key={d.date}
                style={[
                  s.calendarDot,
                  { backgroundColor: d.completed ? accent : '#252540' },
                ]}
                accessibilityLabel={
                  d.completed ? `${d.date} completed` : `${d.date} missed`
                }
              />
            ))}
          </View>
        </View>

        {/* Skill bars */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Skill Breakdown</Text>
          <View style={s.skillsList}>
            {skills.map((sk) => (
              <View key={sk.label} style={s.skillRow}>
                <Text style={s.skillLabel}>{sk.label}</Text>
                <View style={s.skillTrack}>
                  <View
                    style={[
                      s.skillFill,
                      { width: `${sk.value}%`, backgroundColor: accent },
                    ]}
                  />
                </View>
                <Text style={[s.skillValue, { color: accent }]}>
                  {sk.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Track switcher */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Switch Track</Text>
          <View style={s.trackChips}>
            {(
              Object.entries(TRACKS) as [
                TrackId,
                (typeof TRACKS)[TrackId],
              ][]
            ).map(([id, t]) => (
              <TouchableOpacity
                key={id}
                style={[
                  s.trackChip,
                  id === track && {
                    backgroundColor: t.accent + '22',
                    borderColor: t.accent,
                  },
                ]}
                onPress={() => setTrack(id)}
                accessibilityRole="radio"
                accessibilityState={{ checked: id === track }}
                accessibilityLabel={`Switch to ${t.label} track`}
              >
                <Text style={s.trackChipEmoji}>{t.emoji}</Text>
                <Text
                  style={[
                    s.trackChipText,
                    id === track && { color: t.accent },
                  ]}
                >
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
  profileInfo: { gap: 6 },
  username: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  trackBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  trackBadgeText: { fontSize: 12, fontWeight: '700' },
  card: {
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: '#252540',
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  calendarDot: { width: 18, height: 18, borderRadius: 4 },
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
  skillValue: {
    width: 30,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
  },
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
