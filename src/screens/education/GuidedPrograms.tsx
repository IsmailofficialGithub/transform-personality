import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface Program {
  id: string;
  title: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  icon: string;
  color: string[];
  description: string;
  progress: number;
}

const PROGRAMS: Program[] = [
  {
    id: '1',
    title: '30-Day Recovery Program',
    duration: '30 days',
    difficulty: 'beginner',
    icon: '🎯',
    color: ['#667EEA', '#764BA2'],
    description: 'A comprehensive 30-day program to break bad habits',
    progress: 12,
  },
  {
    id: '2',
    title: 'Mindfulness Course',
    duration: '14 days',
    difficulty: 'beginner',
    icon: '🧘',
    color: ['#00E676', '#00C853'],
    description: 'Learn mindfulness techniques to overcome urges',
    progress: 0,
  },
  {
    id: '3',
    title: 'CBT Exercises',
    duration: '21 days',
    difficulty: 'intermediate',
    icon: '🧠',
    color: ['#9C27B0', '#7B1FA2'],
    description: 'Cognitive behavioral therapy exercises',
    progress: 0,
  },
  {
    id: '4',
    title: 'Relapse Prevention',
    duration: '7 days',
    difficulty: 'advanced',
    icon: '🛡️',
    color: ['#FF9800', '#FF5722'],
    description: 'Advanced strategies to prevent relapse',
    progress: 0,
  },
];

export const GuidedPrograms = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#00E676';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#FF5252';
      default: return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Guided Programs</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Structured programs to support your recovery
          </Text>
        </View>

        {PROGRAMS.map((program) => {
          const progressPercent = (program.progress / parseInt(program.duration)) * 100;
          
          return (
            <TouchableOpacity
              key={program.id}
              style={[styles.programCard, { backgroundColor: cardBg }]}
              activeOpacity={0.7}
            >
              <View style={styles.programHeader}>
                <LinearGradient
                  colors={program.color}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.programIcon}
                >
                  <Text style={styles.programIconText}>{program.icon}</Text>
                </LinearGradient>
                <View style={styles.programInfo}>
                  <View style={styles.programTitleRow}>
                    <Text style={[styles.programTitle, { color: textColor }]}>
                      {program.title}
                    </Text>
                    <View style={[
                      styles.difficultyBadge,
                      { backgroundColor: getDifficultyColor(program.difficulty) + '20' }
                    ]}>
                      <Text style={[
                        styles.difficultyText,
                        { color: getDifficultyColor(program.difficulty) }
                      ]}>
                        {program.difficulty}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.programDesc, { color: subText }]}>
                    {program.description}
                  </Text>
                  <Text style={[styles.programDuration, { color: subText }]}>
                    Duration: {program.duration}
                  </Text>
                </View>
              </View>

              {program.progress > 0 ? (
                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.progressText, { color: textColor }]}>
                      Day {program.progress} of {program.duration.split(' ')[0]}
                    </Text>
                    <Text style={[styles.progressPercent, { color: colors.primary }]}>
                      {Math.round(progressPercent)}%
                    </Text>
                  </View>
                  <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
                    <LinearGradient
                      colors={program.color}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.progressFill, { width: `${progressPercent}%` }]}
                    />
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.startButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={program.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.startButtonGradient}
                  >
                    <Text style={styles.startButtonText}>Start Program</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
  },
  programCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  programHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  programIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  programIconText: {
    fontSize: 32,
  },
  programInfo: {
    flex: 1,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  programTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 8,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  programDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 4,
  },
  programDuration: {
    fontSize: 12,
  },
  progressSection: {
    marginTop: 8,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  startButton: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  startButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

