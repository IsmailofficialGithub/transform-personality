import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { AlertCircle, X } from 'lucide-react-native';
import { Habit } from '../types';

interface CravingLoggerProps {
  habit: Habit;
  visible: boolean;
  onClose: () => void;
  onLogComplete?: () => void;
}

export default function CravingLogger({
  habit,
  visible,
  onClose,
  onLogComplete,
}: CravingLoggerProps) {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [triggerType, setTriggerType] = useState<'craving' | 'slip_up' | 'struggle'>('craving');
  const [intensity, setIntensity] = useState<number>(5);
  const [triggerCategory, setTriggerCategory] = useState<
    'time' | 'place' | 'mood' | 'social' | 'stress' | 'boredom' | 'other' | undefined
  >(undefined);
  const [triggerDescription, setTriggerDescription] = useState('');
  const [location, setLocation] = useState('');
  const [moodContext, setMoodContext] = useState<number | undefined>(undefined);
  const [overcame, setOvercame] = useState(true);
  const [copingStrategy, setCopingStrategy] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setTriggerType('craving');
    setIntensity(5);
    setTriggerCategory(undefined);
    setTriggerDescription('');
    setLocation('');
    setMoodContext(undefined);
    setOvercame(true);
    setCopingStrategy('');
    setNotes('');
  };

  async function handleLog() {
    if (!user) return;
    if (!triggerCategory) {
      Alert.alert('Error', 'Please select a trigger category');
      return;
    }

    setLoading(true);

    const now = new Date();
    const timeOfDay = now.toTimeString().split(' ')[0].substring(0, 5); // HH:MM format
    const dayOfWeek = now.getDay(); // 0 = Sunday

    const triggerLogData = {
      user_id: user.id,
      habit_id: habit.id,
      trigger_type: triggerType,
      intensity: intensity,
      trigger_category: triggerCategory,
      trigger_description: triggerDescription.trim() || null,
      location: location.trim() || null,
      mood_context: moodContext || null,
      time_of_day: timeOfDay,
      day_of_week: dayOfWeek,
      overcame: overcame,
      coping_strategy_used: copingStrategy.trim() || null,
      notes: notes.trim() || null,
    };

    const { error } = await supabase.from('trigger_logs').insert(triggerLogData);

    setLoading(false);

    if (!error) {
      resetForm();
      Alert.alert('Success', 'Trigger logged successfully!');
      onLogComplete?.();
      onClose();
    } else {
      Alert.alert('Error', error.message);
    }
  }

  const IntensityButton = ({ value, label }: { value: number; label: string }) => (
    <TouchableOpacity
      onPress={() => setIntensity(value)}
      style={{
        backgroundColor: intensity === value ? theme.primary : theme.base.card,
        borderColor: intensity === value ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="w-10 h-10 rounded-full items-center justify-center mx-1"
    >
      <Text
        style={{ color: intensity === value ? theme.text.inverse : theme.text.secondary }}
        className="text-xs font-bold"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const CategoryButton = ({
    value,
    label,
  }: {
    value: 'time' | 'place' | 'mood' | 'social' | 'stress' | 'boredom' | 'other';
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => setTriggerCategory(value)}
      style={{
        backgroundColor: triggerCategory === value ? theme.primary : theme.base.card,
        borderColor: triggerCategory === value ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="px-4 py-2 rounded-full mr-2 mb-2"
    >
      <Text
        style={{
          color: triggerCategory === value ? theme.text.inverse : theme.text.primary,
        }}
        className="font-medium text-sm"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MoodButton = ({ value, label }: { value: number; label: string }) => (
    <TouchableOpacity
      onPress={() => setMoodContext(value)}
      style={{
        backgroundColor: moodContext === value ? theme.primary : theme.base.card,
        borderColor: moodContext === value ? theme.primary : theme.base.border,
        borderWidth: 2,
      }}
      className="flex-1 p-2 rounded-xl items-center mx-1"
    >
      <Text
        style={{
          color: moodContext === value ? theme.text.inverse : theme.text.secondary,
        }}
        className="text-xs font-medium"
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        className="flex-1 justify-end"
      >
        <View
          style={{ backgroundColor: theme.base.background }}
          className="rounded-t-3xl max-h-[90%]"
        >
          <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: theme.base.border }}>
            <View className="flex-row items-center">
              <AlertCircle size={20} color={theme.primary} />
              <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
                Log {triggerType === 'craving' ? 'Craving' : triggerType === 'slip_up' ? 'Slip-up' : 'Struggle'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4">
            {/* Trigger Type */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Type
              </Text>
              <View className="flex-row">
                <TouchableOpacity
                  onPress={() => setTriggerType('craving')}
                  style={{
                    backgroundColor: triggerType === 'craving' ? theme.primary : theme.base.card,
                    borderColor: triggerType === 'craving' ? theme.primary : theme.base.border,
                    borderWidth: 2,
                  }}
                  className="flex-1 p-3 rounded-xl mr-2 items-center"
                >
                  <Text
                    style={{
                      color: triggerType === 'craving' ? theme.text.inverse : theme.text.primary,
                    }}
                    className="font-medium"
                  >
                    Craving
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTriggerType('struggle')}
                  style={{
                    backgroundColor: triggerType === 'struggle' ? theme.primary : theme.base.card,
                    borderColor: triggerType === 'struggle' ? theme.primary : theme.base.border,
                    borderWidth: 2,
                  }}
                  className="flex-1 p-3 rounded-xl mx-1 items-center"
                >
                  <Text
                    style={{
                      color: triggerType === 'struggle' ? theme.text.inverse : theme.text.primary,
                    }}
                    className="font-medium"
                  >
                    Struggle
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTriggerType('slip_up')}
                  style={{
                    backgroundColor: triggerType === 'slip_up' ? theme.primary : theme.base.card,
                    borderColor: triggerType === 'slip_up' ? theme.primary : theme.base.border,
                    borderWidth: 2,
                  }}
                  className="flex-1 p-3 rounded-xl ml-2 items-center"
                >
                  <Text
                    style={{
                      color: triggerType === 'slip_up' ? theme.text.inverse : theme.text.primary,
                    }}
                    className="font-medium"
                  >
                    Slip-up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Intensity */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Intensity: {intensity}/10
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                    <IntensityButton key={val} value={val} label={val.toString()} />
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Trigger Category */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Trigger Category *
              </Text>
              <View className="flex-row flex-wrap">
                <CategoryButton value="time" label="Time" />
                <CategoryButton value="place" label="Place" />
                <CategoryButton value="mood" label="Mood" />
                <CategoryButton value="social" label="Social" />
                <CategoryButton value="stress" label="Stress" />
                <CategoryButton value="boredom" label="Boredom" />
                <CategoryButton value="other" label="Other" />
              </View>
            </View>

            {/* Trigger Description */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                What triggered this?
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.base.card,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2"
                placeholder="Describe what triggered this..."
                placeholderTextColor={theme.text.tertiary}
                value={triggerDescription}
                onChangeText={setTriggerDescription}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Location */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Location (optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.base.card,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2"
                placeholder="Where were you?"
                placeholderTextColor={theme.text.tertiary}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            {/* Mood Context */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Mood at the time (optional)
              </Text>
              <View className="flex-row">
                <MoodButton value={1} label="1" />
                <MoodButton value={2} label="2" />
                <MoodButton value={3} label="3" />
                <MoodButton value={4} label="4" />
                <MoodButton value={5} label="5" />
              </View>
            </View>

            {/* Overcame */}
            <View className="mb-4">
              <TouchableOpacity
                onPress={() => setOvercame(!overcame)}
                style={{
                  backgroundColor: overcame ? theme.status.success + '20' : theme.base.card,
                  borderColor: overcame ? theme.status.success : theme.base.border,
                  borderWidth: 2,
                }}
                className="p-3 rounded-xl"
              >
                <Text
                  style={{
                    color: overcame ? theme.status.success : theme.text.secondary,
                  }}
                  className="font-medium"
                >
                  {overcame ? '✓ Overcame this trigger' : 'Did not overcome'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Coping Strategy */}
            {overcame && (
              <View className="mb-4">
                <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                  What helped you overcome it?
                </Text>
                <TextInput
                  style={{
                    backgroundColor: theme.base.card,
                    borderColor: theme.base.border,
                    color: theme.text.primary,
                  }}
                  className="p-3 rounded-xl border-2"
                  placeholder="Describe your coping strategy..."
                  placeholderTextColor={theme.text.tertiary}
                  value={copingStrategy}
                  onChangeText={setCopingStrategy}
                  multiline
                  numberOfLines={2}
                />
              </View>
            )}

            {/* Notes */}
            <View className="mb-4">
              <Text style={{ color: theme.text.secondary }} className="text-sm mb-2 font-medium">
                Additional notes (optional)
              </Text>
              <TextInput
                style={{
                  backgroundColor: theme.base.card,
                  borderColor: theme.base.border,
                  color: theme.text.primary,
                }}
                className="p-3 rounded-xl border-2"
                placeholder="Any other thoughts..."
                placeholderTextColor={theme.text.tertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={{ backgroundColor: theme.primary }}
              className="p-4 rounded-xl items-center mb-4"
              onPress={handleLog}
              disabled={loading}
            >
              <Text style={{ color: theme.text.inverse }} className="font-bold text-lg">
                {loading ? 'Logging...' : 'Log Trigger'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

