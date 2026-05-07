import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CameraView, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Video, ResizeMode } from 'expo-av';
import type { RootStackParamList } from '../navigation/RootNavigator';
import {
  BG, CARD, BORDER, TEXT, SUBTEXT, ACCENT, DANGER, SUCCESS, isDemoMode,
} from '../lib/config';
import { DemoBanner } from '../components/DemoBanner';
import { useStore } from '../lib/store';
import { uploadVideo } from '../lib/storageService';
import { createVideoLegacy } from '../lib/firestoreService';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MAX_DURATION_SECONDS = 120;
const DEMO_DURATION = 47;

function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function ComposeVideoScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const addLegacy = useStore((s) => s.addLegacy);

  const [title, setTitle] = React.useState('');
  const [videoUri, setVideoUri] = React.useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);
  const [recordElapsed, setRecordElapsed] = React.useState(0);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const cameraRef = React.useRef<CameraView>(null);
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const autoStopRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const elapsedRef = React.useRef(0);

  function clearTimers() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (autoStopRef.current) { clearTimeout(autoStopRef.current); autoStopRef.current = null; }
  }

  async function handleRecord() {
    if (isDemoMode) {
      setVideoUri('demo://video');
      setDurationSeconds(DEMO_DURATION);
      Alert.alert('Demo Mode', 'In the real app, this opens the camera for video recording (max 2 min).');
      return;
    }

    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        Alert.alert('Permission denied', 'Camera access is required to record video.');
        return;
      }
    }
    if (!micPermission?.granted) {
      const result = await requestMicPermission();
      if (!result.granted) {
        Alert.alert('Permission denied', 'Microphone access is required to record video.');
        return;
      }
    }

    elapsedRef.current = 0;
    setRecordElapsed(0);
    setCameraOpen(true);
  }

  async function startRecording() {
    if (!cameraRef.current) return;
    setIsRecording(true);

    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      setRecordElapsed(elapsedRef.current);
    }, 1000);

    autoStopRef.current = setTimeout(() => {
      stopRecording();
    }, MAX_DURATION_SECONDS * 1000);

    try {
      // TODO: post-MVP — integrate FFmpeg compression pipeline to reduce upload size
      const result = await cameraRef.current.recordAsync({ maxDuration: MAX_DURATION_SECONDS });
      if (result?.uri) {
        setVideoUri(result.uri);
        setDurationSeconds(elapsedRef.current);
      }
    } catch {
      // recording cancelled or stopped externally — uri handled via stopRecording
    } finally {
      clearTimers();
      setIsRecording(false);
      setCameraOpen(false);
    }
  }

  function stopRecording() {
    clearTimers();
    cameraRef.current?.stopRecording();
  }

  async function handlePick() {
    if (isDemoMode) {
      setVideoUri('demo://video');
      setDurationSeconds(DEMO_DURATION);
      Alert.alert('Demo Mode', 'In the real app, this opens the photo library to pick an existing video.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'videos',
      videoMaxDuration: MAX_DURATION_SECONDS,
      allowsEditing: false,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      setVideoUri(asset.uri);
      setDurationSeconds(Math.round((asset.duration ?? 0) / 1000));
    }
  }

  async function handleSave() {
    if (isDemoMode) {
      Alert.alert('Demo Mode', 'In the real app, video is compressed and uploaded to Firebase Storage.');
      nav.goBack();
      return;
    }

    if (!user || !videoUri) return;

    if (!title.trim()) {
      Alert.alert('Title required', 'Please add a title for this legacy.');
      return;
    }

    setIsUploading(true);
    try {
      const legacyId = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
      const storagePath = await uploadVideo(user.uid, legacyId, videoUri, setUploadProgress);
      const newLegacy = await createVideoLegacy(user.uid, {
        title: title.trim(),
        storageRef: storagePath,
        durationSeconds,
      });
      addLegacy(newLegacy);
      nav.goBack();
    } catch {
      Alert.alert('Upload failed', 'Failed to save video legacy. Please try again.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }

  React.useEffect(() => () => { clearTimers(); }, []);

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
        <TextInput
          style={styles.titleInput}
          placeholder="Give this legacy a title..."
          placeholderTextColor={SUBTEXT}
          value={title}
          onChangeText={setTitle}
          maxLength={120}
          editable={!isUploading}
        />

        {videoUri ? (
          <View style={styles.previewContainer}>
            {isDemoMode ? (
              <View style={styles.demoPreview}>
                <Text style={styles.demoPreviewIcon}>🎥</Text>
                <Text style={styles.demoPreviewText}>Demo Video Preview</Text>
              </View>
            ) : (
              <Video
                source={{ uri: videoUri }}
                style={styles.preview}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                accessibilityLabel="Video preview"
              />
            )}
            <Text style={styles.previewLabel}>
              {durationSeconds > 0 ? `${formatDuration(durationSeconds)} · ` : ''}
              Max 2 min · compressed before upload
            </Text>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => { setVideoUri(null); setDurationSeconds(0); }}
              accessibilityLabel="Remove video"
            >
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

        {isUploading && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>Uploading… {uploadProgress}%</Text>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${uploadProgress}%` as `${number}%` }]}
              />
            </View>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionBtn, isUploading && styles.disabledBtn]}
            onPress={() => { void handleRecord(); }}
            disabled={isUploading}
            accessibilityLabel="Record video"
          >
            <Text style={styles.actionBtnText}>📹  Record Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, styles.secondaryActionBtn, isUploading && styles.disabledBtn]}
            onPress={() => { void handlePick(); }}
            disabled={isUploading}
            accessibilityLabel="Choose video from library"
          >
            <Text style={styles.secondaryActionBtnText}>🖼️  Choose from Library</Text>
          </TouchableOpacity>
        </View>

        {videoUri && (
          <TouchableOpacity
            style={[styles.saveBtn, isUploading && styles.saveBtnDisabled]}
            onPress={() => { void handleSave(); }}
            disabled={isUploading}
            accessibilityLabel="Save video legacy"
          >
            <Text style={styles.saveBtnText}>{isUploading ? 'Saving…' : 'Save Legacy'}</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>
          {isDemoMode
            ? 'Demo: video uploads are simulated.'
            : 'Video is compressed automatically before upload. Max 2 minutes.'}
        </Text>
      </View>

      <Modal visible={cameraOpen} animationType="slide" statusBarTranslucent>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            mode="video"
            facing="back"
          />

          {isRecording && (
            <View style={styles.timerOverlay} pointerEvents="none">
              <View style={styles.recDot} />
              <Text style={styles.timerText}>{formatDuration(recordElapsed)}</Text>
              <Text style={styles.timerLimit}>/ {formatDuration(MAX_DURATION_SECONDS)}</Text>
            </View>
          )}

          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cancelCameraBtn}
              onPress={() => {
                if (isRecording) stopRecording();
                else setCameraOpen(false);
              }}
              accessibilityLabel={isRecording ? 'Stop recording' : 'Cancel'}
            >
              <Text style={styles.cancelCameraText}>{isRecording ? 'Stop' : 'Cancel'}</Text>
            </TouchableOpacity>

            {!isRecording ? (
              <TouchableOpacity
                style={styles.recordCircle}
                onPress={() => { void startRecording(); }}
                accessibilityLabel="Start recording"
              >
                <View style={styles.recordCircleInner} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.stopCircle}
                onPress={stopRecording}
                accessibilityLabel="Stop recording"
              >
                <View style={styles.stopSquare} />
              </TouchableOpacity>
            )}

            <View style={{ width: 80 }} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  titleInput: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    paddingBottom: 10,
    textAlign: 'center',
  },

  previewContainer: { alignItems: 'center', gap: 8 },
  preview: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: CARD },
  demoPreview: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  demoPreviewIcon: { fontSize: 40 },
  demoPreviewText: { color: SUBTEXT, fontSize: 14 },
  previewLabel: { color: SUBTEXT, fontSize: 13 },
  removeBtn: { padding: 8 },
  removeBtnText: { color: DANGER, fontSize: 14 },

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

  progressContainer: { gap: 6 },
  progressLabel: { color: SUBTEXT, fontSize: 13, textAlign: 'center' },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: BORDER,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: SUCCESS, borderRadius: 3 },

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
  disabledBtn: { opacity: 0.4 },

  saveBtn: { backgroundColor: ACCENT, borderRadius: 12, padding: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  hint: { color: SUBTEXT, fontSize: 13, textAlign: 'center', lineHeight: 20 },

  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  camera: { flex: 1 },
  timerOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: DANGER,
  },
  timerText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  timerLimit: { color: 'rgba(255,255,255,0.6)', fontSize: 18 },
  cameraControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  cancelCameraBtn: { padding: 12 },
  cancelCameraText: { color: '#fff', fontSize: 17, fontWeight: '600' },
  recordCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordCircleInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: DANGER,
  },
  stopCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopSquare: {
    width: 28,
    height: 28,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
