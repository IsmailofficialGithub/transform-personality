import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';

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
  const [popup, setPopup] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const fadeAnim = new Animated.Value(0);

  // Smooth popup animation
  const showPopup = (type: 'success' | 'error', message: string) => {
    setPopup({ type, message });
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setPopup(null));
      }, 2000);
    });
  };

  const handleSignup = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      showPopup('error', 'Please fill in all fields');
      return;
    }
    if (!email.includes('@')) {
      showPopup('error', 'Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      showPopup('error', 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showPopup('error', 'Passwords do not match');
      return;
    }

    try {
      // Call Supabase signup through Zustand store
      await signUp(email, password, name);
      
      showPopup('success', 'Account created successfully! 🎉');
      
      // AuthNavigator will handle navigation via useEffect
      // No need to call onSignup() - user state will trigger navigation
    } catch (error: any) {
      console.error('Signup error:', error);
      
      // Handle specific Supabase errors
      if (error.message?.includes('already registered')) {
        showPopup('error', 'This email is already registered');
      } else if (error.message?.includes('Email confirmation')) {
        showPopup('success', 'Please check your email to confirm your account');
        setTimeout(onBackToLogin, 2000);
      } else {
        showPopup('error', error.message || 'Signup failed. Please try again.');
      }
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

      {/* Popup Notification */}
      {popup && (
        <Animated.View
          style={[
            styles.popup,
            {
              backgroundColor: popup.type === 'success' ? '#4CAF50' : '#E53935',
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={styles.popupText}>{popup.message}</Text>
        </Animated.View>
      )}
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
  popup: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  popupText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: '600' 
  },
});