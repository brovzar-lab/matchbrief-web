import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import SynthesisCard from '../components/SynthesisCard';
import UsageBadge from '../components/UsageBadge';
import type { Synthesis } from '../lib/types';

export default function HomeScreen(): JSX.Element {
  const navigate = useNavigate();
  const user = useAppStore((s) => s.user);
  const syntheses = useAppStore((s) => s.syntheses);
  const setSyntheses = useAppStore((s) => s.setSyntheses);
  const setRateLimitInfo = useAppStore((s) => s.setRateLimitInfo);
  const setShowPaywall = useAppStore((s) => s.setShowPaywall);

  useEffect(() => {
    if (isDemoMode || !user) return;

    async function loadLibrary(): Promise<void> {
      const { collection, query, orderBy, limit, getDocs } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      if (!db) return;

      const q = query(
        collection(db, 'users', user!.uid, 'syntheses'),
        orderBy('createdAt', 'desc'),
        limit(50),
      );
      const snap = await getDocs(q);
      const items: Synthesis[] = snap.docs.map((doc) => {
        const d = doc.data();
        return {
          id: doc.id,
          sourceType: d.sourceType,
          sourceUrl: d.sourceUrl,
          pdfName: d.pdfName,
          title: d.title,
          summary: d.summary,
          keyInsights: d.keyInsights,
          actionItems: d.actionItems,
          tags: d.tags,
          createdAt: d.createdAt.toDate(),
        };
      });
      setSyntheses(items);
    }

    async function loadUsage(): Promise<void> {
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('../lib/firebase');
      if (!db) return;

      const month = new Date().toISOString().slice(0, 7);
      const usageRef = doc(db, 'users', user!.uid, 'monthlyUsage', month);
      const profileRef = doc(db, 'users', user!.uid);

      const [usageSnap, profileSnap] = await Promise.all([getDoc(usageRef), getDoc(profileRef)]);
      const count = usageSnap.exists() ? (usageSnap.data().count as number) : 0;
      const tier = profileSnap.exists() ? (profileSnap.data().tier as 'free' | 'pro') : 'free';
      setRateLimitInfo({ used: count, limit: tier === 'pro' ? 50 : 5, tier });
    }

    void loadLibrary();
    void loadUsage();
  }, [user, setSyntheses, setRateLimitInfo]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">QuietStack</h1>
            <p className="text-xs text-gray-500">Your synthesis library</p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-300 transition-colors"
          >
            ⚙
          </button>
        </div>

        {/* Usage */}
        <div className="mb-4">
          <UsageBadge onUpgradeClick={() => setShowPaywall(true)} />
        </div>

        {/* New Synthesis CTA */}
        <button
          onClick={() => navigate('/new')}
          className="w-full bg-brand-600 text-white rounded-2xl py-4 font-semibold text-sm hover:bg-brand-700 transition-colors mb-6 flex items-center justify-center gap-2"
        >
          <span className="text-base">+</span> New Synthesis
        </button>

        {/* Library */}
        {syntheses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📚</div>
            <p className="text-gray-500 text-sm">
              Paste a URL or upload a PDF to create your first synthesis.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {syntheses.map((s) => (
              <SynthesisCard
                key={s.id}
                synthesis={s}
                onClick={() => navigate(`/synthesis/${s.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
