import type { AnalysisKeyword } from '../lib/types';

const STATUS_CLASSES: Record<AnalysisKeyword['status'], string> = {
  green: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-600 border-red-200',
};

const STATUS_DOT: Record<AnalysisKeyword['status'], string> = {
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

interface Props {
  keyword: AnalysisKeyword;
}

export default function KeywordChip({ keyword }: Props) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${STATUS_CLASSES[keyword.status]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[keyword.status]}`} />
      {keyword.word}
    </span>
  );
}
