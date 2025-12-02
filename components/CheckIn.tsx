import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../stores/useAuthStore';

export default function CheckIn() {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();

  async function handleCheckIn() {
    if (!user) return;
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
    <View className="bg-gray-100 p-4 rounded-lg my-4 w-full">
      <Text className="text-lg font-bold mb-2">Daily Check-in</Text>
      <TextInput
        className="bg-white p-2 rounded border border-gray-300 mb-2"
        placeholder="How are you feeling?"
        value={mood}
        onChangeText={setMood}
      />
      <TouchableOpacity
        className="bg-blue-500 p-2 rounded items-center"
        onPress={handleCheckIn}
        disabled={loading}
      >
        <Text className="text-white font-bold">{loading ? 'Checking in...' : 'Check In'}</Text>
      </TouchableOpacity>
    </View>
  );
}
