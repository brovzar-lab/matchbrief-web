import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { isDemoMode, PRESET_CATEGORIES } from '../lib/demo';
import { colors } from '../lib/colors';

type ModalMode = 'add' | 'rename';

interface EditModal {
  mode: ModalMode;
  categoryId?: string;
  currentName?: string;
}

function EmojiPicker({ selected, onSelect }: { selected: string; onSelect: (e: string) => void }) {
  const emojis = PRESET_CATEGORIES.map((p) => p.emoji).concat(['🎯', '🏋️', '💊', '🎸', '🌿', '🐾', '🧴', '🔧']);
  return (
    <View style={emojiStyles.grid}>
      {emojis.map((e) => (
        <TouchableOpacity
          key={e}
          style={[emojiStyles.cell, e === selected && emojiStyles.cellSelected]}
          onPress={() => onSelect(e)}
        >
          <Text style={emojiStyles.emoji}>{e}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const emojiStyles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  cell: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellSelected: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
  emoji: { fontSize: 22 },
});

export default function CategoryScreen() {
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const removeCategory = useStore((s) => s.removeCategory);
  const renameCategory = useStore((s) => s.renameCategory);
  const showToast = useStore((s) => s.showToast);

  const [modal, setModal] = useState<EditModal | null>(null);
  const [inputName, setInputName] = useState('');
  const [inputEmoji, setInputEmoji] = useState('📦');

  function openAdd() {
    setInputName('');
    setInputEmoji('📦');
    setModal({ mode: 'add' });
  }

  function openRename(id: string, currentName: string) {
    setInputName(currentName);
    setModal({ mode: 'rename', categoryId: id, currentName });
  }

  function confirmModal() {
    if (!inputName.trim()) return;
    if (modal?.mode === 'add') {
      if (isDemoMode) {
        showToast('Demo mode — changes not saved');
      }
      addCategory(inputName.trim(), inputEmoji);
    } else if (modal?.mode === 'rename' && modal.categoryId) {
      if (isDemoMode) {
        showToast('Demo mode — changes not saved');
      }
      renameCategory(modal.categoryId, inputName.trim());
    }
    setModal(null);
  }

  function handleDelete(id: string, name: string) {
    Alert.alert(
      'Remove category?',
      `"${name}" and its transactions will be removed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            if (isDemoMode) {
              showToast('Demo mode — changes not saved');
            }
            removeCategory(id);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {isDemoMode && (
        <View style={styles.demoBadge}>
          <Text style={styles.demoBadgeText}>DEMO MODE</Text>
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd} activeOpacity={0.85}>
          <Text style={styles.addBtnText}>+ Add Category</Text>
        </TouchableOpacity>

        {categories.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🗂️</Text>
            <Text style={styles.emptyText}>No categories yet. Tap above to add one.</Text>
          </View>
        )}

        {categories.map((cat) => (
          <View key={cat.id} style={styles.categoryRow}>
            <View style={[styles.colorDot, { backgroundColor: cat.color }]} />
            <Text style={styles.catEmoji}>{cat.emoji}</Text>
            <View style={styles.catInfo}>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catAlloc}>${cat.allocated.toLocaleString()} allocated</Text>
            </View>
            <View style={styles.rowActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openRename(cat.id, cat.name)}
              >
                <Text style={styles.actionBtnText}>Rename</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.deleteBtn]}
                onPress={() => handleDelete(cat.id, cat.name)}
              >
                <Text style={styles.deleteBtnText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={styles.presetsSection}>
          <Text style={styles.presetsLabel}>PRESET CATEGORIES</Text>
          <View style={styles.presetList}>
            {PRESET_CATEGORIES.map((p) => {
              const exists = categories.some((c) => c.name === p.name);
              return (
                <TouchableOpacity
                  key={p.name}
                  style={[styles.presetRow, exists && styles.presetRowExists]}
                  onPress={() => {
                    if (!exists) {
                      if (isDemoMode) showToast('Demo mode — changes not saved');
                      addCategory(p.name, p.emoji);
                    }
                  }}
                  disabled={exists}
                  activeOpacity={0.8}
                >
                  <Text style={styles.presetEmoji}>{p.emoji}</Text>
                  <Text style={[styles.presetName, exists && styles.presetNameExists]}>{p.name}</Text>
                  {exists ? (
                    <Text style={styles.checkmark}>✓</Text>
                  ) : (
                    <Text style={styles.plusSign}>+</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Add / Rename Modal */}
      <Modal visible={modal !== null} transparent animationType="slide" onRequestClose={() => setModal(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {modal?.mode === 'add' ? 'New Category' : 'Rename Category'}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={inputName}
              onChangeText={setInputName}
              placeholder="Category name"
              placeholderTextColor={colors.textLight}
              autoFocus
              returnKeyType="done"
              onSubmitEditing={confirmModal}
            />

            {modal?.mode === 'add' && (
              <>
                <Text style={styles.emojiLabel}>Pick an emoji</Text>
                <EmojiPicker selected={inputEmoji} onSelect={setInputEmoji} />
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModal(null)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, !inputName.trim() && styles.confirmBtnDisabled]}
                onPress={confirmModal}
              >
                <Text style={styles.confirmBtnText}>
                  {modal?.mode === 'add' ? 'Add' : 'Save'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  demoBadgeText: { color: colors.white, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtnText: { color: colors.white, fontSize: 15, fontWeight: '700' },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  catEmoji: { fontSize: 22 },
  catInfo: { flex: 1 },
  catName: { fontSize: 15, fontWeight: '700', color: colors.text },
  catAlloc: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  rowActions: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  actionBtn: {
    backgroundColor: colors.primaryLight,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: colors.primary },
  deleteBtn: { backgroundColor: colors.dangerLight },
  deleteBtnText: { fontSize: 13, fontWeight: '700', color: colors.danger },
  presetsSection: { marginTop: 24 },
  presetsLabel: { fontSize: 11, fontWeight: '700', color: colors.textLight, letterSpacing: 0.8, marginBottom: 10 },
  presetList: { gap: 6 },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 10,
  },
  presetRowExists: { opacity: 0.5 },
  presetEmoji: { fontSize: 20 },
  presetName: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.text },
  presetNameExists: { color: colors.textMuted },
  checkmark: { fontSize: 14, color: colors.primary, fontWeight: '700' },
  plusSign: { fontSize: 18, color: colors.primary, fontWeight: '700' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
  },
  modalTitle: { fontSize: 20, fontWeight: '800', color: colors.text, marginBottom: 16 },
  modalInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emojiLabel: { fontSize: 13, fontWeight: '600', color: colors.textMuted, marginBottom: 4 },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  confirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: colors.white },
});
