import React from 'react';
import Svg, { Polygon, Line, Circle, Text as SvgText } from 'react-native-svg';
import { Ratings, DIM_COLORS, DIMENSIONS } from '../lib/config';
import { BORDER, SUBTEXT, ACCENT } from '../lib/config';

interface Props {
  ratings: Ratings;
  size?: number;
}

const LABELS: Record<keyof Ratings, string> = {
  energy: 'Energy',
  mood: 'Mood',
  focus: 'Focus',
  social: 'Social',
  output: 'Output',
};

export default function RadarChart({ ratings, size = 220 }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.38;
  const labelR = size * 0.47;
  const n = DIMENSIONS.length;
  const levels = [2, 4, 6, 8, 10];

  function polar(angle: number, r: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const axisAngles = DIMENSIONS.map((_, i) => (360 / n) * i);

  const webPoints = levels.map((lvl) =>
    axisAngles.map((a) => polar(a, (lvl / 10) * maxR)),
  );

  const dataPoints = DIMENSIONS.map((dim, i) => {
    const val = ratings[dim] ?? 0;
    return polar(axisAngles[i], (val / 10) * maxR);
  });

  const dataPolygon = dataPoints.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <Svg width={size} height={size}>
      {/* Web grid */}
      {webPoints.map((ring, ri) => (
        <Polygon
          key={ri}
          points={ring.map((p) => `${p.x},${p.y}`).join(' ')}
          fill="none"
          stroke={BORDER}
          strokeWidth={0.8}
        />
      ))}

      {/* Axis lines */}
      {axisAngles.map((angle, i) => {
        const outer = polar(angle, maxR);
        return (
          <Line
            key={i}
            x1={cx}
            y1={cy}
            x2={outer.x}
            y2={outer.y}
            stroke={BORDER}
            strokeWidth={0.8}
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
        <Circle key={i} cx={p.x} cy={p.y} r={4} fill={DIM_COLORS[DIMENSIONS[i]]} />
      ))}

      {/* Labels */}
      {axisAngles.map((angle, i) => {
        const lp = polar(angle, labelR);
        const dim = DIMENSIONS[i];
        return (
          <SvgText
            key={i}
            x={lp.x}
            y={lp.y + 4}
            textAnchor="middle"
            fill={SUBTEXT}
            fontSize={11}
            fontWeight="500"
          >
            {LABELS[dim]}
          </SvgText>
        );
      })}
    </Svg>
  );
}
