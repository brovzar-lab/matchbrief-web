import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  secondsLeft: number;
  totalSeconds: number;
  accent: string;
}

const SIZE = 200;
const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function ringColor(secondsLeft: number, accent: string): string {
  if (secondsLeft <= 60) return '#EF4444';
  if (secondsLeft <= 180) return '#F59E0B';
  return accent;
}

export function TimerRing({ secondsLeft, totalSeconds, accent }: Props) {
  const progress = secondsLeft / totalSeconds;
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const color = ringColor(secondsLeft, accent);

  return (
    <View style={s.container}>
      <Svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke="#252540"
          strokeWidth={12}
          fill="none"
        />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={color}
          strokeWidth={12}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={s.overlay}>
        <Text style={[s.digits, { color }]}>{formatTime(secondsLeft)}</Text>
        {secondsLeft <= 30 && secondsLeft > 0 && (
          <Text style={s.warning}>Auto-submitting in {secondsLeft}s…</Text>
        )}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SIZE,
  },
  overlay: {
    position: 'absolute',
    alignItems: 'center',
  },
  digits: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  warning: {
    fontSize: 11,
    color: '#EF4444',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
});
