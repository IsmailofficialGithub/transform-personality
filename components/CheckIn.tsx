import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { CheckCircle, Smile, Frown, Meh } from 'lucide-react-native';
import { Habit } from '../types';
import { updateStreakCounters } from '../services/streakService';
import { awardCoins } from '../services/rewardsService';

interface CheckInProps {
  habitId?: string;
  onCheckInComplete?: () => void;
}

export default function CheckIn({ habitId, onCheckInComplete }: CheckInProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [selectedHabitId, setSelectedHabitId] = useState<string | undefined>(habitId);
  const [mood, setMood] = useState<number | undefined>(undefined);
  const [cravingIntensity, setCravingIntensity] = useState<number>(0);
  const [reflectionNote, setReflectionNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchHabits();
    }
  }, [user]);

  useEffect(() => {
    if (habitId) {
      setSelectedHabitId(habitId);
    } else if (habits.length === 1) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habitId, habits]);

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
  }

  async function handleCheckIn() {
    if (!user) return;
    if (!selectedHabitId) {
      Alert.alert('Error', 'Please select a habit');
      return;
    }
    if (mood === undefined) {
      Alert.alert('Error', 'Please select your mood');
      return;
    }

    setLoading(true);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Check if check-in already exists for today
    const { data: existing } = await supabase
      .from('habit_checkins')
      .select('id')
      .eq('user_id', user.id)
      .eq('habit_id', selectedHabitId)
      .eq('date', today)
      .maybeSingle();

    const checkInData = {
      user_id: user.id,
      habit_id: selectedHabitId,
      date: today,
      status: 'success' as const,
      mood: mood,
      craving_intensity: cravingIntensity,
      reflection_note: reflectionNote.trim() || null,
    };

    let error;
    if (existing) {
      // Update existing check-in
      const { error: updateError } = await supabase
        .from('habit_checkins')
        .update(checkInData)
        .eq('id', existing.id);
      error = updateError;
    } else {
      // Insert new check-in
      const { error: insertError } = await supabase
        .from('habit_checkins')
        .insert(checkInData);
      error = insertError;
    }

    setLoading(false);

    if (!error) {
      // Update streak counters
      const selectedHabit = habits.find(h => h.id === selectedHabitId);
      if (selectedHabit) {
        await updateStreakCounters(user.id, selectedHabitId, selectedHabit.quit_date);
        
        // Award coins for daily check-in (only if it's a new check-in, not an update)
        if (!existing) {
          await awardCoins(user.id, 10, 'Daily check-in');
        }
      }

      // Reset form
      setMood(undefined);
      setCravingIntensity(0);
      setReflectionNote('');
      
      Alert.alert('Success', 'Checked in successfully!');
      onCheckInComplete?.();
    } else {
      Alert.alert('Error', error.message);
    }
  }

  const MoodButton = ({ value, icon: Icon, label }: { value: number; icon: any; label: string }) => (
    <TouchableOpacity
      onPress={() => setMood(value)}
      style={{
        backgroundColor: mood === value ? theme.primary : theme.base.card,
        borderColor: mood === value ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="flex-1 p-3 rounded-xl items-center mx-1"
    >
      <Icon size={24} color={mood === value ? theme.text.inverse : theme.text.secondary} />
      <Text
        style={{ color: mood === value ? theme.text.inverse : theme.text.secondary }}
        className="text-xs mt-1 font-medium"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SliderButton = ({ value, label }: { value: number; label: string }) => (
    <TouchableOpacity
      onPress={() => setCravingIntensity(value)}
      style={{
        backgroundColor: cravingIntensity === value ? theme.primary : theme.base.card,
        borderColor: cravingIntensity === value ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="w-10 h-10 rounded-full items-center justify-center mr-2"
    >
      <Text
        style={{ color: cravingIntensity === value ? theme.text.inverse : theme.text.secondary }}
        className="text-xs font-bold"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  if (habits.length === 0) {
    return (
      <View
        style={{ backgroundColor: theme.base.surface }}
        className="p-4 rounded-xl my-4 w-full"
      >
        <Text style={{ color: theme.text.secondary }} className="text-center">
          No active habits found. Please create a habit first.
        </Text>
      </View>
    );
  }

  return (
    <View
      style={{ backgroundColor: theme.base.surface }}
      className="p-4 rounded-xl my-4 w-full"
    >
      <View className="flex-row items-center mb-3">
        <CheckCircle size={20} color={theme.primary} />
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
          Daily Check-in
        </Text>
      </View>

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
                onPress={() => setSelectedHabitId(habit.id)}
                style={{
                  backgroundColor: selectedHabitId === habit.id ? theme.primary : theme.base.card,
                  borderColor: selectedHabitId === habit.id ? theme.primary : theme.base.border,
                  borderWidth: 2,
                }}
                className="px-4 py-2 rounded-full mr-2"
              >
                <Text
                  style={{
                    color: selectedHabitId === habit.id ? theme.text.inverse : theme.text.primary,
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

      {/* Mood Scale */}
      <View className="mb-4">
        <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
          How are you feeling? (1-5)
        </Text>
        <View className="flex-row">
          <MoodButton value={1} icon={Frown} label="1" />
          <MoodButton value={2} icon={Meh} label="2" />
          <MoodButton value={3} icon={Meh} label="3" />
          <MoodButton value={4} icon={Smile} label="4" />
          <MoodButton value={5} icon={Smile} label="5" />
        </View>
      </View>

      {/* Craving Intensity Slider */}
      <View className="mb-4">
        <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
          Craving Intensity: {cravingIntensity}/10
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 4 }}
        >
          <View className="flex-row items-center">
            <SliderButton value={0} label="0" />
            <SliderButton value={1} label="1" />
            <SliderButton value={2} label="2" />
            <SliderButton value={3} label="3" />
            <SliderButton value={4} label="4" />
            <SliderButton value={5} label="5" />
            <SliderButton value={6} label="6" />
            <SliderButton value={7} label="7" />
            <SliderButton value={8} label="8" />
            <SliderButton value={9} label="9" />
            <SliderButton value={10} label="10" />
          </View>
        </ScrollView>
      </View>

      {/* Reflection Note */}
      <View className="mb-4">
        <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
          What triggered cravings today?
        </Text>
        <TextInput
          style={{
            backgroundColor: theme.base.card,
            borderColor: theme.base.border,
            color: theme.text.primary,
          }}
          className="p-3 rounded-xl border-2"
          placeholder="Optional: Reflect on what triggered cravings..."
          placeholderTextColor={theme.text.tertiary}
          value={reflectionNote}
          onChangeText={setReflectionNote}
          multiline
          numberOfLines={3}
        />
      </View>

      <TouchableOpacity
        style={{ backgroundColor: theme.primary }}
        className="p-3 rounded-xl items-center"
        onPress={handleCheckIn}
        disabled={loading}
      >
        <Text style={{ color: theme.text.inverse }} className="font-bold">
          {loading ? 'Checking in...' : 'Check In'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
