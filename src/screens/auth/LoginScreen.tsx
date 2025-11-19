import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';
import { Button as CustomButton } from '../../components/common/Button';

interface LoginScreenProps {
  onLogin: () => void;
  onSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginScreen = ({
  onLogin,
  onSignUp,
  onForgotPassword,
}: LoginScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const { signIn, user, loading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      }, 1800);
    });
  };

  // 🔐 Login handler using Zustand Auth Store
  const handleLogin = async () => {
    console.log('Button click');
    if (!email || !password) {
      showPopup('error', 'Please enter both email and password.');
      return;
    }

    try {
      await signIn(email, password);
      const currentUser = useAuthStore.getState().user;
      console.log('User after login:', currentUser);

      if (currentUser) {
        showPopup('success', `Welcome back, ${currentUser.full_name || 'User'} 🌟`);
        setTimeout(onLogin, 1200);
      } else {
        showPopup('error', 'Invalid credentials. Please try again.');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      showPopup('error', error.message || 'Something went wrong.');
    }
  };

  return (
    <LinearGradient
      colors={isDark ? ['#1e1e2f', '#141414'] : ['#f7f8fa', '#e9eef3']}
      style={styles.container}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>🌱</Text>
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Transform</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            Grow every day with mindful habits
          </Text>
        </View>

        {/* Login Form */}
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
            placeholder="Email"
            placeholderTextColor={colors.textSecondary}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />

          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border }]}
            placeholder="Password"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity onPress={onForgotPassword} style={styles.forgotContainer}>
            <Text style={[styles.forgotText, { color: colors.primary }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <CustomButton
            title={loading ? 'Logging in...' : 'Login'}
            onPress={handleLogin}
            disabled={loading}
            style={styles.loginButton}
          />

          <View style={styles.signupRow}>
            <Text style={[styles.signupText, { color: colors.textSecondary }]}>
              Don’t have an account?
            </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={[styles.signupLink, { color: colors.primary }]}> Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  content: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  header: { alignItems: 'center', marginBottom: 40 },
  logoContainer: {
    backgroundColor: '#fff',
    borderRadius: 60,
    padding: 15,
    marginBottom: 10,
    elevation: 4,
  },
  logo: { fontSize: 50 },
  appName: { fontSize: 34, fontWeight: '700' },
  tagline: { fontSize: 15, marginTop: 4 },
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
  forgotContainer: { alignSelf: 'flex-end', marginBottom: 20 },
  forgotText: { fontWeight: '600', fontSize: 14 },
  loginButton: { marginBottom: 20 },
  signupRow: { flexDirection: 'row', justifyContent: 'center' },
  signupText: { fontSize: 15 },
  signupLink: { fontWeight: 'bold' },
  popup: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    elevation: 5,
  },
  popupText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
