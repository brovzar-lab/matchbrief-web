import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import { isDemoMode, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, DANGER, WARNING } from '../lib/config';
import { addExpense, settleExpense } from '../lib/firestoreService';
import type { Expense, SplitType } from '../lib/types';
import { DEMO_CO_PARENT_NAME } from '../lib/mockData';

const SPLIT_OPTIONS: { value: SplitType; label: string }[] = [
  { value: 'equal', label: '50/50 Split' },
  { value: 'parent1', label: 'You pay all' },
  { value: 'parent2', label: 'Co-parent pays all' },
];

export default function ExpensesScreen() {
  const user = useStore((s) => s.user);
  const household = useStore((s) => s.household);
  const expenses = useStore((s) => s.expenses);
  const addExpenseLocal = useStore((s) => s.addExpense);
  const updateExpense = useStore((s) => s.updateExpense);

  const [showModal, setShowModal] = React.useState(false);
  const [title, setTitle] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [splitType, setSplitType] = React.useState<SplitType>('equal');
  const [isSaving, setIsSaving] = React.useState(false);

  const unsettled = expenses.filter((e) => e.status === 'unsettled');
  const settled = expenses.filter((e) => e.status === 'settled');

  const totalOwed = unsettled.reduce((sum, e) => {
    if (e.splitType !== 'equal') return sum;
    const half = e.amount / 2;
    if (e.paidBy === user?.uid) return sum + half;
    return sum - half;
  }, 0);

  function payerLabel(uid: string): string {
    return uid === user?.uid ? 'You' : DEMO_CO_PARENT_NAME.split(' ')[0];
  }

  async function handleSettle(expense: Expense) {
    if (isDemoMode) {
      updateExpense(expense.id, { status: 'settled', settledAt: new Date() });
      return;
    }
    if (!household) return;
    try {
      await settleExpense(household.id, expense.id);
      updateExpense(expense.id, { status: 'settled', settledAt: new Date() });
    } catch {
      Alert.alert('Error', 'Could not settle expense.');
    }
  }

  async function handleAdd() {
    const parsedAmount = parseFloat(amount);
    if (!title.trim() || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid input', 'Add a title and a valid amount.');
      return;
    }

    const newExpense: Expense = {
      id: `x-${Date.now()}`,
      title: title.trim(),
      amount: parsedAmount,
      paidBy: user?.uid ?? 'demo-parent1-uid',
      splitType,
      status: 'unsettled',
      settledAt: null,
      createdAt: new Date(),
    };

    if (isDemoMode) {
      addExpenseLocal(newExpense);
      resetForm();
      return;
    }

    if (!household || !user) return;
    setIsSaving(true);
    try {
      await addExpense(household.id, {
        title: newExpense.title,
        amount: newExpense.amount,
        paidBy: user.uid,
        splitType,
      });
      addExpenseLocal(newExpense);
      resetForm();
    } catch {
      Alert.alert('Error', 'Could not save expense.');
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setTitle('');
    setAmount('');
    setSplitType('equal');
    setShowModal(false);
  }

  function renderExpense({ item }: { item: Expense }) {
    const isSettled = item.status === 'settled';
    return (
      <View style={[styles.expenseCard, isSettled && styles.expenseCardSettled]}>
        <View style={styles.expenseMain}>
          <Text style={styles.expenseTitle}>{item.title}</Text>
          <Text style={styles.expenseMeta}>
            Paid by {payerLabel(item.paidBy)} ·{' '}
            {item.splitType === 'equal' ? '50/50' : item.splitType === 'parent1' ? 'Parent 1 covers' : 'Co-parent covers'}
          </Text>
          {isSettled && item.settledAt && (
            <Text style={styles.settledLabel}>Settled {item.settledAt.toLocaleDateString()}</Text>
          )}
        </View>
        <View style={styles.expenseRight}>
          <Text style={[styles.expenseAmount, isSettled && styles.expenseAmountSettled]}>
            ${item.amount.toFixed(2)}
          </Text>
          {!isSettled && (
            <TouchableOpacity style={styles.settleBtn} onPress={() => handleSettle(item)}>
              <Text style={styles.settleBtnText}>Settle</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.header}>
        <Text style={styles.heading}>Expenses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          {totalOwed >= 0 ? 'Co-parent owes you' : 'You owe co-parent'}
        </Text>
        <Text style={[styles.summaryAmount, totalOwed < 0 && styles.summaryAmountNeg]}>
          ${Math.abs(totalOwed).toFixed(2)}
        </Text>
      </View>

      <FlatList
        data={[...unsettled, ...settled]}
        keyExtractor={(item) => item.id}
        renderItem={renderExpense}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.empty}>No expenses yet.</Text>
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Add Expense</Text>
            <TextInput
              style={styles.input}
              placeholder="Description (e.g. Soccer registration)"
              placeholderTextColor={SUBTEXT}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount (e.g. 45.00)"
              placeholderTextColor={SUBTEXT}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
            />
            <View style={styles.splitOptions}>
              {SPLIT_OPTIONS.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.splitOption, splitType === opt.value && styles.splitOptionActive]}
                  onPress={() => setSplitType(opt.value)}
                >
                  <Text style={[styles.splitOptionText, splitType === opt.value && styles.splitOptionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sheetActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isSaving && styles.btnDisabled]}
                onPress={handleAdd}
                disabled={isSaving}
              >
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingBottom: 8,
  },
  heading: { fontSize: 28, fontWeight: '800', color: TEXT },
  addBtn: { backgroundColor: ACCENT, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  summaryCard: {
    margin: 16,
    marginTop: 8,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  summaryLabel: { fontSize: 13, color: SUBTEXT, fontWeight: '600', marginBottom: 4 },
  summaryAmount: { fontSize: 36, fontWeight: '800', color: SUCCESS },
  summaryAmountNeg: { color: DANGER },
  list: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  expenseCard: {
    flexDirection: 'row',
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 14,
    gap: 12,
    alignItems: 'center',
  },
  expenseCardSettled: { opacity: 0.55 },
  expenseMain: { flex: 1, gap: 3 },
  expenseTitle: { fontSize: 16, fontWeight: '700', color: TEXT },
  expenseMeta: { fontSize: 12, color: SUBTEXT },
  settledLabel: { fontSize: 11, color: SUCCESS, fontWeight: '600' },
  expenseRight: { alignItems: 'flex-end', gap: 8 },
  expenseAmount: { fontSize: 18, fontWeight: '800', color: TEXT },
  expenseAmountSettled: { color: SUBTEXT },
  settleBtn: {
    backgroundColor: `${ACCENT}20`,
    borderWidth: 1,
    borderColor: ACCENT,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  settleBtnText: { color: ACCENT, fontWeight: '700', fontSize: 12 },
  empty: { color: SUBTEXT, textAlign: 'center', marginTop: 60, fontSize: 15 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, gap: 14 },
  sheetTitle: { fontSize: 20, fontWeight: '800', color: TEXT },
  input: {
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    color: TEXT,
    fontSize: 16,
  },
  splitOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  splitOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    minWidth: 90,
  },
  splitOptionActive: { borderColor: ACCENT, backgroundColor: `${ACCENT}15` },
  splitOptionText: { color: SUBTEXT, fontSize: 12, fontWeight: '600', textAlign: 'center' },
  splitOptionTextActive: { color: ACCENT },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: BORDER, alignItems: 'center' },
  cancelBtnText: { color: SUBTEXT, fontWeight: '600' },
  saveBtn: { flex: 2, backgroundColor: ACCENT, padding: 16, borderRadius: 12, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  btnDisabled: { opacity: 0.5 },
});
