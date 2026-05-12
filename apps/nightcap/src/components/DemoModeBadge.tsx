import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ACCENT, TEXT } from '../lib/config';

export default function DemoModeBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>Demo Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: ACCENT + '33',
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    zIndex: 999,
  },
  text: {
    color: TEXT,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
