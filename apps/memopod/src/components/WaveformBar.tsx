import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { ACCENT } from '../lib/config';

interface Props {
  active: boolean;
  color?: string;
  barCount?: number;
}

export default function WaveformBar({ active, color = ACCENT, barCount = 20 }: Props) {
  const animations = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    if (!active) {
      animations.forEach((anim) => Animated.spring(anim, { toValue: 0.3, useNativeDriver: false }).start());
      return;
    }

    const anims = animations.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 40),
          Animated.timing(anim, {
            toValue: 0.2 + Math.random() * 0.8,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0.1 + Math.random() * 0.4,
            duration: 300 + Math.random() * 200,
            useNativeDriver: false,
          }),
        ]),
      ),
    );

    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [active]);

  return (
    <View style={styles.container}>
      {animations.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 40] }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 44,
  },
  bar: {
    width: 3,
    borderRadius: 2,
  },
});
