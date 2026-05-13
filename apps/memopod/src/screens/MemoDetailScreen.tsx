import React from 'react';
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
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import {
  BG, CARD, BORDER, TEXT, SUBTEXT, DANGER, isDemoMode,
  CATEGORIES, CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS,
} from '../lib/config';
import { useStore } from '../lib/store';
import CategoryChip from '../components/CategoryChip';
import type { RootStackParamList } from '../navigation/RootNavigator';
import type { MemoCategory } from '../lib/config';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'MemoDetail'>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function MemoDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { memoId } = route.params;

  const memos = useStore((s) => s.memos);
  const removeMemo = useStore((s) => s.removeMemo);
  const updateMemoCategory = useStore((s) => s.updateMemoCategory);

  const memo = memos.find((m) => m.id === memoId);

  if (!memo) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.notFound}>Memo not found.</Text>
      </SafeAreaView>
    );
  }

  function handleReclassify(cat: MemoCategory) {
    if (isDemoMode) {
      updateMemoCategory(memoId, cat);
      showToast('Category updated');
      return;
    }
    updateMemoCategory(memoId, cat);
    // Firestore update wired in Firebase integration phase
  }

  function handleDelete() {
    Alert.alert('Delete Memo', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (isDemoMode) {
            removeMemo(memoId);
            nav.goBack();
            return;
          }
          removeMemo(memoId);
          nav.goBack();
          // Firestore delete wired in Firebase integration phase
        },
      },
    ]);
  }

  const createdDate = new Date(memo.createdAt);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Category + timestamp */}
        <View style={styles.metaRow}>
          <CategoryChip category={memo.category} size="md" />
          <Text style={styles.timestamp}>
            {createdDate.toLocaleDateString('en-US', {
              weekday: 'short', month: 'short', day: 'numeric',
            })}{' '}
            {createdDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        {/* Transcript */}
        <View style={styles.transcriptCard}>
          <Text style={styles.transcript}>{memo.text}</Text>
        </View>

        {/* Duration */}
        <Text style={styles.meta}>{memo.durationSec}s voice memo</Text>

        {/* Extracted date (reminders) */}
        {memo.extractedDate && (
          <View style={styles.dueDateCard}>
            <Text style={styles.dueDateLabel}>Extracted date</Text>
            <Text style={styles.dueDate}>
              ⏰ {new Date(memo.extractedDate).toLocaleDateString('en-US', {
                weekday: 'long', month: 'long', day: 'numeric',
              })}
            </Text>
          </View>
        )}

        {/* Reclassify */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reclassify</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => {
              const isActive = memo.category === cat;
              const color = CATEGORY_COLORS[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryBtn,
                    { borderColor: isActive ? color : BORDER, backgroundColor: isActive ? color + '18' : CARD },
                  ]}
                  onPress={() => handleReclassify(cat)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryBtnIcon}>{CATEGORY_ICONS[cat]}</Text>
                  <Text style={[styles.categoryBtnLabel, { color: isActive ? color : SUBTEXT }]}>
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Delete */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Text style={styles.deleteBtnText}>Delete Memo</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40 },
  notFound: { padding: 24, color: SUBTEXT, textAlign: 'center', marginTop: 40 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timestamp: { fontSize: 12, color: SUBTEXT },
  transcriptCard: {
    backgroundColor: CARD,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 18,
    marginBottom: 8,
  },
  transcript: { fontSize: 16, color: TEXT, lineHeight: 26 },
  meta: { fontSize: 12, color: SUBTEXT, marginBottom: 16 },
  dueDateCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 4,
  },
  dueDateLabel: { fontSize: 11, fontWeight: '600', color: '#92400E', textTransform: 'uppercase', letterSpacing: 0.5 },
  dueDate: { fontSize: 15, fontWeight: '600', color: '#78350F' },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: '45%',
  },
  categoryBtnIcon: { fontSize: 18 },
  categoryBtnLabel: { fontSize: 14, fontWeight: '600' },
  deleteBtn: {
    borderWidth: 1,
    borderColor: DANGER + '66',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    backgroundColor: DANGER + '0A',
  },
  deleteBtnText: { color: DANGER, fontWeight: '700', fontSize: 15 },
});
