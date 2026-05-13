import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, SUCCESS, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function SessionCompleteScreen() {
  const nav = useNavigation<Nav>();
  const sessions = useStore((s) => s.sessions);
  const activeSession = useStore((s) => s.activeSession);
  const setSessions = useStore((s) => s.setSessions);
  const setActiveSession = useStore((s) => s.setActiveSession);

  const [rating, setRating] = useState<number | null>(null);
  const [resonated, setResonated] = useState('');
  const [saving, setSaving] = useState(false);

  const session = activeSession ?? sessions[0];

  async function handleSave() {
    if (!rating) {
      Alert.alert('Please rate your session before finishing.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (isDemoMode) {
      showToast('Demo mode — not saved');
      const updated = sessions.map((s) =>
        s.id === session?.id ? { ...s, rating, resonatedText: resonated.trim() || null } : s,
      );
      setSessions(updated);
      setActiveSession(null);
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
      return;
    }

    setSaving(true);
    try {
      const { getFirestore: getDb } = await import('../lib/firebase');
      const db = await getDb();
      if (!db || !session) throw new Error('No db/session');

      const { doc, updateDoc } = await import('firebase/firestore');
      // We need the uid — pull from the session id convention or from auth
      const { getAuth: getAuthFn } = await import('../lib/firebase');
      const auth = await getAuthFn();
      const uid = auth?.currentUser?.uid;
      if (!uid) throw new Error('Not authenticated');

      await updateDoc(doc(db, 'users', uid, 'sessions', session.id), {
        rating,
        resonatedText: resonated.trim() || null,
      });

      const updated = sessions.map((s) =>
        s.id === session.id ? { ...s, rating, resonatedText: resonated.trim() || null } : s,
      );
      setSessions(updated);
    } catch {
      // Non-fatal
    } finally {
      setSaving(false);
      setActiveSession(null);
      nav.reset({ index: 0, routes: [{ name: 'Main' }] });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Celebration */}
        <View style={styles.celebrationZone}>
          <Text style={styles.confetti}>🎉</Text>
          <Text style={styles.headline}>Session Complete!</Text>
          <Text style={styles.subtitle}>
            You just invested 5 minutes in your leadership. That compounds.
          </Text>

          {session && (
            <View style={styles.sessionSummary}>
              <Text style={styles.sessionTitle}>{session.title}</Text>
              <Text style={styles.sessionSteps}>
                {session.content.length} steps completed
              </Text>
            </View>
          )}
        </View>

        {/* Star rating */}
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>How was this session?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <TouchableOpacity key={n} onPress={() => setRating(n)} style={styles.starBtn}>
                <Text style={[styles.star, { color: rating !== null && n <= rating ? ACCENT : MUTED }]}>
                  ★
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {rating && (
            <Text style={styles.ratingText}>
              {['', 'Not for me', 'Decent', 'Good', 'Really good', 'Outstanding'][rating]}
            </Text>
          )}
        </View>

        {/* Resonated freetext */}
        <View style={styles.resonatedSection}>
          <Text style={styles.resonatedLabel}>What resonated most? (optional)</Text>
          <TextInput
            style={styles.resonatedInput}
            placeholder="Something that landed, a realization, an action…"
            placeholderTextColor={MUTED}
            value={resonated}
            onChangeText={setResonated}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>

        {/* Done CTA */}
        <TouchableOpacity
          style={[styles.doneBtn, saving && styles.btnDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.doneBtnText}>
            {saving ? 'Saving…' : 'Done →'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: 24, gap: 28, justifyContent: 'center' },
  celebrationZone: { alignItems: 'center', gap: 12 },
  confetti: { fontSize: 56 },
  headline: { fontSize: 28, fontWeight: '800', color: TEXT },
  subtitle: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 23 },
  sessionSummary: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  sessionTitle: { fontSize: 14, fontWeight: '600', color: TEXT, textAlign: 'center' },
  sessionSteps: { fontSize: 12, color: SUBTEXT },
  ratingSection: { alignItems: 'center', gap: 12 },
  ratingLabel: { fontSize: 16, fontWeight: '600', color: TEXT },
  starsRow: { flexDirection: 'row', gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 36 },
  ratingText: { fontSize: 14, color: ACCENT, fontWeight: '500' },
  resonatedSection: { gap: 10 },
  resonatedLabel: { fontSize: 14, color: SUBTEXT },
  resonatedInput: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: TEXT,
    minHeight: 90,
  },
  doneBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: '#000' },
});
