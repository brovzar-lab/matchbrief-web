import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, SUCCESS, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import StarRating from '../components/StarRating';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'ProductDetail'>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function ProductDetailScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { productId } = route.params;

  const { products, ratings, efficacy, addRating, setEfficacy, user, isDemo } = useStore();

  const product = products.find((p) => p.id === productId);
  const productRatings = ratings.filter((r) => r.productId === productId);
  const eff = efficacy[productId];

  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [weeksInUse, setWeeksInUse] = useState<number>(4);
  const [saving, setSaving] = useState(false);

  const ratingHistory = useMemo(() => {
    return productRatings
      .slice()
      .sort((a, b) => b.ratedAt.localeCompare(a.ratedAt))
      .slice(0, 5);
  }, [productRatings]);

  if (!product) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.errorText}>Product not found.</Text>
      </SafeAreaView>
    );
  }

  async function handleRate() {
    if (selectedStars === 0) {
      Alert.alert('Select stars', 'Please select a rating before saving.');
      return;
    }

    const newRating = {
      id: `rating-${Date.now()}`,
      productId,
      stars: selectedStars as 1 | 2 | 3 | 4 | 5,
      ratedAt: new Date().toISOString(),
      weeksInUse,
    };

    if (isDemo) {
      showToast('Demo mode — not saved');
      addRating(newRating);
      const allRatings = [...productRatings, newRating];
      const avg = allRatings.reduce((s, r) => s + r.stars, 0) / allRatings.length;
      setEfficacy(productId, {
        productId,
        userId: user?.uid ?? 'demo',
        avgStars: Math.round(avg * 10) / 10,
        ratingCount: allRatings.length,
        updatedAt: new Date().toISOString(),
      });
      setSelectedStars(0);
      return;
    }

    setSaving(true);
    try {
      const { getFirestore: getDbInstance } = await import('../lib/firebase');
      const db = await getDbInstance();
      if (!db || !user) return;

      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid, 'productRatings', newRating.id), newRating);
      addRating(newRating);
      setSelectedStars(0);
    } catch {
      Alert.alert('Error', 'Could not save rating.');
    } finally {
      setSaving(false);
    }
  }

  const categoryEmojis: Record<string, string> = {
    Cleanser: '🫧', Toner: '💧', Serum: '✨', Moisturizer: '🧴',
    Sunscreen: '☀️', 'Eye Cream': '👁️', Exfoliant: '🌀', Mask: '🎭',
    Treatment: '💊', Other: '🔹',
  };
  const emoji = categoryEmojis[product.category] ?? '🔹';

  const weeksOptions = [1, 2, 4, 6, 8, 12];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Product hero */}
        <View style={styles.productHero}>
          <View style={styles.productAvatar}>
            <Text style={styles.productEmoji}>{emoji}</Text>
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productBrand}>{product.brand}</Text>
          <View style={styles.categoryChip}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        {/* Efficacy summary */}
        {eff && (
          <View style={styles.effCard}>
            <Text style={styles.effLabel}>Efficacy Score</Text>
            <View style={styles.effRow}>
              <Text style={styles.effScore}>★ {eff.avgStars.toFixed(1)}</Text>
              <Text style={styles.effCount}>from {eff.ratingCount} rating{eff.ratingCount !== 1 ? 's' : ''}</Text>
            </View>
            <StarRating value={Math.round(eff.avgStars)} readonly size={20} />
          </View>
        )}

        {/* Rate this product */}
        <View style={styles.rateSection}>
          <Text style={styles.sectionTitle}>Rate this product</Text>
          {ratingHistory.length === 0 && (
            <Text style={styles.ratePrompt}>You haven't rated this yet. Try it for 2+ weeks first!</Text>
          )}

          <StarRating value={selectedStars} onChange={setSelectedStars} size={36} />

          <Text style={styles.weeksLabel}>Weeks in use</Text>
          <View style={styles.weeksRow}>
            {weeksOptions.map((w) => (
              <TouchableOpacity
                key={w}
                style={[styles.weekBtn, weeksInUse === w && styles.weekBtnActive]}
                onPress={() => setWeeksInUse(w)}
              >
                <Text style={[styles.weekBtnText, weeksInUse === w && styles.weekBtnTextActive]}>
                  {w}w
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.saveRatingBtn, saving && styles.btnDisabled]}
            onPress={handleRate}
            disabled={saving}
          >
            <Text style={styles.saveRatingText}>{saving ? 'Saving…' : 'Save Rating'}</Text>
          </TouchableOpacity>
        </View>

        {/* Rating history */}
        {ratingHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Rating History</Text>
            {ratingHistory.map((r) => (
              <View key={r.id} style={styles.historyRow}>
                <StarRating value={r.stars} readonly size={16} />
                <Text style={styles.historyMeta}>
                  {r.weeksInUse}w · {new Date(r.ratedAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { padding: 4 },
  backText: { fontSize: 15, color: ACCENT, fontWeight: '600' },
  scroll: { padding: 20, gap: 24, paddingBottom: 40 },
  productHero: { alignItems: 'center', gap: 8 },
  productAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 40 },
  productName: { fontSize: 20, fontWeight: '800', color: TEXT, textAlign: 'center' },
  productBrand: { fontSize: 14, color: SUBTEXT },
  categoryChip: {
    backgroundColor: ACCENT_DIM,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  categoryText: { fontSize: 12, fontWeight: '600', color: ACCENT },
  effCard: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 16,
    padding: 20,
    gap: 8,
  },
  effLabel: { fontSize: 12, color: SUBTEXT, fontWeight: '600', textTransform: 'uppercase' },
  effRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  effScore: { fontSize: 28, fontWeight: '800', color: ACCENT },
  effCount: { fontSize: 13, color: MUTED },
  rateSection: { gap: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  ratePrompt: { fontSize: 13, color: SUBTEXT, lineHeight: 20 },
  weeksLabel: { fontSize: 13, color: SUBTEXT, fontWeight: '600' },
  weeksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  weekBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  weekBtnActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  weekBtnText: { fontSize: 13, color: SUBTEXT, fontWeight: '600' },
  weekBtnTextActive: { color: '#fff' },
  saveRatingBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.5 },
  saveRatingText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  historySection: { gap: 12 },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: CARD,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  historyMeta: { fontSize: 12, color: MUTED },
  errorText: { fontSize: 16, color: SUBTEXT, textAlign: 'center', marginTop: 40 },
});
