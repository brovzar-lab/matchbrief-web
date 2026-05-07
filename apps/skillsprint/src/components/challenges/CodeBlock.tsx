import React from 'react';
import { ScrollView, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  code: string;
}

export function CodeBlock({ code }: Props) {
  return (
    <ScrollView
      horizontal
      style={s.scroll}
      contentContainerStyle={s.content}
      showsHorizontalScrollIndicator={false}
      accessibilityLabel="Code snippet"
    >
      <Text style={s.code} selectable>
        {code}
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
  },
  content: {
    padding: 16,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },
});
