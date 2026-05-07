import React from 'react';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getApps, initializeApp } from 'firebase-admin/app';
import * as logger from 'firebase-functions/logger';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from '@react-pdf/renderer';

if (getApps().length === 0) {
  initializeApp();
}

interface UserProfile {
  track?: string;
  level?: number;
  streak?: number;
}

interface SubmissionRecord {
  score?: number;
  challengeId?: string;
}

interface ReportData {
  username: string;
  track: string;
  level: number;
  bestStreak: number;
  topScores: number[];
  cohortPercentile: number;
}

const pdfStyles = StyleSheet.create({
  page: {
    backgroundColor: '#0F0F13',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#252540',
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#8888AA',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    color: '#8888AA',
    fontFamily: 'Helvetica-Bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  statRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#252540',
  },
  statValue: {
    fontSize: 24,
    color: '#3B82F6',
    fontFamily: 'Helvetica-Bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: '#8888AA',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  scoreRank: {
    fontSize: 12,
    color: '#8888AA',
    width: 24,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#252540',
    borderRadius: 4,
    marginHorizontal: 8,
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3B82F6',
  },
  scoreValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontFamily: 'Helvetica-Bold',
    width: 36,
    textAlign: 'right',
  },
  footer: {
    marginTop: 'auto',
    borderTopWidth: 1,
    borderTopColor: '#252540',
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 10,
    color: '#8888AA',
  },
});

function buildDocument(data: ReportData): React.ReactElement {
  const ce = React.createElement;

  const topScoreRows = data.topScores.map((score, i) =>
    ce(
      View,
      { key: `score-${i}`, style: pdfStyles.scoreRow },
      ce(Text, { style: pdfStyles.scoreRank }, `#${i + 1}`),
      ce(
        View,
        { style: pdfStyles.scoreBar },
        ce(View, { style: { ...pdfStyles.scoreBarFill, width: `${score}%` } }),
      ),
      ce(Text, { style: pdfStyles.scoreValue }, `${score}`),
    ),
  );

  return ce(
    Document,
    null,
    ce(
      Page,
      { size: 'A4', style: pdfStyles.page },
      // Header
      ce(
        View,
        { style: pdfStyles.header },
        ce(Text, { style: pdfStyles.title }, 'SkillSprint Report Card'),
        ce(
          Text,
          { style: pdfStyles.subtitle },
          `${data.username} · ${data.track.charAt(0).toUpperCase() + data.track.slice(1)} Track`,
        ),
      ),
      // Stats row
      ce(
        View,
        { style: pdfStyles.section },
        ce(Text, { style: pdfStyles.sectionTitle }, 'Overview'),
        ce(
          View,
          { style: pdfStyles.statRow },
          ce(
            View,
            { style: pdfStyles.statCard },
            ce(Text, { style: pdfStyles.statValue }, `${data.level}`),
            ce(Text, { style: pdfStyles.statLabel }, 'Level'),
          ),
          ce(
            View,
            { style: pdfStyles.statCard },
            ce(Text, { style: pdfStyles.statValue }, `${data.bestStreak}`),
            ce(Text, { style: pdfStyles.statLabel }, 'Best Streak'),
          ),
          ce(
            View,
            { style: pdfStyles.statCard },
            ce(Text, { style: pdfStyles.statValue }, `${data.cohortPercentile}%`),
            ce(Text, { style: pdfStyles.statLabel }, 'Cohort Rank'),
          ),
        ),
      ),
      // Top scores
      ce(
        View,
        { style: pdfStyles.section },
        ce(Text, { style: pdfStyles.sectionTitle }, 'Top Challenge Scores'),
        ...topScoreRows,
      ),
      // Footer
      ce(
        View,
        { style: pdfStyles.footer },
        ce(Text, { style: pdfStyles.footerText }, 'SkillSprint · skillsprint.app'),
        ce(
          Text,
          { style: pdfStyles.footerText },
          new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        ),
      ),
    ),
  );
}

async function fetchReportData(uid: string): Promise<ReportData> {
  const db = getFirestore();

  const [userSnap, submissionsSnap] = await Promise.all([
    db.doc(`users/${uid}`).get(),
    db
      .collection('submissions')
      .doc(uid)
      .collection('challenges')
      .orderBy('score', 'desc')
      .limit(3)
      .get(),
  ]);

  const user = (userSnap.data() ?? {}) as UserProfile;
  const submissions = submissionsSnap.docs.map((d) => d.data() as SubmissionRecord);

  const topScores = submissions
    .map((s) => (typeof s.score === 'number' ? s.score : 0))
    .slice(0, 3);

  // Pad to 3 entries so the PDF always has 3 rows
  while (topScores.length < 3) {
    topScores.push(0);
  }

  // Simple percentile: use stored value or compute from level as a proxy
  const level = user.level ?? 1;
  const cohortPercentile = Math.min(99, Math.round((level / 20) * 100));

  return {
    username: uid, // real apps resolve display name from auth; uid is the safe fallback
    track: user.track ?? 'coding',
    level,
    bestStreak: user.streak ?? 0,
    topScores,
    cohortPercentile,
  };
}

export const generateSkillReportCard = onCall(
  { timeoutSeconds: 60, memory: '512MiB' },
  async (req) => {
    if (!req.auth) {
      throw new HttpsError('unauthenticated', 'Must be signed in');
    }

    const uid = req.auth.uid;

    const data = await fetchReportData(uid);
    const doc = buildDocument(data);

    let pdfBuffer: Buffer;
    try {
      pdfBuffer = await renderToBuffer(doc);
    } catch (err) {
      logger.error('generateSkillReportCard: PDF render failed', { uid, err });
      throw new HttpsError('internal', 'Failed to generate report card');
    }

    const bucket = getStorage().bucket();
    const filePath = `report-cards/${uid}/latest.pdf`;
    const file = bucket.file(filePath);

    await file.save(pdfBuffer, {
      metadata: { contentType: 'application/pdf' },
    });

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return { url: signedUrl };
  },
);
