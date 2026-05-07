import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import { RootNavigator } from './src/navigation/RootNavigator';
import { BG, isDemoMode } from './src/lib/config';

if (!isDemoMode) {
  Purchases.setLogLevel(LOG_LEVEL.DEBUG);
  Purchases.configure({
    apiKey:
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS!
        : process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID!,
  });
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: BG }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="light" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
