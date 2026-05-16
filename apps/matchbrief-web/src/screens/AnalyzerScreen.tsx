import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/config';
import { DEMO_ANALYSIS } from '../demo/seed';
import DemoModeBadge from '../components/DemoModeBadge';

const ANALYZE_STEPS = [
  'Parsing your documents…',
  'Extracting keywords…',
  'Scoring resume match…',
  'Rewriting your bullets…',
  'Generating cover letters…',
];

export default function AnalyzerScreen() {
  const [jd, setJd] = useState('');
  const [resume, setResume] = useState('');
  const [pdfError, setPdfError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const analyzeStatus = useStore((s) => s.analyzeStatus);
  const analyzeStep = useStore((s) => s.analyzeStep);
  const analyzeError = useStore((s) => s.analyzeError);
  const setCurrentAnalysis = useStore((s) => s.setCurrentAnalysis);
  const prependAnalysis = useStore((s) => s.prependAnalysis);
  const setAnalyzeStatus = useStore((s) => s.setAnalyzeStatus);
  const setAnalyzeStep = useStore((s) => s.setAnalyzeStep);
  const setAnalyzeError = useStore((s) => s.setAnalyzeError);

  const loading = analyzeStatus === 'loading';

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPdfError('');

    if (isDemoMode) {
      setPdfError('Demo mode — PDF parsing bypassed. Using pre-loaded resume text.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const { parseResumePdfFn } = await import('../lib/firebase');
        const result = await parseResumePdfFn({ pdfBase64: base64 });
        if (result.data.text) {
          setResume(result.data.text);
        } else {
          setPdfError('Scanned PDF detected — please paste your resume text instead.');
        }
      } catch {
        setPdfError('Could not parse PDF. Please paste your resume text manually.');
      }
    };
    reader.readAsDataURL(file);
  }

  async function handleAnalyze() {
    if (!jd.trim() || !resume.trim()) return;
    setAnalyzeError(null);
    setAnalyzeStatus('loading');

    if (isDemoMode) {
      let stepIdx = 0;
      setAnalyzeStep(ANALYZE_STEPS[0]);
      const interval = setInterval(() => {
        stepIdx++;
        if (stepIdx < ANALYZE_STEPS.length) {
          setAnalyzeStep(ANALYZE_STEPS[stepIdx]);
        } else {
          clearInterval(interval);
          setAnalyzeStatus('idle');
          setCurrentAnalysis(DEMO_ANALYSIS);
          prependAnalysis(DEMO_ANALYSIS);
          navigate('/results');
        }
      }, 1200);
      return;
    }

    try {
      const { analyzeApplicationFn } = await import('../lib/firebase');
      let stepIdx = 0;
      setAnalyzeStep(ANALYZE_STEPS[0]);
      const interval = setInterval(() => {
        stepIdx = Math.min(stepIdx + 1, ANALYZE_STEPS.length - 1);
        setAnalyzeStep(ANALYZE_STEPS[stepIdx]);
      }, 6000);

      const result = await analyzeApplicationFn({ jobDescription: jd, resumeText: resume });
      clearInterval(interval);

      const analysis = {
        id: result.data.analysisId,
        jobDescription: jd,
        resumeText: resume,
        score: result.data.score,
        keywords: result.data.keywords,
        rewrittenBullets: result.data.rewrittenBullets,
        coverLetters: result.data.coverLetters,
        createdAt: new Date().toISOString(),
      };

      setCurrentAnalysis(analysis);
      prependAnalysis(analysis);
      setAnalyzeStatus('idle');
      navigate('/results');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Analysis failed.';
      if (msg.includes('resource-exhausted')) {
        setAnalyzeError('Free tier limit reached (3 analyses/month). Upgrade to continue.');
      } else {
        setAnalyzeError(msg.replace('Firebase: ', '').trim());
      }
      setAnalyzeStatus('error');
    }
  }

  const canAnalyze = jd.trim().length > 50 && resume.trim().length > 50 && !loading;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {isDemoMode && <DemoModeBadge />}

      <div className="px-5 pt-5 pb-3 shrink-0">
        <h1 className="text-xl font-extrabold text-slate-900">New Analysis</h1>
        <p className="text-xs text-slate-400 mt-0.5">Paste job description + resume, then click Analyze</p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-4 space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Job Description
          </label>
          <textarea
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste the full job description here…"
            rows={7}
            disabled={loading}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-accent resize-none disabled:opacity-50"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Your Resume
            </label>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={loading}
              className="flex items-center gap-1 text-xs font-semibold text-accent hover:underline disabled:opacity-50"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              Upload PDF
            </button>
            <input ref={fileRef} type="file" accept=".pdf" onChange={handlePdfUpload} className="hidden" />
          </div>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume text here, or upload a PDF above…"
            rows={9}
            disabled={loading}
            className="w-full border border-slate-200 rounded-xl p-3 text-sm text-slate-800 placeholder-slate-300 outline-none focus:border-accent resize-none disabled:opacity-50"
          />
          {pdfError && (
            <p className="text-xs text-amber-600 mt-1">{pdfError}</p>
          )}
        </div>
      </div>

      <div className="px-5 pb-6 pt-2 shrink-0">
        {loading ? (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-sm font-semibold text-accent">{analyzeStep}</p>
            <p className="text-xs text-indigo-400 mt-1">~30 seconds</p>
          </div>
        ) : (
          <>
            {analyzeError && (
              <p className="text-xs text-red-500 text-center mb-2">{analyzeError}</p>
            )}
            <button
              onClick={handleAnalyze}
              disabled={!canAnalyze}
              className="w-full bg-accent text-white rounded-2xl py-4 font-bold text-base hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Analyze Application
            </button>
            {(!jd.trim() || !resume.trim()) && (
              <p className="text-xs text-slate-400 text-center mt-2">
                Both fields required (min 50 characters each)
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
