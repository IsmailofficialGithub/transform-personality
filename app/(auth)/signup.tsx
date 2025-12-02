import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { supabase } from '../../services/supabase';
import { useTheme } from '../../hooks/useTheme';
import { Mail, Lock, UserPlus } from 'lucide-react-native';

export default function SignUp() {
  const router = useRouter();
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      Alert.alert('Error', error.message);
      setLoading(false);
    } else if (data.user) {
      // Profile is automatically created by trigger on_auth_user_created
      // No manual insert needed
      // Redirect to onboarding
      router.replace('/(auth)/onboarding');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top', 'bottom']}>
      <View style={{ flex: 1 }} className="justify-center p-6">
      <View className="items-center mb-8">
        <View
          style={{ backgroundColor: theme.primary + '20' }}
          className="w-20 h-20 rounded-full items-center justify-center mb-4"
        >
          <UserPlus size={40} color={theme.primary} />
        </View>
        <Text style={{ color: theme.text.primary }} className="text-3xl font-bold mb-2">
          Create Account
        </Text>
        <Text style={{ color: theme.text.secondary }} className="text-center">
          Start your journey to a better you
        </Text>
      </View>

      <View className="mb-4">
        <View className="flex-row items-center mb-2">
          <Mail size={20} color={theme.text.secondary} />
          <Text style={{ color: theme.text.secondary }} className="ml-2 font-medium">
            Email
          </Text>
        </View>
        <TextInput
          style={{
            backgroundColor: theme.base.card,
            borderColor: theme.base.border,
            color: theme.text.primary,
          }}
          className="w-full border-2 rounded-xl p-4"
          placeholder="Enter your email"
          placeholderTextColor={theme.text.tertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
        />
      </View>

      <View className="mb-6">
        <View className="flex-row items-center mb-2">
          <Lock size={20} color={theme.text.secondary} />
          <Text style={{ color: theme.text.secondary }} className="ml-2 font-medium">
            Password
          </Text>
        </View>
        <TextInput
          style={{
            backgroundColor: theme.base.card,
            borderColor: theme.base.border,
            color: theme.text.primary,
          }}
          className="w-full border-2 rounded-xl p-4"
          placeholder="Create a password"
          placeholderTextColor={theme.text.tertiary}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
        />
      </View>

      <TouchableOpacity
        onPress={signUpWithEmail}
        disabled={loading}
        style={{ backgroundColor: theme.primary }}
        className="w-full p-4 rounded-xl items-center mb-4"
      >
        <Text style={{ color: theme.text.inverse }} className="font-bold text-lg">
          {loading ? 'Creating Account...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <Link href="/login" asChild>
        <TouchableOpacity>
          <Text style={{ color: theme.primary }} className="text-center font-medium">
            Already have an account? Sign In
          </Text>
        </TouchableOpacity>
      </Link>
      </View>
    </SafeAreaView>
  );
}
