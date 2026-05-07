import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, isDemoMode } from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const DEMO_THUMBNAIL = 'https://picsum.photos/seed/legacyvideo/400/225';

export default function ComposeVideoScreen() {
  const nav = useNavigation<Nav>();
  const [videoUri, setVideoUri] = React.useState<string | null>(null);
  const [title, setTitle] = React.useState('');

  function handleRecord() {
    if (isDemoMode) {
      setVideoUri(DEMO_THUMBNAIL);
      Alert.alert('Demo Mode', 'In the real app, this opens the camera for video recording (max 2 min).');
      return;
    }
    // TODO: expo-camera or expo-image-picker video capture
  }

  function handlePick() {
    if (isDemoMode) {
      setVideoUri(DEMO_THUMBNAIL);
      Alert.alert('Demo Mode', 'In the real app, this opens the photo library to pick an existing video.');
      return;
    }
    // TODO: expo-image-picker video picker
  }

  function handleSave() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'In the real app, video is compressed and uploaded to Firebase Storage.');
      nav.goBack();
      return;
    }
    // TODO: upload to Storage, create Firestore doc
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Video Legacy</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        {videoUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: videoUri }} style={styles.preview} />
            <Text style={styles.previewLabel}>Max 2 minutes · compressed before upload</Text>
            <TouchableOpacity style={styles.removeBtn} onPress={() => setVideoUri(null)}>
              <Text style={styles.removeBtnText}>Remove video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyVideo}>
            <Text style={styles.emptyIcon}>🎥</Text>
            <Text style={styles.emptyTitle}>No video selected</Text>
            <Text style={styles.emptySubtitle}>Record a new video or pick one from your library.</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionBtn} onPress={handleRecord}>
            <Text style={styles.actionBtnText}>📹  Record Video</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.secondaryActionBtn]} onPress={handlePick}>
            <Text style={styles.secondaryActionBtnText}>🖼️  Choose from Library</Text>
          </TouchableOpacity>
        </View>

        {videoUri && (
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Save Legacy</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>
          {isDemoMode
            ? 'Demo: video uploads are simulated.'
            : 'Video is compressed automatically before upload. Max 2 minutes.'}
        </Text>
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
  body: { flex: 1, padding: 24, gap: 20 },
  previewContainer: { alignItems: 'center', gap: 8 },
  preview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12 },
  previewLabel: { color: SUBTEXT, fontSize: 13 },
  removeBtn: { padding: 8 },
  removeBtnText: { color: '#F85149', fontSize: 14 },
  emptyVideo: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: TEXT },
  emptySubtitle: { fontSize: 14, color: SUBTEXT, textAlign: 'center' },
  actions: { gap: 12 },
  actionBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  secondaryActionBtn: { backgroundColor: CARD, borderWidth: 1, borderColor: BORDER },
  secondaryActionBtnText: { color: TEXT, fontWeight: '600', fontSize: 16 },
  saveBtn: {
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: SUBTEXT, fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
