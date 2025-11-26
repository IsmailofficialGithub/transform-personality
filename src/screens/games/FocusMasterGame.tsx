import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';
import {
  Target,
  Zap,
  Flame,
  Star,
  Eye,
  Gamepad2,
  Brain,
  Trophy,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface FocusMasterGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Sequence = number[];

export const FocusMasterGame = ({ onComplete, onBack }: FocusMasterGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState<Sequence>([]);
  const [userSequence, setUserSequence] = useState<Sequence>([]);
  const [isShowingSequence, setIsShowingSequence] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [highestLevel, setHighestLevel] = useState(0);

  const scaleAnims = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;

  const colors_buttons = [
    { gradient: ['#00E676', '#00C853'], icon: Target },
    { gradient: ['#2196F3', '#1976D2'], icon: Zap },
    { gradient: ['#FF9800', '#F57C00'], icon: Flame },
    { gradient: ['#9C27B0', '#7B1FA2'], icon: Star },
  ];

  const startGame = () => {
    setIsPlaying(true);
    setLevel(1);
    setScore(0);
    setUserSequence([]);
    generateSequence(1);
  };

  const generateSequence = (currentLevel: number) => {
    const newSequence = [];
    for (let i = 0; i < currentLevel + 2; i++) {
      newSequence.push(Math.floor(Math.random() * 4));
    }
    setSequence(newSequence);
    setUserSequence([]);
    showSequence(newSequence);
  };

  const showSequence = async (seq: Sequence) => {
    setIsShowingSequence(true);

    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      flashButton(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
    }

    setIsShowingSequence(false);
  };

  const flashButton = (index: number) => {
    setActiveButton(index);

    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => setActiveButton(null), 400);
  };

  const handleButtonPress = (index: number) => {
    if (isShowingSequence) return;

    flashButton(index);

    const newUserSequence = [...userSequence, index];
    setUserSequence(newUserSequence);

    // Check if input is correct so far
    if (sequence[newUserSequence.length - 1] !== index) {
      // Wrong input
      gameOver();
      return;
    }

    // Check if sequence is complete
    if (newUserSequence.length === sequence.length) {
      // Correct! Move to next level
      const newLevel = level + 1;
      const levelScore = level * 100;
      setScore(prev => prev + levelScore);
      setLevel(newLevel);
      setHighestLevel(Math.max(highestLevel, newLevel));

      setTimeout(() => {
        generateSequence(newLevel);
      }, 1000);
    }
  };

  const gameOver = () => {
    setIsPlaying(false);

    setTimeout(() => {
      Alert.alert(
        '🎯 Game Over!',
        `Level Reached: ${level}\nHighest Level: ${Math.max(level, highestLevel)}\nFinal Score: ${score}`,
        [
          {
            text: 'Play Again',
            onPress: startGame,
          },
          {
            text: 'Finish',
            onPress: () => onComplete(score),
          },
        ]
      );
    }, 500);
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={[styles.header, { justifyContent: 'center' }]}>
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: textColor }]}>Focus Master</Text>
          <View style={styles.premiumBadge}>
            <LinearGradient
              colors={['#FFD700', '#FFA500']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.premiumGradient}
            >
              <Text style={styles.premiumText}>PRO</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{level}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Level</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Score</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{sequence.length}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Sequence</Text>
        </View>
      </View>

      {/* Status */}
      {isPlaying && (
        <View style={[styles.statusCard, { backgroundColor: cardBg }]}>
          <View style={styles.statusRow}>
            {isShowingSequence ? (
              <Eye size={24} color={textColor} />
            ) : (
              <Gamepad2 size={24} color={textColor} />
            )}
            <Text style={[styles.statusText, { color: textColor }]}>
              {isShowingSequence
                ? ' Watch Carefully...'
                : ` Your Turn (${userSequence.length}/${sequence.length})`
              }
            </Text>
          </View>
        </View>
      )}

      {/* Game Grid */}
      <View style={styles.gameGrid}>
        {colors_buttons.map((btn, index) => {
          const Icon = btn.icon;
          return (
            <TouchableOpacity
              key={index}
              style={styles.buttonContainer}
              onPress={() => handleButtonPress(index)}
              disabled={!isPlaying || isShowingSequence}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.button,
                  {
                    transform: [{ scale: scaleAnims[index] }],
                    opacity: !isPlaying ? 0.5 : activeButton === index ? 1 : 0.7,
                  },
                ]}
              >
                <LinearGradient
                  colors={btn.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Icon size={48} color="#FFF" />
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Start Button */}
      {!isPlaying && (
        <View style={styles.startContainer}>
          <View style={[styles.startCard, { backgroundColor: cardBg }]}>
            <Target size={64} color="#667EEA" style={styles.startIcon} />
            <Text style={[styles.startTitle, { color: textColor }]}>
              Focus Master Challenge
            </Text>
            <Text style={[styles.startDescription, { color: subText }]}>
              Watch the sequence and repeat it. Each level adds more steps!
            </Text>

            <TouchableOpacity
              style={styles.startButton}
              onPress={startGame}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.startButtonGradient}
              >
                <Text style={styles.startButtonText}>Start Challenge</Text>
              </LinearGradient>
            </TouchableOpacity>

            {highestLevel > 0 && (
              <Text style={[styles.highScore, { color: subText }]}>
                Best Level: {highestLevel}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Info */}
      {!isPlaying && (
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <View style={styles.infoHeader}>
            <Brain size={20} color={textColor} />
            <Text style={[styles.infoTitle, { color: textColor }]}>
              Benefits
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Elite focus and memory training
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Increases concentration span
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Builds cognitive resilience
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  premiumBadge: {
    marginLeft: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  premiumGradient: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
    gap: 8,
  },
  statBox: {
    flex: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    marginTop: 4,
  },
  statusCard: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  gameGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: SIZES.padding,
    gap: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    width: (width - SIZES.padding * 2 - 12) / 2,
    height: (width - SIZES.padding * 2 - 12) / 2,
  },
  button: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  startCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  startIcon: {
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  startDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startButton: {
    borderRadius: 12,
    overflow: 'hidden',
    width: '100%',
    marginBottom: 12,
  },
  startButtonGradient: {
    padding: 16,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  highScore: {
    fontSize: 13,
    fontWeight: '600',
  },
  infoCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  infoBullet: {
    fontSize: 16,
    color: '#6C5CE7',
    marginRight: 8,
    marginTop: -2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});