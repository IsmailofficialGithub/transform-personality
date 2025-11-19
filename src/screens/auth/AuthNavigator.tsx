import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuthStore } from 'src/store/authStore';

// Screens (using absolute aliases)
import { LoginScreen } from '@screens/auth/LoginScreen';
import { SignupScreen } from '@screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '@screens/auth/ForgotPasswordScreen';

type AuthScreen = 'login' | 'signup' | 'forgot';

interface AuthNavigatorProps {
  onAuthSuccess: () => void;
}

export const AuthNavigator = ({ onAuthSuccess }: AuthNavigatorProps) => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');
  const user = useAuthStore((state) => state.user);

  // ✅ Auto-navigate when user logs in
  useEffect(() => {
    if (user) {
      console.log('✅ User authenticated in AuthNavigator:', user.email);
      onAuthSuccess();
    }
  }, [user]);

  const handleLoginSuccess = () => {
    // Don't call onAuthSuccess immediately - let the useEffect above handle it
    // This prevents race conditions
    console.log('🔐 Login completed, waiting for user state...');
  };

  const handleSignupSuccess = () => {
    // Same for signup
    console.log('📝 Signup completed, waiting for user state...');
  };

  return (
    <View style={styles.container}>
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLoginSuccess}
          onSignUp={() => setCurrentScreen('signup')}
          onForgotPassword={() => setCurrentScreen('forgot')}
        />
      )}
      {currentScreen === 'signup' && (
        <SignupScreen
          onSignup={handleSignupSuccess}
          onBackToLogin={() => setCurrentScreen('login')}
        />
      )}
      {currentScreen === 'forgot' && (
        <ForgotPasswordScreen onBackToLogin={() => setCurrentScreen('login')} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});