import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT, GRAD_START, GRAD_END } from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_USER } from '../demo/seed';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setUser = useStore((s) => s.setUser);

  function enterDemo() {
    setUser(DEMO_USER);
  }

  async function handleSignIn() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const { getAuth } = await import('../lib/firebase');
      const auth = await getAuth();
      if (!auth) return;
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const cred = await signInWithEmailAndPassword(auth, email, password);
      setUser({
        uid: cred.user.uid,
        displayName: cred.user.displayName ?? email.split('@')[0],
        email: cred.user.email ?? email,
        createdAt: cred.user.metadata.creationTime ?? new Date().toISOString(),
        trialStartDate: new Date().toISOString(),
        tier: 'free',
      });
    } catch (err: any) {
      Alert.alert('Sign-in failed', err.message ?? 'Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.inner}>
        <View style={styles.hero}>
          <Text style={styles.moon}>🌙</Text>
          <Text style={styles.appName}>NightCap</Text>
          <Text style={styles.tagline}>3-minute end-of-day debrief</Text>
        </View>

        {isDemoMode ? (
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Mode Active</Text>
            <Text style={styles.demoBody}>
              14 days of seeded journal data and AI pattern cards are pre-loaded.
              No backend credentials required.
            </Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={enterDemo}>
              <Text style={styles.primaryBtnText}>Continue as Demo User →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor={SUBTEXT}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={SUBTEXT}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={TEXT} />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, justifyContent: 'center', padding: 28 },
  hero: { alignItems: 'center', marginBottom: 44 },
  moon: { fontSize: 56, marginBottom: 12 },
  appName: { fontSize: 38, fontWeight: '700', color: TEXT, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: SUBTEXT, marginTop: 6 },
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
  form: { gap: 14 },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    color: TEXT,
    fontSize: 15,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: TEXT, fontWeight: '700', fontSize: 16 },
});
