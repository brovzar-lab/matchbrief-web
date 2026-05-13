import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { isDemoMode, BG, BORDER, ACCENT, SUBTEXT } from '../lib/config';
import { useStore, initAuthListener } from '../lib/store';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import WeeklyReviewScreen from '../screens/WeeklyReviewScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MemoDetailScreen from '../screens/MemoDetailScreen';

export type TabParamList = {
  Home: undefined;
  Weekly: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MemoDetail: { memoId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function MainTabs() {
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
          tabBarLabel: 'Capture',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎙</Text>,
        }}
      />
      <Tab.Screen
        name="Weekly"
        component={WeeklyReviewScreen}
        options={{
          tabBarLabel: 'Weekly',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const user = useStore((s) => s.user);

  useEffect(() => {
    const unsub = initAuthListener();
    return unsub;
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="MemoDetail"
            component={MemoDetailScreen}
            options={{ headerShown: true, headerTitle: 'Memo', headerBackTitle: 'Back' }}
          />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
