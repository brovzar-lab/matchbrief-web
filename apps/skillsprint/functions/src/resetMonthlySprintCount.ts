import { onSchedule } from 'firebase-functions/v2/scheduler';
import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}

const CHUNK_SIZE = 100;

// Fires at midnight UTC on the 1st of every month
export const resetMonthlySprintCount = onSchedule('0 0 1 * *', async () => {
  const db = getFirestore();
  const usersSnap = await db.collection('users').get();
  const users = usersSnap.docs;

  for (let i = 0; i < users.length; i += CHUNK_SIZE) {
    await Promise.all(
      users.slice(i, i + CHUNK_SIZE).map((doc) =>
        doc.ref.update({ monthlySprintCount: 0 }),
      ),
    );
  }
});
