import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/config';
import { signInWithEmail, signUpWithEmail, signInWithApple } from '../lib/firebaseService';

type AuthMode = 'signin' | 'signup';

export default function AuthScreen() {
  const setUid = useStore((s) => s.setUid);
  const setTrack = useStore((s) => s.setTrack);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const showToast = useStore((s) => s.showToast);

  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  function handleDemoLogin() {
    setUid('demo-user');
    setTrack('coding');
    completeOnboarding();
  }

  async function handleEmailAuth() {
    if (!email.trim() || !password.trim()) {
      showToast('Enter your email and password');
      return;
    }
    setLoading(true);
    try {
      if (authMode === 'signup') {
        await signUpWithEmail(email.trim(), password);
      } else {
        await signInWithEmail(email.trim(), password);
      }
      // Auth state listener in App.tsx sets uid; RootNavigator re-renders automatically
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        showToast('No account found — try "Create Account"');
        setAuthMode('signup');
      } else if (code === 'auth/wrong-password') {
        showToast('Incorrect password. Please try again.');
      } else if (code === 'auth/email-already-in-use') {
        showToast('Email already registered — try signing in');
        setAuthMode('signin');
      } else if (code === 'auth/weak-password') {
        showToast('Password must be at least 6 characters.');
      } else if (code === 'auth/invalid-email') {
        showToast('Enter a valid email address.');
      } else {
        showToast('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleAppleSignIn() {
    setLoading(true);
    try {
      await signInWithApple();
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? '';
      if (code !== 'ERR_REQUEST_CANCELED') {
        showToast('Apple Sign-In failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  const isSignUp = authMode === 'signup';

  return (
    <KeyboardAvoidingView
      style={s.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={s.flex}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={s.logo}>⚡️</Text>
        <Text style={s.appName}>SkillSprint</Text>
        <Text style={s.tagline}>Level up one sprint at a time</Text>

        {isDemoMode && (
          <TouchableOpacity
            style={s.demoBtn}
            onPress={handleDemoLogin}
            accessibilityRole="button"
            accessibilityLabel="Continue as Demo"
          >
            <Text style={s.demoBtnText}>Continue as Demo</Text>
          </TouchableOpacity>
        )}

        <View style={s.form}>
          <Text style={s.fieldLabel}>EMAIL</Text>
          <TextInput
            style={s.input}
            placeholder="you@example.com"
            placeholderTextColor="#8888AA"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            returnKeyType="next"
            accessibilityLabel="Email address"
          />

          <Text style={[s.fieldLabel, s.fieldLabelSpaced]}>PASSWORD</Text>
          <TextInput
            style={s.input}
            placeholder="••••••••"
            placeholderTextColor="#8888AA"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete={isSignUp ? 'new-password' : 'password'}
            returnKeyType="done"
            onSubmitEditing={handleEmailAuth}
            accessibilityLabel="Password"
          />

          <TouchableOpacity
            style={[s.cta, loading && s.ctaDisabled]}
            onPress={handleEmailAuth}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel={isSignUp ? 'Create account' : 'Sign in'}
          >
            <Text style={s.ctaText}>
              {loading
                ? isSignUp
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignUp
                  ? 'Create Account'
                  : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.toggleBtn}
            onPress={() => setAuthMode(isSignUp ? 'signin' : 'signup')}
            accessibilityLabel={
              isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"
            }
          >
            <Text style={s.toggleText}>
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Create one"}
            </Text>
          </TouchableOpacity>

          {Platform.OS === 'ios' && (
            <>
              <View style={s.divider}>
                <View style={s.dividerLine} />
                <Text style={s.dividerText}>or</Text>
                <View style={s.dividerLine} />
              </View>
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                cornerRadius={14}
                style={s.appleBtn}
                onPress={handleAppleSignIn}
              />
            </>
          )}
        </View>

        <Text style={s.legal}>
          By continuing you agree to our Terms of Service and Privacy Policy.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0F0F13' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logo: { fontSize: 56, marginBottom: 12 },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: { fontSize: 15, color: '#8888AA', textAlign: 'center', marginBottom: 32 },
  demoBtn: {
    backgroundColor: '#3B82F622',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#3B82F6',
    marginBottom: 28,
    width: '100%',
    alignItems: 'center',
  },
  demoBtnText: { fontSize: 16, fontWeight: '700', color: '#3B82F6' },
  form: { width: '100%', marginBottom: 20 },
  fieldLabel: {
    fontSize: 11,
    color: '#8888AA',
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  fieldLabelSpaced: { marginTop: 16 },
  input: {
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#252540',
    color: '#FFFFFF',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  cta: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
  },
  ctaDisabled: { opacity: 0.5 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
  toggleBtn: { paddingVertical: 12, alignItems: 'center' },
  toggleText: { fontSize: 13, color: '#3B82F6', fontWeight: '500' },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#252540' },
  dividerText: { fontSize: 13, color: '#8888AA' },
  appleBtn: { width: '100%', height: 50 },
  legal: {
    marginTop: 28,
    fontSize: 12,
    color: '#555570',
    textAlign: 'center',
    lineHeight: 18,
  },
});
