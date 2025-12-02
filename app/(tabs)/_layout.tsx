import React from 'react';
import { Tabs } from 'expo-router';
import { Home, Users, Gamepad2, User } from 'lucide-react-native';
import { useTheme } from '../../hooks/useTheme';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.text.tertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.base.card,
          borderTopColor: theme.base.border,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Home size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Community',
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="games"
        options={{
          title: 'Distract',
          tabBarIcon: ({ color }) => <Gamepad2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          tabBarIcon: ({ color }) => <User size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
