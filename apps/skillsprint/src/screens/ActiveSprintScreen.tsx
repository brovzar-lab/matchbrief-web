import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_SPRINT } from '../lib/mockData';
import { useSubmitChallenge } from '../hooks/useSubmitChallenge';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSprint'>;

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TIMER_SECONDS = 60;

export default function ActiveSprintScreen({ navigation }: Props) {
  const selectedTrack = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[selectedTrack].accent;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const data = DEMO_SPRINT;

  const startedAt = useRef(new Date());
  const selectedOptionRef = useRef<number | null>(null);
  const hasSubmitted = useRef(false);

  const { state: submitState, result, error, submit, reset } = useSubmitChallenge();

  // Keep a stable ref to the latest submit so the timer effect never restarts
  const submitRef = useRef(submit);
  submitRef.current = submit;

  // Navigate to results when scoring completes
  useEffect(() => {
    if (submitState === 'done' && result) {
      navigation.replace('SprintResults', { result, difficulty: data.difficulty });
    }
  }, [submitState, result, navigation, data.difficulty]);

  // Countdown timer — auto-submits when it hits zero. Runs once on mount.
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          if (!hasSubmitted.current) {
            hasSubmitted.current = true;
            const answer =
              selectedOptionRef.current !== null
                ? data.options[selectedOptionRef.current]
                : '';
            void submitRef.current({
              challengeId: data.id,
              answer,
              startedAt: startedAt.current,
            });
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progress = timeLeft / TIMER_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  function handleOptionSelect(i: number) {
    setSelectedOption(i);
    selectedOptionRef.current = i;
  }

  function handleSubmit() {
    if (hasSubmitted.current || selectedOption === null) return;
    hasSubmitted.current = true;
    void submit({
      challengeId: data.id,
      answer: data.options[selectedOption],
      startedAt: startedAt.current,
    });
  }

  function handleRetry() {
    reset();
    hasSubmitted.current = false;
  }

  const isSubmitting = submitState === 'submitting' || submitState === 'scoring';

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}

      {/* Timer ring */}
      <View style={s.timerSection}>
        <Svg width={200} height={200} viewBox="0 0 200 200">
          <Circle
            cx={100}
            cy={100}
            r={RADIUS}
            stroke="#252540"
            strokeWidth={12}
            fill="none"
          />
          <Circle
            cx={100}
            cy={100}
            r={RADIUS}
            stroke={accent}
            strokeWidth={12}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin="100, 100"
          />
        </Svg>
        <View style={s.timerOverlay}>
          <Text style={[s.timerDigits, { color: accent }]}>{timeLeft}</Text>
          <Text style={s.timerLabel}>sec</Text>
        </View>
      </View>

      {/* Challenge text */}
      <View style={s.challengeSection}>
        <Text style={s.questionText}>{data.question}</Text>
      </View>

      {/* Answer options */}
      <View style={s.optionsSection}>
        {data.options.map((opt, i) => {
          const isSelected = selectedOption === i;
          return (
            <TouchableOpacity
              key={i}
              style={[
                s.optionBtn,
                isSelected && {
                  borderColor: accent,
                  backgroundColor: accent + '22',
                },
              ]}
              onPress={() => handleOptionSelect(i)}
              disabled={isSubmitting || submitState === 'error'}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={opt}
            >
              <View
                style={[
                  s.optionLetter,
                  isSelected && { backgroundColor: accent },
                ]}
              >
                <Text
                  style={[
                    s.optionLetterText,
                    isSelected && { color: '#0F0F13' },
                  ]}
                >
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text
                style={[s.optionText, isSelected && { color: '#FFFFFF' }]}
              >
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[
            s.submitBtn,
            {
              backgroundColor:
                selectedOption !== null && !isSubmitting ? accent : '#252540',
            },
          ]}
          onPress={handleSubmit}
          disabled={selectedOption === null || isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Submit answer"
        >
          <Text
            style={[
              s.submitBtnText,
              { color: selectedOption !== null && !isSubmitting ? '#0F0F13' : '#8888AA' },
            ]}
          >
            Submit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scoring overlay */}
      {isSubmitting && (
        <View style={s.overlay}>
          <ActivityIndicator size="large" color={accent} />
          <Text style={s.overlayText}>Scoring…</Text>
        </View>
      )}

      {/* Error overlay */}
      {submitState === 'error' && (
        <View style={s.overlay}>
          <Text style={s.errorText}>{error}</Text>
          <TouchableOpacity
            style={[s.retryBtn, { backgroundColor: accent }]}
            onPress={handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry submission"
          >
            <Text style={s.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  timerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    height: 220,
  },
  timerOverlay: { position: 'absolute', alignItems: 'center' },
  timerDigits: { fontSize: 48, fontWeight: '800' },
  timerLabel: { fontSize: 14, color: '#8888AA', marginTop: -4 },
  challengeSection: { paddingHorizontal: 24, paddingVertical: 12 },
  questionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
  },
  optionsSection: { paddingHorizontal: 24, gap: 10, flex: 1 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#252540',
    gap: 12,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLetterText: { fontSize: 13, fontWeight: '700', color: '#8888AA' },
  optionText: { fontSize: 15, color: '#8888AA', flex: 1 },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0F0F13CC',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  overlayText: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  errorText: {
    fontSize: 15,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  retryBtnText: { fontSize: 16, fontWeight: '700', color: '#0F0F13' },
});
