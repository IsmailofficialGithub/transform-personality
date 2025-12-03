import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Habit, QuitPlan, DailyRoutine, Challenge, PersonalizedTask } from '../../types';
import { supabase } from '../../services/supabase';
import { Target, Calendar, Award, CheckCircle } from 'lucide-react-native';

interface PlanOverviewProps {
  habit: Habit;
}

export default function PlanOverview({ habit }: PlanOverviewProps) {
  const theme = useTheme();
  const [plan, setPlan] = useState<QuitPlan | null>(null);
  const [routines, setRoutines] = useState<DailyRoutine[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [tasks, setTasks] = useState<PersonalizedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlan();
  }, [habit.id]);

  async function loadPlan() {
    setLoading(true);
    try {
      const { data: planData } = await supabase
        .from('quit_plans')
        .select('*')
        .eq('habit_id', habit.id)
        .eq('is_active', true)
        .maybeSingle();

      if (planData) {
        setPlan(planData as QuitPlan);
        
        const [routinesData, challengesData, tasksData] = await Promise.all([
          supabase.from('daily_routines').select('*').eq('plan_id', planData.id),
          supabase.from('challenges').select('*').eq('plan_id', planData.id),
          supabase.from('personalized_tasks').select('*').eq('plan_id', planData.id),
        ]);

        setRoutines((routinesData.data as DailyRoutine[]) || []);
        setChallenges((challengesData.data as Challenge[]) || []);
        setTasks((tasksData.data as PersonalizedTask[]) || []);
      }
    } catch (error) {
      console.error('Error loading plan:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View className="p-4 items-center">
        <ActivityIndicator size="small" color={theme.primary} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View
        style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
        className="p-4 rounded-xl border"
      >
        <Text style={{ color: theme.text.secondary }} className="text-center">
          No personalized plan yet. Complete the questionnaire to generate your plan.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border"
    >
      <View className="flex-row items-center mb-4">
        <Target size={20} color={theme.primary} />
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
          Your Personalized Plan
        </Text>
      </View>

      {plan.plan_description && (
        <Text style={{ color: theme.text.secondary }} className="text-sm mb-4">
          {plan.plan_description}
        </Text>
      )}

      {/* Daily Routines */}
      {routines.length > 0 && (
        <View className="mb-4">
          <Text style={{ color: theme.text.primary }} className="font-bold mb-2">
            Daily Routines
          </Text>
          {routines.map((routine) => (
            <View
              key={routine.id}
              style={{ backgroundColor: theme.base.surface }}
              className="p-3 rounded-lg mb-2"
            >
              <Text style={{ color: theme.text.primary }} className="font-medium">
                {routine.task_title}
              </Text>
              {routine.task_description && (
                <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                  {routine.task_description}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Challenges */}
      {challenges.length > 0 && (
        <View className="mb-4">
          <Text style={{ color: theme.text.primary }} className="font-bold mb-2">
            Challenges
          </Text>
          {challenges.map((challenge) => (
            <View
              key={challenge.id}
              style={{ backgroundColor: theme.base.surface }}
              className="p-3 rounded-lg mb-2"
            >
              <Text style={{ color: theme.text.primary }} className="font-medium">
                {challenge.challenge_name}
              </Text>
              <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                {challenge.duration_days} days • {challenge.progress_percentage}% complete
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <View>
          <Text style={{ color: theme.text.primary }} className="font-bold mb-2">
            Personalized Tasks
          </Text>
          {tasks.map((task) => (
            <View
              key={task.id}
              style={{ backgroundColor: theme.base.surface }}
              className="p-3 rounded-lg mb-2 flex-row items-center"
            >
              <CheckCircle
                size={20}
                color={task.is_completed ? theme.status.success : theme.text.tertiary}
              />
              <View className="ml-2 flex-1">
                <Text style={{ color: theme.text.primary }} className="font-medium">
                  {task.task_title}
                </Text>
                {task.task_description && (
                  <Text style={{ color: theme.text.secondary }} className="text-xs mt-1">
                    {task.task_description}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

