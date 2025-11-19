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

interface Meditation {
  id: string;
  title: string;
  duration: string;
  type: string;
  icon: string;
  color: string[];
  description: string;
}

const MEDITATIONS: Meditation[] = [
  {
    id: '1',
    title: '5-Minute Breathing',
    duration: '5 min',
    type: 'Breathing',
    icon: '🌬️',
    color: ['#667EEA', '#764BA2'],
    description: 'Quick breathing exercise to calm your mind',
  },
  {
    id: '2',
    title: 'Body Scan',
    duration: '10 min',
    type: 'Mindfulness',
    icon: '🧘',
    color: ['#00E676', '#00C853'],
    description: 'Progressive body relaxation technique',
  },
  {
    id: '3',
    title: 'Urge Surfing',
    duration: '8 min',
    type: 'Recovery',
    icon: '🌊',
    color: ['#2196F3', '#1976D2'],
    description: 'Learn to ride out urges without acting',
  },
];

export const Meditation = () => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>Meditation</Text>
          <Text style={[styles.subtitle, { color: subText }]}>
            Guided meditations for mindfulness and recovery
          </Text>
        </View>

        {MEDITATIONS.map((meditation) => (
          <TouchableOpacity
            key={meditation.id}
            style={[styles.meditationCard, { backgroundColor: cardBg }]}
            activeOpacity={0.7}
          >
            <View style={styles.meditationHeader}>
              <LinearGradient
                colors={meditation.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.meditationIcon}
              >
                <Text style={styles.meditationIconText}>{meditation.icon}</Text>
              </LinearGradient>
              <View style={styles.meditationInfo}>
                <View style={styles.meditationMeta}>
                  <Text style={[styles.meditationType, { color: meditation.color[0] }]}>
                    {meditation.type}
                  </Text>
                  <Text style={[styles.meditationDuration, { color: subText }]}>
                    {meditation.duration}
                  </Text>
                </View>
                <Text style={[styles.meditationTitle, { color: textColor }]}>
                  {meditation.title}
                </Text>
                <Text style={[styles.meditationDesc, { color: subText }]}>
                  {meditation.description}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.playButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={meditation.color}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.playButtonGradient}
              >
                <Text style={styles.playButtonText}>▶ Play</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
  meditationCard: {
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
  meditationHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  meditationIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  meditationIconText: {
    fontSize: 32,
  },
  meditationInfo: {
    flex: 1,
  },
  meditationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  meditationType: {
    fontSize: 12,
    fontWeight: '700',
  },
  meditationDuration: {
    fontSize: 12,
  },
  meditationTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  meditationDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  playButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  playButtonGradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
});

