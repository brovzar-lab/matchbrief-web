import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, isDemoMode } from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';
import { RC_PRODUCT_ID } from '../lib/config';
import Purchases from 'react-native-purchases';
import { useStore } from '../lib/store';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FEATURES = [
  '📅 Shared co-parenting calendar',
  '💬 Secure messaging between parents',
  '💸 Expense tracking & splitting',
  '🏠 One household, two parents',
  '🔒 Private & secure',
];

export default function PaywallScreen() {
  const nav = useNavigation<Nav>();
  const household = useStore((s) => s.household);
  const setHousehold = useStore((s) => s.setHousehold);
  const [isPurchasing, setIsPurchasing] = React.useState(false);
  const [isRestoring, setIsRestoring] = React.useState(false);
  const [priceString, setPriceString] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isDemoMode) return;
    async function fetchPrice() {
      try {
        const offerings = await Purchases.getOfferings();
        const pkg = offerings.current?.availablePackages.find(
          (p) => p.product.identifier === RC_PRODUCT_ID
        );
        if (pkg) setPriceString(pkg.product.priceString);
      } catch {
        // ignore — use fallback
      }
    }
    fetchPrice();
  }, []);

  async function handlePurchase() {
    if (isDemoMode) {
      if (household) setHousehold({ ...household, subscriptionActive: true });
      Alert.alert('Demo Mode', 'Purchase flow would launch here. Subscription activated for demo!');
      nav.goBack();
      return;
    }
    if (!household) return;
    setIsPurchasing(true);
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.product.identifier === RC_PRODUCT_ID
      );
      if (!pkg) throw new Error('Product not found');
      await Purchases.purchasePackage(pkg);
      // RevenueCat webhook updates household.subscriptionActive server-side.
      // Optimistically reflect the purchase locally.
      if (household && db) {
        await updateDoc(doc(db, 'households', household.id), { subscriptionActive: true });
      }
      nav.goBack();
    } catch (e: unknown) {
      if (!(e as { userCancelled?: boolean }).userCancelled) {
        Alert.alert('Purchase failed', (e as Error).message);
      }
    } finally {
      setIsPurchasing(false);
    }
  }

  async function handleRestore() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Restore would contact RevenueCat here.');
      return;
    }
    setIsRestoring(true);
    try {
      const info = await Purchases.restorePurchases();
      const active = info.entitlements.active;
      if (Object.keys(active).length > 0) {
        nav.goBack();
      } else {
        Alert.alert('No purchases found', 'No active subscriptions were found for this account.');
      }
    } catch (e: unknown) {
      Alert.alert('Restore failed', (e as Error).message);
    } finally {
      setIsRestoring(false);
    }
  }

  const isBusy = isPurchasing || isRestoring;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <View style={{ width: 44 }} />
        <Text style={styles.topBarTitle}>Unlock NestSync</Text>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.closeBtn} disabled={isBusy}>
          <Text style={styles.closeBtnText}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>🏠</Text>
          <Text style={styles.heroTitle}>One household plan</Text>
          <Text style={styles.heroSubtitle}>
            One parent subscribes, both parents get full access. No double billing.
          </Text>
        </View>

        <View style={styles.priceCard}>
          <Text style={styles.priceLabel}>NestSync Family Plan</Text>
          <Text style={styles.price}>{priceString ?? '$9.99'}<Text style={styles.pricePer}>/month</Text></Text>
          <Text style={styles.priceNote}>Both co-parents included · Cancel anytime</Text>
        </View>

        <View style={styles.featureList}>
          {FEATURES.map((f) => (
            <Text key={f} style={styles.feature}>{f}</Text>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.purchaseBtn, isBusy && styles.purchaseBtnDisabled]}
          onPress={handlePurchase}
          disabled={isBusy}
        >
          {isPurchasing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.purchaseBtnText}>Start Subscription</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleRestore} disabled={isBusy}>
          {isRestoring ? (
            <ActivityIndicator color={SUBTEXT} size="small" />
          ) : (
            <Text style={styles.restoreText}>Restore Purchases</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.legal}>
          Subscription auto-renews monthly. Cancel anytime in{' '}
          {Platform.OS === 'ios' ? 'App Store' : 'Google Play'} settings.
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
  hero: { alignItems: 'center', marginBottom: 28 },
  heroEmoji: { fontSize: 56, marginBottom: 14 },
  heroTitle: { fontSize: 26, fontWeight: '800', color: TEXT, textAlign: 'center', marginBottom: 8 },
  heroSubtitle: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 22 },
  priceCard: {
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: ACCENT,
    borderRadius: 18,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    gap: 4,
  },
  priceLabel: { fontSize: 14, color: SUBTEXT, fontWeight: '600' },
  price: { fontSize: 42, fontWeight: '800', color: TEXT },
  pricePer: { fontSize: 18, color: SUBTEXT, fontWeight: '500' },
  priceNote: { fontSize: 13, color: ACCENT, fontWeight: '600' },
  featureList: { gap: 12 },
  feature: { fontSize: 16, color: TEXT, lineHeight: 24 },
  footer: { padding: 20, gap: 12 },
  purchaseBtn: {
    backgroundColor: ACCENT,
    borderRadius: 14,
    padding: 18,
    alignItems: 'center',
  },
  purchaseBtnDisabled: { opacity: 0.6 },
  purchaseBtnText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  restoreText: { color: SUBTEXT, textAlign: 'center', fontSize: 14 },
  legal: { color: SUBTEXT, fontSize: 11, textAlign: 'center', lineHeight: 16, opacity: 0.7 },
});
