import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, isDemoMode, TIERS } from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PLANS = [
  {
    id: 'pro_monthly',
    icon: '🎙️',
    name: 'Pro Monthly',
    price: '$4.99/mo',
    features: ['Unlimited text legacies', 'Voice memo (5 min max)', 'Up to 20 recipients'],
    highlight: false,
  },
  {
    id: 'vault_monthly',
    icon: '🎥',
    name: 'Vault Monthly',
    price: '$9.99/mo',
    features: ['Everything in Pro', 'Video legacies (2 min max)', 'Unlimited recipients', 'Media vault'],
    highlight: true,
  },
  {
    id: 'lifetime',
    icon: '♾️',
    name: 'Lifetime',
    price: '$79 once',
    features: ['Everything in Vault', 'Lifetime access', 'Priority delivery', 'No future charges'],
    highlight: false,
  },
] as const;

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const [selectedPlan, setSelectedPlan] = React.useState<string>('vault_monthly');

  function handlePurchase() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'RevenueCat purchase flow would launch here. Subscription unlocked for demo.');
      nav.goBack();
      return;
    }
    // TODO: Purchases.purchasePackage() via react-native-purchases
    Alert.alert('Coming soon', 'RevenueCat integration pending.');
  }

  function handleRestore() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Restore purchases would contact RevenueCat here.');
      return;
    }
    // TODO: Purchases.restorePurchases()
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <View style={{ width: 44 }} />
        <Text style={styles.topBarTitle}>Unlock LegacyLetter</Text>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.closeBtn}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.heroSection}>
          <Text style={styles.heroIcon}>📜</Text>
          <Text style={styles.heroTitle}>Leave more than words</Text>
          <Text style={styles.heroSubtitle}>
            Upgrade to send voice memos, videos, and unlimited messages to the people who matter most.
          </Text>
        </View>

        <View style={styles.plans}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              style={[
                styles.planCard,
                selectedPlan === plan.id && styles.planCardSelected,
                plan.highlight && styles.planCardHighlight,
              ]}
              onPress={() => setSelectedPlan(plan.id)}
            >
              {plan.highlight && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
                </View>
              )}
              <View style={styles.planHeader}>
                <Text style={styles.planIcon}>{plan.icon}</Text>
                <View style={styles.planTitleBlock}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planPrice}>{plan.price}</Text>
                </View>
                <View style={[styles.radio, selectedPlan === plan.id && styles.radioSelected]}>
                  {selectedPlan === plan.id && <View style={styles.radioDot} />}
                </View>
              </View>
              {plan.features.map((f) => (
                <Text key={f} style={styles.feature}>✓ {f}</Text>
              ))}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.purchaseBtn} onPress={handlePurchase}>
          <Text style={styles.purchaseBtnText}>Continue</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>
        <Text style={styles.legal}>
          Subscriptions auto-renew. Cancel anytime in App Store / Google Play settings.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  topBarTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  closeBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  closeBtnText: { color: SUBTEXT, fontSize: 20 },
  body: { padding: 20, paddingBottom: 8 },
  heroSection: { alignItems: 'center', marginBottom: 28 },
  heroIcon: { fontSize: 48, marginBottom: 12 },
  heroTitle: { fontSize: 24, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 22 },
  plans: { gap: 12 },
  planCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  planCardSelected: { borderColor: ACCENT },
  planCardHighlight: { borderColor: ACCENT, backgroundColor: `${ACCENT}10` },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  popularBadgeText: { color: '#fff', fontWeight: '700', fontSize: 11, letterSpacing: 0.5 },
  planHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  planIcon: { fontSize: 28 },
  planTitleBlock: { flex: 1 },
  planName: { fontSize: 17, fontWeight: '700', color: TEXT },
  planPrice: { fontSize: 14, color: SUBTEXT, marginTop: 2 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: ACCENT },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: ACCENT },
  feature: { fontSize: 14, color: SUBTEXT, marginLeft: 40 },
  footer: { padding: 20, gap: 12 },
  purchaseBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  purchaseBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  restoreText: { color: SUBTEXT, textAlign: 'center', fontSize: 14 },
  legal: { color: SUBTEXT, fontSize: 11, textAlign: 'center', lineHeight: 16, opacity: 0.7 },
});
