import React, { useState } from 'react';
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

interface Mood {
  id: string;
  emoji: string;
  label: string;
  value: number;
  color: string[];
}

const MOODS: Mood[] = [
  { id: '1', emoji: '😊', label: 'Great', value: 5, color: ['#00E676', '#00C853'] },
  { id: '2', emoji: '🙂', label: 'Good', value: 4, color: ['#4CAF50', '#388E3C'] },
  { id: '3', emoji: '😐', label: 'Okay', value: 3, color: ['#FFC107', '#FFA000'] },
  { id: '4', emoji: '😔', label: 'Down', value: 2, color: ['#FF9800', '#F57C00'] },
  { id: '5', emoji: '😢', label: 'Struggling', value: 1, color: ['#FF5252', '#D32F2F'] },
];

export const MoodTracker = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<Array<{ date: string; mood: Mood }>>([]);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood.id);
    const newEntry = {
      date: new Date().toISOString(),
      mood,
    };
    setMoodHistory([newEntry, ...moodHistory]);
  };

  const averageMood = moodHistory.length > 0
    ? moodHistory.reduce((sum, entry) => sum + entry.mood.value, 0) / moodHistory.length
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Mood Tracker</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Track your emotional state daily
          </Text>
        </View>

        {/* Average Mood */}
        {moodHistory.length > 0 && (
          <View style={[styles.averageCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.averageLabel, { color: subText }]}>Average Mood</Text>
            <Text style={[styles.averageValue, { color: colors.primary }]}>
              {averageMood.toFixed(1)} / 5.0
            </Text>
            <View style={[styles.averageBar, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.averageFill,
                  { width: `${(averageMood / 5) * 100}%`, backgroundColor: colors.primary }
                ]}
              />
            </View>
          </View>
        )}

        {/* Mood Selection */}
        <View style={styles.moodSelection}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            How are you feeling today?
          </Text>
          <View style={styles.moodsGrid}>
            {MOODS.map((mood) => (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.moodCard,
                  { backgroundColor: cardBg },
                  selectedMood === mood.id && styles.moodCardSelected,
                ]}
                onPress={() => handleMoodSelect(mood)}
                activeOpacity={0.7}
              >
                {selectedMood === mood.id && (
                  <LinearGradient
                    colors={mood.color}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.moodCardGradient}
                  />
                )}
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <Text style={[
                  styles.moodLabel,
                  { color: selectedMood === mood.id ? '#FFF' : textColor }
                ]}>
                  {mood.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood History */}
        {moodHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              Recent History
            </Text>
            {moodHistory.slice(0, 7).map((entry, index) => (
              <View
                key={index}
                style={[styles.historyItem, { backgroundColor: cardBg }]}
              >
                <Text style={styles.historyEmoji}>{entry.mood.emoji}</Text>
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyLabel, { color: textColor }]}>
                    {entry.mood.label}
                  </Text>
                  <Text style={[styles.historyDate, { color: subText }]}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
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
  averageCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  averageLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  averageValue: {
    fontSize: 36,
    fontWeight: '700',
    marginBottom: 12,
  },
  averageBar: {
    width: '100%',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  averageFill: {
    height: '100%',
  },
  moodSelection: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  moodsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodCard: {
    width: (SIZES.width - SIZES.padding * 3) / 2.5,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  moodCardSelected: {
    borderWidth: 2,
  },
  moodCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.9,
  },
  moodEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  historySection: {
    paddingHorizontal: SIZES.padding,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  historyEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
  },
});

