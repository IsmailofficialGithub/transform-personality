import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../services/supabase';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) Alert.alert(error.message);
    else Alert.alert('Check your inbox for email verification!');
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-6">Create Account</Text>
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
        className="w-full bg-green-600 p-3 rounded-lg items-center"
        onPress={signUpWithEmail}
        disabled={loading}
      >
        <Text className="text-white font-bold">{loading ? 'Loading...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <Link href="/login" asChild>
        <TouchableOpacity className="mt-4">
          <Text className="text-blue-600">Already have an account? Sign In</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
