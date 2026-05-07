import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function DemoBanner() {
  return (
    <View style={styles.banner} accessibilityLabel="Demo mode active">
      <Text style={styles.text}>DEMO MODE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#1A1A2E',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
  },
  text: { fontSize: 11, color: '#00C8FF', fontWeight: '600', letterSpacing: 1 },
});
