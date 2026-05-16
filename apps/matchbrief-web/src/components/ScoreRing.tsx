import { SCORE_COLOR } from '../lib/config';

interface Props {
  score: number;
  size?: number;
}

const RADIUS = 40;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ScoreRing({ score, size = 120 }: Props) {
  const offset = CIRCUMFERENCE * (1 - score / 100);
  const color = SCORE_COLOR(score);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        style={{ transform: 'rotate(-90deg)' }}
      >
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="10"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50"
          y="54"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill={color}
          style={{ transform: 'rotate(90deg)', transformOrigin: '50% 50%', fontFamily: 'Inter, sans-serif' }}
        >
          {score}
        </text>
      </svg>
      <p className="text-xs font-semibold text-slate-500 -mt-1">Match Score</p>
    </div>
  );
}
