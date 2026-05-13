import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_USER } from '../demo/seed';
import DemoModeBadge from '../components/DemoModeBadge';

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleDemoMode() {
    setUser(DEMO_USER);
  }

  async function handleEmailAuth() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Please enter email and password.');
      return;
    }
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Firebase auth is not available in demo mode.');
      return;
    }
    setLoading(true);
    try {
      const { getAuth: getAuthInstance } = await import('../lib/firebase');
      const auth = await getAuthInstance();
      if (!auth) throw new Error('Firebase not initialized');

      if (mode === 'signup') {
        const { createUserWithEmailAndPassword } = await import('firebase/auth');
        await createUserWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const { signInWithEmailAndPassword } = await import('firebase/auth');
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
    } catch (err: any) {
      Alert.alert('Auth error', err.message ?? 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Google Sign-In is not available in demo mode.');
      return;
    }
    Alert.alert('Coming soon', 'Google Sign-In will be wired in the Firebase integration phase.');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          {isDemoMode && <DemoModeBadge />}

          {/* Hero */}
          <View style={styles.hero}>
            <Text style={styles.logo}>🌸</Text>
            <Text style={styles.appName}>GlowLog</Text>
            <Text style={styles.tagline}>
              Track your skincare.{'\n'}See what actually works.
            </Text>
          </View>

          {/* Demo CTA */}
          <TouchableOpacity style={styles.demoCta} onPress={handleDemoMode}>
            <Text style={styles.demoCtaText}>Try Demo</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign in</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Email / password form */}
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor={MUTED}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor={MUTED}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleEmailAuth}
              disabled={loading}
            >
              <Text style={styles.primaryBtnText}>
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.googleBtn} onPress={handleGoogleSignIn}>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.toggleMode}
              onPress={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
            >
              <Text style={styles.toggleModeText}>
                {mode === 'signin'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 24 },
  hero: { alignItems: 'center', gap: 12 },
  logo: { fontSize: 64 },
  appName: { fontSize: 34, fontWeight: '800', color: TEXT, letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: SUBTEXT, textAlign: 'center', lineHeight: 24 },
  demoCta: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  demoCtaText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: BORDER },
  dividerText: { fontSize: 12, color: MUTED },
  form: { gap: 12 },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  googleBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  googleBtnText: { fontSize: 15, fontWeight: '500', color: SUBTEXT },
  toggleMode: { alignItems: 'center', paddingVertical: 8 },
  toggleModeText: { fontSize: 13, color: SUBTEXT },
});
