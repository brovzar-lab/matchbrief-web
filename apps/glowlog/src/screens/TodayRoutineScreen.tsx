import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, SUCCESS, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import { computeSkinHealthScore } from '../demo/seed';
import DemoModeBadge from '../components/DemoModeBadge';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

function ScoreCircle({ score }: { score: number }) {
  const pct = Math.round((score / 5) * 100);
  return (
    <View style={scoreStyles.wrap}>
      <View style={scoreStyles.circle}>
        <Text style={scoreStyles.number}>{score.toFixed(1)}</Text>
        <Text style={scoreStyles.label}>/ 5</Text>
      </View>
      <Text style={scoreStyles.title}>Skin Health Score</Text>
      <Text style={scoreStyles.sub}>{pct}% efficacy avg</Text>
    </View>
  );
}

const scoreStyles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 4 },
  circle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: ACCENT_DIM,
    borderWidth: 3,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: { fontSize: 26, fontWeight: '800', color: ACCENT },
  label: { fontSize: 11, color: SUBTEXT },
  title: { fontSize: 13, fontWeight: '600', color: TEXT },
  sub: { fontSize: 11, color: MUTED },
});

export default function TodayRoutineScreen() {
  const nav = useNavigation<Nav>();
  const {
    user,
    activeRoutineType,
    setActiveRoutineType,
    morningRoutine,
    nightRoutine,
    products,
    routineEntries,
    efficacy,
    addRoutineEntry,
    isDemo,
  } = useStore();

  const activeRoutine = activeRoutineType === 'morning' ? morningRoutine : nightRoutine;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayEntry = routineEntries.find(
    (e) => e.routineId === activeRoutine?.id && e.date === todayStr,
  );

  const completedIds = new Set(todayEntry?.completedProductIds ?? []);

  const skinScore = useMemo(() => computeSkinHealthScore(efficacy), [efficacy]);

  async function handleToggleProduct(productId: string) {
    if (!activeRoutine) return;

    const newCompleted = completedIds.has(productId)
      ? [...completedIds].filter((id) => id !== productId)
      : [...completedIds, productId];

    if (isDemo) {
      showToast('Demo mode — logged locally');
      addRoutineEntry({
        id: `entry-local-${Date.now()}`,
        routineId: activeRoutine.id,
        date: todayStr,
        completedProductIds: newCompleted,
        loggedAt: new Date().toISOString(),
      });
      return;
    }

    try {
      const { getFirestore: getDbInstance } = await import('../lib/firebase');
      const db = await getDbInstance();
      if (!db || !user) return;

      const { doc, setDoc } = await import('firebase/firestore');
      const entryId = `${activeRoutine.id}-${todayStr}`;
      const entryRef = doc(db, 'users', user.uid, 'routineEntries', entryId);
      const entry = {
        routineId: activeRoutine.id,
        date: todayStr,
        completedProductIds: newCompleted,
        loggedAt: new Date().toISOString(),
      };
      await setDoc(entryRef, entry, { merge: true });
      addRoutineEntry({ id: entryId, ...entry });
    } catch {
      Alert.alert('Error', 'Could not save entry.');
    }
  }

  const routineProducts = (activeRoutine?.productIds ?? [])
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  const allDone =
    routineProducts.length > 0 &&
    routineProducts.every((p) => completedIds.has(p.id));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isDemoMode && <DemoModeBadge />}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {activeRoutineType === 'morning' ? 'morning' : 'evening'} 🌸</Text>
            <Text style={styles.name}>{user?.displayName ?? 'Glow User'}</Text>
          </View>
          <View style={styles.streak}>
            <Text style={styles.streakNum}>🔥 {user?.streakDays ?? 0}</Text>
            <Text style={styles.streakLabel}>day streak</Text>
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreRow}>
          <ScoreCircle score={skinScore} />
          {/* 4-week sparkline placeholder */}
          <View style={styles.sparkline}>
            {[3.5, 3.8, 4.1, 4.3, 4.2, 4.5, 4.6].map((v, i) => (
              <View
                key={i}
                style={[
                  styles.sparkBar,
                  { height: (v / 5) * 48, backgroundColor: i === 6 ? ACCENT : ACCENT_DIM },
                ]}
              />
            ))}
            <Text style={styles.sparkLabel}>4-week trend</Text>
          </View>
        </View>

        {/* Morning / Night toggle */}
        <View style={styles.toggle}>
          {(['morning', 'night'] as const).map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.toggleBtn, activeRoutineType === type && styles.toggleBtnActive]}
              onPress={() => setActiveRoutineType(type)}
            >
              <Text style={[styles.toggleText, activeRoutineType === type && styles.toggleTextActive]}>
                {type === 'morning' ? '☀️ Morning' : '🌙 Night'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Done banner */}
        {allDone && (
          <View style={styles.doneBanner}>
            <Text style={styles.doneText}>✓ Routine complete for today!</Text>
          </View>
        )}

        {/* Product cards */}
        {routineProducts.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No products in this routine yet.</Text>
            <TouchableOpacity
              style={styles.buildBtn}
              onPress={() => nav.navigate('RoutineBuilder', { type: activeRoutineType })}
            >
              <Text style={styles.buildBtnText}>Build Routine</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {routineProducts.map((product) => {
              const done = completedIds.has(product.id);
              const eff = efficacy[product.id];
              return (
                <TouchableOpacity
                  key={product.id}
                  style={[styles.productCard, done && styles.productCardDone]}
                  onPress={() => handleToggleProduct(product.id)}
                  onLongPress={() => nav.navigate('ProductDetail', { productId: product.id })}
                >
                  <View style={styles.productLeft}>
                    <View style={[styles.checkCircle, done && styles.checkCircleDone]}>
                      {done && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View>
                      <Text style={[styles.productName, done && styles.productNameDone]}>
                        {product.name}
                      </Text>
                      <Text style={styles.productBrand}>{product.brand} · {product.category}</Text>
                    </View>
                  </View>
                  {eff && (
                    <Text style={styles.efficacyBadge}>★ {eff.avgStars.toFixed(1)}</Text>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity
              style={styles.editRoutineBtn}
              onPress={() => nav.navigate('RoutineBuilder', { type: activeRoutineType })}
            >
              <Text style={styles.editRoutineText}>Edit Routine</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, gap: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: SUBTEXT },
  name: { fontSize: 22, fontWeight: '800', color: TEXT },
  streak: { alignItems: 'center' },
  streakNum: { fontSize: 20, fontWeight: '700', color: TEXT },
  streakLabel: { fontSize: 10, color: MUTED },
  scoreRow: {
    flexDirection: 'row',
    backgroundColor: BG_SECONDARY,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 24,
  },
  sparkline: { flex: 1, flexDirection: 'row', alignItems: 'flex-end', gap: 4, position: 'relative' },
  sparkBar: { flex: 1, borderRadius: 3 },
  sparkLabel: { position: 'absolute', bottom: -18, left: 0, fontSize: 10, color: MUTED },
  toggle: { flexDirection: 'row', backgroundColor: BG_SECONDARY, borderRadius: 12, padding: 4, gap: 4 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: ACCENT },
  toggleText: { fontSize: 14, fontWeight: '600', color: SUBTEXT },
  toggleTextActive: { color: '#fff' },
  doneBanner: {
    backgroundColor: SUCCESS + '22',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  doneText: { fontSize: 14, fontWeight: '600', color: SUCCESS },
  productCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  productCardDone: { opacity: 0.7, borderColor: SUCCESS },
  productLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCircleDone: { backgroundColor: SUCCESS, borderColor: SUCCESS },
  checkmark: { fontSize: 14, color: '#fff', fontWeight: '800' },
  productName: { fontSize: 15, fontWeight: '600', color: TEXT },
  productNameDone: { textDecorationLine: 'line-through', color: MUTED },
  productBrand: { fontSize: 12, color: SUBTEXT, marginTop: 2 },
  efficacyBadge: { fontSize: 13, fontWeight: '700', color: ACCENT },
  empty: { alignItems: 'center', gap: 16, paddingVertical: 40 },
  emptyText: { fontSize: 15, color: SUBTEXT },
  buildBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buildBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  editRoutineBtn: { alignItems: 'center', paddingVertical: 8 },
  editRoutineText: { fontSize: 13, color: SUBTEXT, textDecorationLine: 'underline' },
});
