import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useStore } from './src/lib/store';
import { DemoBanner } from './src/components/DemoBanner';
import { isDemoMode } from './src/lib/config';
import { listenToAuthState, getUserProfile } from './src/lib/firebaseService';

function useAuthSetup() {
  const setUid = useStore((s) => s.setUid);
  const setIsAuthLoading = useStore((s) => s.setIsAuthLoading);
  const setIsPremium = useStore((s) => s.setIsPremium);
  const setTrack = useStore((s) => s.setTrack);
  const setStreak = useStore((s) => s.setStreak);
  const setXp = useStore((s) => s.setXp);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  useEffect(() => {
    if (isDemoMode) {
      setIsAuthLoading(false);
      return;
    }

    const unsub = listenToAuthState(async (user) => {
      setIsAuthLoading(false);
      if (user) {
        setUid(user.uid);
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            if (profile.selectedTrack) setTrack(profile.selectedTrack);
            if (profile.isPremium != null) setIsPremium(profile.isPremium);
            if (profile.streak != null) setStreak(profile.streak);
            if (profile.xp != null) setXp(profile.xp);
            if (profile.selectedTrack) completeOnboarding();
          }
        } catch {
          // non-critical — store has sensible defaults
        }
      } else {
        setUid(null);
        setIsPremium(false);
      }
    });

    return unsub;
  }, [setUid, setIsAuthLoading, setIsPremium, setTrack, setStreak, setXp, completeOnboarding]);
}

function ToastOverlay() {
  const toastMessage = useStore((s) => s.toastMessage);
  const clearToast = useStore((s) => s.clearToast);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(clearToast, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage, clearToast]);

  if (!toastMessage) return null;

  return (
    <View style={styles.toast} accessibilityLiveRegion="polite">
      <Text style={styles.toastText}>{toastMessage}</Text>
    </View>
  );
}

function AppContent() {
  useAuthSetup();

  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      {isDemoMode && <DemoBanner />}
      <ToastOverlay />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: '#1A1A2E',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#252540',
  },
  toastText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
});
