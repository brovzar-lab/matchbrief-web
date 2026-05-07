import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { NavigatorScreenParams } from '@react-navigation/native';
import { isDemoMode, BG, BORDER, ACCENT, SUBTEXT } from '../lib/config';
import { useStore, initAuthListener } from '../lib/store';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import ComposeTextScreen from '../screens/ComposeTextScreen';
import ComposeVoiceScreen from '../screens/ComposeVoiceScreen';
import ComposeVideoScreen from '../screens/ComposeVideoScreen';
import DeliverySettingsScreen from '../screens/DeliverySettingsScreen';
import RecipientsScreen from '../screens/RecipientsScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';
import type { Legacy } from '../lib/types';

export type TabParamList = {
  Home: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ComposeText: { legacyId?: string } | undefined;
  ComposeVoice: { legacyId?: string } | undefined;
  ComposeVideo: { legacyId?: string } | undefined;
  DeliverySettings: { legacy: Legacy };
  Recipients: { legacy: Legacy };
  Paywall: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: BG, borderTopColor: BORDER },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: SUBTEXT,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Legacies',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📜</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Account',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const user = useStore((s) => s.user);
  const isAuthLoading = useStore((s) => s.isAuthLoading);

  React.useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  if (!isDemoMode && isAuthLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={ACCENT} size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="ComposeText" component={ComposeTextScreen} />
          <Stack.Screen name="ComposeVoice" component={ComposeVoiceScreen} />
          <Stack.Screen name="ComposeVideo" component={ComposeVideoScreen} />
          <Stack.Screen name="DeliverySettings" component={DeliverySettingsScreen} />
          <Stack.Screen name="Recipients" component={RecipientsScreen} />
          <Stack.Screen
            name="Paywall"
            component={PaywallScreen}
            options={{ presentation: 'modal' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
