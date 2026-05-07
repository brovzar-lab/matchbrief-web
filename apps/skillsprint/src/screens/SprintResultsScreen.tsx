import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_RESULTS } from '../lib/mockData';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'SprintResults'>;

export default function SprintResultsScreen({ navigation }: Props) {
  const track = useStore((s) => s.track);
  const accent = TRACKS[track].accent;
  const data = DEMO_RESULTS;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>
        {/* Score */}
        <View style={s.scoreSection}>
          <Text style={s.scoreLabel}>Your Score</Text>
          <View style={s.scoreRow}>
            <Text style={[s.scoreValue, { color: accent }]}>{data.score}</Text>
            <Text style={s.scoreMax}> / 100</Text>
          </View>
        </View>

        {/* XP badge */}
        <View
          style={[
            s.xpBadge,
            { backgroundColor: accent + '22', borderColor: accent + '44' },
          ]}
        >
          <Text style={[s.xpBadgeText, { color: accent }]}>
            +{data.xpEarned} XP earned
          </Text>
        </View>

        {/* Cohort comparison bar */}
        <View style={s.cohortCard}>
          <Text style={s.cohortText}>
            You scored better than{' '}
            <Text style={[s.cohortPct, { color: accent }]}>
              {data.percentile}%
            </Text>{' '}
            of users today
          </Text>
          <View style={s.cohortTrackBg}>
            <View
              style={[
                s.cohortFill,
                { width: `${data.percentile}%`, backgroundColor: accent },
              ]}
            />
          </View>
          <View style={s.cohortLabels}>
            <Text style={s.cohortLabelText}>0%</Text>
            <Text style={s.cohortLabelText}>100%</Text>
          </View>
        </View>

        {/* Improvement notes */}
        <View style={s.notesCard}>
          <Text style={s.notesTitle}>Improvement Notes</Text>
          {data.notes.map((note, i) => (
            <View key={i} style={s.noteRow}>
              <View
                style={[s.noteNumber, { backgroundColor: accent + '22' }]}
              >
                <Text style={[s.noteNumberText, { color: accent }]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={s.noteText}>{note}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: accent }]}
          onPress={() => navigation.replace('ActiveSprint')}
          accessibilityRole="button"
          accessibilityLabel="Start next sprint"
        >
          <Text style={s.primaryBtnText}>Next Sprint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => navigation.navigate('Tabs')}
          accessibilityRole="button"
          accessibilityLabel="Go home"
        >
          <Text style={s.secondaryBtnText}>Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  content: { padding: 24, gap: 16, alignItems: 'center' },
  scoreSection: { alignItems: 'center', paddingVertical: 16 },
  scoreLabel: { fontSize: 14, color: '#8888AA', marginBottom: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'flex-end' },
  scoreValue: { fontSize: 72, fontWeight: '900', lineHeight: 80 },
  scoreMax: {
    fontSize: 28,
    color: '#8888AA',
    fontWeight: '700',
    paddingBottom: 12,
  },
  xpBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
  },
  xpBadgeText: { fontSize: 15, fontWeight: '700' },
  cohortCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  cohortText: { fontSize: 15, color: '#8888AA', textAlign: 'center' },
  cohortPct: { fontWeight: '800', fontSize: 16 },
  cohortTrackBg: {
    height: 8,
    backgroundColor: '#252540',
    borderRadius: 4,
    overflow: 'hidden',
  },
  cohortFill: { height: '100%', borderRadius: 4 },
  cohortLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  cohortLabelText: { fontSize: 11, color: '#8888AA' },
  notesCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  notesTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  noteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  noteNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  noteNumberText: { fontSize: 13, fontWeight: '800' },
  noteText: { fontSize: 14, color: '#8888AA', flex: 1, lineHeight: 20 },
  primaryBtn: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryBtnText: { fontSize: 16, fontWeight: '700', color: '#0F0F13' },
  secondaryBtn: { paddingVertical: 12 },
  secondaryBtnText: { fontSize: 15, color: '#8888AA' },
});
