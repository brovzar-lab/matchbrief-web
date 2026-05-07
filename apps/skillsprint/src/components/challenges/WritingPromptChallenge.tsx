import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import type { WritingPromptChallenge } from '../../types/challenges';

interface Props {
  challenge: WritingPromptChallenge;
  accent: string;
  onAnswerChange: (answer: string | string[]) => void;
  disabled?: boolean;
}

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
}

export function WritingPromptChallengeRenderer({
  challenge,
  accent,
  onAnswerChange,
  disabled,
}: Props) {
  const [value, setValue] = useState('');
  const { prompt, context, minWords } = challenge.content;
  const words = countWords(value);
  const hasEnough = words >= minWords;

  function handleChange(text: string) {
    setValue(text);
    onAnswerChange(text);
  }

  return (
    <View style={s.container}>
      <Text style={s.prompt}>{prompt}</Text>
      {context != null && <Text style={s.context}>{context}</Text>}
      <TextInput
        style={[
          s.input,
          {
            borderColor: hasEnough
              ? accent
              : value.length > 0
              ? '#F59E0B'
              : '#252540',
          },
        ]}
        value={value}
        onChangeText={handleChange}
        placeholder="Write your response here…"
        placeholderTextColor="#8888AA"
        multiline
        numberOfLines={6}
        textAlignVertical="top"
        editable={!disabled}
        accessibilityLabel="Writing prompt response"
      />
      <View style={s.wordCountRow}>
        <Text style={[s.wordCount, { color: hasEnough ? accent : '#8888AA' }]}>
          {words} word{words !== 1 ? 's' : ''}
        </Text>
        <Text style={s.wordMin}>min {minWords}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  prompt: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  context: {
    fontSize: 14,
    color: '#8888AA',
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    fontSize: 15,
    color: '#FFFFFF',
    lineHeight: 22,
    minHeight: 140,
  },
  wordCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  wordCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  wordMin: {
    fontSize: 12,
    color: '#8888AA',
  },
});
