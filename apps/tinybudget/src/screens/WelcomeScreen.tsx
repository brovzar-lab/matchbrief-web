import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { useStore } from '../lib/store';
import { isDemoMode } from '../lib/demo';
import { colors } from '../lib/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const FEATURES = [
  { emoji: '⚡', title: 'Zero-based budgeting', desc: 'Give every dollar a job' },
  { emoji: '📊', title: 'Visual progress', desc: 'See where your money goes' },
  { emoji: '🗂️', title: 'Custom categories', desc: 'Built around your life' },
];

export default function WelcomeScreen({ navigation }: Props) {
  const enterDemo = useStore((s) => s.enterDemo);

  return (
    <SafeAreaView style={styles.safe}>
      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO MODE</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Text style={styles.logoEmoji}>💚</Text>
          <Text style={styles.appName}>TinyBudget</Text>
          <Text style={styles.tagline}>Zero-based budgeting.{'\n'}Set up in 60 seconds.</Text>
        </View>

        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Onboarding')}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Set up my budget →</Text>
          </TouchableOpacity>

          {isDemoMode && (
            <TouchableOpacity
              style={styles.demoBtn}
              onPress={enterDemo}
              activeOpacity={0.85}
            >
              <Text style={styles.demoBtnText}>Continue as Demo User</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.footer}>No account required. 100% on-device.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  demoBadge: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  demoBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 48 },
  hero: { alignItems: 'center', marginBottom: 40 },
  logoEmoji: { fontSize: 64, marginBottom: 12 },
  appName: { fontSize: 36, fontWeight: '800', color: colors.text, marginBottom: 10 },
  tagline: {
    fontSize: 18,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 26,
  },
  features: { marginBottom: 40, gap: 16 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  featureEmoji: { fontSize: 28 },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 2 },
  featureDesc: { fontSize: 13, color: colors.textMuted },
  actions: { gap: 12, marginBottom: 24 },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  primaryBtnText: { color: colors.white, fontSize: 16, fontWeight: '700' },
  demoBtn: {
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  demoBtnText: { color: colors.textMuted, fontSize: 15, fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 12, color: colors.textLight },
});
