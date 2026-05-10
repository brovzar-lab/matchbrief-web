import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { DEMO_SYNTHESES } from '../lib/mockData';
import type { SynthesisSource, SynthesisResult } from '../lib/types';

type Tab = SynthesisSource;

export default function NewSynthesisScreen(): JSX.Element {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('url');
  const [url, setUrl] = useState('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const user = useAppStore((s) => s.user);
  const rateLimitInfo = useAppStore((s) => s.rateLimitInfo);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);
  const prependSynthesis = useAppStore((s) => s.prependSynthesis);
  const setRateLimitInfo = useAppStore((s) => s.setRateLimitInfo);
  const addToast = useAppStore((s) => s.addToast);

  function checkRateLimit(): boolean {
    if (!rateLimitInfo) return true;
    if (rateLimitInfo.used >= rateLimitInfo.limit) {
      setShowPaywall(true);
      return false;
    }
    return true;
  }

  async function handleDemoSubmit(): Promise<void> {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    const demo = DEMO_SYNTHESES[Math.floor(Math.random() * DEMO_SYNTHESES.length)];
    prependSynthesis({ ...demo, id: Math.random().toString(36).slice(2), createdAt: new Date() });
    addToast('Demo mode — synthesis not saved');
    navigate('/');
    setLoading(false);
  }

  async function handleUrlSubmit(): Promise<void> {
    if (!url.trim()) { setError('Please enter a URL.'); return; }
    if (!checkRateLimit()) return;
    if (isDemoMode) { await handleDemoSubmit(); return; }

    setLoading(true);
    setError('');
    try {
      const { httpsCallable } = await import('firebase/functions');
      const { functions } = await import('../lib/firebase');
      if (!functions) return;

      const fn = httpsCallable<{ url: string }, SynthesisResult>(functions, 'synthesizeUrl');
      const result = await fn({ url: url.trim() });
      const r = result.data;

      prependSynthesis({
        id: r.synthesisId,
        sourceType: 'url',
        sourceUrl: url.trim(),
        title: r.title,
        summary: r.summary,
        keyInsights: r.keyInsights,
        actionItems: r.actionItems,
        tags: r.tags,
        createdAt: new Date(),
      });

      if (rateLimitInfo) {
        setRateLimitInfo({ ...rateLimitInfo, used: rateLimitInfo.used + 1 });
      }

      navigate(`/synthesis/${r.synthesisId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Synthesis failed. Please try again.';
      if (msg.includes('rate-limit')) {
        setShowPaywall(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handlePdfSubmit(): Promise<void> {
    if (!pdfFile) { setError('Please select a PDF.'); return; }
    if (!checkRateLimit()) return;
    if (isDemoMode) { await handleDemoSubmit(); return; }

    setLoading(true);
    setError('');
    try {
      const { ref, uploadBytes } = await import('firebase/storage');
      const { httpsCallable } = await import('firebase/functions');
      const { storage, functions } = await import('../lib/firebase');
      if (!storage || !functions || !user) return;

      const storagePath = `pdfs/${user.uid}/${Date.now()}_${pdfFile.name}`;
      const fileRef2 = ref(storage, storagePath);
      await uploadBytes(fileRef2, pdfFile);

      const fn = httpsCallable<{ storagePath: string; fileName: string }, SynthesisResult>(
        functions,
        'synthesizePdf',
      );
      const result = await fn({ storagePath, fileName: pdfFile.name });
      const r = result.data;

      prependSynthesis({
        id: r.synthesisId,
        sourceType: 'pdf',
        pdfName: pdfFile.name,
        title: r.title,
        summary: r.summary,
        keyInsights: r.keyInsights,
        actionItems: r.actionItems,
        tags: r.tags,
        createdAt: new Date(),
      });

      if (rateLimitInfo) {
        setRateLimitInfo({ ...rateLimitInfo, used: rateLimitInfo.used + 1 });
      }

      navigate(`/synthesis/${r.synthesisId}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Synthesis failed. Please try again.';
      if (msg.includes('rate-limit')) {
        setShowPaywall(true);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-lg font-bold text-gray-900">New Synthesis</h1>
        </div>

        {/* Tabs */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 mb-5">
          {(['url', 'pdf'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                tab === t
                  ? 'bg-brand-600 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'url' ? '🔗 URL' : '📄 PDF'}
            </button>
          ))}
        </div>

        {/* URL input */}
        {tab === 'url' && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Article or blog URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                onKeyDown={(e) => e.key === 'Enter' && void handleUrlSubmit()}
              />
            </div>
            <button
              onClick={() => void handleUrlSubmit()}
              disabled={loading || !url.trim()}
              className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Synthesizing…
                </span>
              ) : (
                'Synthesize'
              )}
            </button>
          </div>
        )}

        {/* PDF input */}
        {tab === 'pdf' && (
          <div className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 text-center hover:border-brand-400 hover:bg-brand-50 transition-all"
            >
              {pdfFile ? (
                <div>
                  <div className="text-2xl mb-1">📄</div>
                  <p className="text-sm font-medium text-gray-800">{pdfFile.name}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {(pdfFile.size / 1024 / 1024).toFixed(1)} MB — tap to change
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-2xl mb-1">📁</div>
                  <p className="text-sm font-medium text-gray-700">Tap to select a PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Max 10 MB</p>
                </div>
              )}
            </button>
            <button
              onClick={() => void handlePdfSubmit()}
              disabled={loading || !pdfFile}
              className="w-full bg-brand-600 text-white rounded-xl py-3.5 font-semibold text-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⟳</span> Uploading & synthesizing…
                </span>
              ) : (
                'Synthesize PDF'
              )}
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600 text-center">{error}</p>
        )}

        {/* What you get */}
        <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            What you get
          </p>
          <ul className="space-y-1.5 text-sm text-gray-600">
            {[
              '2-3 sentence summary',
              '3-5 key insights',
              '1-3 action items',
              '5 topic tags',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="text-brand-500">✦</span> {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
