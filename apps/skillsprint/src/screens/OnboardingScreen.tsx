import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../lib/store';
import { isDemoMode, TRACKS } from '../lib/config';
import { saveUserTrack } from '../lib/firebaseService';
import type { TrackId } from '../lib/config';

const TRACK_ORDER: TrackId[] = ['coding', 'writing', 'design', 'critical_thinking'];

export default function OnboardingScreen() {
  const uid = useStore((s) => s.uid);
  const setTrack = useStore((s) => s.setTrack);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const showToast = useStore((s) => s.showToast);

  const [selectedTrack, setSelectedTrack] = useState<TrackId | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleConfirm() {
    if (!selectedTrack) return;
    setSaving(true);
    try {
      if (!isDemoMode && uid) {
        await saveUserTrack(uid, selectedTrack);
      } else {
        showToast('Demo mode — not saved');
      }
      setTrack(selectedTrack);
      completeOnboarding();
    } catch {
      showToast('Could not save track. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={s.logo}>⚡️</Text>
      <Text style={s.title}>Choose your track</Text>
      <Text style={s.subtitle}>
        Pick the skill you want to sprint on every day.{'\n'}You can change this later.
      </Text>

      <View style={s.grid}>
        {TRACK_ORDER.map((id) => {
          const t = TRACKS[id];
          const active = selectedTrack === id;
          return (
            <TouchableOpacity
              key={id}
              style={[
                s.card,
                active && { borderColor: t.accent, backgroundColor: t.accent + '18' },
              ]}
              onPress={() => setSelectedTrack(id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.label}
            >
              <Text style={s.cardEmoji}>{t.emoji}</Text>
              <Text style={[s.cardLabel, active && { color: t.accent }]}>{t.label}</Text>
              <View
                style={[
                  s.accentBar,
                  { backgroundColor: active ? t.accent : '#252540' },
                ]}
              />
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity
        style={[s.cta, (!selectedTrack || saving) && s.ctaDisabled]}
        onPress={handleConfirm}
        disabled={!selectedTrack || saving}
        accessibilityRole="button"
        accessibilityLabel="Confirm track selection"
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={s.ctaText}>
            {selectedTrack ? `Start ${TRACKS[selectedTrack].label} Sprints →` : 'Select a track'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0F13' },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logo: { fontSize: 48, marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: '#8888AA',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'center',
    width: '100%',
    marginBottom: 36,
  },
  card: {
    width: '45%',
    backgroundColor: '#1A1A2E',
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#252540',
    gap: 10,
  },
  cardEmoji: { fontSize: 32 },
  cardLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  accentBar: {
    height: 3,
    width: 32,
    borderRadius: 2,
    marginTop: 4,
  },
  cta: {
    backgroundColor: '#3B82F6',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    width: '100%',
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaDisabled: { opacity: 0.4 },
  ctaText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
});
