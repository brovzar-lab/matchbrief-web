import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, isDemoMode, FREE_LEGACY_LIMIT } from '../lib/config';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';

type Props = NativeStackScreenProps<RootStackParamList, 'ComposeText'>;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function ComposeTextScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Props['route']>();
  const legacyId = route.params?.legacyId;

  const legacies = useStore((s) => s.legacies);
  const addLegacy = useStore((s) => s.addLegacy);
  const updateLegacy = useStore((s) => s.updateLegacy);
  const user = useStore((s) => s.user);

  const existing = legacyId ? legacies.find((l) => l.id === legacyId) : undefined;

  const [title, setTitle] = React.useState(existing?.title ?? '');
  const [content, setContent] = React.useState(existing?.content ?? '');
  const [isSaving, setIsSaving] = React.useState(false);

  const textLegacyCount = legacies.filter((l) => l.type === 'text').length;
  const isFreeTierBlocked =
    !existing &&
    user?.subscription.tier === 'free' &&
    textLegacyCount >= FREE_LEGACY_LIMIT;

  React.useEffect(() => {
    if (isFreeTierBlocked) {
      nav.replace('Paywall');
    }
  }, [isFreeTierBlocked]);

  async function handleSave(asDraft = true) {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a title for this legacy.');
      return;
    }

    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Changes are not saved in demo mode.');
      return;
    }

    setIsSaving(true);
    try {
      if (existing) {
        updateLegacy(existing.id, { title: title.trim(), content, status: asDraft ? 'draft' : existing.status });
      } else {
        addLegacy({
          id: Date.now().toString(),
          type: 'text',
          title: title.trim(),
          content,
          deliveryDate: null,
          recipients: [],
          status: 'draft',
          createdAt: new Date(),
        });
      }
      nav.goBack();
    } catch {
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleSchedule() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'In the real app, this opens delivery settings.');
      return;
    }
    // TODO: navigate to DeliverySettings with current legacy
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => nav.goBack()}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>{existing ? 'Edit Legacy' : 'New Text Legacy'}</Text>
          <TouchableOpacity onPress={() => handleSave(true)} disabled={isSaving}>
            <Text style={[styles.saveText, isSaving && { opacity: 0.5 }]}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <TextInput
            style={styles.titleInput}
            placeholder="Give this legacy a title..."
            placeholderTextColor={SUBTEXT}
            value={title}
            onChangeText={setTitle}
            maxLength={120}
          />

          <TextInput
            style={styles.contentInput}
            placeholder="Write your message here. Speak from the heart — this may be the most important thing you ever write."
            placeholderTextColor={SUBTEXT}
            value={content}
            onChangeText={setContent}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.scheduleBtn} onPress={handleSchedule}>
              <Text style={styles.scheduleBtnText}>📅 Set Delivery Date</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  saveText: { color: ACCENT, fontSize: 16, fontWeight: '600' },
  body: { padding: 20, flexGrow: 1 },
  titleInput: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 12,
    marginBottom: 20,
  },
  contentInput: {
    fontSize: 16,
    color: TEXT,
    lineHeight: 26,
    minHeight: 300,
    flex: 1,
  },
  actions: { marginTop: 24 },
  scheduleBtn: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  scheduleBtnText: { color: TEXT, fontWeight: '600', fontSize: 15 },
});
