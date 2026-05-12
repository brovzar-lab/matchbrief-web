import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { NavigatorScreenParams } from '@react-navigation/native';
import { isDemoMode, BG, BORDER, ACCENT, SUBTEXT } from '../lib/config';
import { useStore, initAuthListener } from '../lib/store';

import AuthScreen from '../screens/AuthScreen';
import MyShiftsScreen from '../screens/worker/MyShiftsScreen';
import OpenSwapsScreen from '../screens/worker/OpenSwapsScreen';
import SwapHistoryScreen from '../screens/worker/SwapHistoryScreen';
import PendingApprovalsScreen from '../screens/manager/PendingApprovalsScreen';
import LocationSettingsScreen from '../screens/manager/LocationSettingsScreen';

export type WorkerTabParamList = {
  MyShifts: undefined;
  OpenSwaps: undefined;
  SwapHistory: undefined;
};

export type ManagerTabParamList = {
  PendingApprovals: undefined;
  LocationSettings: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  WorkerTabs: NavigatorScreenParams<WorkerTabParamList> | undefined;
  ManagerTabs: NavigatorScreenParams<ManagerTabParamList> | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const WorkerTab = createBottomTabNavigator<WorkerTabParamList>();
const ManagerTab = createBottomTabNavigator<ManagerTabParamList>();

function WorkerTabNavigator() {
  return (
    <WorkerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: BG, borderTopColor: BORDER },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: SUBTEXT,
      }}
    >
      <WorkerTab.Screen
        name="MyShifts"
        component={MyShiftsScreen}
        options={{
          tabBarLabel: 'My Shifts',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📅</Text>,
        }}
      />
      <WorkerTab.Screen
        name="OpenSwaps"
        component={OpenSwapsScreen}
        options={{
          tabBarLabel: 'Open Swaps',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🔄</Text>,
        }}
      />
      <WorkerTab.Screen
        name="SwapHistory"
        component={SwapHistoryScreen}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>📋</Text>,
        }}
      />
    </WorkerTab.Navigator>
  );
}

function ManagerTabNavigator() {
  return (
    <ManagerTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: BG, borderTopColor: BORDER },
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: SUBTEXT,
      }}
    >
      <ManagerTab.Screen
        name="PendingApprovals"
        component={PendingApprovalsScreen}
        options={{
          tabBarLabel: 'Approvals',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>✅</Text>,
        }}
      />
      <ManagerTab.Screen
        name="LocationSettings"
        component={LocationSettingsScreen}
        options={{
          tabBarLabel: 'Location',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>⚙️</Text>,
        }}
      />
    </ManagerTab.Navigator>
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
      ) : user.role === 'manager' ? (
        <Stack.Screen name="ManagerTabs" component={ManagerTabNavigator} />
      ) : (
        <Stack.Screen name="WorkerTabs" component={WorkerTabNavigator} />
      )}
    </Stack.Navigator>
  );
}
