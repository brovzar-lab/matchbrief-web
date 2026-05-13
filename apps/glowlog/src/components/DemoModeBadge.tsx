import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACCENT, ACCENT_DIM } from '../lib/config';

export default function DemoModeBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Demo Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'center',
    backgroundColor: ACCENT_DIM,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 3,
    marginBottom: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    color: ACCENT,
    letterSpacing: 0.5,
  },
});
