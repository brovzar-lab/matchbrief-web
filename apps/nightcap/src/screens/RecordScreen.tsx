import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Alert, ToastAndroid, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { BG, CARD, TEXT, SUBTEXT, ACCENT, ACCENT_LIGHT, GRAD_START, GRAD_END, BORDER } from '../lib/config';
import { isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import { getFirebaseApp } from '../lib/firebase';
import DemoModeBadge from '../components/DemoModeBadge';
import type { TabParamList } from '../navigation/RootNavigator';

const MAX_SECONDS = 120;
const BAR_COUNT = 32;

function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
}

export default function RecordScreen() {
  const nav = useNavigation<BottomTabNavigationProp<TabParamList>>();
  const setPendingTranscript = useStore((s) => s.setPendingTranscript);

  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [uploading, setUploading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingRef = useRef<any>(null);

  // Waveform animation values
  const barAnims = useRef(Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.15))).current;
  const waveLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  function startWaveAnimation() {
    const anims = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 30),
          Animated.timing(anim, { toValue: Math.random() * 0.7 + 0.2, duration: 250 + Math.random() * 200, useNativeDriver: false }),
          Animated.timing(anim, { toValue: Math.random() * 0.3 + 0.1, duration: 250 + Math.random() * 200, useNativeDriver: false }),
        ]),
      ),
    );
    waveLoopRef.current = Animated.parallel(anims);
    waveLoopRef.current.start();
  }

  function stopWaveAnimation() {
    waveLoopRef.current?.stop();
    barAnims.forEach((a) => a.setValue(0.15));
  }

  async function startRecording() {
    if (isDemoMode) {
      setRecording(true);
      startWaveAnimation();
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_SECONDS - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return;
    }
    try {
      const { Audio } = await import('expo-av');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
      startWaveAnimation();
      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_SECONDS - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      Alert.alert('Permission denied', 'Microphone access is required to record.');
    }
  }

  async function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    stopWaveAnimation();
    setRecording(false);
    setUploading(true);

    if (isDemoMode) {
      // Simulate transcription delay then navigate to Rate
      await new Promise((r) => setTimeout(r, 1400));
      setPendingTranscript(
        "Today was actually really good. Finished the feature I'd been blocked on, had a helpful sync with the team. Feeling optimistic about the week.",
        ['productivity', 'team', 'optimism'],
      );
      setUploading(false);
      setElapsed(0);
      showToast('Demo mode — transcript simulated');
      nav.navigate('Rate');
      return;
    }

    try {
      const rec = recordingRef.current;
      recordingRef.current = null;
      let transcript = '';
      let tags: string[] = [];

      if (rec) {
        await rec.stopAndUnloadAsync();
        const uri: string | null = rec.getURI();

        if (uri) {
          const app = await getFirebaseApp();
          const uid = useStore.getState().user?.uid;

          if (app && uid) {
            const { getStorage: _gs, ref: sRef, uploadBytes } = await import('firebase/storage');
            const audioPath = `users/${uid}/audio/${new Date().toISOString().split('T')[0]}.m4a`;
            const fileRef = sRef(_gs(app), audioPath);
            const blob: Blob = await new Promise((resolve, reject) => {
              const xhr = new XMLHttpRequest();
              xhr.onload = () => resolve(xhr.response as Blob);
              xhr.onerror = () => reject(new Error('Upload failed'));
              xhr.responseType = 'blob';
              xhr.open('GET', uri, true);
              xhr.send(null);
            });
            await uploadBytes(fileRef, blob, { contentType: 'audio/m4a' });

            const { getFunctions, httpsCallable } = await import('firebase/functions');
            const transcribeVoice = httpsCallable<
              { audioStoragePath: string },
              { transcript: string; tags: string[] }
            >(getFunctions(app), 'transcribeVoice');
            const result = await transcribeVoice({ audioStoragePath: audioPath });
            transcript = result.data.transcript;
            tags = result.data.tags;
          }
        }
      }

      setPendingTranscript(transcript, tags);
    } catch {
      Alert.alert('Transcription failed', 'Could not process your recording. Please try again.');
    } finally {
      setUploading(false);
      setElapsed(0);
      nav.navigate('Rate');
    }
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopWaveAnimation();
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
        recordingRef.current = null;
      }
    };
  }, []);

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  return (
    <LinearGradient colors={[GRAD_START, GRAD_END]} style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {isDemoMode && <DemoModeBadge />}

        <Text style={styles.title}>Tonight's Debrief</Text>
        <Text style={styles.subtitle}>
          {uploading ? 'Transcribing…' : recording ? 'Recording…' : 'Tap to start — max 2 minutes'}
        </Text>

        {/* Waveform */}
        <View style={styles.waveContainer}>
          {barAnims.map((anim, i) => (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  height: anim.interpolate({ inputRange: [0, 1], outputRange: [4, 80] }),
                  backgroundColor: recording ? ACCENT : BORDER,
                },
              ]}
            />
          ))}
        </View>

        {/* Timer */}
        <Text style={styles.timer}>{mins}:{secs}</Text>
        {recording && (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(elapsed / MAX_SECONDS) * 100}%` as any }]} />
          </View>
        )}

        {/* Record / Stop Button */}
        {!uploading && (
          <TouchableOpacity
            style={[styles.recordBtn, recording && styles.stopBtn]}
            onPress={recording ? stopRecording : startRecording}
          >
            <Text style={styles.recordBtnIcon}>{recording ? '⏹' : '🎙'}</Text>
          </TouchableOpacity>
        )}

        {uploading && (
          <View style={styles.uploadingBox}>
            <Text style={styles.uploadingText}>Transcribing your entry…</Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, alignItems: 'center', justifyContent: 'space-evenly', padding: 24 },
  title: { fontSize: 26, fontWeight: '700', color: TEXT },
  subtitle: { fontSize: 14, color: SUBTEXT },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    gap: 3,
    width: '100%',
    paddingHorizontal: 12,
  },
  bar: { width: 5, borderRadius: 3, minHeight: 4 },
  timer: { fontSize: 48, fontWeight: '200', color: TEXT, letterSpacing: 2 },
  progressTrack: {
    width: '80%',
    height: 3,
    backgroundColor: BORDER,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: { height: 3, backgroundColor: ACCENT, borderRadius: 2 },
  recordBtn: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopBtn: { backgroundColor: '#EF4444' },
  recordBtnIcon: { fontSize: 34 },
  uploadingBox: {
    backgroundColor: CARD,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 16,
  },
  uploadingText: { color: ACCENT_LIGHT, fontSize: 14 },
});
