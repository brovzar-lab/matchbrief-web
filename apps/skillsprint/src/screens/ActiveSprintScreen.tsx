import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { TimerRing } from '../components/challenges/TimerRing';
import { MultipleChoiceChallengeRenderer } from '../components/challenges/MultipleChoiceChallenge';
import { FillInBlankChallengeRenderer } from '../components/challenges/FillInBlankChallenge';
import { CodeReadingChallengeRenderer } from '../components/challenges/CodeReadingChallenge';
import { WritingPromptChallengeRenderer } from '../components/challenges/WritingPromptChallenge';
import { DesignCritiqueChallengeRenderer } from '../components/challenges/DesignCritiqueChallenge';
import { isDemoMode, TRACKS } from '../lib/config';
import type { TrackId } from '../lib/config';
import { useStore } from '../lib/store';
import { useSubmitChallenge } from '../hooks/useSubmitChallenge';
import {
  MULTIPLE_CHOICE_FIXTURE,
  FILL_IN_BLANK_FIXTURE,
  CODE_READING_FIXTURE,
  WRITING_PROMPT_FIXTURE,
  DESIGN_CRITIQUE_FIXTURE,
} from '../fixtures/challenges';
import type { Challenge } from '../types/challenges';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSprint'>;

const TIMER_SECONDS = 600;

function getDemoChallenge(trackId: TrackId): Challenge {
  switch (trackId) {
    case 'coding':
      return FILL_IN_BLANK_FIXTURE;
    case 'writing':
      return WRITING_PROMPT_FIXTURE;
    case 'design':
      return DESIGN_CRITIQUE_FIXTURE;
    case 'critical_thinking':
      return CODE_READING_FIXTURE;
    default:
      return MULTIPLE_CHOICE_FIXTURE;
  }
}

function isAnswerValid(challenge: Challenge, answer: string | string[] | null): boolean {
  if (answer === null) return false;
  switch (challenge.type) {
    case 'fill_in_blank':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'multiple_choice':
    case 'code_reading':
      return typeof answer === 'string' && answer.length > 0;
    case 'writing_prompt': {
      if (typeof answer !== 'string') return false;
      const words = answer.trim() === '' ? 0 : answer.trim().split(/\s+/).length;
      return words >= challenge.content.minWords;
    }
    case 'design_critique':
      return Array.isArray(answer) && answer.every((v) => v.trim().length > 0);
  }
}

function renderChallenge(
  challenge: Challenge,
  accent: string,
  onAnswerChange: (a: string | string[]) => void,
  disabled: boolean,
): React.ReactElement {
  switch (challenge.type) {
    case 'multiple_choice':
      return (
        <MultipleChoiceChallengeRenderer
          challenge={challenge}
          accent={accent}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
    case 'fill_in_blank':
      return (
        <FillInBlankChallengeRenderer
          challenge={challenge}
          accent={accent}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
    case 'code_reading':
      return (
        <CodeReadingChallengeRenderer
          challenge={challenge}
          accent={accent}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
    case 'writing_prompt':
      return (
        <WritingPromptChallengeRenderer
          challenge={challenge}
          accent={accent}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
    case 'design_critique':
      return (
        <DesignCritiqueChallengeRenderer
          challenge={challenge}
          accent={accent}
          onAnswerChange={onAnswerChange}
          disabled={disabled}
        />
      );
  }
}

export default function ActiveSprintScreen({ navigation }: Props) {
  const selectedTrack = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[selectedTrack].accent;
  const challenge = getDemoChallenge(selectedTrack);

  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [answer, setAnswer] = useState<string | string[] | null>(null);

  const startedAt = useRef(new Date());
  const answerRef = useRef<string | string[] | null>(null);
  const hasSubmitted = useRef(false);

  const { state: submitState, result, error, submit, reset } = useSubmitChallenge();
  const submitRef = useRef(submit);
  submitRef.current = submit;

  useEffect(() => {
    if (submitState === 'done' && result) {
      navigation.replace('SprintResults', {
        result,
        difficulty: challenge.difficulty,
      });
    }
  }, [submitState, result, navigation, challenge.difficulty]);

  // Countdown — auto-submits at zero. Runs once on mount.
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          if (!hasSubmitted.current) {
            hasSubmitted.current = true;
            const a = answerRef.current ?? '';
            void submitRef.current({
              challengeId: challenge.id,
              answer: a,
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

  function handleAnswerChange(a: string | string[]) {
    setAnswer(a);
    answerRef.current = a;
  }

  function handleSubmit() {
    if (hasSubmitted.current || !isAnswerValid(challenge, answer)) return;
    hasSubmitted.current = true;
    void submit({
      challengeId: challenge.id,
      answer: answer ?? '',
      startedAt: startedAt.current,
    });
  }

  function handleRetry() {
    reset();
    hasSubmitted.current = false;
  }

  const isSubmitting = submitState === 'submitting' || submitState === 'scoring';
  const canSubmit = isAnswerValid(challenge, answer) && !isSubmitting;

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
        {isDemoMode && <DemoBanner />}

        <TimerRing
          secondsLeft={timeLeft}
          totalSeconds={TIMER_SECONDS}
          accent={accent}
        />

        <ScrollView
          style={s.scrollArea}
          contentContainerStyle={s.cardContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderChallenge(challenge, accent, handleAnswerChange, isSubmitting)}
        </ScrollView>

        <View style={s.footer}>
          <TouchableOpacity
            style={[
              s.submitBtn,
              { backgroundColor: canSubmit ? accent : '#252540' },
            ]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Submit answer"
            accessibilityState={{ disabled: !canSubmit }}
          >
            <Text
              style={[
                s.submitBtnText,
                { color: canSubmit ? '#0F0F13' : '#8888AA' },
              ]}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>

        {isSubmitting && (
          <View style={s.overlay}>
            <ActivityIndicator size="large" color={accent} />
            <Text style={s.overlayText}>Scoring…</Text>
          </View>
        )}

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
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#0F0F13' },
  scrollArea: { flex: 1 },
  cardContent: { padding: 24, paddingBottom: 8, gap: 8 },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    paddingTop: 8,
  },
  submitBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
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
