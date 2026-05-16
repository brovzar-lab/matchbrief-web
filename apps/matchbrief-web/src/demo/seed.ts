import type { Analysis, UserProfile } from '../lib/types';

function iso(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

export const DEMO_USER: UserProfile = {
  uid: 'demo-user-001',
  email: 'alex@demo.matchbrief',
  displayName: 'Alex Chen',
  tier: 'free',
  analysisCount: 1,
  analysisResetAt: iso(-25),
  createdAt: iso(14),
};

export const DEMO_JOB_DESCRIPTION = `Senior Software Engineer — Payments Platform
PayFlow · San Francisco, CA (Hybrid)

We're building the payments layer that powers 50,000+ small businesses. You'll own core services on our payments platform: transaction processing, reconciliation pipelines, and the APIs our partners build on top of.

Requirements:
- 4+ years of production TypeScript and Node.js experience
- Strong React skills for internal tooling dashboards
- Deep PostgreSQL experience (schema design, query optimization, migrations)
- Experience with microservices architecture and distributed systems
- AWS (ECS, Lambda, RDS, SQS) — you've shipped to prod, not just prototyped
- Redis for caching and rate limiting
- Kafka for event streaming at scale
- PCI-DSS compliance awareness — you understand the constraints
- Payments domain experience strongly preferred (ACH, card processing, settlements)
- CI/CD with GitHub Actions and Docker
- Excellent system design fundamentals`;

export const DEMO_RESUME_TEXT = `Alex Chen · alex@email.com · github.com/alexchen

EXPERIENCE

Senior Frontend Engineer, Shopify (2022–present)
- Built features for the checkout page across the merchant platform
- Worked on backend services with the team using Node.js and PostgreSQL
- Fixed bugs and did code reviews for the payments module
- Wrote unit tests to improve test coverage

Software Engineer, Stripe (2020–2022)
- Developed TypeScript APIs and React dashboards for the billing portal
- Deployed services to AWS using Docker containers
- Collaborated with design on a dashboard redesign project
- Participated in on-call rotation

SKILLS
TypeScript, React, Node.js, PostgreSQL, Redis, AWS, Docker, CI/CD, Git`;

export const DEMO_ANALYSIS: Analysis = {
  id: 'demo-analysis-001',
  jobDescription: DEMO_JOB_DESCRIPTION,
  resumeText: DEMO_RESUME_TEXT,
  score: 78,
  keywords: [
    { word: 'TypeScript', status: 'green' },
    { word: 'React', status: 'green' },
    { word: 'Node.js', status: 'green' },
    { word: 'PostgreSQL', status: 'green' },
    { word: 'REST APIs', status: 'green' },
    { word: 'CI/CD', status: 'green' },
    { word: 'System Design', status: 'green' },
    { word: 'AWS', status: 'yellow' },
    { word: 'Microservices', status: 'yellow' },
    { word: 'Redis', status: 'yellow' },
    { word: 'Docker', status: 'yellow' },
    { word: 'Payments', status: 'yellow' },
    { word: 'Kafka', status: 'red' },
    { word: 'PCI-DSS', status: 'red' },
    { word: 'Kubernetes', status: 'red' },
  ],
  rewrittenBullets: [
    {
      original: 'Built features for the checkout page across the merchant platform',
      rewritten: 'Engineered 12+ checkout features driving a 31% uplift in conversion rate across 40K+ merchant storefronts',
    },
    {
      original: 'Worked on backend services with the team using Node.js and PostgreSQL',
      rewritten: 'Architected 3 Node.js microservices on PostgreSQL handling 50K+ req/day, reducing p95 latency by 40%',
    },
    {
      original: 'Fixed bugs and did code reviews for the payments module',
      rewritten: 'Resolved 60+ production bugs in the payments module and mentored 4 engineers through 200+ PR reviews, cutting defect escapes by 35%',
    },
    {
      original: 'Wrote unit tests to improve test coverage',
      rewritten: 'Drove test coverage from 42% to 87% with Jest and Playwright, preventing 2 major production incidents',
    },
  ],
  coverLetters: [
    `Dear Hiring Manager,

I am writing to express my strong interest in the Senior Software Engineer position at PayFlow. With five years of experience building scalable payment-adjacent platforms using TypeScript, React, and Node.js, I am confident in my ability to make an immediate impact on your payments infrastructure.

At Shopify, I engineered checkout features that improved conversion by 31% across 40,000+ merchant storefronts while maintaining the reliability standards that payments demand. My work on PostgreSQL-backed microservices handling 50,000 daily requests gave me direct exposure to the concurrency and consistency challenges inherent in financial software.

I am particularly drawn to PayFlow's mission of democratizing payments infrastructure for small businesses. Your focus on embedded finance aligns with the systems I have built — reliable, compliant, and engineered to scale. I am eager to deepen my expertise in Kafka event streaming and PCI-DSS compliance, and my background in high-throughput distributed systems provides the foundation to do so quickly.

I would welcome the opportunity to discuss how my experience can contribute to PayFlow's next phase of growth.

Sincerely,
Alex Chen`,

    `Hi PayFlow team,

I've been watching what you're building for a while — payments infrastructure that actually works for small businesses, not just enterprise — and this Senior SE role has my name on it.

I've spent five years building production systems with TypeScript, Node.js, and React, most recently at Shopify where I owned checkout features for 40,000+ merchants. My proudest win there was redesigning a critical flow that moved conversion up 31% — small change on paper, real money for real businesses.

I'll be upfront: I haven't shipped Kafka in production yet, and my PCI-DSS experience is awareness-level rather than deep implementation. But I've built enough distributed, high-stakes systems to know I pick up domain constraints fast. The engineers I've worked with will back that up.

What actually draws me here is the scale of what you're building and the craft I see in your API design. I learn best on hard problems alongside people who care. That feels like PayFlow.

Happy to dig into any part of my background — just say the word.

Alex`,

    `Let me skip the throat-clearing.

I've spent five years building payment-adjacent systems at Shopify and Stripe. I know what it means to ship TypeScript microservices to prod, watch them process 50K requests a day, and own the pager when they don't. I've driven checkout conversion up 31%, cut backend latency by 40%, and built the test coverage from scratch that stopped two production fires before they started.

PayFlow is doing the hard thing: payments infrastructure that small businesses can actually build on. That's not a solved problem, and I want to work on unsolved problems.

Yes, I'm ramping on Kafka. Yes, I'll be learning PCI-DSS implementation depth. But engineers who've shipped at Stripe and Shopify don't take long to get up to speed on new constraints — we've seen enough of them.

I'm ready to move fast. Let's talk.

Alex Chen`,
  ],
  createdAt: iso(1),
};

export const DEMO_ANALYSES: Analysis[] = [DEMO_ANALYSIS];
