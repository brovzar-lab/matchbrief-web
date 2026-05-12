import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, updateDoc } from 'firebase/firestore';
import Purchases from 'react-native-purchases';
import { db } from '../../lib/firebase';
import { useStore } from '../../lib/store';
import { isDemoMode, RC_PRODUCT_ID, BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, DANGER, WARNING } from '../../lib/config';
import type { Worker } from '../../lib/types';

const ROLES = ['Cashier', 'Shift Lead', 'Cook', 'Server'];

export default function LocationSettingsScreen() {
  const user = useStore((s) => s.user);
  const workers = useStore((s) => s.workers);
  const currentLocation = useStore((s) => s.currentLocation);
  const setCurrentLocation = useStore((s) => s.setCurrentLocation);

  const [otHours, setOtHours] = React.useState(
    String(currentLocation?.overtimeThresholdHours ?? 40)
  );
  const [savingOt, setSavingOt] = React.useState(false);
  const [showingPaywall, setShowingPaywall] = React.useState(false);

  async function handleSaveOtThreshold() {
    const parsed = parseInt(otHours, 10);
    if (isNaN(parsed) || parsed < 1 || parsed > 80) {
      Alert.alert('Invalid', 'Enter a number between 1 and 80.');
      return;
    }
    setSavingOt(true);
    if (isDemoMode) {
      setCurrentLocation(currentLocation ? { ...currentLocation, overtimeThresholdHours: parsed } : null);
      Alert.alert('Demo mode', 'Threshold updated (not saved).');
    } else {
      try {
        const companyId = user!.companyId;
        const locationId = user!.locationId;
        await updateDoc(
          doc(db!, `companies/${companyId}/locations/${locationId}`),
          { overtimeThresholdHours: parsed }
        );
        setCurrentLocation(currentLocation ? { ...currentLocation, overtimeThresholdHours: parsed } : null);
        Alert.alert('Saved', 'Overtime threshold updated.');
      } catch (e: unknown) {
        Alert.alert('Error', (e as Error).message);
      }
    }
    setSavingOt(false);
  }

  async function handleAddLocation() {
    if (isDemoMode) {
      Alert.alert('Demo mode', 'RevenueCat paywall would appear here for $49/mo per location.');
      return;
    }
    try {
      const offerings = await Purchases.getOfferings();
      const pkg = offerings.current?.availablePackages.find(
        (p) => p.product.identifier === RC_PRODUCT_ID
      );
      if (!pkg) {
        Alert.alert('Not available', 'No active subscription offering found.');
        return;
      }
      await Purchases.purchasePackage(pkg);
      Alert.alert('Subscribed', 'New location slot unlocked!');
    } catch (e: unknown) {
      // user cancelled
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {isDemoMode && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>Demo Mode</Text>
        </View>
      )}
      <Text style={styles.heading}>Location Settings</Text>
      {currentLocation && (
        <Text style={styles.locationName}>{currentLocation.name}</Text>
      )}

      {/* Overtime threshold */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overtime Threshold</Text>
        <Text style={styles.sectionDesc}>
          Swap requests will show an overtime warning if the claimant would exceed this weekly hour limit.
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={otHours}
            onChangeText={setOtHours}
            keyboardType="number-pad"
            maxLength={3}
            placeholderTextColor={SUBTEXT}
          />
          <Text style={styles.inputSuffix}>hours / week</Text>
          <TouchableOpacity
            style={[styles.saveBtn, savingOt && { opacity: 0.6 }]}
            onPress={handleSaveOtThreshold}
            disabled={savingOt}
          >
            <Text style={styles.saveBtnText}>{savingOt ? 'Saving…' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Workers list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Team ({workers.length})</Text>
        <FlatList
          data={workers}
          keyExtractor={(w) => w.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Text style={styles.empty}>No workers in this location.</Text>
          }
          renderItem={({ item }: { item: Worker }) => (
            <View style={styles.workerRow}>
              <View style={styles.workerInfo}>
                <Text style={styles.workerName}>{item.name}</Text>
                <Text style={styles.workerEmail}>{item.email}</Text>
              </View>
              <View style={[styles.roleBadge]}>
                <Text style={styles.roleBadgeText}>{item.role}</Text>
              </View>
            </View>
          )}
        />
      </View>

      {/* Add location paywall CTA */}
      <View style={styles.paywallCard}>
        <Text style={styles.paywallTitle}>Add Another Location</Text>
        <Text style={styles.paywallDesc}>$49 / month per location. Cancel anytime.</Text>
        <TouchableOpacity style={styles.paywallBtn} onPress={handleAddLocation}>
          <Text style={styles.paywallBtnText}>Unlock New Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  demoBanner: { backgroundColor: ACCENT, paddingVertical: 4, alignItems: 'center' },
  demoBannerText: { color: '#000', fontWeight: '700', fontSize: 12 },
  heading: { fontSize: 24, fontWeight: '700', color: TEXT, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 2 },
  locationName: { color: SUBTEXT, fontSize: 14, paddingHorizontal: 20, marginBottom: 16 },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  sectionTitle: { color: TEXT, fontWeight: '700', fontSize: 16, marginBottom: 6 },
  sectionDesc: { color: SUBTEXT, fontSize: 13, marginBottom: 14, lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  input: {
    width: 64,
    backgroundColor: BG,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 10,
    color: TEXT,
    fontSize: 16,
    textAlign: 'center',
  },
  inputSuffix: { color: SUBTEXT, fontSize: 14, flex: 1 },
  saveBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  saveBtnText: { color: '#000', fontWeight: '700' },
  empty: { color: SUBTEXT, textAlign: 'center', paddingVertical: 12 },
  workerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  workerInfo: { flex: 1 },
  workerName: { color: TEXT, fontWeight: '600', fontSize: 14 },
  workerEmail: { color: SUBTEXT, fontSize: 12 },
  roleBadge: {
    backgroundColor: `${ACCENT}22`,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  roleBadgeText: { color: ACCENT, fontSize: 12, fontWeight: '600' },
  paywallCard: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: `${ACCENT}11`,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${ACCENT}44`,
    padding: 20,
    alignItems: 'center',
  },
  paywallTitle: { color: TEXT, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  paywallDesc: { color: SUBTEXT, fontSize: 13, marginBottom: 16 },
  paywallBtn: { backgroundColor: ACCENT, borderRadius: 8, paddingHorizontal: 24, paddingVertical: 12 },
  paywallBtnText: { color: '#000', fontWeight: '700', fontSize: 15 },
});
