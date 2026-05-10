import type { Synthesis } from '../lib/types';

type Props = {
  synthesis: Synthesis;
  onClick: () => void;
};

export default function SynthesisCard({ synthesis, onClick }: Props): JSX.Element {
  const date = synthesis.createdAt.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-gray-200 rounded-2xl p-4 hover:border-brand-300 hover:shadow-md transition-all group"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5 flex-shrink-0">
          {synthesis.sourceType === 'url' ? '🔗' : '📄'}
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-brand-700 line-clamp-2">
            {synthesis.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{synthesis.summary}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-gray-400">{date}</span>
            <span className="text-gray-300">·</span>
            <div className="flex gap-1 flex-wrap">
              {synthesis.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
