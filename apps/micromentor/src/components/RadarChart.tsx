import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { CareerDimensions, DimensionKey } from '../lib/types';
import { ACCENT, ACCENT_DIM, BORDER, SUBTEXT, TEXT } from '../lib/config';

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  leadership: 'Leadership',
  communication: 'Comms',
  strategy: 'Strategy',
  execution: 'Execution',
  influence: 'Influence',
  selfAwareness: 'Self-Aware',
};

const KEYS: DimensionKey[] = [
  'leadership',
  'communication',
  'strategy',
  'execution',
  'influence',
  'selfAwareness',
];

const SIZE = 220;
const CENTER = SIZE / 2;
const RADIUS = 80;
const LABEL_RADIUS = RADIUS + 22;
const N = KEYS.length;

function angleFor(i: number) {
  return (Math.PI * 2 * i) / N - Math.PI / 2;
}

function point(r: number, i: number) {
  const angle = angleFor(i);
  return { x: CENTER + r * Math.cos(angle), y: CENTER + r * Math.sin(angle) };
}

interface Props {
  dimensions: CareerDimensions;
}

export default function RadarChart({ dimensions }: Props) {
  // Web rings at 25%, 50%, 75%, 100%
  const rings = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = KEYS.map((k, i) => {
    const ratio = Math.max(0, Math.min(10, dimensions[k])) / 10;
    return point(RADIUS * ratio, i);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE}>
        {/* Rings */}
        {rings.map((r) => {
          const ringPoints = KEYS.map((_, i) => point(RADIUS * r, i));
          const poly = ringPoints.map((p) => `${p.x},${p.y}`).join(' ');
          return (
            <Polygon
              key={r}
              points={poly}
              fill="none"
              stroke={BORDER}
              strokeWidth={1}
            />
          );
        })}

        {/* Spokes */}
        {KEYS.map((_, i) => {
          const outer = point(RADIUS, i);
          return (
            <Line
              key={i}
              x1={CENTER}
              y1={CENTER}
              x2={outer.x}
              y2={outer.y}
              stroke={BORDER}
              strokeWidth={1}
            />
          );
        })}

        {/* Data polygon */}
        <Polygon
          points={dataPolygon}
          fill={ACCENT + '33'}
          stroke={ACCENT}
          strokeWidth={2}
        />

        {/* Data dots */}
        {dataPoints.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r={4} fill={ACCENT} />
        ))}

        {/* Labels */}
        {KEYS.map((k, i) => {
          const lp = point(LABEL_RADIUS, i);
          const anchor =
            lp.x < CENTER - 5 ? 'end' : lp.x > CENTER + 5 ? 'start' : 'middle';
          return (
            <SvgText
              key={k}
              x={lp.x}
              y={lp.y + 4}
              fontSize={9}
              fill={SUBTEXT}
              textAnchor={anchor}
            >
              {DIMENSION_LABELS[k]}
            </SvgText>
          );
        })}
      </Svg>

      {/* Score list */}
      <View style={styles.scoreList}>
        {KEYS.map((k) => (
          <View key={k} style={styles.scoreRow}>
            <Text style={styles.scoreLabel}>{DIMENSION_LABELS[k]}</Text>
            <View style={styles.scoreBarBg}>
              <View
                style={[
                  styles.scoreBarFill,
                  { width: `${(dimensions[k] / 10) * 100}%` as any },
                ]}
              />
            </View>
            <Text style={styles.scoreValue}>{dimensions[k]}/10</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 16 },
  scoreList: { width: '100%', gap: 8 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel: { width: 80, fontSize: 12, color: SUBTEXT },
  scoreBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: 3,
  },
  scoreValue: { width: 36, fontSize: 11, color: TEXT, textAlign: 'right' },
});
