import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface PremiumTestPanelProps {
  onStatusChange?: () => void;
}

export const PremiumTestPanel = ({ onStatusChange }: PremiumTestPanelProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const unlockPremium = async () => {
    try {
      await AsyncStorage.setItem('premium_status', 'true');
      await AsyncStorage.setItem('subscription_plan', 'monthly_pro');
      Alert.alert('✅ Success', 'Premium features unlocked!');
      onStatusChange?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock premium');
    }
  };

  const startTrial = async () => {
    try {
      await AsyncStorage.setItem('premium_status', 'true');
      await AsyncStorage.setItem('trial_start_date', new Date().toISOString());
      Alert.alert('✅ Success', '3-day free trial started!');
      onStatusChange?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to start trial');
    }
  };

  const lockPremium = async () => {
    try {
      await AsyncStorage.removeItem('premium_status');
      await AsyncStorage.removeItem('trial_start_date');
      await AsyncStorage.removeItem('subscription_plan');
      Alert.alert('🔒 Locked', 'Premium features locked');
      onStatusChange?.();
    } catch (error) {
      Alert.alert('Error', 'Failed to lock premium');
    }
  };

  const checkStatus = async () => {
    try {
      const premium = await AsyncStorage.getItem('premium_status');
      const trial = await AsyncStorage.getItem('trial_start_date');
      const plan = await AsyncStorage.getItem('subscription_plan');

      let status = 'FREE USER';
      if (trial) {
        const startDate = new Date(trial);
        const now = new Date();
        const daysLeft = 3 - Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft > 0) {
          status = `TRIAL (${daysLeft} days left)`;
        }
      }
      if (premium === 'true' && plan) {
        status = `PREMIUM (${plan})`;
      }

      Alert.alert('Current Status', status);
    } catch (error) {
      Alert.alert('Error', 'Failed to check status');
    }
  };

  const textColor = isDark ? '#FFF' : '#000';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: cardBg }]}>
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>🧪</Text>
        <Text style={[styles.headerTitle, { color: textColor }]}>
          Premium Testing Panel
        </Text>
      </View>

      <Text style={[styles.description, { color: textColor }]}>
        Use these buttons to test premium features without real payments
      </Text>

      <TouchableOpacity style={styles.button} onPress={startTrial}>
        <LinearGradient
          colors={['#00E676', '#00C853']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>🎁 Start 3-Day Trial</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={unlockPremium}>
        <LinearGradient
          colors={['#6C5CE7', '#9C27B0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>💎 Unlock Premium</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={lockPremium}>
        <LinearGradient
          colors={['#FF5252', '#D32F2F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>🔒 Lock Premium</Text>
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={checkStatus}>
        <LinearGradient
          colors={['#FFB300', '#FF8F00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.buttonGradient}
        >
          <Text style={styles.buttonText}>📊 Check Status</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.warningBox}>
        <Text style={styles.warningEmoji}>⚠️</Text>
        <Text style={[styles.warningText, { color: textColor }]}>
          This panel is for testing only. Remove before production release.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  description: {
    fontSize: 13,
    marginBottom: 20,
    opacity: 0.7,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  buttonGradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '700',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
  },
  warningEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
});