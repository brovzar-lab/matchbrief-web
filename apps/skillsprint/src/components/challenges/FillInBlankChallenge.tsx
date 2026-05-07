import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import type { FillInBlankChallenge } from '../../types/challenges';
import { CodeBlock } from './CodeBlock';

interface Props {
  challenge: FillInBlankChallenge;
  accent: string;
  onAnswerChange: (answer: string | string[]) => void;
  disabled?: boolean;
}

const BLANK_PLACEHOLDER = '[ ________ ]';

export function FillInBlankChallengeRenderer({
  challenge,
  accent,
  onAnswerChange,
  disabled,
}: Props) {
  const [value, setValue] = useState('');
  const { codeSnippet } = challenge.content;

  const displayCode = codeSnippet.replace('__BLANK__', BLANK_PLACEHOLDER);

  function handleChange(text: string) {
    setValue(text);
    onAnswerChange(text);
  }

  return (
    <View style={s.container}>
      <Text style={s.heading}>Fill in the blank</Text>
      <CodeBlock code={displayCode} />
      <View style={s.inputSection}>
        <Text style={s.inputLabel}>Your answer</Text>
        <TextInput
          style={[
            s.input,
            { borderColor: value.trim().length > 0 ? accent : '#252540' },
          ]}
          value={value}
          onChangeText={handleChange}
          placeholder="Type the missing token…"
          placeholderTextColor="#8888AA"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          editable={!disabled}
          returnKeyType="done"
          accessibilityLabel="Fill in the blank answer"
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  inputSection: { gap: 8 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#8888AA' },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1.5,
    fontSize: 15,
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    minHeight: 44,
  },
});
