import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  BG, BG_SECONDARY, TEXT, SUBTEXT, ACCENT, RECORD_ACTIVE,
  BORDER, CARD, isDemoMode, FREE_MEMO_LIMIT,
} from '../lib/config';
import { useStore } from '../lib/store';
import { Memo } from '../lib/types';
import { DEMO_TRANSCRIPTS } from '../demo/seed';
import DemoModeBadge from '../components/DemoModeBadge';
import CategoryChip from '../components/CategoryChip';
import MemoCard from '../components/MemoCard';
import WaveformBar from '../components/WaveformBar';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
}

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const memos = useStore((s) => s.memos);
  const user = useStore((s) => s.user);
  const prependMemo = useStore((s) => s.prependMemo);
  const recordingState = useStore((s) => s.recordingState);
  const setRecordingState = useStore((s) => s.setRecordingState);
  const liveTranscript = useStore((s) => s.liveTranscript);
  const setLiveTranscript = useStore((s) => s.setLiveTranscript);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const demoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isRecording = recordingState === 'recording';
  const isTranscribing = recordingState === 'transcribing';
  const busy = isRecording || isTranscribing;

  const startPulse = useCallback(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  const stopPulse = useCallback(() => {
    pulseAnim.stopAnimation();
    Animated.spring(pulseAnim, { toValue: 1, useNativeDriver: true }).start();
  }, [pulseAnim]);

  function handleRecordPress() {
    if (busy) {
      stopRecording();
      return;
    }

    if (isDemoMode) {
      startDemoRecording();
      return;
    }

    if ((user?.memoCountThisMonth ?? 0) >= FREE_MEMO_LIMIT && !user?.isPremium) {
      Alert.alert('Free limit reached', 'You\'ve used your 20 free memos this month. Upgrade to Premium for unlimited capture.');
      return;
    }

    startRealRecording();
  }

  function startDemoRecording() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecordingState('recording');
    setLiveTranscript('');
    startPulse();

    const transcript = DEMO_TRANSCRIPTS[Math.floor(Math.random() * DEMO_TRANSCRIPTS.length)];

    // Simulate live transcription character by character
    let charIdx = 0;
    const interval = setInterval(() => {
      charIdx += 3;
      setLiveTranscript(transcript.text.slice(0, charIdx));
      if (charIdx >= transcript.text.length) clearInterval(interval);
    }, 30);

    demoTimerRef.current = setTimeout(() => {
      clearInterval(interval);
      setLiveTranscript(transcript.text);
      setRecordingState('transcribing');
      stopPulse();

      setTimeout(() => {
        const newMemo: Memo = {
          id: `demo-${Date.now()}`,
          text: transcript.text,
          category: transcript.category,
          createdAt: new Date().toISOString(),
          durationSec: 3,
          extractedDate: transcript.category === 'reminder' ? new Date(Date.now() + 86400000 * 2).toISOString() : null,
          isPremium: false,
        };
        prependMemo(newMemo);
        setRecordingState('idle');
        setLiveTranscript('');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 1000);
    }, 3000);
  }

  function stopRecording() {
    if (demoTimerRef.current) clearTimeout(demoTimerRef.current);
    stopPulse();
    setRecordingState('idle');
    setLiveTranscript('');
  }

  async function startRealRecording() {
    // Real recording with expo-av — gated behind non-demo path
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecordingState('recording');
    startPulse();
    showToast('Recording… tap again to stop');
    // Full expo-av + classifyMemo CF wiring comes in the Firebase integration phase
  }

  const recordBtnColor = isRecording ? RECORD_ACTIVE : ACCENT;

  return (
    <SafeAreaView style={styles.container}>
      {isDemoMode && <DemoModeBadge />}

      {/* Record section */}
      <View style={styles.captureZone}>
        <Text style={styles.hintText}>
          {isRecording ? 'Recording… tap to stop' : isTranscribing ? 'Classifying…' : 'Tap to capture a thought'}
        </Text>

        <Animated.View style={[styles.btnWrap, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            style={[styles.recordBtn, { borderColor: recordBtnColor, shadowColor: recordBtnColor }]}
            onPress={handleRecordPress}
            activeOpacity={0.85}
          >
            <View style={[styles.recordInner, { backgroundColor: recordBtnColor }]}>
              <Text style={styles.recordIcon}>{isRecording ? '⏹' : '🎙'}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {busy && (
          <View style={styles.liveArea}>
            <WaveformBar active={isRecording} color={isRecording ? RECORD_ACTIVE : ACCENT} />
            {liveTranscript ? (
              <Text style={styles.liveTranscript} numberOfLines={4}>
                {liveTranscript}
              </Text>
            ) : null}
          </View>
        )}

        {!busy && memos.length > 0 && (
          <View style={styles.todayStats}>
            {(['idea', 'task', 'reminder', 'note'] as const).map((cat) => {
              const count = memos.filter((m) => m.category === cat).length;
              if (count === 0) return null;
              return (
                <View key={cat} style={styles.statChip}>
                  <CategoryChip category={cat} size="sm" />
                  <Text style={styles.statCount}> {count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Memo feed */}
      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.feedTitle}>Recent Memos</Text>
        {memos.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎙</Text>
            <Text style={styles.emptyText}>Tap the button to capture your first thought</Text>
          </View>
        ) : (
          memos.map((memo) => (
            <MemoCard
              key={memo.id}
              memo={memo}
              onPress={() => nav.navigate('MemoDetail', { memoId: memo.id })}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  captureZone: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    backgroundColor: BG,
  },
  hintText: {
    fontSize: 14,
    color: SUBTEXT,
    marginBottom: 20,
    fontWeight: '500',
  },
  btnWrap: {
    marginBottom: 20,
  },
  recordBtn: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: BG,
  },
  recordInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordIcon: { fontSize: 38 },
  liveArea: {
    width: '100%',
    alignItems: 'center',
    gap: 12,
  },
  liveTranscript: {
    fontSize: 14,
    color: TEXT,
    textAlign: 'center',
    lineHeight: 22,
    fontStyle: 'italic',
  },
  todayStats: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statCount: {
    fontSize: 12,
    color: SUBTEXT,
    fontWeight: '600',
  },
  feed: { flex: 1, backgroundColor: BG_SECONDARY },
  feedContent: { padding: 16, paddingBottom: 40 },
  feedTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: SUBTEXT,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  emptyState: { alignItems: 'center', paddingTop: 40, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: { fontSize: 15, color: SUBTEXT, textAlign: 'center', lineHeight: 22 },
});
