import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ACCENT, BORDER, MUTED } from '../lib/config';

interface Props {
  total: number;
  current: number;
}

export default function StepProgress({ total, current }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i < current && styles.dotDone,
            i === current && styles.dotActive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BORDER,
  },
  dotDone: { backgroundColor: MUTED },
  dotActive: { backgroundColor: ACCENT, width: 20, borderRadius: 4 },
});
