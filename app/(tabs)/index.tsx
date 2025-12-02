import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/useAuthStore';
import CheckIn from '../../components/CheckIn';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { Habit } from '../../types';
import { Target, Calendar, TrendingUp, LogOut } from 'lucide-react-native';

export default function Dashboard() {
  const theme = useTheme();
  const { signOut, user, profile } = useAuthStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHabits();
  }, []);

  async function fetchHabits() {
    if (!user) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHabits(data as Habit[]);
    }
    setLoading(false);
  }

  const calculateDaysClean = (quitDate: string) => {
    const quit = new Date(quitDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
      >
      <View className="mb-6">
        <Text style={{ color: theme.text.primary }} className="text-3xl font-bold mb-2">
          Welcome Back
        </Text>
        <Text style={{ color: theme.text.secondary }} className="text-base">
          {profile?.username || user?.email}
        </Text>
      </View>

      {habits.length > 0 && (
        <View className="mb-6">
          <View className="flex-row items-center mb-4">
            <Target size={24} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Your Habits
            </Text>
          </View>
          {habits.map((habit) => {
            const daysClean = calculateDaysClean(habit.quit_date);
            return (
              <View
                key={habit.id}
                style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
                className="p-4 rounded-xl mb-3 border"
              >
                <View className="flex-row items-center justify-between mb-2">
                  <Text style={{ color: theme.text.primary }} className="text-lg font-bold">
                    {habit.name}
                  </Text>
                  <View
                    style={{ backgroundColor: theme.status.success + '20' }}
                    className="px-3 py-1 rounded-full"
                  >
                    <Text style={{ color: theme.status.success }} className="font-bold">
                      {daysClean} days
                    </Text>
                  </View>
                </View>
                <View className="flex-row items-center">
                  <Calendar size={16} color={theme.text.tertiary} />
                  <Text style={{ color: theme.text.secondary }} className="ml-2 text-sm">
                    Quit on {new Date(habit.quit_date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <CheckIn />

      <TouchableOpacity
        style={{ backgroundColor: theme.status.error }}
        className="p-4 rounded-xl mt-6 items-center"
        onPress={() => signOut()}
      >
        <View className="flex-row items-center">
          <LogOut size={20} color={theme.text.inverse} />
          <Text style={{ color: theme.text.inverse }} className="font-bold ml-2 text-lg">
            Sign Out
          </Text>
        </View>
      </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
