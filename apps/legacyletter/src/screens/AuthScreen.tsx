import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithCredential,
  updateProfile,
} from 'firebase/auth';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT } from '../lib/config';
import { isDemoMode } from '../lib/config';
import { DEMO_USER } from '../lib/mockData';
import { useStore, createUserDoc } from '../lib/store';
import { auth } from '../lib/firebase';

WebBrowser.maybeCompleteAuthSession();

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [, googleResponse, promptGoogleAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    responseType: ResponseType.IdToken,
    scopes: ['openid', 'profile', 'email'],
  });

  React.useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const idToken = googleResponse.params.id_token;
    if (!idToken || !auth) return;
    const credential = GoogleAuthProvider.credential(idToken);
    setIsLoading(true);
    signInWithCredential(auth, credential)
      .catch((err: Error) => Alert.alert('Google Sign-In Failed', err.message))
      .finally(() => setIsLoading(false));
  }, [googleResponse]);

  function handleDemoLogin() {
    setUser(DEMO_USER);
  }

  async function handleEmailAuth() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Sign in is disabled in demo mode. Use "Continue as Demo User".');
      return;
    }
    if (!auth) return;
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        const { user } = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
        const displayName = trimmedEmail.split('@')[0] ?? null;
        await updateProfile(user, { displayName });
        await createUserDoc(user.uid, trimmedEmail, displayName);
      } else {
        await signInWithEmailAndPassword(auth, trimmedEmail, password);
      }
      // onAuthStateChanged in initAuthListener will update the store
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed.';
      Alert.alert('Error', message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Google sign-in is disabled in demo mode.');
      return;
    }
    await promptGoogleAsync();
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logo}>📜</Text>
          <Text style={styles.title}>LegacyLetter</Text>
          <Text style={styles.subtitle}>Leave words that last forever</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={SUBTEXT}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={SUBTEXT}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!isLoading}
          />

          <TouchableOpacity
            style={[styles.primaryBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleEmailAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryBtnText}>
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, isLoading && { opacity: 0.6 }]}
            onPress={handleGoogleSignIn}
            disabled={isLoading}
          >
            <Text style={styles.secondaryBtnText}>Continue with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setIsSignUp((v) => !v)}>
            <Text style={styles.toggleText}>
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </Text>
          </TouchableOpacity>
        </View>

        {isDemoMode && (
          <TouchableOpacity style={styles.demoBtn} onPress={handleDemoLogin}>
            <Text style={styles.demoBtnText}>Continue as Demo User</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 48 },
  logo: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 32, fontWeight: '700', color: TEXT, marginBottom: 8 },
  subtitle: { fontSize: 16, color: SUBTEXT, textAlign: 'center' },
  form: { gap: 12 },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    color: TEXT,
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  secondaryBtnText: { color: TEXT, fontWeight: '600', fontSize: 16 },
  toggleText: { color: SUBTEXT, textAlign: 'center', marginTop: 8 },
  demoBtn: {
    marginTop: 32,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  demoBtnText: { color: ACCENT, fontWeight: '600', fontSize: 16 },
});
