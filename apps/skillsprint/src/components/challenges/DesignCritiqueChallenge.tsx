import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import type { DesignCritiqueChallenge } from '../../types/challenges';

interface Props {
  challenge: DesignCritiqueChallenge;
  accent: string;
  onAnswerChange: (answer: string | string[]) => void;
  disabled?: boolean;
}

export function DesignCritiqueChallengeRenderer({
  challenge,
  accent,
  onAnswerChange,
  disabled,
}: Props) {
  const { imageUri, context, critiqueFields } = challenge.content;
  const [imageError, setImageError] = useState(false);

  const [fieldValues, setFieldValues] = useState<Record<string, string>>(
    () => Object.fromEntries(critiqueFields.map((f) => [f, ''])),
  );

  function handleFieldChange(field: string, text: string) {
    const next = { ...fieldValues, [field]: text };
    setFieldValues(next);
    onAnswerChange(critiqueFields.map((f) => next[f] ?? ''));
  }

  return (
    <View style={s.container}>
      {imageError ? (
        <View style={s.imageFallback}>
          <Text style={s.imageFallbackText}>Design sample</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUri }}
          style={s.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
          accessibilityLabel="Design sample to critique"
        />
      )}

      <Text style={s.context}>{context}</Text>

      <View style={s.fields}>
        {critiqueFields.map((field) => {
          const val = fieldValues[field] ?? '';
          const filled = val.trim().length > 0;
          return (
            <View key={field} style={s.fieldRow}>
              <Text style={s.fieldLabel}>{field}</Text>
              <TextInput
                style={[
                  s.fieldInput,
                  { borderColor: filled ? accent : '#252540' },
                ]}
                value={val}
                onChangeText={(text) => handleFieldChange(field, text)}
                placeholder={`Your critique of ${field.toLowerCase()}…`}
                placeholderTextColor="#8888AA"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!disabled}
                accessibilityLabel={`${field} critique`}
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 16 },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  imageFallback: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#252540',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFallbackText: {
    fontSize: 14,
    color: '#8888AA',
    fontWeight: '600',
  },
  context: {
    fontSize: 15,
    color: '#8888AA',
    lineHeight: 22,
  },
  fields: { gap: 16 },
  fieldRow: { gap: 6 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  fieldInput: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    minHeight: 80,
  },
});
