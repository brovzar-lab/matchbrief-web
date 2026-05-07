import { getApps, initializeApp } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import Anthropic from '@anthropic-ai/sdk';

if (getApps().length === 0) {
  initializeApp();
}

const anthropicKey = defineSecret('ANTHROPIC_API_KEY');

type OcrRequest = {
  imageBase64: string;
  sessionId: string;
};

type LineItem = {
  name: string;
  price: number;
  quantity: number;
};

type OcrResponse = {
  items: LineItem[];
  receiptImageUrl: string;
};

export const ocr = onCall<OcrRequest, Promise<OcrResponse>>(
  { secrets: [anthropicKey], timeoutSeconds: 60 },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be authenticated to use OCR.');
    }

    const { imageBase64, sessionId } = request.data;

    if (!imageBase64 || !sessionId) {
      throw new HttpsError('invalid-argument', 'imageBase64 and sessionId are required.');
    }

    // Upload receipt image to Firebase Storage
    const bucket = getStorage().bucket();
    const filename = `receipts/${sessionId}.jpg`;
    const buffer = Buffer.from(imageBase64, 'base64');
    const file = bucket.file(filename);

    await file.save(buffer, { contentType: 'image/jpeg', resumable: false });

    const [receiptImageUrl] = await file.getSignedUrl({
      action: 'read',
      expires: '03-09-2491',
    });

    // Call Claude Vision API
    const client = new Anthropic({ apiKey: anthropicKey.value() });

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: imageBase64,
              },
            },
            {
              type: 'text',
              text: 'Extract all food and drink line items from this receipt. Return ONLY a valid JSON array with no markdown fences, no explanation, no extra text. Each element must have exactly these keys: "name" (string), "price" (integer cents), "quantity" (integer). Example: [{"name":"Burger","price":1299,"quantity":1},{"name":"Fries","price":499,"quantity":2}]',
            },
          ],
        },
      ],
    });

    const rawText =
      response.content[0].type === 'text' ? response.content[0].text.trim() : '[]';

    let items: LineItem[] = [];
    try {
      const parsed: unknown = JSON.parse(rawText);
      if (Array.isArray(parsed)) {
        items = parsed
          .filter(
            (item): item is Record<string, unknown> =>
              typeof item === 'object' && item !== null,
          )
          .map((item) => ({
            name: String(item['name'] ?? 'Unknown Item'),
            price: Math.abs(Math.round(Number(item['price'] ?? 0))),
            quantity: Math.max(1, Math.round(Number(item['quantity'] ?? 1))),
          }));
      }
    } catch {
      items = [];
    }

    return { items, receiptImageUrl };
  },
);
