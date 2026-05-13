import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_USER } from '../demo/seed';

export default function AuthScreen() {
  const [loading, setLoading] = React.useState(false);
  const setUser = useStore((s) => s.setUser);

  function enterDemo() {
    setUser(DEMO_USER);
  }

  async function handleAnonymousSignIn() {
    setLoading(true);
    try {
      const { getAuth } = await import('../lib/firebase');
      const auth = await getAuth();
      if (!auth) return;
      const { signInAnonymously } = await import('firebase/auth');
      await signInAnonymously(auth);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Please try again.';
      Alert.alert('Sign-in failed', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.hero}>
          <Text style={styles.icon}>🎙</Text>
          <Text style={styles.appName}>MemoPod</Text>
          <Text style={styles.tagline}>One tap. Captured. Classified.</Text>
        </View>

        <View style={styles.features}>
          {[
            { icon: '💡', label: 'Ideas' },
            { icon: '✅', label: 'Tasks' },
            { icon: '⏰', label: 'Reminders' },
            { icon: '📝', label: 'Notes' },
          ].map((f) => (
            <View key={f.label} style={styles.featureChip}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureLabel}>{f.label}</Text>
            </View>
          ))}
        </View>

        {isDemoMode ? (
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Mode Active</Text>
            <Text style={styles.demoBody}>
              14 pre-seeded memos across all 4 categories are loaded. No backend credentials required.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={enterDemo}>
              <Text style={styles.primaryBtnText}>Continue as Demo User →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.signInBox}>
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleAnonymousSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryBtnText}>Get Started — No Account Needed</Text>
              )}
            </TouchableOpacity>
            <Text style={styles.signInNote}>
              Starts as anonymous. Add email anytime to back up your memos.
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  hero: { alignItems: 'center', marginBottom: 40 },
  icon: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 40, fontWeight: '800', color: TEXT, letterSpacing: -1 },
  tagline: { fontSize: 16, color: SUBTEXT, marginTop: 8, textAlign: 'center' },
  features: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 44,
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  featureIcon: { fontSize: 14 },
  featureLabel: { fontSize: 13, fontWeight: '600', color: TEXT },
  demoBox: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 24,
    gap: 12,
  },
  demoTitle: { fontSize: 17, fontWeight: '700', color: ACCENT_LIGHT },
  demoBody: { fontSize: 14, color: SUBTEXT, lineHeight: 20 },
  signInBox: { gap: 14 },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  signInNote: { fontSize: 13, color: SUBTEXT, textAlign: 'center', lineHeight: 18 },
});
