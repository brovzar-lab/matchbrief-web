import React, { useState } from 'react';
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
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, MUTED, DANGER, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Route = RouteProp<RootStackParamList, 'RoutineBuilder'>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function RoutineBuilderScreen() {
  const nav = useNavigation();
  const route = useRoute<Route>();
  const { type } = route.params;

  const {
    products,
    morningRoutine,
    nightRoutine,
    setRoutine,
    user,
    isDemo,
  } = useStore();

  const existingRoutine = type === 'morning' ? morningRoutine : nightRoutine;
  const [selectedIds, setSelectedIds] = useState<string[]>(
    existingRoutine?.productIds ?? [],
  );

  const activeProducts = products.filter((p) => p.isActive);

  function toggleProduct(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function moveUp(index: number) {
    if (index === 0) return;
    const next = [...selectedIds];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    setSelectedIds(next);
  }

  function moveDown(index: number) {
    if (index === selectedIds.length - 1) return;
    const next = [...selectedIds];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    setSelectedIds(next);
  }

  async function handleSave() {
    const routine = {
      id: existingRoutine?.id ?? `routine-${type}`,
      type,
      productIds: selectedIds,
      updatedAt: new Date().toISOString(),
    };

    if (isDemo) {
      setRoutine(routine);
      showToast('Demo mode — not saved');
      nav.goBack();
      return;
    }

    try {
      const { getFirestore: getDbInstance } = await import('../lib/firebase');
      const db = await getDbInstance();
      if (!db || !user) return;

      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid, 'routines', routine.id), routine);
      setRoutine(routine);
      nav.goBack();
    } catch {
      Alert.alert('Error', 'Could not save routine.');
    }
  }

  const selectedProducts = selectedIds
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean) as typeof products;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{type === 'morning' ? '☀️ Morning' : '🌙 Night'} Routine</Text>
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Current order */}
        {selectedProducts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Step Order</Text>
            {selectedProducts.map((p, i) => (
              <View key={p.id} style={styles.orderCard}>
                <Text style={styles.stepNum}>{i + 1}</Text>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderName}>{p.name}</Text>
                  <Text style={styles.orderBrand}>{p.brand}</Text>
                </View>
                <View style={styles.orderActions}>
                  <TouchableOpacity onPress={() => moveUp(i)} style={styles.arrowBtn}>
                    <Text style={styles.arrowText}>↑</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => moveDown(i)} style={styles.arrowBtn}>
                    <Text style={styles.arrowText}>↓</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => toggleProduct(p.id)} style={styles.removeBtn}>
                    <Text style={styles.removeText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Product picker */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tap to add products</Text>
          {activeProducts.length === 0 ? (
            <Text style={styles.emptyText}>Add products in the Library first.</Text>
          ) : (
            activeProducts.map((p) => {
              const isSelected = selectedIds.includes(p.id);
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pickerCard, isSelected && styles.pickerCardSelected]}
                  onPress={() => toggleProduct(p.id)}
                >
                  <View style={styles.pickerInfo}>
                    <Text style={styles.pickerName}>{p.name}</Text>
                    <Text style={styles.pickerBrand}>{p.brand} · {p.category}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  cancelBtn: { padding: 4 },
  cancelText: { fontSize: 15, color: SUBTEXT },
  title: { fontSize: 17, fontWeight: '700', color: TEXT },
  saveBtn: { padding: 4 },
  saveText: { fontSize: 15, fontWeight: '700', color: ACCENT },
  scroll: { padding: 20, gap: 24, paddingBottom: 40 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: SUBTEXT, textTransform: 'uppercase', letterSpacing: 0.5 },
  orderCard: {
    backgroundColor: BG_SECONDARY,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepNum: { fontSize: 16, fontWeight: '800', color: ACCENT, width: 24, textAlign: 'center' },
  orderInfo: { flex: 1 },
  orderName: { fontSize: 14, fontWeight: '600', color: TEXT },
  orderBrand: { fontSize: 12, color: SUBTEXT },
  orderActions: { flexDirection: 'row', gap: 8 },
  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontSize: 14, color: TEXT },
  removeBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: DANGER + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: { fontSize: 12, color: DANGER, fontWeight: '700' },
  pickerCard: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  pickerCardSelected: { borderColor: ACCENT, backgroundColor: ACCENT + '11' },
  pickerInfo: { flex: 1 },
  pickerName: { fontSize: 14, fontWeight: '600', color: TEXT },
  pickerBrand: { fontSize: 12, color: SUBTEXT, marginTop: 2 },
  checkmark: { fontSize: 16, color: ACCENT, fontWeight: '700' },
  emptyText: { fontSize: 14, color: MUTED, textAlign: 'center', paddingVertical: 20 },
});
