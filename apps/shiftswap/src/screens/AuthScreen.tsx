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
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../lib/firebase';
import { useStore } from '../lib/store';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER } from '../lib/config';
import { DEMO_USER, DEMO_MANAGER_USER } from '../demo/seed';
import type { UserRole } from '../lib/types';

type Mode = 'signin' | 'signup';

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);
  const [mode, setMode] = React.useState<Mode>('signin');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [role, setRole] = React.useState<UserRole>('worker');
  const [isLoading, setIsLoading] = React.useState(false);

  function handleDemoWorker() {
    setUser(DEMO_USER);
  }

  function handleDemoManager() {
    setUser(DEMO_MANAGER_USER);
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
    if (!email.trim() || !password.trim() || !name.trim()) {
      Alert.alert('Missing fields', 'Fill in all fields.');
      return;
    }
    setIsLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth!, email.trim(), password);
      const uid = cred.user.uid;

      await setDoc(doc(db!, 'users', uid), {
        email: email.trim(),
        name: name.trim(),
        role,
        companyId: '',
        locationId: '',
        createdAt: serverTimestamp(),
      });

      // Cloud Function sets custom claims (companyId, locationId, role)
      if (functions) {
        const setClaimsFn = httpsCallable(functions, 'setUserClaims');
        await setClaimsFn({ uid, role });
      }
    } catch (e: unknown) {
      Alert.alert('Sign up failed', (e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>ShiftSwap</Text>
          <Text style={styles.tagline}>Shift trading made simple</Text>

          {isDemoMode && (
            <View style={styles.demoBox}>
              <Text style={styles.demoLabel}>Demo Mode</Text>
              <TouchableOpacity style={styles.demoBtn} onPress={handleDemoWorker}>
                <Text style={styles.demoBtnText}>Continue as Demo Worker</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.demoBtn, { marginTop: 8 }]} onPress={handleDemoManager}>
                <Text style={styles.demoBtnText}>Continue as Demo Manager</Text>
              </TouchableOpacity>
            </View>
          )}

          {!isDemoMode && (
            <View style={styles.card}>
              <View style={styles.tabs}>
                <TouchableOpacity
                  style={[styles.tab, mode === 'signin' && styles.tabActive]}
                  onPress={() => setMode('signin')}
                >
                  <Text style={[styles.tabText, mode === 'signin' && styles.tabTextActive]}>
                    Sign In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => setMode('signup')}
                >
                  <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              {mode === 'signup' && (
                <TextInput
                  style={styles.input}
                  placeholder="Full name"
                  placeholderTextColor={SUBTEXT}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              )}

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

              {mode === 'signup' && (
                <View style={styles.roleRow}>
                  <Text style={styles.roleLabel}>I am a:</Text>
                  {(['worker', 'manager'] as UserRole[]).map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.roleBtn, role === r && styles.roleBtnActive]}
                      onPress={() => setRole(r)}
                    >
                      <Text style={[styles.roleBtnText, role === r && styles.roleBtnTextActive]}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && { opacity: 0.6 }]}
                onPress={mode === 'signin' ? handleSignIn : handleSignUp}
                disabled={isLoading}
              >
                <Text style={styles.primaryBtnText}>
                  {isLoading ? 'Loading…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  container: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '700', color: ACCENT, textAlign: 'center', marginBottom: 4 },
  tagline: { fontSize: 15, color: SUBTEXT, textAlign: 'center', marginBottom: 32 },
  demoBox: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
    marginBottom: 16,
  },
  demoLabel: {
    color: ACCENT,
    fontWeight: '600',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    textAlign: 'center',
  },
  demoBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  demoBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  card: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 20,
  },
  tabs: { flexDirection: 'row', marginBottom: 16 },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: ACCENT },
  tabText: { color: SUBTEXT, fontWeight: '500' },
  tabTextActive: { color: ACCENT },
  input: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 12,
    color: TEXT,
    marginBottom: 12,
    fontSize: 15,
  },
  roleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  roleLabel: { color: SUBTEXT, marginRight: 8 },
  roleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  roleBtnActive: { borderColor: ACCENT, backgroundColor: `${ACCENT}22` },
  roleBtnText: { color: SUBTEXT },
  roleBtnTextActive: { color: ACCENT, fontWeight: '600' },
  primaryBtn: {
    backgroundColor: ACCENT,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  primaryBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
  errorText: { color: DANGER, fontSize: 13, marginTop: 8, textAlign: 'center' },
});
