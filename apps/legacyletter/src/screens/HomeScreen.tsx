import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, SUCCESS, WARNING, DANGER, isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { DemoBanner } from '../components/DemoBanner';
import type { Legacy } from '../lib/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const STATUS_CONFIG = {
  draft: { label: 'Draft', color: SUBTEXT },
  scheduled: { label: 'Scheduled', color: WARNING },
  delivered: { label: 'Delivered', color: SUCCESS },
} as const;

const TYPE_ICON: Record<Legacy['type'], string> = {
  text: '📝',
  voice: '🎙️',
  video: '🎥',
};

function LegacyCard({ legacy }: { legacy: Legacy }) {
  const nav = useNavigation<Nav>();
  const status = STATUS_CONFIG[legacy.status];

  function handlePress() {
    if (legacy.type === 'text') nav.navigate('ComposeText', { legacyId: legacy.id });
    else if (legacy.type === 'voice') nav.navigate('ComposeVoice', { legacyId: legacy.id });
    else nav.navigate('ComposeVideo', { legacyId: legacy.id });
  }

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress}>
      <View style={styles.cardLeft}>
        <Text style={styles.typeIcon}>{TYPE_ICON[legacy.type]}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle} numberOfLines={1}>{legacy.title}</Text>
        <Text style={styles.cardMeta}>
          {legacy.recipients.length > 0
            ? `${legacy.recipients.length} recipient${legacy.recipients.length !== 1 ? 's' : ''}`
            : 'No recipients yet'}
          {legacy.deliveryDate
            ? ` · ${legacy.deliveryDate.toLocaleDateString()}`
            : ' · No date set'}
        </Text>
      </View>
      <View style={[styles.statusBadge, { borderColor: status.color }]}>
        <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const legacies = useStore((s) => s.legacies);
  const user = useStore((s) => s.user);

  function showComposeOptions() {
    Alert.alert('New Legacy', 'Choose a format', [
      { text: 'Text', onPress: () => nav.navigate('ComposeText', undefined) },
      { text: 'Voice Memo', onPress: () => nav.navigate('ComposeVoice', undefined) },
      { text: 'Video', onPress: () => nav.navigate('ComposeVideo', undefined) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.displayName ? `Hi, ${user.displayName.split(' ')[0]}` : 'Your Legacies'}
          </Text>
          <Text style={styles.subGreeting}>
            {legacies.length} {legacies.length === 1 ? 'message' : 'messages'} saved
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={showComposeOptions}>
          <Text style={styles.addBtnText}>+ New</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={legacies}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LegacyCard legacy={item} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>📜</Text>
            <Text style={styles.emptyTitle}>No legacies yet</Text>
            <Text style={styles.emptySubtitle}>
              Start by creating a text, voice, or video message for your loved ones.
            </Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={showComposeOptions}>
              <Text style={styles.emptyBtnText}>Create your first legacy</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: '700', color: TEXT },
  subGreeting: { fontSize: 13, color: SUBTEXT, marginTop: 2 },
  addBtn: { backgroundColor: ACCENT, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  list: { padding: 16, gap: 12 },
  card: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardLeft: {
    width: 44,
    height: 44,
    backgroundColor: BG,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeIcon: { fontSize: 22 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: TEXT },
  cardMeta: { fontSize: 12, color: SUBTEXT, marginTop: 4 },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 22 },
  emptyBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 24,
  },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
