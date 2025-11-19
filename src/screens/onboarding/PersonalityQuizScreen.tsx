import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useThemeStore } from '../../store/themeStore';
import { SIZES } from '../../utils/theme';

interface Question {
  id: string;
  question: string;
  options: string[];
  emoji: string;
}

interface PersonalityQuizScreenProps {
  onComplete: (answers: Record<string, string>) => void;
}

const QUESTIONS: Question[] = [
  {
    id: 'motivation',
    question: 'What motivates you most to change?',
    emoji: '💭',
    options: [
      'Improving my health',
      'Better relationships',
      'Career success',
      'Self-respect',
      'Financial stability',
    ],
  },
  {
    id: 'trigger',
    question: 'What triggers your habits most?',
    emoji: '⚡',
    options: [
      'Stress',
      'Boredom',
      'Social situations',
      'Being alone',
      'Certain times of day',
    ],
  },
  {
    id: 'support',
    question: 'What support do you need most?',
    emoji: '🤝',
    options: [
      'Accountability partner',
      'Professional help',
      'Community support',
      'Self-help resources',
      'Family support',
    ],
  },
  {
    id: 'commitment',
    question: 'How committed are you to change?',
    emoji: '🎯',
    options: [
      "Extremely - I'll do whatever it takes",
      "Very - I'm ready to work hard",
      "Moderately - I'll try my best",
      'Somewhat - I want to change',
      'Just exploring options',
    ],
  },
  {
    id: 'experience',
    question: 'Have you tried quitting before?',
    emoji: '📖',
    options: [
      'Many times - keep relapsing',
      'A few times - struggled',
      'Once or twice',
      'Never tried seriously',
      'First time trying',
    ],
  },
  {
    id: 'goal',
    question: "What's your primary goal?",
    emoji: '🏆',
    options: [
      'Complete sobriety',
      'Reduce frequency',
      'Better self-control',
      'Understand my triggers',
      'Build healthier habits',
    ],
  },
];

export const PersonalityQuizScreen = ({ onComplete }: PersonalityQuizScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [slideAnim] = useState(new Animated.Value(0));

  const question = QUESTIONS[currentQuestion];
  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (answer: string) => {
    const newAnswers = { ...answers, [question.id]: answer };
    setAnswers(newAnswers);

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      slideAnim.setValue(0);
      if (currentQuestion < QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        onComplete(newAnswers);
      }
    });
  };

  const handleBack = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.95)' : 'rgba(255,255,255,0.95)';
  const bgColor = isDark ? '#000' : '#F7F7F7';

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {currentQuestion > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={[styles.backArrow, { color: textColor }]}>←</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.headerTitle, { color: textColor }]}>
            Personality Quiz
          </Text>
          <View style={{ width: 30 }} />
        </View>

        <View style={styles.progressWrapper}>
          <View
            style={[
              styles.progressBarBackground,
              { backgroundColor: isDark ? '#222' : '#E0E0E0' },
            ]}
          >
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  backgroundColor: isDark ? '#FFF' : '#000',
                  width: `${progress}%`,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: subText }]}>
            {Math.round(progress)}%
          </Text>
        </View>
      </View>

      {/* BODY */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.questionCard,
            { backgroundColor: cardBg },
            {
              transform: [
                {
                  translateX: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -40],
                  }),
                },
              ],
              opacity: slideAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 0],
              }),
            },
          ]}
        >
          <View style={styles.questionHeader}>
            <Text style={styles.emoji}>{question.emoji}</Text>
            <Text style={[styles.questionText, { color: textColor }]}>
              {question.question}
            </Text>
          </View>

          {question.options.map((option, index) => {
            const selected = answers[question.id] === option;
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionCard,
                  {
                    backgroundColor: selected
                      ? isDark
                        ? 'rgba(255,255,255,0.15)'
                        : 'rgba(0,0,0,0.05)'
                      : 'transparent',
                    borderColor: selected
                      ? isDark
                        ? '#FFF'
                        : '#000'
                      : 'rgba(0,0,0,0.1)',
                  },
                ]}
                onPress={() => handleAnswer(option)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.optionCircle,
                    { backgroundColor: selected ? '#6C5CE7' : '#CCC' },
                  ]}
                >
                  <Text style={styles.optionIndex}>{index + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.optionText,
                    { color: textColor, fontWeight: selected ? '600' : '400' },
                  ]}
                >
                  {option}
                </Text>
                {selected && (
                  <Text
                    style={[
                      styles.checkmark,
                      { color: isDark ? '#FFF' : '#000' },
                    ]}
                  >
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}

          <View
            style={[
              styles.tipCard,
              { backgroundColor: isDark ? '#111' : '#EEE' },
            ]}
          >
            <Text style={styles.tipIcon}>💡</Text>
            <Text style={[styles.tipText, { color: subText }]}>
              Be honest — your answers help personalize your journey.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: { padding: 8 },
  backArrow: { fontSize: 22 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  progressWrapper: { marginTop: 16 },
  progressBarBackground: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: { fontSize: 13, marginTop: 6 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  questionCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  questionHeader: { alignItems: 'center', marginBottom: 20 },
  emoji: { fontSize: 52, marginBottom: 10 },
  questionText: {
    fontSize: 18,
    textAlign: 'center',
    lineHeight: 26,
    fontWeight: '600',
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  optionCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  optionIndex: { color: '#FFF', fontWeight: '700' },
  optionText: { flex: 1, fontSize: 15 },
  checkmark: { fontSize: 18, fontWeight: '700' },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  tipIcon: { fontSize: 22, marginRight: 8 },
  tipText: { fontSize: 13, flex: 1, lineHeight: 18 },
});

export default PersonalityQuizScreen;
