import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { isDemoMode } from '../lib/config';

export function DemoBanner() {
  if (!isDemoMode) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Demo Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#C9934C22',
    borderBottomWidth: 1,
    borderBottomColor: '#C9934C44',
    paddingVertical: 4,
    alignItems: 'center',
  },
  text: {
    color: '#C9934C',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});
