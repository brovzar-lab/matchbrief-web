import React from 'react';
import { Text } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TRACKS } from '../lib/config';
import { useStore } from '../lib/store';
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
  Tabs: undefined;
  ActiveSprint: undefined;
  SprintResults: undefined;
  Paywall: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

function TabNavigator() {
  const track = useStore((s) => s.track);
  const accent = TRACKS[track].accent;

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
            <Text style={{ color, fontSize: 18 }}>📊</Text>
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
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="ActiveSprint"
        component={ActiveSprintScreen}
        options={{ contentStyle: { backgroundColor: '#0F0F13' } }}
      />
      <Stack.Screen
        name="SprintResults"
        component={SprintResultsScreen}
        options={{ contentStyle: { backgroundColor: '#0F0F13' } }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: 'modal',
          contentStyle: { backgroundColor: '#0F0F13' },
        }}
      />
    </Stack.Navigator>
  );
}
