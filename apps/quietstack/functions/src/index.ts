import { getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import pdfParse from 'pdf-parse';
import {
  checkAndIncrementRateLimit,
  runSynthesis,
  saveSynthesis,
} from './synthesis';

if (getApps().length === 0) {
  initializeApp();
}

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

type SynthesizeUrlRequest = {
  url: string;
};

type SynthesizePdfRequest = {
  storagePath: string;
  fileName: string;
};

type SynthesisResponse = {
  synthesisId: string;
  title: string;
  summary: string;
  keyInsights: string[];
  actionItems: string[];
  tags: string[];
};

export const synthesizeUrl = onCall<SynthesizeUrlRequest, Promise<SynthesisResponse>>(
  { secrets: [anthropicKey], timeoutSeconds: 120, memory: '512MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { url } = request.data;
    if (!url?.startsWith('http')) {
      throw new HttpsError('invalid-argument', 'A valid URL is required.');
    }

    const uid = request.auth.uid;

    // Rate limit check + increment (throws if over limit)
    await checkAndIncrementRateLimit(uid);

    // Fetch and extract article text
    let articleText: string;
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'QuietStack/1.0 (+https://quietstack.app)' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        throw new HttpsError('invalid-argument', `Could not fetch URL: HTTP ${res.status}`);
      }
      const html = await res.text();
      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document);
      const article = reader.parse();
      articleText = article?.textContent ?? html.replace(/<[^>]+>/g, ' ');
    } catch (err) {
      if (err instanceof HttpsError) throw err;
      throw new HttpsError('invalid-argument', 'Failed to fetch or parse the URL.');
    }

    if (articleText.trim().length < 100) {
      throw new HttpsError('invalid-argument', 'Not enough text content found at this URL.');
    }

    const synthesis = await runSynthesis(articleText, anthropicKey.value());
    const synthesisId = await saveSynthesis(uid, synthesis, {
      sourceType: 'url',
      sourceUrl: url,
    });

    return { synthesisId, ...synthesis };
  },
);

export const synthesizePdf = onCall<SynthesizePdfRequest, Promise<SynthesisResponse>>(
  { secrets: [anthropicKey], timeoutSeconds: 180, memory: '1GiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { storagePath, fileName } = request.data;
    if (!storagePath || !fileName) {
      throw new HttpsError('invalid-argument', 'storagePath and fileName are required.');
    }

    // Verify the path belongs to the authenticated user
    const uid = request.auth.uid;
    if (!storagePath.startsWith(`pdfs/${uid}/`)) {
      throw new HttpsError('permission-denied', 'Access denied to this file.');
    }

    // Rate limit check + increment
    await checkAndIncrementRateLimit(uid);

    // Download PDF from Storage and extract text
    let pdfText: string;
    try {
      const bucket = getStorage().bucket();
      const file = bucket.file(storagePath);
      const [buffer] = await file.download();
      const data = await pdfParse(buffer);
      pdfText = data.text;
    } catch {
      throw new HttpsError('internal', 'Failed to extract text from PDF.');
    }

    if (pdfText.trim().length < 100) {
      throw new HttpsError('invalid-argument', 'Not enough text content found in this PDF.');
    }

    const synthesis = await runSynthesis(pdfText, anthropicKey.value());
    const synthesisId = await saveSynthesis(uid, synthesis, {
      sourceType: 'pdf',
      pdfName: fileName,
      storagePath,
    });

    return { synthesisId, ...synthesis };
  },
);
