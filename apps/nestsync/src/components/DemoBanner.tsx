import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isDemoMode } from '../lib/config';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View style={styles.banner} accessibilityLabel="Demo mode active">
      <Text style={styles.text}>DEMO MODE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#0A1628',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1B3558',
  },
  text: { fontSize: 11, color: '#10B981', fontWeight: '600', letterSpacing: 1 },
});
