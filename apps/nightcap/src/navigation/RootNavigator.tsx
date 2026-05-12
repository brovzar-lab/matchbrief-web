import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { isDemoMode, BG, BORDER, ACCENT, SUBTEXT } from '../lib/config';
import { useStore, initAuthListener } from '../lib/store';

import AuthScreen from '../screens/AuthScreen';
import HomeScreen from '../screens/HomeScreen';
import RecordScreen from '../screens/RecordScreen';
import RateScreen from '../screens/RateScreen';
import ReviewScreen from '../screens/ReviewScreen';
import InsightsScreen from '../screens/InsightsScreen';

export type TabParamList = {
  Home: undefined;
  Record: undefined;
  Rate: undefined;
  Review: undefined;
  Insights: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
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
        options={{ tabBarLabel: 'Today', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🌙</Text> }}
      />
      <Tab.Screen
        name="Record"
        component={RecordScreen}
        options={{ tabBarLabel: 'Record', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🎙</Text> }}
      />
      <Tab.Screen
        name="Rate"
        component={RateScreen}
        options={{ tabBarLabel: 'Rate', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚖️</Text> }}
      />
      <Tab.Screen
        name="Review"
        component={ReviewScreen}
        options={{ tabBarLabel: 'Review', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📝</Text> }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{ tabBarLabel: 'Insights', tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✨</Text> }}
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
        <Stack.Screen name="Main" component={MainTabs} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
}
