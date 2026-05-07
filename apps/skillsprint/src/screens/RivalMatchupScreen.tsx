import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_RIVAL } from '../lib/mockData';
import type { TabParamList } from '../navigation/RootNavigator';

type Props = BottomTabScreenProps<TabParamList, 'Rival'>;

export default function RivalMatchupScreen(_props: Props) {
  const track = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[track].accent;
  const data = DEMO_RIVAL;
  const maxScore = Math.max(data.userScore, data.rivalScore, 1);
  const delta = data.userScore - data.rivalScore;
  const isAhead = delta > 0;

  const userPct = Math.round((data.userScore / maxScore) * 100);
  const rivalPct = Math.round((data.rivalScore / maxScore) * 100);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.title}>This Week's Rival</Text>
        <Text style={s.dateRange}>{data.weekRange}</Text>

        {/* Head-to-head */}
        <View style={s.h2h}>
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
                style={[
                  s.progressFill,
                  { width: `${userPct}%`, backgroundColor: accent },
                ]}
              />
            </View>
            <Text style={s.record}>
              {data.userWins}W – {data.userLosses}L
            </Text>
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
            <Text style={s.sideScore}>
              {data.rivalScore.toLocaleString()}
            </Text>
            <View style={s.progressTrack}>
              <View
                style={[
                  s.progressFill,
                  { width: `${rivalPct}%`, backgroundColor: '#8888AA' },
                ]}
              />
            </View>
            <Text style={s.record}>
              {data.rivalWins}W – {data.rivalLosses}L
            </Text>
          </View>
        </View>

        {/* Delta chip */}
        <View
          style={[
            s.deltaChip,
            {
              backgroundColor: isAhead ? '#00FF8822' : '#FF444422',
              borderColor: isAhead ? '#00FF8844' : '#FF444444',
            },
          ]}
        >
          <Text
            style={[
              s.deltaText,
              { color: isAhead ? '#00FF88' : '#FF4444' },
            ]}
          >
            {isAhead
              ? `+${delta} pts ahead`
              : `${Math.abs(delta)} pts behind`}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  content: { padding: 24, gap: 20, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  dateRange: { fontSize: 13, color: '#8888AA' },
  h2h: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    gap: 16,
  },
  side: { flex: 1, alignItems: 'center', gap: 8 },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1A1A2E',
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
  record: { fontSize: 12, color: '#8888AA' },
  vs: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  deltaChip: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  deltaText: { fontSize: 16, fontWeight: '700' },
});
