import type { Synthesis, MonthlyUsage, RateLimitInfo } from './types';

export const DEMO_SYNTHESES: Synthesis[] = [
  {
    id: 'demo-1',
    sourceType: 'url',
    sourceUrl: 'https://www.paulgraham.com/greatwork.html',
    title: 'How to Do Great Work',
    summary:
      'Paul Graham outlines a framework for doing exceptional work: choose something you have genuine curiosity about, work hard enough to reach the frontier of your field, and notice interesting gaps worth exploring. The most important factor is intrinsic motivation—working on things you find genuinely fascinating.',
    keyInsights: [
      'Choose work based on genuine curiosity, not prestige or external validation',
      'Reaching the frontier of a field reveals which gaps are interesting to fill',
      'Consistency and momentum matter more than heroic individual efforts',
      'The best work often comes from the intersection of multiple domains',
      'Prolificness is underrated—volume of output increases your chances of a hit',
    ],
    actionItems: [
      'Identify 3 topics you find genuinely fascinating and pursue depth in one',
      'Spend time at the frontier of your field to discover what is unknown',
      'Build a habit of working a little each day rather than waiting for inspiration',
    ],
    tags: ['productivity', 'creativity', 'career', 'entrepreneurship', 'mindset'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-2',
    sourceType: 'pdf',
    pdfName: 'attention-is-all-you-need.pdf',
    title: 'Attention Is All You Need (Transformer Architecture)',
    summary:
      'Vaswani et al. introduce the Transformer, a sequence-to-sequence model relying entirely on attention mechanisms—dispensing with recurrence and convolutions. The model achieves state-of-the-art results on machine translation tasks while being significantly more parallelizable and faster to train.',
    keyInsights: [
      'Self-attention allows direct modeling of dependencies regardless of sequence distance',
      'Multi-head attention lets the model jointly attend to information from different subspaces',
      'Positional encodings inject sequence order without recurrence',
      'The encoder-decoder architecture with attention outperforms LSTM-based models',
      'Training parallelism dramatically reduces time-to-convergence vs. RNNs',
    ],
    actionItems: [
      'Implement a minimal Transformer from scratch to internalize the attention math',
      'Review positional encoding alternatives (RoPE, ALiBi) for your use case',
      'Benchmark self-attention complexity O(n²) against your sequence lengths',
    ],
    tags: ['ml', 'nlp', 'transformers', 'deep-learning', 'research'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'demo-3',
    sourceType: 'url',
    sourceUrl: 'https://stripe.com/blog/payment-api-design',
    title: 'Designing Robust Payment APIs',
    summary:
      'Stripe engineering shares principles behind their payment API design: idempotency keys prevent duplicate charges, webhook retries require idempotent handlers, and explicit error codes are more useful than generic failures. These patterns make integrations resilient across network failures and race conditions.',
    keyInsights: [
      'Idempotency keys are essential for safe retries in distributed payment systems',
      'Webhooks must be processed idempotently—duplicate deliveries are expected',
      'Machine-readable error codes help developers handle edge cases programmatically',
      'Versioned APIs allow safe evolution without breaking existing integrations',
      'Optimistic locking prevents double-charges under concurrent requests',
    ],
    actionItems: [
      'Add idempotency keys to all payment mutation endpoints',
      'Audit webhook handlers for idempotency gaps',
      'Define a structured error code taxonomy before shipping your payment API',
    ],
    tags: ['api-design', 'payments', 'distributed-systems', 'engineering', 'stripe'],
    createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
  },
];

export const DEMO_USAGE: MonthlyUsage = {
  count: 3,
  month: new Date().toISOString().slice(0, 7),
};

export const DEMO_RATE_LIMIT: RateLimitInfo = {
  used: 3,
  limit: 5,
  tier: 'free',
};
