import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import Purchases from 'react-native-purchases';

import RootNavigator from './src/navigation/RootNavigator';
import { isDemoMode, RC_ENTITLEMENT_ID } from './src/lib/config';
import { useStore } from './src/lib/store';

export default function App() {
  const setRcPremiumActive = useStore((s) => s.setRcPremiumActive);

  useEffect(() => {
    if (isDemoMode) return;
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY;
    if (!apiKey) return;
    Purchases.configure({ apiKey });
    Purchases.getCustomerInfo()
      .then((info) => {
        if (info.entitlements.active[RC_ENTITLEMENT_ID]) {
          setRcPremiumActive(true);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
