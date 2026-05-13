import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, SUCCESS, MUTED,
  isDemoMode, RC_MONTHLY_ID, RC_ANNUAL_ID, RC_ENTITLEMENT_ID,
} from '../lib/config';
import { useStore } from '../lib/store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

const FEATURES = [
  { icon: '🎯', text: 'Unlimited daily coaching sessions' },
  { icon: '🧠', text: 'AI coach powered by Claude Sonnet' },
  { icon: '📊', text: 'Full career dimension radar' },
  { icon: '🔥', text: 'Streak tracking + accountability' },
  { icon: '📚', text: 'Personalized session history' },
  { icon: '⚡', text: 'Priority session generation' },
];

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const setRcPremiumActive = useStore((s) => s.setRcPremiumActive);

  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [purchasing, setPurchasing] = useState(false);

  async function handleSubscribe() {
    if (isDemoMode) {
      showToast('Demo mode — not charged');
      setRcPremiumActive(true);
      nav.goBack();
      return;
    }

    setPurchasing(true);
    try {
      const Purchases = (await import('react-native-purchases')).default;
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find((p) =>
        plan === 'annual' ? p.identifier.includes('annual') : p.identifier.includes('monthly'),
      );
      if (!pkg) throw new Error('Package not found');
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      if (customerInfo.entitlements.active[RC_ENTITLEMENT_ID]) {
        setRcPremiumActive(true);
        showToast('Welcome to MicroMentor Premium!');
        nav.goBack();
      }
    } catch (err: any) {
      if (err.userCancelled) return;
      Alert.alert('Purchase failed', err.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  }

  async function handleRestore() {
    if (isDemoMode) {
      showToast('Demo mode — nothing to restore');
      return;
    }
    try {
      const Purchases = (await import('react-native-purchases')).default;
      const { customerInfo } = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active[RC_ENTITLEMENT_ID]) {
        setRcPremiumActive(true);
        Alert.alert('Restored', 'Your premium access has been restored.');
        nav.goBack();
      } else {
        Alert.alert('Nothing to restore', 'No active subscription found.');
      }
    } catch {
      Alert.alert('Error', 'Could not restore purchases.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Close */}
        <TouchableOpacity style={styles.closeBtn} onPress={() => nav.goBack()}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🧠</Text>
          <Text style={styles.heroTitle}>MicroMentor Premium</Text>
          <Text style={styles.heroSubtitle}>
            Executive coaching for the price of a coffee.{'\n'}Start your 7-day free trial today.
          </Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {FEATURES.map((f) => (
            <View key={f.text} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plan toggle */}
        <View style={styles.planToggle}>
          <TouchableOpacity
            style={[styles.planOption, plan === 'monthly' && styles.planSelected]}
            onPress={() => setPlan('monthly')}
          >
            <Text style={[styles.planName, plan === 'monthly' && styles.planNameSelected]}>Monthly</Text>
            <Text style={[styles.planPrice, plan === 'monthly' && styles.planPriceSelected]}>$14.99/mo</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.planOption, plan === 'annual' && styles.planSelected]}
            onPress={() => setPlan('annual')}
          >
            <View style={styles.saveBadge}>
              <Text style={styles.saveBadgeText}>SAVE 45%</Text>
            </View>
            <Text style={[styles.planName, plan === 'annual' && styles.planNameSelected]}>Annual</Text>
            <Text style={[styles.planPrice, plan === 'annual' && styles.planPriceSelected]}>$99/yr</Text>
            <Text style={[styles.planPerMonth, plan === 'annual' && styles.planPerMonthSelected]}>$8.25/mo</Text>
          </TouchableOpacity>
        </View>

        {/* CTA */}
        <TouchableOpacity
          style={[styles.ctaBtn, purchasing && styles.btnDisabled]}
          onPress={handleSubscribe}
          disabled={purchasing}
        >
          <Text style={styles.ctaBtnText}>
            {purchasing ? 'Processing…' : 'Start 7-Day Free Trial'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.trialNote}>
          No charge for 7 days. Cancel anytime before trial ends.
        </Text>

        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        <Text style={styles.legalText}>
          Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
          Manage or cancel your subscription in your device settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  content: { padding: 24, gap: 24, paddingBottom: 40 },
  closeBtn: { alignSelf: 'flex-start', padding: 4 },
  closeText: { fontSize: 20, color: SUBTEXT },
  hero: { alignItems: 'center', gap: 10 },
  heroEmoji: { fontSize: 52 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: TEXT },
  heroSubtitle: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 23 },
  features: { gap: 12 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  featureIcon: { fontSize: 20, width: 28 },
  featureText: { fontSize: 15, color: TEXT, flex: 1 },
  planToggle: { flexDirection: 'row', gap: 12 },
  planOption: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  planSelected: { borderColor: ACCENT, borderWidth: 2 },
  planName: { fontSize: 14, color: SUBTEXT, fontWeight: '600' },
  planNameSelected: { color: TEXT },
  planPrice: { fontSize: 20, fontWeight: '800', color: SUBTEXT },
  planPriceSelected: { color: ACCENT },
  planPerMonth: { fontSize: 11, color: MUTED },
  planPerMonthSelected: { color: SUBTEXT },
  saveBadge: {
    position: 'absolute',
    top: -10,
    backgroundColor: SUCCESS,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  saveBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  ctaBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  ctaBtnText: { fontSize: 17, fontWeight: '800', color: '#000' },
  trialNote: { fontSize: 12, color: SUBTEXT, textAlign: 'center' },
  restoreText: { fontSize: 13, color: SUBTEXT, textAlign: 'center', textDecorationLine: 'underline' },
  legalText: { fontSize: 11, color: MUTED, textAlign: 'center', lineHeight: 17 },
});
