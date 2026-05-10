import React from 'react';
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
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { useStore } from '../lib/store';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT } from '../lib/config';
import { DEMO_USER, DEMO_HOUSEHOLD } from '../lib/mockData';

type Mode = 'signin' | 'signup' | 'join';

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);
  const setHousehold = useStore((s) => s.setHousehold);
  const [mode, setMode] = React.useState<Mode>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [inviteCode, setInviteCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleDemoLogin() {
    setUser(DEMO_USER);
    setHousehold(DEMO_HOUSEHOLD);
  }

  async function handleSignIn() {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing fields', 'Enter your email and password.');
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth!, email.trim(), password);
    } catch (e: unknown) {
      Alert.alert('Sign in failed', (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp() {
    if (!email.trim() || !password.trim() || !displayName.trim()) {
      Alert.alert('Missing fields', 'Fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
      const uid = cred.user.uid;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const householdRef = doc(db!, 'households', uid);
      await setDoc(householdRef, {
        parent1Uid: uid,
        parent2Uid: null,
        subscriptionActive: false,
        revenueCatCustomerId: null,
        inviteCode: code,
        createdAt: serverTimestamp(),
      });
      await setDoc(doc(db!, 'users', uid), {
        email: email.trim(),
        displayName: displayName.trim(),
        householdId: uid,
      });
    } catch (e: unknown) {
      Alert.alert('Sign up failed', (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleJoinHousehold() {
    if (!inviteCode.trim() || inviteCode.length !== 6) {
      Alert.alert('Invalid code', 'Enter the 6-digit invite code from your co-parent.');
      return;
    }
    Alert.alert('Join Household', `Code "${inviteCode}" accepted. Cloud Function would link households here.`);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <Text style={styles.logo}>🏠</Text>
            <Text style={styles.appName}>NestSync</Text>
            <Text style={styles.tagline}>Co-parenting, coordinated.</Text>
          </View>

          {isDemoMode && (
            <TouchableOpacity style={styles.demoBtn} onPress={handleDemoLogin}>
              <Text style={styles.demoBtnText}>Continue as Demo User</Text>
            </TouchableOpacity>
          )}

          <View style={styles.tabs}>
            {(['signin', 'signup', 'join'] as Mode[]).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.tab, mode === m && styles.tabActive]}
                onPress={() => setMode(m)}
              >
                <Text style={[styles.tabText, mode === m && styles.tabTextActive]}>
                  {m === 'signin' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Join'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.form}>
            {mode === 'signup' && (
              <TextInput
                style={styles.input}
                placeholder="Your name"
                placeholderTextColor={SUBTEXT}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}
            {mode !== 'join' && (
              <>
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor={SUBTEXT}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor={SUBTEXT}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </>
            )}
            {mode === 'join' && (
              <>
                <Text style={styles.joinHint}>
                  Ask your co-parent for their 6-digit invite code.
                </Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  placeholderTextColor={SUBTEXT}
                  value={inviteCode}
                  onChangeText={setInviteCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </>
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
              onPress={
                mode === 'signin'
                  ? handleSignIn
                  : mode === 'signup'
                  ? handleSignUp
                  : handleJoinHousehold
              }
              disabled={isLoading || isDemoMode}
            >
              <Text style={styles.primaryBtnText}>
                {mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Join Household'}
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
  body: { padding: 24, flexGrow: 1 },
  hero: { alignItems: 'center', marginTop: 40, marginBottom: 36 },
  logo: { fontSize: 64, marginBottom: 8 },
  appName: { fontSize: 32, fontWeight: '800', color: TEXT, letterSpacing: -0.5 },
  tagline: { fontSize: 16, color: SUBTEXT, marginTop: 4 },
  demoBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  demoBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  tabs: { flexDirection: 'row', backgroundColor: CARD, borderRadius: 12, padding: 4, marginBottom: 24 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: ACCENT },
  tabText: { color: SUBTEXT, fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#fff' },
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
  codeInput: { textAlign: 'center', fontSize: 28, letterSpacing: 8, fontWeight: '700' },
  joinHint: { color: SUBTEXT, fontSize: 14, textAlign: 'center', marginBottom: 4 },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
