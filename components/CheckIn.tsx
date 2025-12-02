import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import { useTheme } from '../hooks/useTheme';
import { CheckCircle } from 'lucide-react-native';

export default function CheckIn() {
  const theme = useTheme();
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  async function handleCheckIn() {
    if (!user) return;
    if (!mood.trim()) {
      Alert.alert('Error', 'Please enter how you\'re feeling');
      return;
    }
    setLoading(true);
    const { error } = await supabase.from('checkins').insert({
      user_id: user.id,
      mood,
    });
    setLoading(false);
    if (!error) {
      setMood('');
      Alert.alert('Success', 'Checked in successfully!');
    } else {
      Alert.alert('Error', error.message);
    }
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
      <TextInput
        style={{
          backgroundColor: theme.base.card,
          borderColor: theme.base.border,
          color: theme.text.primary,
        }}
        className="p-3 rounded-xl border-2 mb-3"
        placeholder="How are you feeling today?"
        placeholderTextColor={theme.text.tertiary}
        value={mood}
        onChangeText={setMood}
        multiline
        numberOfLines={3}
      />
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
