import React, { useState, useEffect, useRef } from 'react';
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
import {
  HABIT_IMAGES,
  HABIT_NAMES,
  HABIT_DESCRIPTIONS,
} from '../../utils/constants';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width * 0.9 - 40) / 2;

interface HabitSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onHabitsUpdated?: () => void;
}

const HabitSelectionModal = ({
  visible,
  onClose,
  onHabitsUpdated,
}: HabitSelectionModalProps) => {
  const [selectedHabits, setSelectedHabits] = useState<Set<string>>(new Set());
  const [scaleAnims] = useState(
    Object.keys(HABIT_IMAGES).map(() => new Animated.Value(1))
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const addHabit = useHabitStore((state) => state.addHabit);
    const [loading, setloading] = useState(false);

  // 🌀 Animate modal open/close
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

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
    setloading(true);
    try {
      const userId = useAuthStore.getState().user?.id;
      if (!userId) {
        console.error('User ID not found — user may not be logged in');
        return;
      }

      for (const habitType of selectedHabits) {
        // ✅ Save locally
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

      if (onHabitsUpdated) onHabitsUpdated();
      onClose();
    } catch (err) {
      console.error('Error saving habit:', err);
    }finally {
      setloading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.modalContainer,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <LinearGradient
            colors={['#fff8e7', '#fff']} // 🌾 simple wheat/white background
            style={styles.gradient}
          >
            <Text style={styles.title}>Choose Your Habits</Text>
            <Text style={styles.subtitle}>Select the habits you want to work on or quit.</Text>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
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
                          {
                            borderColor: isSelected ? '#667eea' : 'transparent',
                          },
                        ]}
                        onPress={() => toggleHabit(habit, index)}
                        activeOpacity={0.9}
                      >
                        <Image
                          source={{ uri: HABIT_IMAGES[habit] }}
                          style={styles.habitImage}
                        />
                        <Text style={styles.habitName}>{HABIT_NAMES[habit]}</Text>
                        <Text style={styles.habitDescription}>
                          {HABIT_DESCRIPTIONS[habit]}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
              </View>
            </ScrollView>

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
                  : loading
                  ? 'Saving...'
                  : `Add ${selectedHabits.size} habit${
                      selectedHabits.size > 1 ? 's' : ''
                    }`}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Cancel</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

export default HabitSelectionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '85%',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 10,
  },
  gradient: {
    flex: 1,
    padding:15,
  },
  title: {
    fontSize: 22,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  scrollContent: {
    paddingBottom: 80,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  habitCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
  },
  habitCardInner: {
    backgroundColor: '#fff',
    height: CARD_WIDTH * 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  habitImage: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  habitName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  habitDescription: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#667eea',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#bbb',
  },
  buttonText: {
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    alignSelf: 'center',
    marginTop: 10,
  },
  closeText: {
    color: '#444',
    fontSize: 16,
  },
});
