import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, MUTED, isDemoMode,
  ONBOARDING_QUESTIONS,
} from '../lib/config';
import { useStore } from '../lib/store';
import DemoModeBadge from '../components/DemoModeBadge';

const TOTAL = ONBOARDING_QUESTIONS.length;

export default function OnboardingScreen() {
  const step = useStore((s) => s.onboardingStep);
  const setStep = useStore((s) => s.setOnboardingStep);
  const setAnswer = useStore((s) => s.setOnboardingAnswer);
  const answers = useStore((s) => s.onboardingAnswers);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const setUser = useStore((s) => s.setUser);
  const user = useStore((s) => s.user);

  const [currentAnswer, setCurrentAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const q = ONBOARDING_QUESTIONS[step];
  const progress = (step + 1) / TOTAL;

  function handleNext() {
    if (!currentAnswer.trim()) {
      Alert.alert('Please answer the question before continuing.');
      return;
    }
    setAnswer(q.key, currentAnswer.trim());
    setCurrentAnswer('');

    if (step < TOTAL - 1) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  }

  function handleBack() {
    if (step > 0) {
      // Restore previous answer if any
      const prev = answers.find((a) => a.questionKey === ONBOARDING_QUESTIONS[step - 1].key);
      setCurrentAnswer(prev?.answer ?? '');
      setStep(step - 1);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);

    if (isDemoMode) {
      // Demo: simulate classification delay then mark complete
      await new Promise((r) => setTimeout(r, 1500));
      completeOnboarding();
      setSubmitting(false);
      return;
    }

    try {
      const { getFunctions: getFn } = await import('../lib/firebase');
      const functions = await getFn();
      if (!functions) throw new Error('Firebase not ready');

      const { httpsCallable } = await import('firebase/functions');
      const classifyFn = httpsCallable(functions, 'classifyOnboarding');

      const allAnswers = [...answers];
      // Include the last answer which was set just before this call
      if (!allAnswers.find((a) => a.questionKey === q.key)) {
        allAnswers.push({ questionKey: q.key, answer: currentAnswer.trim() });
      }

      await classifyFn({ answers: allAnswers });

      // Reload profile from Firestore to pick up updated dimensions
      const { getFirestore: getDb } = await import('../lib/firebase');
      const db = await getDb();
      if (!db || !user) throw new Error('No db or user');

      const { doc, getDoc } = await import('firebase/firestore');
      const snap = await getDoc(doc(db, 'users', user.uid, 'profile', 'data'));
      if (snap.exists()) {
        setUser({ uid: user.uid, ...(snap.data() as any) });
      }

      completeOnboarding();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Could not save your profile. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          {isDemoMode && <DemoModeBadge />}

          {/* Progress bar */}
          <View style={styles.progressBg}>
            <Animated.View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={styles.progressLabel}>
            {step + 1} of {TOTAL}
          </Text>

          {/* Question */}
          <View style={styles.questionCard}>
            <Text style={styles.questionNum}>Question {step + 1}</Text>
            <Text style={styles.questionText}>{q.question}</Text>
          </View>

          {/* Answer input */}
          <TextInput
            style={styles.input}
            placeholder={q.placeholder}
            placeholderTextColor={MUTED}
            value={currentAnswer}
            onChangeText={setCurrentAnswer}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            autoFocus
          />

          {/* Navigation */}
          <View style={styles.navRow}>
            {step > 0 && (
              <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                <Text style={styles.backBtnText}>← Back</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.nextBtn, submitting && styles.btnDisabled]}
              onPress={handleNext}
              disabled={submitting}
            >
              <Text style={styles.nextBtnText}>
                {submitting
                  ? 'Building your profile…'
                  : step === TOTAL - 1
                  ? 'Finish Setup'
                  : 'Next →'}
              </Text>
            </TouchableOpacity>
          </View>

          {submitting && (
            <Text style={styles.submittingHint}>
              Our AI coach is analyzing your answers to personalize your first session…
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  container: { flex: 1, padding: 24, gap: 20 },
  progressBg: {
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 2,
  },
  progressLabel: { fontSize: 12, color: MUTED, textAlign: 'right' },
  questionCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    gap: 8,
  },
  questionNum: { fontSize: 11, fontWeight: '700', color: ACCENT, letterSpacing: 0.8 },
  questionText: { fontSize: 18, fontWeight: '600', color: TEXT, lineHeight: 26 },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: TEXT,
    minHeight: 120,
  },
  navRow: { flexDirection: 'row', gap: 12 },
  backBtn: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backBtnText: { fontSize: 15, color: SUBTEXT, fontWeight: '500' },
  nextBtn: {
    flex: 2,
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  nextBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  submittingHint: {
    fontSize: 13,
    color: SUBTEXT,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});
