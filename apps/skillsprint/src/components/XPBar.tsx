import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  xp: number;
  nextLevelXp: number;
  level: number;
  accentColor: string;
}

export function XPBar({ xp, nextLevelXp, level, accentColor }: Props) {
  const progress = Math.min(xp / nextLevelXp, 1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.levelText}>Level {level}</Text>
        <Text style={styles.xpText}>
          {xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${Math.round(progress * 100)}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  xpText: { fontSize: 12, color: '#8888AA' },
  track: {
    height: 6,
    backgroundColor: '#252540',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
});
