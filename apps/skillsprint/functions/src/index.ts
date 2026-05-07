import { getApps, initializeApp } from 'firebase-admin/app';

if (getApps().length === 0) {
  initializeApp();
}

export { assignDailySprints } from './assignDailySprints';
export { scoreSubmission } from './scoreSubmission';
export { scoreSubmissionLLM } from './scoreSubmissionLLM';
