import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { BG, BORDER, ACCENT, SUBTEXT } from '../lib/config';
import { useStore, initAuthListener } from '../lib/store';

import AuthScreen from '../screens/AuthScreen';
import TodayRoutineScreen from '../screens/TodayRoutineScreen';
import RoutineBuilderScreen from '../screens/RoutineBuilderScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import ProductLibraryScreen from '../screens/ProductLibraryScreen';
import SkinTimelineScreen from '../screens/SkinTimelineScreen';
import PaywallScreen from '../screens/PaywallScreen';
import SettingsScreen from '../screens/SettingsScreen';

export type TabParamList = {
  Today: undefined;
  Library: undefined;
  Timeline: undefined;
  Settings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  RoutineBuilder: { type: 'morning' | 'night' };
  ProductDetail: { productId: string };
  Paywall: undefined;
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
        name="Today"
        component={TodayRoutineScreen}
        options={{
          tabBarLabel: 'Today',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✨</Text>,
        }}
      />
      <Tab.Screen
        name="Library"
        component={ProductLibraryScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🧴</Text>,
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={SkinTimelineScreen}
        options={{
          tabBarLabel: 'Timeline',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📸</Text>,
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
      {!user ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen
            name="RoutineBuilder"
            component={RoutineBuilderScreen}
            options={{ presentation: 'modal' }}
          />
          <Stack.Screen
            name="ProductDetail"
            component={ProductDetailScreen}
          />
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
