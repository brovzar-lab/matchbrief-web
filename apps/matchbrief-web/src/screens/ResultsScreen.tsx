import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/config';
import { COVER_LETTER_LABELS } from '../lib/config';
import DemoModeBadge from '../components/DemoModeBadge';
import ScoreRing from '../components/ScoreRing';
import KeywordChip from '../components/KeywordChip';

type Tab = 'score' | 'bullets' | 'letters';

export default function ResultsScreen() {
  const analysis = useStore((s) => s.currentAnalysis);
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('score');
  const [activeLetter, setActiveLetter] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!analysis) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-center px-8">
        <p className="text-slate-400 text-sm mb-4">No analysis loaded.</p>
        <button
          onClick={() => navigate('/analyze')}
          className="bg-accent text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
        >
          Start New Analysis
        </button>
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'score', label: 'Score' },
    { id: 'bullets', label: 'Bullets' },
    { id: 'letters', label: 'Letters' },
  ];

  async function copyLetter() {
    const text = analysis!.coverLetters[activeLetter];
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function printLetter() {
    window.print();
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isDemoMode && <DemoModeBadge />}

      <div className="px-5 pt-4 pb-3 shrink-0 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="text-slate-400 hover:text-slate-600 transition-colors no-print"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <h1 className="text-lg font-extrabold text-slate-900 flex-1 truncate">
          {analysis.jobDescription.split('\n')[0].slice(0, 50)}
        </h1>
      </div>

      <div className="px-5 mb-3 shrink-0 no-print">
        <div className="flex border border-slate-200 rounded-xl overflow-hidden">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tab === id ? 'bg-accent text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        {tab === 'score' && (
          <div className="space-y-5">
            <div className="flex justify-center pt-2">
              <ScoreRing score={analysis.score} size={140} />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Keywords</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Match</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" />Partial</span>
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Missing</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.keywords.map((kw) => (
                  <KeywordChip key={kw.word} keyword={kw} />
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-700 mb-1">What this score means</p>
              <p>
                {analysis.score >= 75
                  ? 'Strong match. Your resume hits most of the key requirements. Focus on adding missing keywords and sharpening your bullet points.'
                  : analysis.score >= 50
                  ? 'Moderate match. There are notable gaps — add missing keywords and tailor your experience to the role before applying.'
                  : 'Weak match. Significant gaps exist. Consider whether this role aligns with your background before investing time in the application.'}
              </p>
            </div>
          </div>
        )}

        {tab === 'bullets' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-400 leading-relaxed">
              Rewritten with stronger action verbs and quantified impact.
            </p>
            {analysis.rewrittenBullets.map((bullet, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-red-50 border-b border-slate-100">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-1">Before</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{bullet.original}</p>
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">After</p>
                  <p className="text-sm text-slate-900 font-medium leading-relaxed">{bullet.rewritten}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'letters' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {COVER_LETTER_LABELS.map((label, i) => (
                <button
                  key={label}
                  onClick={() => setActiveLetter(i)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-colors ${
                    activeLetter === i
                      ? 'bg-accent text-white border-accent'
                      : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 print-target">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed font-sans">
                {analysis.coverLetters[activeLetter]}
              </pre>
            </div>

            <div className="flex gap-3 no-print">
              <button
                onClick={copyLetter}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {copied ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={printLetter}
                className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
                  <rect x="6" y="14" width="12" height="8" />
                </svg>
                Print
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
