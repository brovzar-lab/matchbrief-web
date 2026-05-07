import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigatorScreenParams } from '@react-navigation/native';
import { TRACKS, isDemoMode } from '../lib/config';
import { useStore } from '../lib/store';
import type { SubmitResult } from '../hooks/useSubmitChallenge';
import type { Difficulty } from '../lib/mockData';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import HomeScreen from '../screens/HomeScreen';
import LeaderboardScreen from '../screens/LeaderboardScreen';
import RivalMatchupScreen from '../screens/RivalMatchupScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ActiveSprintScreen from '../screens/ActiveSprintScreen';
import SprintResultsScreen from '../screens/SprintResultsScreen';
import PaywallScreen from '../screens/PaywallScreen';

export type TabParamList = {
  Home: undefined;
  Leaderboard: undefined;
  Rival: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Tabs: NavigatorScreenParams<TabParamList> | undefined;
  ActiveSprint: undefined;
  SprintResults: { result: SubmitResult; difficulty: Difficulty };
  Paywall: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const selectedTrack = useStore((s) => s.selectedTrack) ?? 'coding';
  const accent = TRACKS[selectedTrack].accent;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: '#0F0F13', borderTopColor: '#252540' },
        tabBarActiveTintColor: accent,
        tabBarInactiveTintColor: '#8888AA',
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>🏠</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Leaderboard"
        component={LeaderboardScreen}
        options={{
          tabBarLabel: 'Ranks',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>🏆</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Rival"
        component={RivalMatchupScreen}
        options={{
          tabBarLabel: 'Rival',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>⚔️</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }}>👤</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  const uid = useStore((s) => s.uid);
  const isAuthLoading = useStore((s) => s.isAuthLoading);
  const hasOnboarded = useStore((s) => s.hasOnboarded);

  if (!isDemoMode && isAuthLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0F0F13', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#3B82F6" size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0F0F13' },
      }}
    >
      {!uid ? (
        <Stack.Screen name="Auth" component={AuthScreen} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="ActiveSprint" component={ActiveSprintScreen} />
          <Stack.Screen name="SprintResults" component={SprintResultsScreen} />
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
