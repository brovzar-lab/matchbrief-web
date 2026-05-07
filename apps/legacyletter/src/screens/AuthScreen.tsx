import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT } from '../lib/config';
import { isDemoMode } from '../lib/config';
import { DEMO_USER } from '../lib/mockData';
import { useStore } from '../lib/store';

export default function AuthScreen() {
  const setUser = useStore((s) => s.setUser);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);

  function handleDemoLogin() {
    setUser(DEMO_USER);
  }

  async function handleEmailAuth() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Sign in is disabled in demo mode. Use "Continue as Demo User".');
      return;
    }
    // TODO: wire Firebase Auth email/password
    Alert.alert('Coming soon', 'Firebase Auth integration pending.');
  }

  async function handleGoogleSignIn() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Google sign-in is disabled in demo mode.');
      return;
    }
    // TODO: wire Firebase Auth Google provider
    Alert.alert('Coming soon', 'Google sign-in integration pending.');
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
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={SUBTEXT}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={handleEmailAuth}>
            <Text style={styles.primaryBtnText}>
              {isSignUp ? 'Create Account' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={handleGoogleSignIn}>
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
