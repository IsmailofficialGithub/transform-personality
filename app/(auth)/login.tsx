import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Welcome Back</Text>
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-4"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        className="w-full border border-gray-300 rounded-lg p-3 mb-6"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        className="w-full bg-blue-600 p-3 rounded-lg items-center"
        onPress={signInWithEmail}
        disabled={loading}
      >
        <Text className="text-white font-bold">{loading ? 'Loading...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <Link href="/signup" asChild>
        <TouchableOpacity className="mt-4">
          <Text className="text-blue-600">Don't have an account? Sign Up</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
