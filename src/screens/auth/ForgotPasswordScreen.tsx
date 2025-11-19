import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { Button as CustomButton } from '../../components/common/Button';

interface ForgotPasswordScreenProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordScreen = ({
  onBackToLogin,
}: ForgotPasswordScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBackToLogin} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.logo}>🔑</Text>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>
          {sent ? 'Check your email!' : 'Enter your email to reset password'}
        </Text>
      </LinearGradient>

      {/* Body */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.form}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {sent ? (
            <View
              style={[
                styles.successCard,
                {
                  backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={styles.successIcon}>✅</Text>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Email Sent!
              </Text>
              <Text style={[styles.successText, { color: colors.textSecondary }]}>
                We've sent password reset instructions to {email}. Please check
                your inbox and follow the link to reset your password.
              </Text>

              <CustomButton
                title="Back to Login"
                onPress={onBackToLogin}
                style={styles.button}
              />
            </View>
          ) : (
            <>
              {/* Email Input */}
              <View
                style={[
                  styles.inputContainer,
                  {
                    backgroundColor: isDark ? '#1E1E1E' : '#F8F8F8',
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Reset Button */}
              <CustomButton
                title={loading ? 'Sending...' : 'Send Reset Link'}
                onPress={handleResetPassword}
                disabled={loading}
                style={styles.button}
              />

              {/* Back to Login */}
              <TouchableOpacity onPress={onBackToLogin} style={styles.backLink}>
                <Text
                  style={[styles.backLinkText, { color: colors.textSecondary }]}
                >
                  Remember your password?{' '}
                  <Text
                    style={{
                      color: colors.primary,
                      fontWeight: 'bold',
                    }}
                  >
                    Login
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    padding: SIZES.paddingLarge,
    paddingTop: SIZES.paddingLarge + 40,
    paddingBottom: SIZES.paddingLarge * 2,
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: SIZES.paddingLarge + 40,
    left: SIZES.padding,
  },
  backText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  logo: {
    fontSize: 80,
    marginBottom: SIZES.margin,
  },
  title: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: SIZES.body,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },

  form: { flex: 1, marginTop: -SIZES.paddingLarge },
  scrollContent: { padding: SIZES.padding },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.radius,
    borderWidth: 1,
    paddingHorizontal: SIZES.padding,
    marginBottom: SIZES.margin,
  },
  inputIcon: { fontSize: 22, marginRight: SIZES.marginSmall },
  input: {
    flex: 1,
    paddingVertical: SIZES.padding,
    fontSize: SIZES.body,
  },

  button: {
    marginTop: SIZES.margin,
    marginBottom: SIZES.marginLarge,
  },
  backLink: {
    alignItems: 'center',
  },
  backLinkText: {
    fontSize: SIZES.body,
  },

  successCard: {
    padding: SIZES.paddingLarge,
    borderRadius: SIZES.radiusLarge,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: SIZES.marginLarge,
  },
  successIcon: {
    fontSize: 80,
    marginBottom: SIZES.margin,
  },
  successTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  successText: {
    fontSize: SIZES.body,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: SIZES.marginLarge,
  },
});
