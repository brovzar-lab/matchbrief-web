import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_SPRINT } from '../lib/mockData';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ActiveSprint'>;

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const TIMER_SECONDS = 60;

export default function ActiveSprintScreen({ navigation }: Props) {
  const track = useStore((s) => s.track);
  const accent = TRACKS[track].accent;
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const data = DEMO_SPRINT;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          navigation.replace('SprintResults');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigation]);

  const progress = timeLeft / TIMER_SECONDS;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  function handleSubmit() {
    navigation.replace('SprintResults');
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'bottom']}>
      {isDemoMode && <DemoBanner />}

      {/* Timer ring — top 30% */}
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
              onPress={() => setSelectedOption(i)}
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
                selectedOption !== null ? accent : '#252540',
            },
          ]}
          onPress={handleSubmit}
          disabled={selectedOption === null}
          accessibilityRole="button"
          accessibilityLabel="Submit answer"
        >
          <Text
            style={[
              s.submitBtnText,
              { color: selectedOption !== null ? '#0F0F13' : '#8888AA' },
            ]}
          >
            Submit
          </Text>
        </TouchableOpacity>
      </View>
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
});
