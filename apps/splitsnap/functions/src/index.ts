import { getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as vision from '@google-cloud/vision';

if (getApps().length === 0) {
  initializeApp();
}

const gmailPassword = defineSecret('GMAIL_APP_PASSWORD');
const gmailUser = defineSecret('GMAIL_USER');

type OcrReceiptRequest = {
  imageBase64: string;
  sessionId: string;
};

type OcrItem = {
  name: string;
  price: number;
};

type OcrReceiptResponse = {
  items: OcrItem[];
  rawText: string;
};

type InviteMemberRequest = {
  groupId: string;
  groupName: string;
  inviteeEmail: string;
  inviterName: string;
};

type InviteMemberResponse = {
  sent: boolean;
};

function parseLineItems(text: string): OcrItem[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: OcrItem[] = [];
  // Match lines like "Item Name  12.99" or "Item Name $12.99"
  const pricePattern = /\$?(\d{1,4}\.\d{2})\s*$/;
  const skipKeywords = /^(subtotal|total|tax|tip|gratuity|amount|balance|change|cash|card|visa|mastercard|amex)/i;

  for (const line of lines) {
    if (skipKeywords.test(line)) continue;
    const match = pricePattern.exec(line);
    if (!match) continue;
    const price = parseFloat(match[1]);
    if (price <= 0 || price > 500) continue;
    const name = line.slice(0, match.index).replace(/^\d+\s*[xX×]\s*/, '').trim();
    if (name.length < 2) continue;
    items.push({ name, price });
  }
  return items;
}

export const ocrReceipt = onCall<OcrReceiptRequest, Promise<OcrReceiptResponse>>(
  { timeoutSeconds: 60, memory: '512MiB' },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { imageBase64, sessionId } = request.data;
    if (!imageBase64 || imageBase64.length < 100) {
      throw new HttpsError('invalid-argument', 'A valid base64 image is required.');
    }
    if (!sessionId) {
      throw new HttpsError('invalid-argument', 'sessionId is required.');
    }

    const client = new vision.ImageAnnotatorClient();
    let rawText = '';
    let items: OcrItem[] = [];

    try {
      const [result] = await client.textDetection({
        image: { content: imageBase64 },
      });
      const detections = result.textAnnotations;
      if (detections && detections.length > 0 && detections[0].description) {
        rawText = detections[0].description;
        items = parseLineItems(rawText);
      }
    } catch (err) {
      throw new HttpsError('internal', `Vision API error: ${String(err)}`);
    }

    if (items.length === 0) {
      throw new HttpsError('not-found', 'No line items found in receipt. Try manual entry.');
    }

    // Write OCR result into the session document if it exists
    try {
      const db = getFirestore();
      if (sessionId !== 'new') {
        // Find and update the session — in production, pass groupId as well
        // For now, store items in a temp collection keyed by sessionId
        await db.collection('ocr_results').doc(sessionId).set({
          items,
          rawText,
          createdAt: new Date(),
          uid: request.auth.uid,
        });
      }
    } catch {
      // Non-fatal — items already computed, just return them
    }

    return { items, rawText };
  },
);

export const inviteMember = onCall<InviteMemberRequest, Promise<InviteMemberResponse>>(
  { secrets: [gmailUser, gmailPassword], timeoutSeconds: 30 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Authentication required.');
    }

    const { groupId, groupName, inviteeEmail, inviterName } = request.data;
    if (!groupId || !groupName || !inviteeEmail) {
      throw new HttpsError('invalid-argument', 'groupId, groupName, and inviteeEmail are required.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteeEmail)) {
      throw new HttpsError('invalid-argument', 'Invalid email address.');
    }

    const deepLink = `https://splitsnap.app/join?groupId=${groupId}`;

    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.default.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser.value(),
          pass: gmailPassword.value(),
        },
      });

      await transporter.sendMail({
        from: `SplitSnap <${gmailUser.value()}>`,
        to: inviteeEmail,
        subject: `${inviterName} invited you to split bills in ${groupName}`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
            <h1 style="color: #ea580c;">📸 SplitSnap</h1>
            <p><strong>${inviterName}</strong> has invited you to join <strong>${groupName}</strong> on SplitSnap — the easiest way to split bills from a photo.</p>
            <a href="${deepLink}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:12px;text-decoration:none;font-weight:bold;margin:16px 0;">
              Join ${groupName}
            </a>
            <p style="color:#6b7280;font-size:13px;">Or paste this link: ${deepLink}</p>
          </div>
        `,
      });
    } catch (err) {
      throw new HttpsError('internal', `Failed to send invite: ${String(err)}`);
    }

    return { sent: true };
  },
);
