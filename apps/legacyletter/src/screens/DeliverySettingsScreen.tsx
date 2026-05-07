import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'DeliverySettings'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function DeliverySettingsScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const { legacy } = route.params;
  const updateLegacy = useStore((s) => s.updateLegacy);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [deliveryDate, setDeliveryDate] = React.useState<Date>(
    legacy.deliveryDate ?? tomorrow
  );
  const [showPicker, setShowPicker] = React.useState(false);

  function handleSave() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', `Delivery would be scheduled for ${deliveryDate.toLocaleDateString()}.`);
      nav.goBack();
      return;
    }
    updateLegacy(legacy.id, { deliveryDate, status: 'scheduled' });
    Alert.alert('Scheduled!', `This legacy will be delivered on ${deliveryDate.toLocaleDateString()}.`, [
      { text: 'OK', onPress: () => nav.goBack() },
    ]);
  }

  function handleClearDate() {
    Alert.alert('Remove delivery date?', 'This legacy will return to draft status.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => {
          if (!isDemoMode) updateLegacy(legacy.id, { deliveryDate: null, status: 'draft' });
          nav.goBack();
        },
      },
    ]);
  }

  const formattedDate = deliveryDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Delivery Settings</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        <View style={styles.infoCard}>
          <Text style={styles.infoIcon}>📅</Text>
          <Text style={styles.infoTitle}>Date-Based Delivery</Text>
          <Text style={styles.infoText}>
            Your legacy will be sent to recipients via email on the exact date you choose.
            You can change or cancel this at any time before the delivery date.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Delivery Date</Text>
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.dateBtnText}>{formattedDate}</Text>
            <Text style={styles.dateBtnEdit}>Change ›</Text>
          </TouchableOpacity>
        </View>

        {/* TODO: integrate @react-native-community/datetimepicker */}
        {showPicker && (
          <View style={styles.pickerPlaceholder}>
            <Text style={styles.pickerPlaceholderText}>
              DateTimePicker will render here{'\n'}
              (@react-native-community/datetimepicker)
            </Text>
            <TouchableOpacity
              style={styles.pickerDoneBtn}
              onPress={() => {
                setDeliveryDate(new Date(deliveryDate.getTime() + 30 * 24 * 60 * 60 * 1000));
                setShowPicker(false);
              }}
            >
              <Text style={styles.pickerDoneBtnText}>Set +30 days (demo)</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Legacy</Text>
          <View style={styles.legacyCard}>
            <Text style={styles.legacyTitle}>{legacy.title}</Text>
            <Text style={styles.legacyMeta}>{legacy.type} · {legacy.recipients.length} recipients</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>✓ Confirm Delivery Date</Text>
        </TouchableOpacity>

        {legacy.deliveryDate && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearDate}>
            <Text style={styles.clearBtnText}>Remove Delivery Date</Text>
          </TouchableOpacity>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  backText: { color: SUBTEXT, fontSize: 16 },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: TEXT },
  body: { flex: 1, padding: 20, gap: 20 },
  infoCard: {
    backgroundColor: `${ACCENT}18`,
    borderWidth: 1,
    borderColor: `${ACCENT}44`,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  infoIcon: { fontSize: 32 },
  infoTitle: { fontSize: 17, fontWeight: '700', color: TEXT },
  infoText: { fontSize: 14, color: SUBTEXT, textAlign: 'center', lineHeight: 20 },
  section: { gap: 8 },
  sectionLabel: { fontSize: 13, color: SUBTEXT, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },
  dateBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBtnText: { fontSize: 16, color: TEXT, fontWeight: '500' },
  dateBtnEdit: { fontSize: 15, color: ACCENT },
  pickerPlaceholder: {
    backgroundColor: CARD,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  pickerPlaceholderText: { color: SUBTEXT, textAlign: 'center', fontSize: 14 },
  pickerDoneBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8 },
  pickerDoneBtnText: { color: '#fff', fontWeight: '600' },
  legacyCard: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  legacyTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  legacyMeta: { fontSize: 13, color: SUBTEXT },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  clearBtn: { alignItems: 'center', padding: 12 },
  clearBtnText: { color: '#F85149', fontSize: 15 },
});
