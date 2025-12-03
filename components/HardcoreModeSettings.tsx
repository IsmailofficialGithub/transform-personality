import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Switch, Alert, ScrollView } from 'react-native';
import { useTheme } from '../hooks/useTheme';
import { Habit, HardcoreModeSettings as HardcoreSettings } from '../types';
import { getHardcoreModeSettings, enableHardcoreMode, disableHardcoreMode } from '../services/hardcoreModeService';
import { Lock, AlertTriangle } from 'lucide-react-native';

interface HardcoreModeSettingsProps {
  habit: Habit;
  onSettingsChanged?: () => void;
}

export default function HardcoreModeSettings({ habit, onSettingsChanged }: HardcoreModeSettingsProps) {
  const theme = useTheme();
  const [settings, setSettings] = useState<HardcoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(habit.hardcore_mode || false);
  const [zeroTolerance, setZeroTolerance] = useState(true);
  const [mandatoryCheckIn, setMandatoryCheckIn] = useState(true);
  const [featureLock, setFeatureLock] = useState(true);

  useEffect(() => {
    loadSettings();
  }, [habit.id]);

  async function loadSettings() {
    setLoading(true);
    const hardcoreSettings = await getHardcoreModeSettings(habit.id);
    if (hardcoreSettings) {
      setSettings(hardcoreSettings);
      setZeroTolerance(hardcoreSettings.zero_tolerance_enabled);
      setMandatoryCheckIn(hardcoreSettings.mandatory_checkin_enabled);
      setFeatureLock(hardcoreSettings.feature_lock_enabled);
    }
    setLoading(false);
  }

  async function handleToggleHardcoreMode() {
    if (enabled) {
      Alert.alert(
        'Disable Hardcore Mode?',
        'Are you sure you want to disable hardcore mode? This will remove all strict enforcement rules.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Disable',
            style: 'destructive',
            onPress: async () => {
              const success = await disableHardcoreMode(habit.id);
              if (success) {
                setEnabled(false);
                onSettingsChanged?.();
              }
            },
          },
        ]
      );
    } else {
      Alert.alert(
        'Enable Hardcore Mode?',
        'Hardcore mode enables strict rules: zero-tolerance streaks, mandatory daily check-ins, and feature locks. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Enable',
            onPress: async () => {
              const success = await enableHardcoreMode(habit.user_id, habit.id, {
                zero_tolerance_enabled: zeroTolerance,
                mandatory_checkin_enabled: mandatoryCheckIn,
                feature_lock_enabled: featureLock,
              });
              if (success) {
                setEnabled(true);
                await loadSettings();
                onSettingsChanged?.();
              }
            },
          },
        ]
      );
    }
  }

  return (
    <View
      style={{ backgroundColor: theme.base.card, borderColor: theme.base.border }}
      className="p-4 rounded-xl border mb-3"
    >
      <View className="flex-row items-center mb-4">
        <Lock size={20} color={theme.primary} />
        <Text style={{ color: theme.text.primary }} className="text-lg font-bold ml-2">
          Hardcore Mode
        </Text>
      </View>

      <View
        style={{
          backgroundColor: enabled ? theme.status.error + '15' : theme.base.surface,
          borderColor: enabled ? theme.status.error : theme.base.border,
          borderWidth: 2,
        }}
        className="p-3 rounded-xl mb-4"
      >
        <View className="flex-row items-center justify-between mb-2">
          <Text style={{ color: theme.text.primary }} className="font-medium">
            Enable Hardcore Mode
          </Text>
          <Switch
            value={enabled}
            onValueChange={handleToggleHardcoreMode}
            trackColor={{ false: theme.base.border, true: theme.status.error }}
            thumbColor={enabled ? theme.text.inverse : theme.text.tertiary}
          />
        </View>
        <Text style={{ color: theme.text.secondary }} className="text-xs">
          Strict mode with zero-tolerance and mandatory check-ins
        </Text>
      </View>

      {enabled && (
        <View>
          <View className="flex-row items-center mb-3">
            <AlertTriangle size={16} color={theme.status.warning} />
            <Text style={{ color: theme.text.secondary }} className="text-sm ml-2">
              Hardcore Mode Features:
            </Text>
          </View>
          <View className="ml-6">
            <Text style={{ color: theme.text.secondary }} className="text-xs mb-1">
              • Zero-tolerance streak (no resets)
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mb-1">
              • Mandatory daily check-in
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs mb-1">
              • Feature locks until tasks completed
            </Text>
            <Text style={{ color: theme.text.secondary }} className="text-xs">
              • Emergency urge blocker tools
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

