import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Audio, type AVPlaybackStatus } from 'expo-av';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, SUCCESS, isDemoMode } from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';
import { useStore } from '../lib/store';
import { uploadVoiceMemo } from '../lib/storageService';
import { createVoiceLegacy } from '../lib/firestoreService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_DURATION_SECONDS = 300;

export default function ComposeVoiceScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const addLegacy = useStore((s) => s.addLegacy);

  const [title, setTitle] = React.useState('');
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordingDuration, setRecordingDuration] = React.useState(0);
  const [hasRecording, setHasRecording] = React.useState(false);
  const [localUri, setLocalUri] = React.useState<string | null>(null);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [playbackPosition, setPlaybackPosition] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const soundRef = React.useRef<Audio.Sound | null>(null);

  function formatDuration(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  async function handleStartRecording() {
    if (isDemoMode) {
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        setRecordingDuration((d) => {
          if (d >= MAX_DURATION_SECONDS - 1) {
            void handleStopRecording();
            return d;
          }
          return d + 1;
        });
      }, 1000);
      return;
    }

    const { status } = await Audio.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Microphone access is required to record voice memos.');
      return;
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );
    recordingRef.current = recording;
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      setRecordingDuration((d) => d + 1);
    }, 1000);

    autoStopRef.current = setTimeout(() => {
      void handleStopRecording();
    }, MAX_DURATION_SECONDS * 1000);
  }

  async function handleStopRecording() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    setIsRecording(false);

    if (!isDemoMode && recordingRef.current) {
      await recordingRef.current.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      const uri = recordingRef.current.getURI();
      setLocalUri(uri ?? null);
      recordingRef.current = null;
    }

    setHasRecording(true);
  }

  async function handleTogglePlayback() {
    if (!localUri) return;

    if (soundRef.current) {
      if (isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
      return;
    }

    const onStatus = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      setPlaybackPosition(Math.floor(status.positionMillis / 1000));
      if (status.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    };

    const { sound } = await Audio.Sound.createAsync(
      { uri: localUri },
      { shouldPlay: true },
      onStatus
    );
    soundRef.current = sound;
    setIsPlaying(true);
  }

  async function handleDiscard() {
    Alert.alert('Discard Recording?', 'This cannot be undone.', [
      { text: 'Keep', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: async () => {
          if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
          }
          setHasRecording(false);
          setRecordingDuration(0);
          setLocalUri(null);
          setIsPlaying(false);
          setPlaybackPosition(0);
        },
      },
    ]);
  }

  async function handleSave() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'Voice memo would be uploaded to Firebase Storage in the real app.');
      nav.goBack();
      return;
    }

    if (!user || !localUri) return;

    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a title for this legacy.');
      return;
    }

    if (soundRef.current && isPlaying) {
      await soundRef.current.pauseAsync();
      setIsPlaying(false);
    }

    setIsUploading(true);
    try {
      const legacyId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      const storagePath = await uploadVoiceMemo(user.uid, legacyId, localUri, setUploadProgress);
      const newLegacy = await createVoiceLegacy(user.uid, {
        title: title.trim(),
        storageRef: storagePath,
        durationSeconds: recordingDuration,
      });
      addLegacy(newLegacy);
      nav.goBack();
    } catch {
      Alert.alert('Upload failed', 'Failed to save voice memo. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  React.useEffect(() => () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoStopRef.current) clearTimeout(autoStopRef.current);
    void soundRef.current?.unloadAsync();
    void recordingRef.current?.stopAndUnloadAsync();
  }, []);

  const playbackPct =
    recordingDuration > 0 ? (playbackPosition / recordingDuration) * 100 : 0;

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
        <TextInput
          style={styles.titleInput}
          placeholder="Give this legacy a title..."
          placeholderTextColor={SUBTEXT}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          editable={!isRecording && !isUploading}
        />

        <Text style={styles.caption}>
          {isRecording ? 'Recording...' : hasRecording ? 'Recording complete' : 'Tap to start recording'}
        </Text>
        <Text style={styles.limit}>Max 5 minutes</Text>

        <View style={styles.timerRing}>
          <Text style={styles.timer}>{formatDuration(recordingDuration)}</Text>
          {isRecording && <View style={styles.recordingDot} />}
        </View>

        {hasRecording && !isDemoMode && localUri && (
          <View style={styles.playbackBar}>
            <TouchableOpacity
              onPress={() => { void handleTogglePlayback(); }}
              style={styles.playbackBtn}
              accessibilityLabel={isPlaying ? 'Pause playback' : 'Play recording'}
            >
              <Text style={styles.playbackIcon}>{isPlaying ? '⏸' : '▶️'}</Text>
            </TouchableOpacity>
            <View style={styles.playbackTrack}>
              <View style={[styles.playbackFill, { width: `${playbackPct}%` as `${number}%` }]} />
            </View>
            <Text style={styles.playbackTime}>{formatDuration(playbackPosition)}</Text>
          </View>
        )}

        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Uploading… {uploadProgress}%</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` as `${number}%` }]} />
            </View>
          </View>
        )}

        <View style={styles.controls}>
          {!hasRecording ? (
            <TouchableOpacity
              style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
              onPress={isRecording ? () => { void handleStopRecording(); } : () => { void handleStartRecording(); }}
            >
              <Text style={styles.recordBtnIcon}>{isRecording ? '⏹' : '🎙️'}</Text>
              <Text style={styles.recordBtnLabel}>{isRecording ? 'Stop' : 'Record'}</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.postRecordControls}>
              <TouchableOpacity
                style={styles.discardBtn}
                onPress={() => { void handleDiscard(); }}
                disabled={isUploading}
              >
                <Text style={[styles.discardBtnText, isUploading && { opacity: 0.4 }]}>Discard</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isUploading && styles.saveBtnDisabled]}
                onPress={() => { void handleSave(); }}
                disabled={isUploading}
              >
                <Text style={styles.saveBtnText}>
                  {isUploading ? 'Saving…' : 'Save Legacy'}
                </Text>
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
  titleInput: {
    width: '100%',
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 10,
    marginBottom: 24,
    textAlign: 'center',
  },
  caption: { fontSize: 18, fontWeight: '600', color: TEXT, marginBottom: 4 },
  limit: { fontSize: 13, color: SUBTEXT, marginBottom: 32 },
  timerRing: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
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
  playbackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    gap: 10,
    marginBottom: 16,
    backgroundColor: CARD,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  playbackBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  playbackIcon: { fontSize: 20 },
  playbackTrack: {
    flex: 1,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  playbackFill: { height: '100%', backgroundColor: ACCENT, borderRadius: 2 },
  playbackTime: { color: SUBTEXT, fontSize: 12, minWidth: 36, textAlign: 'right' },
  progressContainer: { width: '100%', marginBottom: 16 },
  progressLabel: { color: SUBTEXT, fontSize: 13, marginBottom: 6, textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: SUCCESS, borderRadius: 3 },
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
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: SUBTEXT, fontSize: 13, textAlign: 'center', marginTop: 32, lineHeight: 20 },
});
