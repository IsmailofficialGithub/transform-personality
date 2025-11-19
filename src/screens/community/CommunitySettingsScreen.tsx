import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import Toast from 'react-native-root-toast';
import { communityService } from '../../services/CommunityService';
import { useCommunityStore } from '../../store/communityStore';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';
import type { Screen } from '../../navigation/AppNavigator';

interface CommunitySettingsScreenProps {
  onNavigate?: (screen: Screen) => void;
  onBack?: () => void;
}

export const CommunitySettingsScreen = ({ onNavigate, onBack }: CommunitySettingsScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const { currentProfile, loadCurrentProfile } = useCommunityStore();

  const [settings, setSettings] = useState({
    is_profile_public: currentProfile?.is_profile_public || false,
    show_streak: currentProfile?.show_streak || true,
    show_before_after: currentProfile?.show_before_after || false,
    show_success_stories: currentProfile?.show_success_stories || true,
  });

  const handleToggleSetting = async (key: keyof typeof settings, value: boolean) => {
    try {
      setSettings((prev) => ({ ...prev, [key]: value }));
      await communityService.updateProfileSettings({ [key]: value });
      await loadCurrentProfile();
      Toast.show('Setting updated', { duration: Toast.durations.SHORT });
    } catch (error: any) {
      // Revert on error
      setSettings((prev) => ({ ...prev, [key]: !value }));
      Toast.show('Failed to update setting', { duration: Toast.durations.SHORT });
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Implement account deletion
            Toast.show('Account deletion not implemented yet', { duration: Toast.durations.SHORT });
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <LinearGradient
        colors={colors.gradientPurple}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={onBack || (() => onNavigate?.('profile' as Screen))} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Community Settings</Text>
        <View style={styles.headerSpacer} />
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Privacy Settings */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.text : '#000' }]}>Privacy</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Public Profile</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Allow others to view your profile and posts
              </Text>
            </View>
            <Switch
              value={settings.is_profile_public}
              onValueChange={(value) => handleToggleSetting('is_profile_public', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Show Streak</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Display your current streak on your profile
              </Text>
            </View>
            <Switch
              value={settings.show_streak}
              onValueChange={(value) => handleToggleSetting('show_streak', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Show Before/After Photos</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Allow before/after photos in success stories
              </Text>
            </View>
            <Switch
              value={settings.show_before_after}
              onValueChange={(value) => handleToggleSetting('show_before_after', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: isDark ? colors.text : '#000' }]}>Show Success Stories</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Display your success stories on your profile
              </Text>
            </View>
            <Switch
              value={settings.show_success_stories}
              onValueChange={(value) => handleToggleSetting('show_success_stories', value)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#FFF"
            />
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.text : '#000' }]}>Notifications</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            Notification preferences are managed in your device settings
          </Text>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: isDark ? colors.background : '#F5F5F5' }]}
            onPress={() => onNavigate?.('notificationSettings' as Screen)}
            activeOpacity={0.7}
          >
            <Text style={[styles.settingsButtonText, { color: colors.primary }]}>Open Notification Settings</Text>
          </TouchableOpacity>
        </View>

        {/* Account Actions */}
        <View style={[styles.section, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? colors.text : '#000' }]}>Account</Text>

          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: colors.error }]}
            onPress={handleDeleteAccount}
            activeOpacity={0.7}
          >
            <Text style={[styles.dangerButtonText, { color: colors.error }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: SIZES.padding,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#FFF',
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: SIZES.h3,
    fontWeight: '700',
    color: '#FFF',
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  section: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: SIZES.marginLarge,
  },
  sectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: SIZES.small,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: SIZES.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: SIZES.tiny,
    lineHeight: 16,
  },
  settingsButton: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    alignItems: 'center',
    marginTop: 8,
  },
  settingsButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
  },
  dangerButton: {
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    borderWidth: 2,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: SIZES.body,
    fontWeight: '700',
  },
});

