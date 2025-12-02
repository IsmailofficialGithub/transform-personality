import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/useAuthStore';
import { useTheme } from '../../hooks/useTheme';
import { User, Calendar, Target, Plus } from 'lucide-react-native';

const HABIT_TYPES = [
  { value: 'smoking', label: 'Smoking' },
  { value: 'pornography', label: 'Pornography' },
  { value: 'alcohol', label: 'Alcohol' },
  { value: 'drugs', label: 'Drugs' },
  { value: 'gambling', label: 'Gambling' },
  { value: 'social_media', label: 'Social Media' },
  { value: 'gaming', label: 'Gaming' },
];

export default function Onboarding() {
  const router = useRouter();
  const theme = useTheme();
  const { user, fetchProfile } = useAuthStore();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say' | ''>('');
  const [age, setAge] = useState('');
  const [selectedHabits, setSelectedHabits] = useState<string[]>([]);
  const [customHabit, setCustomHabit] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGenderSelect = (value: typeof gender) => {
    setGender(value);
  };

  const toggleHabit = (habitType: string) => {
    if (habitType === 'custom') {
      setShowCustomInput(!showCustomInput);
      return;
    }
    if (selectedHabits.includes(habitType)) {
      setSelectedHabits(selectedHabits.filter(h => h !== habitType));
    } else {
      setSelectedHabits([...selectedHabits, habitType]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !gender) {
      Alert.alert('Please select your gender');
      return;
    }
    if (step === 2 && (!age || parseInt(age) < 13 || parseInt(age) > 120)) {
      Alert.alert('Please enter a valid age (13-120)');
      return;
    }
    if (step === 3 && selectedHabits.length === 0 && !customHabit) {
      Alert.alert('Please select at least one habit or add a custom one');
      return;
    }
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setLoading(true);
    try {
      // Check if profile already exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id, username')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingProfile) {
        // Profile exists, just update it (username already set by trigger)
        // No update needed for now, but we can add fields here later
      } else {
        // Profile doesn't exist, create it with required username
        const username = `user_${user.id.substring(0, 8)}`;
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            username: username,
            // Note: gender and age fields may need to be added to user_profiles schema
          });

        if (profileError) throw profileError;
      }

      // Create habits (using simplified schema from OPTIMIZED_SCHEMA)
      const habitsToCreate = selectedHabits.map(habitType => ({
        user_id: user.id,
        name: HABIT_TYPES.find(h => h.value === habitType)?.label || habitType,
        description: `Tracking ${HABIT_TYPES.find(h => h.value === habitType)?.label || habitType}`,
        is_active: true,
      }));

      if (customHabit) {
        habitsToCreate.push({
          user_id: user.id,
          name: customHabit,
          description: `Tracking ${customHabit}`,
          is_active: true,
        });
      }

      if (habitsToCreate.length > 0) {
        const { error: habitsError } = await supabase
          .from('habits')
          .insert(habitsToCreate);

        if (habitsError) throw habitsError;
      }

      await fetchProfile();
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete setup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top', 'bottom']}>
      <ScrollView className="flex-1 p-6" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Progress Indicator */}
        <View className="flex-row mb-8">
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={{
                flex: 1,
                height: 4,
                backgroundColor: s <= step ? theme.primary : theme.base.border,
                marginHorizontal: 2,
                borderRadius: 2,
              }}
            />
          ))}
        </View>

        {/* Step 1: Gender */}
        {step === 1 && (
          <View>
            <View className="items-center mb-8">
              <View
                style={{ backgroundColor: theme.primary + '20' }}
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
              >
                <User size={32} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mb-2">
                Tell us about yourself
              </Text>
              <Text style={{ color: theme.text.secondary }} className="text-center">
                We'll use this to personalize your experience
              </Text>
            </View>

            <Text style={{ color: theme.text.primary }} className="text-lg font-semibold mb-4">
              What's your gender?
            </Text>

            {[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
              { value: 'prefer_not_to_say', label: 'Prefer not to say' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => handleGenderSelect(option.value as any)}
                style={{
                  backgroundColor: gender === option.value ? theme.primary : theme.base.card,
                  borderColor: gender === option.value ? theme.primary : theme.base.border,
                  borderWidth: 2,
                }}
                className="p-4 rounded-xl mb-3"
              >
                <Text
                  style={{
                    color: gender === option.value ? theme.text.inverse : theme.text.primary,
                  }}
                  className="text-center font-semibold"
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Step 2: Age */}
        {step === 2 && (
          <View>
            <View className="items-center mb-8">
              <View
                style={{ backgroundColor: theme.primary + '20' }}
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
              >
                <Calendar size={32} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mb-2">
                How old are you?
              </Text>
              <Text style={{ color: theme.text.secondary }} className="text-center">
                This helps us provide age-appropriate content
              </Text>
            </View>

            <TextInput
              style={{
                backgroundColor: theme.base.card,
                borderColor: theme.base.border,
                color: theme.text.primary,
              }}
              className="w-full border-2 rounded-xl p-4 text-lg mb-4"
              placeholder="Enter your age"
              placeholderTextColor={theme.text.tertiary}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>
        )}

        {/* Step 3: Habits */}
        {step === 3 && (
          <View>
            <View className="items-center mb-8">
              <View
                style={{ backgroundColor: theme.primary + '20' }}
                className="w-16 h-16 rounded-full items-center justify-center mb-4"
              >
                <Target size={32} color={theme.primary} />
              </View>
              <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mb-2">
                What habits do you want to break?
              </Text>
              <Text style={{ color: theme.text.secondary }} className="text-center">
                Select all that apply. You can add more later.
              </Text>
            </View>

            <View className="flex-row flex-wrap mb-4">
              {HABIT_TYPES.map((habit) => (
                <TouchableOpacity
                  key={habit.value}
                  onPress={() => toggleHabit(habit.value)}
                  style={{
                    backgroundColor: selectedHabits.includes(habit.value)
                      ? theme.primary
                      : theme.base.card,
                    borderColor: selectedHabits.includes(habit.value)
                      ? theme.primary
                      : theme.base.border,
                    borderWidth: 2,
                  }}
                  className="p-3 rounded-lg mr-2 mb-2"
                >
                  <Text
                    style={{
                      color: selectedHabits.includes(habit.value)
                        ? theme.text.inverse
                        : theme.text.primary,
                    }}
                    className="font-medium"
                  >
                    {habit.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => toggleHabit('custom')}
              style={{
                backgroundColor: showCustomInput ? theme.primary : theme.base.card,
                borderColor: showCustomInput ? theme.primary : theme.base.border,
                borderWidth: 2,
              }}
              className="p-4 rounded-xl mb-4 flex-row items-center justify-center"
            >
              <Plus
                size={20}
                color={showCustomInput ? theme.text.inverse : theme.text.primary}
              />
              <Text
                style={{
                  color: showCustomInput ? theme.text.inverse : theme.text.primary,
                }}
                className="ml-2 font-semibold"
              >
                Add Custom Habit
              </Text>
            </TouchableOpacity>

            {showCustomInput && (
              <TextInput
                style={{
                  backgroundColor: theme.base.card,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="w-full border-2 rounded-xl p-4 mb-4"
                placeholder="Enter custom habit name"
                placeholderTextColor={theme.text.tertiary}
                value={customHabit}
                onChangeText={setCustomHabit}
              />
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={handleNext}
          disabled={loading}
          style={{ backgroundColor: theme.primary }}
          className="p-4 rounded-xl mt-6"
        >
          <Text style={{ color: theme.text.inverse }} className="text-center font-bold text-lg">
            {loading ? 'Setting up...' : step === 3 ? 'Complete Setup' : 'Next'}
          </Text>
        </TouchableOpacity>

        {step > 1 && (
          <TouchableOpacity
            onPress={() => setStep(step - 1)}
            className="mt-4"
          >
            <Text style={{ color: theme.text.secondary }} className="text-center">
              Back
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

