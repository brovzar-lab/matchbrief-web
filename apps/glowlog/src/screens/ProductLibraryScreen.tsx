import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, ACCENT_DIM, MUTED, SUCCESS, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import { ProductCategory } from '../lib/types';
import DemoModeBadge from '../components/DemoModeBadge';
import StarRating from '../components/StarRating';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CATEGORIES: ProductCategory[] = [
  'Cleanser', 'Toner', 'Serum', 'Moisturizer', 'Sunscreen',
  'Eye Cream', 'Exfoliant', 'Mask', 'Treatment', 'Other',
];

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function ProductLibraryScreen() {
  const nav = useNavigation<Nav>();
  const { products, efficacy, addProduct, user, isDemo } = useStore();

  const [filterCat, setFilterCat] = useState<ProductCategory | 'All'>('All');
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBrand, setNewBrand] = useState('');
  const [newCategory, setNewCategory] = useState<ProductCategory>('Serum');
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    if (filterCat === 'All') return products;
    return products.filter((p) => p.category === filterCat);
  }, [products, filterCat]);

  async function handleAddProduct() {
    if (!newName.trim() || !newBrand.trim()) {
      Alert.alert('Missing fields', 'Please enter product name and brand.');
      return;
    }

    const product = {
      id: `prod-${Date.now()}`,
      name: newName.trim(),
      brand: newBrand.trim(),
      photoUrl: null,
      category: newCategory,
      addedAt: new Date().toISOString(),
      isActive: true,
    };

    if (isDemo) {
      addProduct(product);
      showToast('Demo mode — not saved');
      setShowAdd(false);
      setNewName('');
      setNewBrand('');
      return;
    }

    setSaving(true);
    try {
      const { getFirestore: getDbInstance } = await import('../lib/firebase');
      const db = await getDbInstance();
      if (!db || !user) return;

      const { doc, setDoc } = await import('firebase/firestore');
      await setDoc(doc(db, 'users', user.uid, 'products', product.id), product);
      addProduct(product);
      setShowAdd(false);
      setNewName('');
      setNewBrand('');
    } catch {
      Alert.alert('Error', 'Could not save product.');
    } finally {
      setSaving(false);
    }
  }

  const categoryEmojis: Record<string, string> = {
    Cleanser: '🫧', Toner: '💧', Serum: '✨', Moisturizer: '🧴',
    Sunscreen: '☀️', 'Eye Cream': '👁️', Exfoliant: '🌀', Mask: '🎭',
    Treatment: '💊', Other: '🔹',
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        {isDemoMode && <DemoModeBadge />}
        <View style={styles.headerRow}>
          <Text style={styles.title}>Product Library</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {(['All', ...CATEGORIES] as const).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.filterChip, filterCat === cat && styles.filterChipActive]}
            onPress={() => setFilterCat(cat)}
          >
            <Text style={[styles.filterChipText, filterCat === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🧴</Text>
            <Text style={styles.emptyText}>No products yet. Add your first one!</Text>
          </View>
        ) : (
          filtered.map((product) => {
            const eff = efficacy[product.id];
            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() => nav.navigate('ProductDetail', { productId: product.id })}
              >
                <View style={styles.productAvatar}>
                  <Text style={styles.productEmoji}>
                    {categoryEmojis[product.category] ?? '🔹'}
                  </Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={styles.productBrand}>{product.brand}</Text>
                  <Text style={styles.productCategory}>{product.category}</Text>
                </View>
                {eff ? (
                  <View style={styles.efficacyBadge}>
                    <Text style={styles.efficacyScore}>★ {eff.avgStars.toFixed(1)}</Text>
                    <Text style={styles.efficacyCount}>{eff.ratingCount}x</Text>
                  </View>
                ) : (
                  <View style={styles.noRatingBadge}>
                    <Text style={styles.noRatingText}>No rating</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Add product modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAdd(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Product</Text>
            <TouchableOpacity onPress={handleAddProduct} disabled={saving}>
              <Text style={[styles.modalSave, saving && styles.btnDisabled]}>
                {saving ? 'Saving…' : 'Add'}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Vitamin C Serum"
                placeholderTextColor={MUTED}
                value={newName}
                onChangeText={setNewName}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Brand</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. The Ordinary"
                placeholderTextColor={MUTED}
                value={newBrand}
                onChangeText={setNewBrand}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Category</Text>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.catOption,
                      newCategory === cat && styles.catOptionActive,
                    ]}
                    onPress={() => setNewCategory(cat)}
                  >
                    <Text style={styles.catOptionEmoji}>{categoryEmojis[cat]}</Text>
                    <Text style={[
                      styles.catOptionText,
                      newCategory === cat && styles.catOptionTextActive,
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '800', color: TEXT },
  addBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7 },
  addBtnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  filterRow: { paddingHorizontal: 20, gap: 8, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  filterChipActive: { backgroundColor: ACCENT, borderColor: ACCENT },
  filterChipText: { fontSize: 13, color: SUBTEXT, fontWeight: '500' },
  filterChipTextActive: { color: '#fff', fontWeight: '700' },
  scroll: { padding: 20, gap: 12, paddingBottom: 40 },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 60 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { fontSize: 15, color: SUBTEXT },
  productCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderColor: BORDER,
  },
  productAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BG_SECONDARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productEmoji: { fontSize: 24 },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 14, fontWeight: '700', color: TEXT },
  productBrand: { fontSize: 12, color: SUBTEXT },
  productCategory: { fontSize: 11, color: MUTED },
  efficacyBadge: { alignItems: 'center' },
  efficacyScore: { fontSize: 15, fontWeight: '800', color: ACCENT },
  efficacyCount: { fontSize: 10, color: MUTED },
  noRatingBadge: {
    backgroundColor: ACCENT_DIM,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  noRatingText: { fontSize: 10, color: ACCENT, fontWeight: '600' },
  modalSafe: { flex: 1, backgroundColor: BG },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalCancel: { fontSize: 15, color: SUBTEXT },
  modalTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  modalSave: { fontSize: 15, fontWeight: '700', color: ACCENT },
  btnDisabled: { opacity: 0.5 },
  modalScroll: { padding: 20, gap: 24 },
  formGroup: { gap: 10 },
  formLabel: { fontSize: 14, fontWeight: '600', color: TEXT },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: TEXT,
  },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
  },
  catOptionActive: { backgroundColor: ACCENT + '22', borderColor: ACCENT },
  catOptionEmoji: { fontSize: 16 },
  catOptionText: { fontSize: 13, color: SUBTEXT },
  catOptionTextActive: { color: ACCENT, fontWeight: '700' },
});
