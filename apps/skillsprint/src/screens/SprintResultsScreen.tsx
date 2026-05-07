import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { SubmitResult } from '../hooks/useSubmitChallenge';

type Props = NativeStackScreenProps<RootStackParamList, 'SprintResults'>;

const RING_RADIUS = 80;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const DEMO_FALLBACK: SubmitResult = {
  score: 78,
  feedback: [
    'Good foundational understanding — your answer identifies the key concept.',
    'Include a concrete real-world example to deepen the explanation.',
    'Review related algorithmic patterns to build a stronger mental model.',
  ],
  scoredBy: 'deterministic',
  cohortPercentile: 64,
  timedOut: false,
};

export default function SprintResultsScreen({ navigation, route }: Props) {
  const selectedTrack = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[selectedTrack].accent;

  const { result, difficulty } = route.params ?? {
    result: DEMO_FALLBACK,
    difficulty: 'Medium' as const,
  };

  const [displayScore, setDisplayScore] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listenerId = animValue.addListener(({ value }) => {
      setDisplayScore(Math.round(value));
    });
    Animated.timing(animValue, {
      toValue: result.score,
      duration: 1200,
      useNativeDriver: false,
    }).start();
    return () => animValue.removeListener(listenerId);
    // animValue is a stable ref — intentionally omitted from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.score]);

  const ringOffset = RING_CIRCUMFERENCE * (1 - displayScore / 100);

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}
      <ScrollView contentContainerStyle={s.content}>

        {/* Score ring + animated count-up */}
        <View style={s.ringSection}>
          <Svg width={200} height={200} viewBox="0 0 200 200">
            <Circle
              cx={100}
              cy={100}
              r={RING_RADIUS}
              stroke="#252540"
              strokeWidth={12}
              fill="none"
            />
            <Circle
              cx={100}
              cy={100}
              r={RING_RADIUS}
              stroke={accent}
              strokeWidth={12}
              fill="none"
              strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
              strokeDashoffset={ringOffset}
              strokeLinecap="round"
              rotation="-90"
              origin="100, 100"
            />
          </Svg>
          <View style={s.ringOverlay}>
            <Text style={[s.scoreValue, { color: accent }]}>{displayScore}</Text>
            <Text style={s.scoreMax}>/ 100</Text>
          </View>
        </View>

        {/* Difficulty badge */}
        <View
          style={[
            s.difficultyBadge,
            { backgroundColor: accent + '22', borderColor: accent + '44' },
          ]}
        >
          <Text style={[s.difficultyText, { color: accent }]}>{difficulty}</Text>
        </View>

        {/* Cohort percentile */}
        <View style={s.cohortCard}>
          <Text style={s.cohortText}>
            Better than{' '}
            <Text style={[s.cohortPct, { color: accent }]}>
              {result.cohortPercentile}%
            </Text>{' '}
            of today's submissions
          </Text>
          <View style={s.cohortTrackBg}>
            <View
              style={[
                s.cohortFill,
                {
                  width: `${result.cohortPercentile}%`,
                  backgroundColor: accent,
                },
              ]}
            />
          </View>
          <View style={s.cohortLabels}>
            <Text style={s.cohortLabelText}>0%</Text>
            <Text style={s.cohortLabelText}>100%</Text>
          </View>
        </View>

        {/* Feedback card */}
        <View style={s.feedbackCard}>
          <Text style={s.feedbackTitle}>Feedback</Text>
          {result.feedback.map((note, i) => (
            <View key={i} style={s.feedbackRow}>
              <View
                style={[s.feedbackNumber, { backgroundColor: accent + '22' }]}
              >
                <Text style={[s.feedbackNumberText, { color: accent }]}>
                  {i + 1}
                </Text>
              </View>
              <Text style={s.feedbackText}>{note}</Text>
            </View>
          ))}
        </View>

        {/* CTAs */}
        <TouchableOpacity
          style={[s.primaryBtn, { backgroundColor: accent }]}
          onPress={() => navigation.navigate('Tabs', { screen: 'Leaderboard' })}
          accessibilityRole="button"
          accessibilityLabel="See leaderboard"
        >
          <Text style={s.primaryBtnText}>See Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.secondaryBtn}
          onPress={() => navigation.navigate('Tabs', { screen: 'Home' })}
          accessibilityRole="button"
          accessibilityLabel="Back to hub"
        >
          <Text style={s.secondaryBtnText}>Back to Hub</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  content: { padding: 24, gap: 16, alignItems: 'center' },
  ringSection: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 220,
  },
  ringOverlay: { position: 'absolute', alignItems: 'center' },
  scoreValue: { fontSize: 56, fontWeight: '900', lineHeight: 64 },
  scoreMax: { fontSize: 16, color: '#8888AA', fontWeight: '600' },
  difficultyBadge: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderWidth: 1,
  },
  difficultyText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
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
  feedbackCard: {
    width: '100%',
    backgroundColor: '#1A1A2E',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  feedbackTitle: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  feedbackRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  feedbackNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  feedbackNumberText: { fontSize: 13, fontWeight: '800' },
  feedbackText: { fontSize: 14, color: '#8888AA', flex: 1, lineHeight: 20 },
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
