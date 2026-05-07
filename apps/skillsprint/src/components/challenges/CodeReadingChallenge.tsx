import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { CodeReadingChallenge } from '../../types/challenges';
import { CodeBlock } from './CodeBlock';

interface Props {
  challenge: CodeReadingChallenge;
  accent: string;
  onAnswerChange: (answer: string | string[]) => void;
  disabled?: boolean;
}

export function CodeReadingChallengeRenderer({
  challenge,
  accent,
  onAnswerChange,
  disabled,
}: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const { codeSnippet, question, options } = challenge.content;

  function handleSelect(i: number) {
    if (disabled) return;
    setSelectedIndex(i);
    onAnswerChange(options[i]);
  }

  return (
    <View style={s.container}>
      <CodeBlock code={codeSnippet} />
      <Text style={s.question}>{question}</Text>
      <View style={s.options}>
        {options.map((opt, i) => {
          const isSelected = selectedIndex === i;
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
              onPress={() => handleSelect(i)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
              accessibilityLabel={`Option ${String.fromCharCode(65 + i)}: ${opt}`}
            >
              <View style={[s.letter, isSelected && { backgroundColor: accent }]}>
                <Text style={[s.letterText, isSelected && { color: '#0F0F13' }]}>
                  {String.fromCharCode(65 + i)}
                </Text>
              </View>
              <Text style={[s.optionText, isSelected && { color: '#FFFFFF' }]}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  question: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  options: { gap: 10 },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#252540',
    gap: 12,
    minHeight: 44,
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  letterText: { fontSize: 13, fontWeight: '700', color: '#8888AA' },
  optionText: { fontSize: 15, color: '#8888AA', flex: 1 },
});
