import { initializeApp, cert, App } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import * as path from 'path';
import * as fs from 'fs';
import { challenges } from './data/challenges';

function initFirebase(): App {
  const serviceAccountPath =
    process.env.GOOGLE_APPLICATION_CREDENTIALS ??
    path.join(__dirname, '..', 'service-account.json');

  if (!fs.existsSync(serviceAccountPath)) {
    const projectId = process.env.GCLOUD_PROJECT ?? process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error(
        'No service account found. Set GOOGLE_APPLICATION_CREDENTIALS or ensure service-account.json exists.\n' +
          'For emulator use, set FIRESTORE_EMULATOR_HOST=localhost:8080 and FIREBASE_PROJECT_ID=your-project.',
      );
    }
    return initializeApp({ projectId });
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(serviceAccountPath) as object;
  return initializeApp({ credential: cert(serviceAccount) });
}

async function seed(): Promise<void> {
  initFirebase();
  const db = getFirestore();

  let created = 0;
  let skipped = 0;
  let errors = 0;

  console.log(`Seeding ${challenges.length} challenges…`);

  for (const challenge of challenges) {
    try {
      const ref = db.collection('challenges').doc(challenge.id);
      const snap = await ref.get();

      if (snap.exists) {
        skipped++;
        continue;
      }

      await ref.set({ ...challenge, createdAt: Timestamp.now() });
      created++;
      process.stdout.write('.');
    } catch (err) {
      errors++;
      console.error(`\nFailed to seed challenge ${challenge.id}:`, err);
    }
  }

  console.log(
    `\n\nSeed complete: ${created} created, ${skipped} skipped, ${errors} errors`,
  );

  if (errors > 0) {
    process.exit(1);
  }
}

seed().catch((err) => {
  console.error('Seed script failed:', err);
  process.exit(1);
});
