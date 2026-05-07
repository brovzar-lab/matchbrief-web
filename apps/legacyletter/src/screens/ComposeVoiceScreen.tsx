import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, isDemoMode } from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_DURATION_SECONDS = 300;

export default function ComposeVoiceScreen() {
  const nav = useNavigation<Nav>();
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingDuration, setRecordingDuration] = React.useState(0);
  const [hasRecording, setHasRecording] = React.useState(false);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function handleStartRecording() {
    if (isDemoMode) {
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        setRecordingDuration((d) => {
          if (d >= MAX_DURATION_SECONDS - 1) {
            handleStopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
      return;
    }
    // TODO: expo-av Audio.Recording implementation
    Alert.alert('Coming soon', 'Real recording requires expo-av integration.');
  }

  function handleStopRecording() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setIsRecording(false);
    setHasRecording(true);
  }

  function handleDiscard() {
    Alert.alert('Discard Recording?', 'This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          setHasRecording(false);
          setRecordingDuration(0);
        },
      },
    ]);
  }

  function handleSave() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Voice memo would be uploaded to Firebase Storage in the real app.');
      nav.goBack();
      return;
    }
    // TODO: upload to Storage, create Firestore doc
  }

  React.useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <DemoBanner />
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => nav.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Voice Memo</Text>
        <View style={{ width: 50 }} />
      </View>

      <View style={styles.body}>
        <Text style={styles.caption}>
          {isRecording ? 'Recording...' : hasRecording ? 'Recording complete' : 'Tap to start recording'}
        </Text>
        <Text style={styles.limit}>Max 5 minutes</Text>

        <View style={styles.timerRing}>
          <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
          {isRecording && <View style={styles.recordingDot} />}
        </View>

        <View style={styles.controls}>
          {!hasRecording ? (
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
              <Text style={styles.recordBtnLabel}>{isRecording ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.postRecordControls}>
              <TouchableOpacity style={styles.discardBtn} onPress={handleDiscard}>
                <Text style={styles.discardBtnText}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save Legacy</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <Text style={styles.hint}>
          {isDemoMode
            ? 'Demo: recordings are simulated and not stored.'
            : 'Recording will be securely stored and delivered on your chosen date.'}
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
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  caption: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 4 },
  limit: { fontSize: 13, color: SUBTEXT, marginBottom: 40 },
  timerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  timer: { fontSize: 42, fontWeight: '700', color: TEXT },
  recordingDot: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DANGER,
  },
  controls: { width: '100%', alignItems: 'center' },
  recordBtn: {
    backgroundColor: CARD,
    borderWidth: 2,
    borderColor: ACCENT,
    borderRadius: 60,
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  recordBtnActive: { borderColor: DANGER, backgroundColor: '#F8514922' },
  recordBtnIcon: { fontSize: 36 },
  recordBtnLabel: { color: TEXT, fontWeight: '700', fontSize: 14 },
  postRecordControls: { flexDirection: 'row', gap: 16, width: '100%' },
  discardBtn: {
    flex: 1,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  discardBtnText: { color: SUBTEXT, fontWeight: '600', fontSize: 16 },
  saveBtn: {
    flex: 2,
    backgroundColor: ACCENT,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: SUBTEXT, fontSize: 13, textAlign: 'center', marginTop: 32, lineHeight: 20 },
});
