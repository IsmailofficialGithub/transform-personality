import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit, StreakData } from '../types';
import { getStreakData } from '../services/streakService';
import { Flame, Calendar, Trophy } from 'lucide-react-native';

interface StreakDisplayProps {
  habit: Habit;
}

export default function StreakDisplay({ habit }: StreakDisplayProps) {
  const theme = useTheme();
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreakData();
  }, [habit.id]);

  async function loadStreakData() {
    setLoading(true);
    try {
      const data = await getStreakData(habit.user_id, habit.id, habit.quit_date);
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
      setStreakData({
        current_streak: 0,
        longest_streak: 0,
        days_clean: 0,
      });
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border"
      >
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (!streakData) {
    return null;
  }

  const formatDays = (days: number) => {
    if (days === 0) return '0 days';
    if (days === 1) return '1 day';
    if (days < 7) return `${days} days`;
    if (days < 30) {
      const weeks = Math.floor(days / 7);
      const remainingDays = days % 7;
      if (remainingDays === 0) return `${weeks} week${weeks > 1 ? 's' : ''}`;
      return `${weeks} week${weeks > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remainingDays = days % 30;
      if (remainingDays === 0) return `${months} month${months > 1 ? 's' : ''}`;
      return `${months} month${months > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    const years = Math.floor(days / 365);
    const remainingDays = days % 365;
    if (remainingDays === 0) return `${years} year${years > 1 ? 's' : ''}`;
    return `${years} year${years > 1 ? 's' : ''} ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
  };

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border mb-3"
    >
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Flame size={20} color={theme.primary} />
          <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
            Progress
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        {/* Current Streak */}
        <View className="flex-1 items-center mr-2">
          <View
            style={{ backgroundColor: theme.primary + '20' }}
            className="p-3 rounded-xl w-full items-center"
          >
            <Flame size={24} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mt-1">
              {streakData.current_streak}
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
              Day Streak
            </Text>
          </View>
        </View>

        {/* Days Clean */}
        <View className="flex-1 items-center mx-1">
          <View
            style={{ backgroundColor: theme.status.success + '20' }}
            className="p-3 rounded-xl w-full items-center"
          >
            <Calendar size={24} color={theme.status.success} />
            <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mt-1">
              {streakData.days_clean}
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
              Days Clean
            </Text>
          </View>
        </View>

        {/* Longest Streak */}
        <View className="flex-1 items-center ml-2">
          <View
            style={{ backgroundColor: theme.status.warning + '20' }}
            className="p-3 rounded-xl w-full items-center"
          >
            <Trophy size={24} color={theme.status.warning} />
            <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mt-1">
              {streakData.longest_streak}
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
              Best Streak
            </Text>
          </View>
        </View>
      </View>

      {streakData.days_clean > 0 && (
        <View className="mt-3 pt-3" style={{ borderTopColor: theme.base.border, borderTopWidth: 1 }}>
          <Text style={{ color: theme.text.secondary }} className="text-xs text-center">
            Clean for {formatDays(streakData.days_clean)}
          </Text>
        </View>
      )}
    </View>
  );
}

