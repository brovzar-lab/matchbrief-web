/**
 * Integration test for scheduleLegacyDelivery against the Firebase Emulator Suite.
 *
 * Prerequisites:
 *   firebase emulators:start --only firestore,functions
 *
 * Run after building:
 *   npm run build && FIRESTORE_EMULATOR_HOST=localhost:8080 node lib/test-delivery.js
 *
 * Or directly with ts-node:
 *   FIRESTORE_EMULATOR_HOST=localhost:8080 npx ts-node src/test-delivery.ts
 */

// Must set emulator env vars before ANY firebase-admin code initialises.
// Using require() throughout so assignment order is respected at runtime
// (TypeScript import statements are hoisted when compiled to CommonJS).
process.env.FIREBASE_CONFIG = JSON.stringify({
  projectId: 'legacyletter-dev',
  storageBucket: 'legacyletter-dev.appspot.com',
});
process.env.FIRESTORE_EMULATOR_HOST =
  process.env.FIRESTORE_EMULATOR_HOST ?? 'localhost:8080';
process.env.STORAGE_EMULATOR_HOST =
  process.env.STORAGE_EMULATOR_HOST ?? 'localhost:9199';
process.env.SENDGRID_API_KEY = 'test-key-emulator';

// Patch @sendgrid/mail before ./index loads it.
// Both files resolve to the same cached CommonJS module object, so mutating
// .send here is visible to the imported index.ts code.
/* eslint-disable @typescript-eslint/no-require-imports */
const sgMailMod = require('@sendgrid/mail') as Record<string, unknown>;
const sendCalls: unknown[] = [];
sgMailMod['send'] = async (data: unknown): Promise<[{ statusCode: number }]> => {
  sendCalls.push(data);
  return [{ statusCode: 202 }];
};

const { runDelivery } = require('./index') as { runDelivery: () => Promise<void> };
const admin = require('firebase-admin') as typeof import('firebase-admin');
/* eslint-enable @typescript-eslint/no-require-imports */

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(`Assertion failed: ${message}`);
}

async function main(): Promise<void> {
  const db = admin.firestore();
  // Unique uid per run to avoid cross-test interference
  const uid = `test-user-${Date.now()}`;

  console.log('--- LegacyLetter delivery integration test ---\n');

  // ── Test 1: text legacy is delivered ──────────────────────────────────────
  const deliveryDate = admin.firestore.Timestamp.fromMillis(Date.now() - 60 * 60 * 1000);
  const ref = await db.collection(`users/${uid}/legacies`).add({
    type: 'text',
    title: 'My Test Legacy',
    content: 'Hello from the past.',
    status: 'scheduled',
    deliveryDate,
    recipients: [{ name: 'Test Recipient', email: 'recipient@test.example' }],
  });
  console.log(`Seeded legacy ${ref.id} (uid=${uid})`);

  await runDelivery();

  const snap = await ref.get();
  const data = snap.data();
  assert(data?.status === 'delivered', `Expected status='delivered', got '${String(data?.status)}'`);
  assert(data?.deliveredAt != null, 'Expected deliveredAt to be set');
  console.log('✓  doc.status flipped to "delivered"');

  assert(sendCalls.length === 1, `Expected sgMail.send called 1 time, got ${sendCalls.length}`);
  console.log('✓  sgMail.send called once');

  // ── Test 2: idempotency guard ──────────────────────────────────────────────
  const callsBefore = sendCalls.length;
  await runDelivery();
  assert(
    sendCalls.length === callsBefore,
    `Idempotency guard failed: sgMail.send was called again (total=${sendCalls.length})`,
  );
  console.log('✓  Idempotency guard prevents double delivery');

  // ── Test 3: legacy in the future is NOT delivered ─────────────────────────
  const futureRef = await db.collection(`users/${uid}/legacies`).add({
    type: 'text',
    title: 'Future Legacy',
    content: 'Not yet.',
    status: 'scheduled',
    deliveryDate: admin.firestore.Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000),
    recipients: [{ name: 'Recipient', email: 'recipient@test.example' }],
  });
  const callsBeforeFuture = sendCalls.length;
  await runDelivery();
  assert(
    sendCalls.length === callsBeforeFuture,
    'Future legacy should not be delivered yet',
  );
  const futureSnap = await futureRef.get();
  assert(futureSnap.data()?.status === 'scheduled', 'Future legacy status should remain scheduled');
  console.log('✓  Future-dated legacy is not delivered prematurely');

  // ── Cleanup ────────────────────────────────────────────────────────────────
  await ref.delete();
  await futureRef.delete();

  console.log('\nAll tests passed ✓');
}

main().catch((err: unknown) => {
  console.error('\nTest FAILED:', err);
  process.exit(1);
});
