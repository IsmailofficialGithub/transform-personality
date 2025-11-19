import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import { getExercisesForHabit, Exercise } from '../../utils/exercises';

interface ExercisesScreenProps {
  habitType: string;
}

export const ExercisesScreen = ({ habitType }: ExercisesScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  const exercises = getExercisesForHabit(habitType);

  const getDifficultyColor = (difficulty: string): string => {
    if (difficulty === 'easy') return '#00E676';
    if (difficulty === 'medium') return '#FF9800';
    return '#FF5252';
  };

  const handleExercisePress = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setShowModal(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={colors.gradientPurple}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Text style={styles.headerEmoji}>💪</Text>
          <Text style={styles.headerTitle}>Exercises</Text>
          <Text style={styles.headerSubtitle}>
            Activities to overcome urges
          </Text>
        </LinearGradient>

        {/* Exercises List */}
        {exercises.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={[styles.emptyText, { color: colors.text }]}>
              No exercises available
            </Text>
          </View>
        ) : (
          exercises.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              style={[styles.exerciseCard, { backgroundColor: colors.surface }]}
              onPress={() => handleExercisePress(exercise)}
              activeOpacity={0.7}
            >
              <View style={styles.exerciseHeader}>
                <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                <View style={styles.exerciseInfo}>
                  <Text style={[styles.exerciseTitle, { color: colors.text }]}>
                    {exercise.title}
                  </Text>
                  <Text
                    style={[
                      styles.exerciseDescription,
                      { color: colors.textSecondary },
                    ]}
                    numberOfLines={2}
                  >
                    {exercise.description}
                  </Text>
                </View>
              </View>

              <View style={styles.exerciseMeta}>
                <View
                  style={[
                    styles.difficultyBadge,
                    {
                      backgroundColor:
                        getDifficultyColor(exercise.difficulty) + '20',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.difficultyText,
                      { color: getDifficultyColor(exercise.difficulty) },
                    ]}
                  >
                    {exercise.difficulty}
                  </Text>
                </View>
                <Text
                  style={[styles.duration, { color: colors.textSecondary }]}
                >
                  ⏱️ {exercise.duration}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Exercise Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedExercise && (
                <>
                  <Text style={styles.modalIcon}>{selectedExercise.icon}</Text>
                  <Text style={[styles.modalTitle, { color: colors.text }]}>
                    {selectedExercise.title}
                  </Text>
                  <Text
                    style={[
                      styles.modalDescription,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {selectedExercise.description}
                  </Text>

                  <View style={styles.modalSection}>
                    <Text
                      style={[
                        styles.modalSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      📋 Instructions
                    </Text>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <View key={index} style={styles.instructionItem}>
                        <View style={styles.instructionNumber}>
                          <Text style={styles.instructionNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.instructionText,
                            { color: colors.text },
                          ]}
                        >
                          {instruction}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={styles.modalSection}>
                    <Text
                      style={[
                        styles.modalSectionTitle,
                        { color: colors.text },
                      ]}
                    >
                      ✨ Benefits
                    </Text>
                    {selectedExercise.benefits.map((benefit, index) => (
                      <View key={index} style={styles.benefitItem}>
                        <Text style={styles.benefitBullet}>•</Text>
                        <Text
                          style={[
                            styles.benefitText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {benefit}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.closeButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.closeButtonText}>Got It!</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 120,
  },
  header: {
    padding: SIZES.paddingLarge,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
    marginBottom: SIZES.marginLarge,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerEmoji: { fontSize: 56, marginBottom: SIZES.margin },
  headerTitle: {
    fontSize: SIZES.h1,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  headerSubtitle: { fontSize: SIZES.body, color: 'rgba(255,255,255,0.9)' },
  emptyState: {
    padding: SIZES.paddingLarge * 2,
    borderRadius: SIZES.radiusLarge,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 64, marginBottom: SIZES.margin },
  emptyText: { fontSize: SIZES.h4, fontWeight: 'bold' },

  exerciseCard: {
    padding: SIZES.padding,
    borderRadius: SIZES.radiusLarge,
    marginBottom: SIZES.margin,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.margin,
  },
  exerciseIcon: { fontSize: 48, marginRight: SIZES.margin },
  exerciseInfo: { flex: 1 },
  exerciseTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  exerciseDescription: { fontSize: SIZES.small, lineHeight: 20 },
  exerciseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: SIZES.small,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  duration: { fontSize: SIZES.small, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: SIZES.radiusLarge,
    borderTopRightRadius: SIZES.radiusLarge,
    padding: SIZES.paddingLarge,
    maxHeight: '90%',
  },
  modalIcon: {
    fontSize: 80,
    textAlign: 'center',
    marginBottom: SIZES.margin,
  },
  modalTitle: {
    fontSize: SIZES.h2,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SIZES.marginSmall,
  },
  modalDescription: {
    fontSize: SIZES.body,
    textAlign: 'center',
    marginBottom: SIZES.marginLarge,
    lineHeight: 24,
  },
  modalSection: { marginBottom: SIZES.marginLarge },
  modalSectionTitle: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    marginBottom: SIZES.margin,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginSmall,
  },
  instructionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.margin,
  },
  instructionNumberText: { color: '#FFF', fontSize: SIZES.body, fontWeight: 'bold' },
  instructionText: { flex: 1, fontSize: SIZES.body, lineHeight: 24 },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SIZES.marginSmall,
  },
  benefitBullet: {
    fontSize: SIZES.h3,
    color: '#00E676',
    marginRight: SIZES.marginSmall,
  },
  benefitText: { flex: 1, fontSize: SIZES.body, lineHeight: 22 },
  closeButton: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    alignItems: 'center',
    marginTop: SIZES.margin,
  },
  closeButtonText: { color: '#FFF', fontSize: SIZES.body, fontWeight: 'bold' },
});
