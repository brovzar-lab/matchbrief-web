import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/config';
import { SCORE_COLOR } from '../lib/config';
import DemoModeBadge from '../components/DemoModeBadge';

function ScoreBadge({ score }: { score: number }) {
  const color = SCORE_COLOR(score);
  return (
    <span
      className="text-sm font-extrabold tabular-nums px-2.5 py-1 rounded-full text-white shrink-0"
      style={{ backgroundColor: color }}
    >
      {score}
    </span>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return h === 0 ? 'Just now' : `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function jobTitle(jd: string): string {
  const first = jd.split('\n')[0].trim();
  return first.length > 60 ? first.slice(0, 57) + '…' : first;
}

export default function DashboardScreen() {
  const analyses = useStore((s) => s.analyses);
  const setCurrentAnalysis = useStore((s) => s.setCurrentAnalysis);
  const navigate = useNavigate();

  function openAnalysis(id: string) {
    const a = analyses.find((x) => x.id === id);
    if (a) {
      setCurrentAnalysis(a);
      navigate('/results');
    }
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-y-auto">
      {isDemoMode && <DemoModeBadge />}

      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-slate-900">My Analyses</h1>
        <button
          onClick={() => navigate('/analyze')}
          className="flex items-center gap-1.5 bg-accent text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <span className="text-base leading-none">+</span> New
        </button>
      </div>

      {analyses.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8 pb-16">
          <div className="text-5xl mb-4">📋</div>
          <p className="text-lg font-bold text-slate-700 mb-2">No analyses yet</p>
          <p className="text-slate-400 text-sm mb-6">Paste a job description and your resume to get your first match score, keyword breakdown, and cover letters.</p>
          <button
            onClick={() => navigate('/analyze')}
            className="bg-accent text-white font-bold px-6 py-3 rounded-2xl hover:bg-indigo-700 transition-colors"
          >
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="px-5 pb-6 space-y-3">
          {analyses.map((a) => (
            <button
              key={a.id}
              onClick={() => openAnalysis(a.id)}
              className="w-full bg-white border border-slate-200 rounded-2xl p-4 text-left hover:border-indigo-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-slate-900 leading-snug flex-1">
                  {jobTitle(a.jobDescription)}
                </p>
                <ScoreBadge score={a.score} />
              </div>
              <div className="flex items-center gap-3">
                <p className="text-xs text-slate-400">{timeAgo(a.createdAt)}</p>
                <span className="text-slate-200">·</span>
                <p className="text-xs text-slate-400">{a.keywords.filter((k) => k.status === 'red').length} missing keywords</p>
                <span className="text-slate-200">·</span>
                <p className="text-xs text-slate-400">{a.rewrittenBullets.length} bullet rewrites</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
