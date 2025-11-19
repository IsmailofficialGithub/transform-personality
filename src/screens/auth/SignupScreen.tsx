import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import Toast from 'react-native-root-toast';

// Stores & Utils
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { SIZES } from '../../utils/theme';

// Components
import { Button as CustomButton } from '../../components/common/Button';

interface SignupScreenProps {
  onSignup: () => void;
  onBackToLogin: () => void;
}

export const SignupScreen = ({ onSignup, onBackToLogin }: SignupScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { signUp, loading } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Toast.show('Please fill in all fields', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
      return;
    }
    if (!email.includes('@')) {
      Toast.show('Please enter a valid email address', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
      return;
    }
    if (password.length < 6) {
      Toast.show('Password must be at least 6 characters', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
      return;
    }
    if (password !== confirmPassword) {
      Toast.show('Passwords do not match', {
        duration: Toast.durations.SHORT,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
      return;
    }

    try {
      // Call Supabase signup through Zustand store
      await signUp(email, password, name);
      
      Toast.show('Account created successfully! 🎉', {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: '#4CAF50',
        textColor: '#FFF',
      });
      
      // AuthNavigator will handle navigation via useEffect
      // No need to call onSignup() - user state will trigger navigation
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase errors
      let errorMessage = 'Signup failed. Please try again.';
      if (error.message?.includes('already registered') || error.message?.includes('already exists')) {
        errorMessage = 'This email is already registered';
      } else if (error.message?.includes('Email confirmation')) {
        Toast.show('Please check your email to confirm your account', {
          duration: Toast.durations.LONG,
          position: Toast.positions.TOP,
          backgroundColor: '#4CAF50',
          textColor: '#FFF',
        });
        setTimeout(onBackToLogin, 2000);
        return;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Toast.show(errorMessage, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        backgroundColor: '#E53935',
        textColor: '#FFF',
      });
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1e1e2f', '#141414'] : ['#f7f8fa', '#e9eef3']}
      style={styles.container}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={onBackToLogin}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <Text style={[styles.backText, { color: colors.primary }]}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Text style={styles.logo}>🌿</Text>
            </View>
            <Text style={[styles.appName, { color: colors.text }]}>Transform</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Join the journey to better habits
            </Text>
          </View>

          {/* Form */}
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: isDark ? '#1e1e1e' : '#fff',
                shadowColor: isDark ? '#000' : '#aaa',
              },
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Full Name"
              placeholderTextColor={colors.textSecondary}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />

            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />

            <CustomButton
              title={loading ? 'Creating Account...' : 'Sign Up'}
              onPress={handleSignup}
              disabled={loading}
              style={styles.signupButton}
            />

            {/* Login Link */}
            <View style={styles.loginRow}>
              <Text style={[styles.loginText, { color: colors.textSecondary }]}>
                Already have an account?
              </Text>
              <TouchableOpacity onPress={onBackToLogin} disabled={loading}>
                <Text style={[styles.loginLink, { color: colors.primary }]}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 15,
    marginBottom: 10,
    elevation: 4,
  },
  logo: { fontSize: 50 },
  appName: { fontSize: 34, fontWeight: '700' },
  subtitle: { fontSize: 15, marginTop: 4, textAlign: 'center' },
  backButton: {
    position: 'absolute',
    top: -10,
    left: 0,
    padding: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  signupButton: {
    marginTop: 10,
    marginBottom: 20,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});