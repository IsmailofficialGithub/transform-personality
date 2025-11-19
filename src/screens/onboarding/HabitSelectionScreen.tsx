import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { supabase } from '../../services/supabase';
import { SIZES } from '../../utils/theme';
import {
  HABIT_IMAGES,
  HABIT_NAMES,
  HABIT_DESCRIPTIONS,
} from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - SIZES.padding * 2 - SIZES.margin) / 2;

interface Props {
  onComplete?: () => void; // used in onboarding
  visible?: boolean; // used in Home
  onClose?: () => void; // used in Home
  onHabitsUpdated?: () => void; // used in Home
}

const HabitSelectionScreen = ({
  onComplete,
  visible,
  onClose,
  onHabitsUpdated,
}: Props) => {
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [scaleAnims] = useState(
    Object.keys(HABIT_IMAGES).map(() => new Animated.Value(1))
  );
  const addHabit = useHabitStore((state) => state.addHabit);

  const toggleHabit = (habit: string, index: number) => {
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnims[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const newSet = new Set(selectedHabits);
    newSet.has(habit) ? newSet.delete(habit) : newSet.add(habit);
    setSelectedHabits(newSet);
  };

  const handleContinue = async () => {
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        console.error('User ID not found — user may not be logged in');
        return;
      }

      for (const habitType of selectedHabits) {
        // ✅ Save to local store (for offline cache)
        addHabit({
          type: habitType,
          quitDate: new Date().toISOString(),
          currentStreak: 0,
          longestStreak: 0,
          totalRelapses: 0,
          severity: 'moderate',
        });

        // ✅ Save to Supabase
        await supabase.from('habits').insert({
          user_id: userId,
          name: HABIT_NAMES[habitType],
          description: HABIT_DESCRIPTIONS[habitType],
          icon: HABIT_IMAGES[habitType],
          is_active: true,
        });
      }

      if (onHabitsUpdated) onHabitsUpdated(); // refresh Home list
      if (onClose) onClose(); // close modal
      if (onComplete) onComplete(); // finish onboarding
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const content = (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose Your Habits</Text>
        <Text style={styles.subtitle}>
          Select the habits you want to work on or quit.
        </Text>

        <View style={styles.grid}>
          {Object.keys(HABIT_IMAGES).map((habit, index) => {
            const isSelected = selectedHabits.has(habit);
            return (
              <Animated.View
                key={habit}
                style={[
                  styles.habitCard,
                  { transform: [{ scale: scaleAnims[index] }] },
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.habitCardInner,
                    { borderColor: isSelected ? '#FFF' : 'transparent' },
                  ]}
                  onPress={() => toggleHabit(habit, index)}
                  activeOpacity={0.9}
                >
                  <Image
                    source={{ uri: HABIT_IMAGES[habit] }}
                    style={styles.habitImage}
                    resizeMode="cover"
                  />
                  <LinearGradient
                    colors={
                      isSelected
                        ? ['transparent', 'rgba(108, 92, 231, 0.9)']
                        : ['transparent', 'rgba(0,0,0,0.85)']
                    }
                    style={styles.habitGradient}
                  >
                    <Text style={styles.habitName}>{HABIT_NAMES[habit]}</Text>
                    <Text style={styles.habitDescription}>
                      {HABIT_DESCRIPTIONS[habit]}
                    </Text>
                    {isSelected && (
                      <View style={styles.checkmark}>
                        <Text style={styles.checkmarkText}>✓</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            selectedHabits.size === 0 && styles.buttonDisabled,
          ]}
          disabled={selectedHabits.size === 0}
          onPress={handleContinue}
        >
          <Text style={styles.buttonText}>
            {selectedHabits.size === 0
              ? 'Select at least one habit'
              : `Add ${selectedHabits.size} habit${
                  selectedHabits.size > 1 ? 's' : ''
                }`}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );

  // Modal Mode (Home Screen)
  if (visible !== undefined) {
    return (
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onClose}
      >
        {content}
      </Modal>
    );
  }

  // Onboarding Mode
  return content;
};

export default HabitSelectionScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 60 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginVertical: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  habitCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  habitCardInner: {
    height: CARD_WIDTH * 1.3,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 3,
  },
  habitImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  habitGradient: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
  },
  habitName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFF',
  },
  habitDescription: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
  },
  checkmark: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00E676',
    borderRadius: 18,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: {
    fontWeight: 'bold',
    color: '#667eea',
  },
});
