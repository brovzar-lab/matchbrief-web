import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';

import {
  BG, BG_SECONDARY, CARD, BORDER, TEXT, SUBTEXT, ACCENT, MUTED, isDemoMode,
} from '../lib/config';
import { useStore } from '../lib/store';
import { DEMO_TODAY_SESSION } from '../demo/seed';
import { Session } from '../lib/types';
import DemoModeBadge from '../components/DemoModeBadge';
import SessionCard from '../components/SessionCard';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function showToast(msg: string) {
  if (Platform.OS === 'android') ToastAndroid.show(msg, ToastAndroid.SHORT);
}

export default function HomeScreen() {
  const nav = useNavigation<Nav>();
  const user = useStore((s) => s.user);
  const sessions = useStore((s) => s.sessions);
  const setActiveSession = useStore((s) => s.setActiveSession);
  const prependSession = useStore((s) => s.prependSession);

  const [generatingSession, setGeneratingSession] = useState(false);

  const today = new Date().toDateString();
  const hasSessionToday = sessions.some(
    (s) => new Date(s.date).toDateString() === today,
  );
  const todaySession = sessions.find((s) => new Date(s.date).toDateString() === today);

  async function handleStartSession() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isDemoMode) {
      const demoSession: Session = { ...DEMO_TODAY_SESSION, id: `session-${Date.now()}` };
      setActiveSession(demoSession);
      nav.navigate('ActiveSession', { sessionId: demoSession.id });
      return;
    }

    if (!user?.isPremium && sessions.length >= 3) {
      nav.navigate('Paywall');
      return;
    }

    setGeneratingSession(true);
    showToast('Generating your session…');

    try {
      const { getFunctions: getFn } = await import('../lib/firebase');
      const functions = await getFn();
      if (!functions) throw new Error('Firebase not ready');

      const { httpsCallable } = await import('firebase/functions');
      const generateFn = httpsCallable(functions, 'generateSession');
      const result = await generateFn({ uid: user!.uid });
      const session = result.data as Session;

      prependSession(session);
      setActiveSession(session);
      nav.navigate('ActiveSession', { sessionId: session.id });
    } catch (err: any) {
      Alert.alert('Error', 'Could not generate your session. Please try again.');
    } finally {
      setGeneratingSession(false);
    }
  }

  function handleContinueSession(session: Session) {
    setActiveSession(session);
    nav.navigate('ActiveSession', { sessionId: session.id });
  }

  const recentSessions = sessions.filter((s) => s.completedAt).slice(0, 5);
  const streak = user?.currentStreak ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {isDemoMode && <DemoModeBadge />}

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
              {user?.displayName?.split(' ')[0] ?? 'Coach'} 👋
            </Text>
            <Text style={styles.subGreeting}>Your 5-min coaching session awaits</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={styles.streakCount}>{streak}</Text>
            <Text style={styles.streakLabel}>day{streak !== 1 ? 's' : ''}</Text>
          </View>
        </View>

        {/* Today's session card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TODAY</Text>

          {hasSessionToday && todaySession?.completedAt ? (
            <SessionCard session={todaySession} variant="today" />
          ) : hasSessionToday && todaySession ? (
            <SessionCard
              session={todaySession}
              variant="today"
              onPress={() => handleContinueSession(todaySession)}
            />
          ) : (
            <View style={styles.generateCard}>
              <View style={styles.coachAvatar}>
                <Text style={styles.coachEmoji}>🧠</Text>
              </View>
              <Text style={styles.generateTitle}>
                Your personalized session is ready to generate
              </Text>
              <Text style={styles.generateSubtitle}>
                Based on your profile and coaching history, our AI will craft a 5-step session
                targeting your current growth edge.
              </Text>
              <View style={styles.timerChip}>
                <Text style={styles.timerText}>⏱ ~5 minutes</Text>
              </View>
              <TouchableOpacity
                style={[styles.startBtn, generatingSession && styles.btnDisabled]}
                onPress={handleStartSession}
                disabled={generatingSession}
              >
                <Text style={styles.startBtnText}>
                  {generatingSession ? 'Generating your session…' : 'Start Today\'s Session'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Recent sessions */}
        {recentSessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECENT SESSIONS</Text>
            <View style={styles.sessionList}>
              {recentSessions.map((s) => (
                <SessionCard key={s.id} session={s} variant="history" />
              ))}
            </View>
          </View>
        )}

        {recentSessions.length === 0 && (
          <View style={styles.emptyHistory}>
            <Text style={styles.emptyIcon}>📚</Text>
            <Text style={styles.emptyText}>
              Complete your first session to start building your coaching history.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  content: { padding: 20, gap: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 20, fontWeight: '700', color: TEXT, marginBottom: 4 },
  subGreeting: { fontSize: 14, color: SUBTEXT },
  streakBadge: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  streakFire: { fontSize: 18 },
  streakCount: { fontSize: 20, fontWeight: '800', color: ACCENT },
  streakLabel: { fontSize: 10, color: SUBTEXT },
  section: { gap: 12 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: MUTED,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  generateCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: ACCENT,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  coachAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(245,158,11,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coachEmoji: { fontSize: 28 },
  generateTitle: { fontSize: 16, fontWeight: '600', color: TEXT, textAlign: 'center' },
  generateSubtitle: { fontSize: 13, color: SUBTEXT, textAlign: 'center', lineHeight: 20 },
  timerChip: {
    backgroundColor: 'rgba(245,158,11,0.12)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  timerText: { fontSize: 13, color: ACCENT, fontWeight: '600' },
  startBtn: {
    width: '100%',
    backgroundColor: ACCENT,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  startBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
  sessionList: { gap: 10 },
  emptyHistory: { alignItems: 'center', paddingTop: 20, gap: 12 },
  emptyIcon: { fontSize: 36 },
  emptyText: { fontSize: 14, color: SUBTEXT, textAlign: 'center', lineHeight: 21 },
});
