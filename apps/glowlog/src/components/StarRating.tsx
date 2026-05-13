import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { ACCENT, MUTED } from '../lib/config';

interface Props {
  value: number;
  onChange?: (stars: number) => void;
  size?: number;
  readonly?: boolean;
}

export default function StarRating({ value, onChange, size = 24, readonly = false }: Props) {
  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((star) => (
        <TouchableOpacity
          key={star}
          onPress={() => !readonly && onChange?.(star)}
          disabled={readonly}
          style={{ padding: 2 }}
        >
          <Text style={{ fontSize: size, color: star <= value ? ACCENT : MUTED }}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
