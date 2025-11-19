import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SIZES } from '../../utils/theme';
import { Button } from '../../components/common/Button';
import { useThemeStore } from '../../store/themeStore';

interface QuizResultsScreenProps {
  answers: Record<string, string>;
  onContinue: () => void;
}

export const QuizResultsScreen = ({ answers, onContinue }: QuizResultsScreenProps) => {
  const colors = useThemeStore((state) => state.colors);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const getPersonalityType = () => {
    const commitment = answers.commitment || '';
    const experience = answers.experience || '';

    if (commitment.includes('Extremely') && experience.includes('Many times')) {
      return {
        emoji: '⚔️',
        title: 'The Determined Warrior',
        description:
          "You've faced challenges before — and you're ready to win again. Your experience is your greatest strength.",
        strengths: ['High commitment', 'Experienced', 'Strong willpower', 'Self-aware'],
        recommendations: [
          'Track triggers',
          'Celebrate small wins',
          'Stay accountable',
          'Build a support network',
        ],
      };
    } else if (commitment.includes('Very') || commitment.includes('Moderately')) {
      return {
        emoji: '🧭',
        title: 'The Committed Explorer',
        description:
          "You're open to learning and discovering new strategies to build lasting habits.",
        strengths: [
          'Curious and open-minded',
          'Willing to experiment',
          'Realistic expectations',
          'Growth mindset',
        ],
        recommendations: [
          'Start with small steps',
          'Track your progress',
          'Learn from experience',
          'Be patient with yourself',
        ],
      };
    } else if (experience.includes('Never') || experience.includes('First time')) {
      return {
        emoji: '🌟',
        title: 'The Fresh Pioneer',
        description:
          "You're starting with a clean slate — ready to build strong habits from scratch.",
        strengths: [
          'Fresh perspective',
          'High motivation',
          'Clear goals',
          'Eager to learn',
        ],
        recommendations: [
          'Learn from others',
          'Set simple goals',
          'Stay consistent',
          'Celebrate progress',
        ],
      };
    } else {
      return {
        emoji: '🎯',
        title: 'The Strategic Thinker',
        description:
          'You approach change with logic and planning — a strong formula for lasting success.',
        strengths: [
          'Analytical mindset',
          'Goal-driven',
          'Reflective',
          'Consistent',
        ],
        recommendations: [
          'Plan your routines',
          'Track your data',
          'Adjust strategies',
          'Reflect regularly',
        ],
      };
    }
  };

  const personality = getPersonalityType();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View
          style={[
            styles.header,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Text style={styles.emoji}>{personality.emoji}</Text>
          <Text style={[styles.title, { color: colors.text }]}>Your Result</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            {personality.title}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {personality.description}
          </Text>
        </Animated.View>

        <Animated.View
          style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Strengths</Text>
          {personality.strengths.map((s, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bullet, { color: colors.primary }]}>•</Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>{s}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View
          style={[styles.section, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommendations</Text>
          {personality.recommendations.map((r, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={[styles.bullet, { color: colors.primary }]}>{i + 1}.</Text>
              <Text style={[styles.listText, { color: colors.textSecondary }]}>{r}</Text>
            </View>
          ))}
        </Animated.View>

        <Button
          title="Continue →"
          onPress={onContinue}
          style={styles.button}
        />

        <Text style={[styles.footer, { color: colors.textTertiary }]}>
          🌱 Remember — your journey is unique. These insights guide, not define you.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SIZES.paddingLarge, paddingBottom: 80 },
  header: { alignItems: 'center', marginBottom: 30 },
  emoji: { fontSize: 72, marginBottom: 10 },
  title: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  subtitle: { fontSize: 24, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 15, textAlign: 'center', lineHeight: 22, maxWidth: 320 },
  section: { marginBottom: 28 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 10 },
  listItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  bullet: { fontSize: 18, marginRight: 8, fontWeight: 'bold' },
  listText: { fontSize: 15, lineHeight: 22 },
  button: { marginTop: 24 },
  footer: {
    textAlign: 'center',
    fontSize: 13,
    marginTop: 24,
    fontStyle: 'italic',
  },
});
