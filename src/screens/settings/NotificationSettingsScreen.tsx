import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import NotificationService from '../../services/NotificationService';

interface NotificationSettingsScreenProps {
  onBack: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  type: 'daily-checkin' | 'motivational' | 'selfie-reminder' | 'streak-warning' | 'weekly-report' | 'daily-tip';
}

export const NotificationSettingsScreen = ({ onBack }: NotificationSettingsScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: '1',
      title: 'Daily Check-in',
      description: 'Remind me to log my progress daily',
      icon: '📝',
      enabled: true,
      type: 'daily-checkin',
    },
    {
      id: '2',
      title: 'Motivational Messages',
      description: 'Receive encouraging messages throughout the day',
      icon: '💪',
      enabled: true,
      type: 'motivational',
    },
    {
      id: '3',
      title: 'Selfie Reminders',
      description: 'Weekly reminder to take progress photos',
      icon: '📸',
      enabled: true,
      type: 'selfie-reminder',
    },
    {
      id: '4',
      title: 'Streak Warnings',
      description: 'Alert me if my streak is about to break',
      icon: '🔥',
      enabled: true,
      type: 'streak-warning',
    },
    {
      id: '5',
      title: 'Weekly Report',
      description: 'Get a summary of your weekly progress',
      icon: '📊',
      enabled: true,
      type: 'weekly-report',
    },
    {
      id: '6',
      title: 'Daily Tips',
      description: 'Receive helpful tips each morning',
      icon: '💡',
      enabled: true,
      type: 'daily-tip',
    },
  ]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem('notification_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings(prev => 
          prev.map(setting => ({
            ...setting,
            enabled: parsed[setting.type] ?? setting.enabled
          }))
        );
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const toggleSetting = async (id: string) => {
    const newSettings = settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setSettings(newSettings);

    // Save to storage
    const settingsObject = newSettings.reduce((acc, setting) => ({
      ...acc,
      [setting.type]: setting.enabled
    }), {});
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settingsObject));

    // Update actual notifications
    const setting = newSettings.find(s => s.id === id);
    if (setting) {
      if (setting.enabled) {
        await NotificationService.enableNotifications([setting.type]);
      } else {
        await NotificationService.disableNotifications([setting.type]);
      }
    }
  };

  const testNotification = async () => {
    await NotificationService.sendAchievementNotification(
      'Test Notification',
      'This is a test notification!'
    );
    Alert.alert('✅ Test Sent', 'Check your notification tray!');
  };

  const enableAll = async () => {
    const newSettings = settings.map(s => ({ ...s, enabled: true }));
    setSettings(newSettings);

    const types = newSettings.map(s => s.type);
    await NotificationService.enableNotifications(types);

    const settingsObject = newSettings.reduce((acc, setting) => ({
      ...acc,
      [setting.type]: true
    }), {});
    await AsyncStorage.setItem('notification_settings', JSON.stringify(settingsObject));

    Alert.alert('✅ All Enabled', 'All notifications have been enabled!');
  };

  const disableAll = async () => {
    Alert.alert(
      'Disable All?',
      'This will turn off all notification types.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disable All',
          style: 'destructive',
          onPress: async () => {
            const newSettings = settings.map(s => ({ ...s, enabled: false }));
            setSettings(newSettings);

            await NotificationService.cancelAllNotifications();

            const settingsObject = newSettings.reduce((acc, setting) => ({
              ...acc,
              [setting.type]: false
            }), {});
            await AsyncStorage.setItem('notification_settings', JSON.stringify(settingsObject));

            Alert.alert('✅ All Disabled', 'All notifications have been disabled.');
          },
        },
      ]
    );
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={styles.infoIcon}>🔔</Text>
          <View style={styles.infoContent}>
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Stay on Track
            </Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Enable notifications to get reminders, motivation, and stay accountable to your goals.
            </Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            onPress={enableAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: '#00E676' }]}>
              ✅ Enable All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: cardBg }]}
            onPress={disableAll}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionButtonText, { color: '#FF5252' }]}>
              ❌ Disable All
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Notification Types
          </Text>

          {settings.map((setting) => (
            <View
              key={setting.id}
              style={[styles.settingCard, { backgroundColor: cardBg }]}
            >
              <View style={styles.settingLeft}>
                <Text style={styles.settingIcon}>{setting.icon}</Text>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: textColor }]}>
                    {setting.title}
                  </Text>
                  <Text style={[styles.settingDescription, { color: subText }]}>
                    {setting.description}
                  </Text>
                </View>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.id)}
                trackColor={{ false: '#767577', true: '#6C5CE7' }}
                thumbColor={setting.enabled ? '#FFF' : '#f4f3f4'}
              />
            </View>
          ))}
        </View>

        {/* Test Button */}
        <TouchableOpacity
          style={styles.testButton}
          onPress={testNotification}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#667EEA', '#764BA2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.testButtonGradient}
          >
            <Text style={styles.testButtonText}>🧪 Send Test Notification</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Info */}
        <View style={[styles.bottomInfo, { backgroundColor: cardBg }]}>
          <Text style={[styles.bottomInfoText, { color: subText }]}>
            💡 Make sure notifications are enabled in your device settings for the best experience.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  infoCard: {
    flexDirection: 'row',
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 20,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 28,
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  testButton: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  testButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  bottomInfo: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
  },
  bottomInfoText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});