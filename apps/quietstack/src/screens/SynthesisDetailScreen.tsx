import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';

export default function SynthesisDetailScreen(): JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const syntheses = useAppStore((s) => s.syntheses);
  const synthesis = syntheses.find((s) => s.id === id);

  if (!synthesis) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Synthesis not found.</p>
          <button onClick={() => navigate('/')} className="mt-3 text-brand-600 text-sm font-medium">
            Go home
          </button>
        </div>
      </div>
    );
  }

  const date = synthesis.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors"
          >
            ←
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span>{synthesis.sourceType === 'url' ? '🔗' : '📄'}</span>
              <span className="text-xs text-gray-400 truncate">
                {synthesis.sourceType === 'url'
                  ? (synthesis.sourceUrl ?? '')
                  : (synthesis.pdfName ?? '')}
              </span>
            </div>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-4 leading-snug">
          {synthesis.title}
        </h1>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {synthesis.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Summary */}
        <Section title="Summary">
          <p className="text-sm text-gray-700 leading-relaxed">{synthesis.summary}</p>
        </Section>

        {/* Key Insights */}
        <Section title="Key Insights">
          <ul className="space-y-2">
            {synthesis.keyInsights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-500 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span>
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </Section>

        {/* Action Items */}
        <Section title="Action Items">
          <ul className="space-y-2">
            {synthesis.actionItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-brand-500 flex-shrink-0 mt-0.5">☐</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-3">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}
