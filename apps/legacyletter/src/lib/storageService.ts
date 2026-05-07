import { ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadVoiceMemo(
  uid: string,
  legacyId: string,
  localUri: string,
  onProgress?: (pct: number) => void
): Promise<string> {
  const response = await fetch(localUri);
  const blob = await response.blob();

  const storagePath = `users/${uid}/voice/${legacyId}.m4a`;
  const storageRef = ref(storage!, storagePath);

  return new Promise((resolve, reject) => {
    const task = uploadBytesResumable(storageRef, blob, { contentType: 'audio/m4a' });
    task.on(
      'state_changed',
      (snap) => onProgress?.(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)),
      reject,
      () => resolve(storagePath)
    );
  });
}
