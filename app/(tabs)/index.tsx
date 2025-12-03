import { AlertCircle, Award, LogOut } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CheckIn from '../../components/CheckIn';
import CravingLogger from '../../components/CravingLogger';
import PatternAnalysis from '../../components/PatternAnalysis';
import Rewards from '../../components/Rewards';
import StreakDisplay from '../../components/StreakDisplay';
import HardcoreModeSettings from '../../components/HardcoreModeSettings';
import UrgeBlocker from '../../components/UrgeBlocker';
import PlanOverview from '../../components/QuitPlan/PlanOverview';
import FinancialTracker from '../../components/FinancialTracker';
import { useTheme } from '../../hooks/useTheme';
import { checkMilestoneBadges } from '../../services/rewardsService';
import { checkAndAwardMilestones } from '../../services/streakService';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/useAuthStore';
import { Habit, Milestone } from '../../types';

export default function Dashboard() {
  const theme = useTheme();
  const { signOut, user, profile } = useAuthStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
  const [showCravingLogger, setShowCravingLogger] = useState(false);
  const [showUrgeBlocker, setShowUrgeBlocker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [milestones, setMilestones] = useState<Milestone[]>([]);

  useEffect(() => {
    if (user) {
      fetchHabits();
      fetchMilestones();
    }
  }, [user]);

  async function fetchHabits() {
    if (!user) return;
    const { data, error } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (!error && data) {
      const habitsData = data as Habit[];
      setHabits(habitsData);
      if (habitsData.length > 0 && !selectedHabit) {
        setSelectedHabit(habitsData[0]);
      }
    }
    setLoading(false);
  }

  async function fetchMilestones() {
    if (!user) return;
    const { data, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('user_id', user.id)
      .order('days_count', { ascending: false })
      .limit(5);

    if (!error && data) {
      setMilestones(data as Milestone[]);
    }
  }

  async function handleCheckInComplete() {
    if (selectedHabit && user) {
      // Check for new milestones
      const newMilestones = await checkAndAwardMilestones(
        user.id,
        selectedHabit.id,
        calculateDaysClean(selectedHabit.quit_date)
      );

      if (newMilestones.length > 0) {
        // Award badges for milestones
        for (const milestone of newMilestones) {
          await checkMilestoneBadges(user.id, selectedHabit.id, milestone);
        }
        // Refresh milestones
        await fetchMilestones();
      }
    }
    // Refresh habits to update streak data
    await fetchHabits();
  }

  const calculateDaysClean = (quitDate: string) => {
    const quit = new Date(quitDate);
    const now = new Date();
    quit.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    const diffTime = now.getTime() - quit.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
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
          <>
            {/* Habit Selection */}
            {habits.length > 1 && (
              <View className="mb-4">
                <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                  Select Habit
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {habits.map((habit) => (
                    <TouchableOpacity
                      key={habit.id}
                      onPress={() => setSelectedHabit(habit)}
                      style={{
                        backgroundColor:
                          selectedHabit?.id === habit.id ? theme.primary : theme.base.card,
                        borderColor:
                          selectedHabit?.id === habit.id ? theme.primary : theme.base.border,
                        borderWidth: 2,
                      }}
                      className="px-4 py-2 rounded-full mr-2"
                    >
                      <Text
                        style={{
                          color:
                            selectedHabit?.id === habit.id
                              ? theme.text.inverse
                              : theme.text.primary,
                        }}
                        className="font-medium"
                      >
                        {habit.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Selected Habit Details */}
            {selectedHabit && (
              <>
                {/* Streak Display */}
                <StreakDisplay habit={selectedHabit} />

                {/* Recent Milestones */}
                {milestones.length > 0 && (
                  <View
                    style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
                    className="p-4 rounded-xl border mb-3"
                  >
                    <View className="flex-row items-center mb-3">
                      <Award size={20} color={theme.primary} />
                      <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
                        Recent Milestones
                      </Text>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {milestones
                        .filter((m) => m.habit_id === selectedHabit.id)
                        .slice(0, 5)
                        .map((milestone) => (
                          <View
                            key={milestone.id}
                            style={{
                              backgroundColor: theme.base.surface,
                              borderColor: theme.base.border,
                            }}
                            className="px-4 py-3 rounded-xl border mr-2 min-w-[120px] items-center"
                          >
                            <Text
                              style={{ color: theme.primary }}
                              className="text-2xl font-bold"
                            >
                              {milestone.days_count}
                            </Text>
                            <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                              {milestone.milestone_type.replace('_', ' ')}
                            </Text>
                            <Text
                              style={{ color: theme.text.tertiary }}
                              className="text-xs mt-1"
                            >
                              {new Date(milestone.achieved_at).toLocaleDateString()}
                            </Text>
                          </View>
                        ))}
                    </ScrollView>
                  </View>
                )}

                {/* Financial Tracker */}
                <FinancialTracker habit={selectedHabit} />

                {/* Personalized Plan */}
                <PlanOverview habit={selectedHabit} />

                {/* Hardcore Mode Settings */}
                <HardcoreModeSettings
                  habit={selectedHabit}
                  onSettingsChanged={() => fetchHabits()}
                />

                {/* Pattern Analysis Summary */}
                <PatternAnalysis habit={selectedHabit} />

                {/* Rewards Summary */}
                <Rewards habit={selectedHabit} />

                {/* Quick Actions */}
                <View className="flex-row mb-3">
                  <TouchableOpacity
                    onPress={() => setShowCravingLogger(true)}
                    style={{
                      backgroundColor: theme.status.error + '20',
                      borderColor: theme.status.error,
                      borderWidth: 2,
                    }}
                    className="flex-1 p-4 rounded-xl mr-2 flex-row items-center justify-center"
                  >
                    <AlertCircle size={18} color={theme.status.error} />
                    <Text
                      style={{ color: theme.status.error }}
                      className="font-bold ml-2 text-sm"
                    >
                      Log Trigger
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setShowUrgeBlocker(true)}
                    style={{
                      backgroundColor: theme.primary + '20',
                      borderColor: theme.primary,
                      borderWidth: 2,
                    }}
                    className="flex-1 p-4 rounded-xl ml-2 flex-row items-center justify-center"
                  >
                    <AlertCircle size={18} color={theme.primary} />
                    <Text
                      style={{ color: theme.primary }}
                      className="font-bold ml-2 text-sm"
                    >
                      Urge Blocker
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </>
        )}

        {/* Daily Check-in */}
        <CheckIn habitId={selectedHabit?.id} onCheckInComplete={handleCheckInComplete} />

        {/* Sign Out */}
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

      {/* Craving Logger Modal */}
      {selectedHabit && (
        <>
          <CravingLogger
            habit={selectedHabit}
            visible={showCravingLogger}
            onClose={() => setShowCravingLogger(false)}
            onLogComplete={() => {
              setShowCravingLogger(false);
            }}
          />
          <UrgeBlocker
            habit={selectedHabit}
            visible={showUrgeBlocker}
            onClose={() => setShowUrgeBlocker(false)}
          />
        </>
      )}
    </SafeAreaView>
  );
}
