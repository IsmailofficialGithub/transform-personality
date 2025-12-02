import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '../stores/useAuthStore';
import { useThemeStore } from '../stores/useThemeStore';
import { supabase } from '../services/supabase';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';

export default function RootLayout() {
  const { session, setSession, loading, profile } = useAuthStore();
  const { initTheme } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const theme = useTheme();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    initTheme();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (loading) return;
      if (!session) {
        setCheckingOnboarding(false);
        return;
      }

      // Check if user has completed onboarding (has gender or habits)
      if (profile) {
        const { data: habits } = await supabase
          .from('habits')
          .select('id')
          .eq('user_id', session.user.id)
          .limit(1);

        const hasCompletedOnboarding = profile.gender || (habits && habits.length > 0);

        if (!hasCompletedOnboarding && segments[0] !== '(auth)') {
          router.replace('/(auth)/onboarding');
        }
      }
      setCheckingOnboarding(false);
    };

    checkOnboarding();
  }, [session, loading, profile, segments]);

  useEffect(() => {
    if (loading || checkingOnboarding) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (session && inAuthGroup && segments[1] !== 'onboarding') {
      router.replace('/(tabs)');
    }
  }, [session, loading, checkingOnboarding, segments]);

  if (loading || checkingOnboarding) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.base.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return <Slot />;
}
