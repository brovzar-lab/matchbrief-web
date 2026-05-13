import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import { SessionStep } from '../lib/types';
import StepProgress from '../components/StepProgress';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STEP_TYPE_LABELS: Record<SessionStep['type'], string> = {
  scenario: '💼 Scenario',
  reflection: '🪞 Reflection',
  micro_lesson: '📖 Micro-Lesson',
};

interface StepResponses {
  [stepIndex: number]: string;
}

export default function ActiveSessionScreen() {
  const nav = useNavigation<Nav>();
  const session = useStore((s) => s.activeSession);
  const prependSession = useStore((s) => s.prependSession);

  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<StepResponses>({});
  const [textInput, setTextInput] = useState('');

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.errorText}>Session not found.</Text>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.backLink}>← Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const steps = session.content;
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  function handleChoice(choice: string) {
    Haptics.selectionAsync();
    setResponses((r) => ({ ...r, [currentStep]: choice }));
  }

  function handleNext() {
    const response = step.responseFormat === 'text' ? textInput : responses[currentStep];

    if (step.responseFormat === 'text' && !textInput.trim()) {
      Alert.alert('Please write a response before continuing.');
      return;
    }
    if (step.responseFormat === 'choice' && !responses[currentStep]) {
      Alert.alert('Please select an option before continuing.');
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (isLastStep) {
      handleComplete();
      return;
    }

    setTextInput('');
    setCurrentStep((s) => s + 1);
  }

  async function handleComplete() {
    if (isDemoMode) {
      const completed = { ...session, completedAt: new Date().toISOString() };
      prependSession(completed);
      nav.replace('SessionComplete', { sessionId: session.id });
      return;
    }

    try {
      const { getFirestore: getDb } = await import('../lib/firebase');
      const db = await getDb();
      if (!db) throw new Error('No db');

      const { doc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      await updateDoc(doc(db, 'users', session.id.split('-')[0] ?? 'x', 'sessions', session.id), {
        completedAt: new Date().toISOString(),
      });
    } catch {
      // Non-fatal — still navigate to complete screen
    }

    nav.replace('SessionComplete', { sessionId: session.id });
  }

  function handleExit() {
    Alert.alert(
      'Exit session?',
      'Your progress will be lost.',
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Exit', style: 'destructive', onPress: () => nav.goBack() },
      ],
    );
  }

  const selectedChoice = responses[currentStep];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleExit} style={styles.exitBtn}>
          <Text style={styles.exitText}>✕</Text>
        </TouchableOpacity>
        <StepProgress total={steps.length} current={currentStep} />
        <View style={styles.exitBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Session title */}
        <Text style={styles.sessionTitle}>{session.title}</Text>

        {/* Step type badge */}
        <View style={styles.stepTypeBadge}>
          <Text style={styles.stepTypeText}>{STEP_TYPE_LABELS[step.type]}</Text>
        </View>

        {/* Step content */}
        <View style={styles.stepCard}>
          <Text style={styles.promptText}>{step.promptText}</Text>
        </View>

        {/* Response area */}
        {step.responseFormat === 'choice' && step.choices && (
          <View style={styles.choices}>
            {step.choices.map((choice) => (
              <TouchableOpacity
                key={choice}
                style={[
                  styles.choiceBtn,
                  selectedChoice === choice && styles.choiceBtnSelected,
                ]}
                onPress={() => handleChoice(choice)}
              >
                <View
                  style={[
                    styles.choiceRadio,
                    selectedChoice === choice && styles.choiceRadioSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.choiceText,
                    selectedChoice === choice && styles.choiceTextSelected,
                  ]}
                >
                  {choice}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step.responseFormat === 'text' && (
          <TextInput
            style={styles.textInput}
            placeholder="Write your thoughts here…"
            placeholderTextColor={MUTED}
            value={textInput}
            onChangeText={setTextInput}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
          />
        )}
      </ScrollView>

      {/* Next button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {isLastStep ? 'Complete Session ✓' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  errorText: { fontSize: 16, color: SUBTEXT },
  backLink: { fontSize: 14, color: ACCENT },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  exitBtn: { width: 36, alignItems: 'flex-start' },
  exitText: { fontSize: 18, color: SUBTEXT },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 16, paddingBottom: 32 },
  sessionTitle: { fontSize: 13, fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: 0.5 },
  stepTypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: ACCENT_DIM,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepTypeText: { fontSize: 12, fontWeight: '600', color: ACCENT },
  stepCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
  },
  promptText: { fontSize: 16, color: TEXT, lineHeight: 26 },
  choices: { gap: 10 },
  choiceBtn: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
    gap: 12,
  },
  choiceBtnSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT_DIM,
  },
  choiceRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: MUTED,
    marginTop: 2,
  },
  choiceRadioSelected: {
    borderColor: ACCENT,
    backgroundColor: ACCENT,
  },
  choiceText: { flex: 1, fontSize: 14, color: SUBTEXT, lineHeight: 21 },
  choiceTextSelected: { color: TEXT },
  textInput: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: TEXT,
    minHeight: 140,
  },
  footer: {
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  nextBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
