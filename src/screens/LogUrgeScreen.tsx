import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { SIZES, DARK_COLORS } from '../utils/theme';
import { useThemeStore } from '../store/themeStore';
import { useHabitStore } from '../store/habitStore';
import { HABIT_NAMES } from '../utils/constants';

interface LogUrgeScreenProps {
  habitId?: string;
  onComplete: () => void;
}

export const LogUrgeScreen: React.FC<LogUrgeScreenProps> = ({ habitId, onComplete }) => {
  const colors = useThemeStore((state) => state.colors) || DARK_COLORS;
  const habits = useHabitStore((state) => state.habits);
  const logUrge = useHabitStore((state) => state.logUrge);

  // If no habitId provided, use first habit or null
  const [selectedHabitId, setSelectedHabitId] = useState<string>(
    habitId || habits[0]?.id || ''
  );
  const [showHabitSelector, setShowHabitSelector] = useState(false);
  const [intensity, setIntensity] = useState(5);
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [overcome, setOvercome] = useState<boolean | null>(null);

  const selectedHabit = habits.find((h) => h.id === selectedHabitId);

  const triggers = [
    { icon: 'emoticon-sad-outline', label: 'Stress' },
    { icon: 'emoticon-neutral-outline', label: 'Boredom' },
    { icon: 'emoticon-cry-outline', label: 'Sadness' },
    { icon: 'emoticon-angry-outline', label: 'Anger' },
    { icon: 'emoticon-confused-outline', label: 'Anxiety' },
    { icon: 'weather-night', label: 'Night Time' },
    { icon: 'home-outline', label: 'Alone' },
    { icon: 'cellphone', label: 'Social Media' },
    { icon: 'laptop', label: 'Internet' },
    { icon: 'bed', label: 'Tired' },
  ];

  const toggleTrigger = (label: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const handleHabitSelect = (id: string) => {
    setSelectedHabitId(id);
    setShowHabitSelector(false);
  };

  const handleSubmit = () => {
    if (!selectedHabitId) {
      Alert.alert('Required', 'Please select a habit');
      return;
    }

    if (overcome === null) {
      Alert.alert('Required', 'Please select if you overcame the urge or not');
      return;
    }

    logUrge({
      habitId: selectedHabitId,
      intensity,
      trigger: selectedTriggers.join(', '),
      notes,
      overcome,
    });

    Alert.alert(
      overcome ? '🎉 Great Job!' : '💪 Keep Going',
      overcome
        ? 'You successfully overcame this urge. Keep up the great work!'
        : "It's okay. Every day is a new opportunity to try again.",
      [{ text: 'OK', onPress: onComplete }]
    );
  };

  if (habits.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No habits tracked yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Add a habit first to log urges
          </Text>
        </View>
      </View>
    );
  }

  if (!selectedHabit) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Habit not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colors.background === '#0F0F0F' ? 'light' : 'dark'} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Feather name="activity" size={32} color="#fff" style={{ marginBottom: 8 }} />
          <Text style={styles.headerTitle}>Log Urge</Text>
          <Text style={styles.headerSubtitle}>Track your progress</Text>
        </LinearGradient>

        {/* Habit Selector (Only show if user has multiple habits) */}
        {habits.length > 1 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Select Habit
            </Text>
            <TouchableOpacity
              style={[
                styles.habitSelector,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => setShowHabitSelector(true)}
              activeOpacity={0.7}
            >
              <View style={styles.habitSelectorContent}>
                <Text style={[styles.habitSelectorText, { color: colors.text }]}>
                  {selectedHabit.customName || HABIT_NAMES[selectedHabit.type]}
                </Text>
                <Feather name="chevron-down" size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Single Habit Display (Only show if user has 1 habit) */}
        {habits.length === 1 && (
          <View style={styles.section}>
            <View style={[styles.singleHabitCard, { backgroundColor: colors.surface }]}>
              <Text style={[styles.singleHabitLabel, { color: colors.textSecondary }]}>
                Logging urge for:
              </Text>
              <Text style={[styles.singleHabitName, { color: colors.text }]}>
                {selectedHabit.customName || HABIT_NAMES[selectedHabit.type]}
              </Text>
            </View>
          </View>
        )}

        {/* Intensity Selector */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Intensity Level: {intensity}/10
          </Text>
          <View style={styles.intensityContainer}>
            {[...Array(10)].map((_, i) => {
              const level = i + 1;
              return (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.intensityButton,
                    { backgroundColor: intensity >= level ? colors.primary : colors.surface },
                  ]}
                  onPress={() => setIntensity(level)}
                >
                  <Text
                    style={[
                      styles.intensityText,
                      { color: intensity >= level ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.intensityHelper, { color: colors.textSecondary }]}>
            {intensity <= 3 ? '😌 Mild' : intensity <= 6 ? '😐 Moderate' : '😰 Strong'}
          </Text>
        </View>

        {/* Triggers */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            What triggered this urge?
          </Text>
          <View style={styles.triggersContainer}>
            {triggers.map(({ icon, label }) => {
              const selected = selectedTriggers.includes(label);
              return (
                <TouchableOpacity
                  key={label}
                  style={[
                    styles.triggerChip,
                    {
                      backgroundColor: selected ? colors.primary : colors.surface,
                      borderColor: selected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => toggleTrigger(label)}
                >
                  <MaterialCommunityIcons
                    name={icon as any}
                    size={18}
                    color={selected ? '#FFF' : colors.text}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.triggerText,
                      { color: selected ? '#FFF' : colors.text },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Additional Notes (Optional)
          </Text>
          <TextInput
            style={[
              styles.notesInput,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="How did you feel? What were you doing?"
            placeholderTextColor={colors.textSecondary}
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        {/* Outcome */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Did you overcome this urge? *
          </Text>
          <View style={styles.outcomeContainer}>
            <TouchableOpacity
              style={[
                styles.outcomeButton,
                {
                  backgroundColor: overcome === true ? '#00E676' : colors.surface,
                  borderColor: overcome === true ? '#00E676' : colors.border,
                },
              ]}
              onPress={() => setOvercome(true)}
              activeOpacity={0.7}
            >
              <Feather
                name="check-circle"
                size={20}
                color={overcome === true ? '#FFF' : colors.text}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.outcomeText,
                  { color: overcome === true ? '#FFF' : colors.text },
                ]}
              >
                Yes, I overcame it ✨
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.outcomeButton,
                {
                  backgroundColor: overcome === false ? '#FF5252' : colors.surface,
                  borderColor: overcome === false ? '#FF5252' : colors.border,
                },
              ]}
              onPress={() => setOvercome(false)}
              activeOpacity={0.7}
            >
              <Feather
                name="x-circle"
                size={20}
                color={overcome === false ? '#FFF' : colors.text}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.outcomeText,
                  { color: overcome === false ? '#FFF' : colors.text },
                ]}
              >
                No, I relapsed 💪
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
          <LinearGradient
            colors={colors.gradientPurple}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitGradient}
          >
            <Text style={styles.submitText}>Save Log</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Habit Selection Modal */}
      <Modal
        visible={showHabitSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHabitSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Select Habit
              </Text>
              <TouchableOpacity onPress={() => setShowHabitSelector(false)}>
                <Feather name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {habits.map((habit) => (
                <TouchableOpacity
                  key={habit.id}
                  style={[
                    styles.habitOption,
                    {
                      backgroundColor: selectedHabitId === habit.id 
                        ? colors.primary + '20' 
                        : 'transparent',
                      borderColor: selectedHabitId === habit.id 
                        ? colors.primary 
                        : colors.border,
                    },
                  ]}
                  onPress={() => handleHabitSelect(habit.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.habitOptionContent}>
                    <Text style={[styles.habitOptionName, { color: colors.text }]}>
                      {habit.customName || HABIT_NAMES[habit.type]}
                    </Text>
                    <Text style={[styles.habitOptionType, { color: colors.textSecondary }]}>
                      {HABIT_NAMES[habit.type]}
                    </Text>
                  </View>
                  {selectedHabitId === habit.id && (
                    <Feather name="check-circle" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  scrollContent: { paddingBottom: 50 },
  header: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },

  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },

  habitSelector: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 16,
  },
  habitSelectorContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  habitSelectorText: {
    fontSize: 16,
    fontWeight: '600',
  },

  singleHabitCard: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  singleHabitLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  singleHabitName: {
    fontSize: 18,
    fontWeight: '700',
  },

  intensityContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  intensityButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  intensityText: { fontSize: 14, fontWeight: '700' },
  intensityHelper: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },

  triggersContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triggerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  triggerText: { fontSize: 13, fontWeight: '600' },

  notesInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    minHeight: 100,
    fontSize: 14,
    textAlignVertical: 'top',
  },

  outcomeContainer: { gap: 10 },
  outcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  outcomeText: { fontSize: 14, fontWeight: '600' },

  submitButton: {
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 40,
  },
  submitGradient: { padding: 14, alignItems: 'center' },
  submitText: { fontSize: 16, fontWeight: '700', color: '#FFF' },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  habitOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 10,
  },
  habitOptionContent: {
    flex: 1,
  },
  habitOptionName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  habitOptionType: {
    fontSize: 12,
  },
});