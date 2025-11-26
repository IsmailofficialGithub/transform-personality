/* FULL FIXED FILE BELOW – NOTHING CUT OFF */

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

const { width } = Dimensions.get('window');
const GRID_SIZE = 4;
const CELL_SIZE = (width - SIZES.padding * 2 - 30) / GRID_SIZE;

interface PatternMasterGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type Cell = {
  id: number;
  isActive: boolean;
  isRevealed: boolean;
};

export const PatternMasterGame = ({ onComplete, onBack }: PatternMasterGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(1);
  const [grid, setGrid] = useState<Cell[]>([]);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowingPattern, setIsShowingPattern] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  const cellAnims = useRef(
    Array(GRID_SIZE * GRID_SIZE).fill(0).map(() => new Animated.Value(1))
  ).current;

  useEffect(() => {
    if (isPlaying && !isShowingPattern && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isPlaying) {
      checkPattern();
    }
  }, [timeLeft, isPlaying, isShowingPattern]);

  const initializeGrid = () => {
    const cells: Cell[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      cells.push({ id: i, isActive: false, isRevealed: false });
    }
    setGrid(cells);
  };

  const startGame = () => {
    setIsPlaying(true);
    setLevel(1);
    setScore(0);
    initializeGrid();
    generatePattern(1);
  };

  const generatePattern = (currentLevel: number) => {
    initializeGrid();
    setUserPattern([]);
    setTimeLeft(10 + currentLevel * 2);

    const patternSize = Math.min(3 + currentLevel, 10);
    const newPattern: number[] = [];

    while (newPattern.length < patternSize) {
      const randomCell = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      if (!newPattern.includes(randomCell)) {
        newPattern.push(randomCell);
      }
    }

    setPattern(newPattern);
    showPattern(newPattern);
  };

  const showPattern = async (pat: number[]) => {
    setIsShowingPattern(true);

    for (let i = 0; i < pat.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 300));
      flashCell(pat[i]);
      setGrid(prev => prev.map((cell, idx) =>
        idx === pat[i] ? { ...cell, isRevealed: true } : cell
      ));
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    setGrid(prev => prev.map(cell => ({ ...cell, isRevealed: false })));
    setIsShowingPattern(false);
  };

  const flashCell = (index: number) => {
    Animated.sequence([
      Animated.timing(cellAnims[index], {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(cellAnims[index], {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCellPress = (cellId: number) => {
    if (isShowingPattern) return;

    flashCell(cellId);

    const newUserPattern = [...userPattern, cellId];
    setUserPattern(newUserPattern);

    setGrid(prev => prev.map((cell, idx) =>
      idx === cellId ? { ...cell, isActive: true } : cell
    ));

    if (newUserPattern.length === pattern.length) {
      setTimeout(() => checkPattern(), 500);
    }
  };

  const checkPattern = () => {
    const isCorrect = userPattern.length === pattern.length &&
      userPattern.every((val, idx) => val === pattern[idx]);

    if (isCorrect) {
      const levelScore = level * 100 + timeLeft * 10;
      setScore(prev => prev + levelScore);
      const newLevel = level + 1;
      setLevel(newLevel);

      Alert.alert(
        'Correct!',
        `+${levelScore} points!\nMoving to level ${newLevel}`,
        [{ text: 'Continue', onPress: () => generatePattern(newLevel) }]
      );
    } else {
      gameOver();
    }
  };

  const gameOver = () => {
    setIsPlaying(false);

    setTimeout(() => {
      Alert.alert(
        'Game Over',
        `Level: ${level}\nFinal Score: ${score}`,
        [
          { text: 'Play Again', onPress: startGame },
          { text: 'Finish', onPress: () => onComplete(score) },
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
        <Text style={[styles.title, { color: textColor }]}>Pattern Master</Text>
      </View>

      {/* Stats */}
      < View style={styles.statsRow} >
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{level}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Level</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{score}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Score</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: timeLeft < 5 ? '#FF5252' : textColor }]}>
            {timeLeft}s
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Time</Text>
        </View>
      </View >

      {/* Status */}
      {
        isPlaying && (
          <View style={[styles.statusCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.statusText, { color: textColor }]}>
              {isShowingPattern
                ? 'Memorize the pattern...'
                : `Recreate it (${userPattern.length}/${pattern.length})`
              }
            </Text>
          </View>
        )
      }

      {/* Grid */}
      <View style={styles.gridContainer}>
        <View style={styles.grid}>
          {grid.map((cell, index) => (
            <TouchableOpacity
              key={cell.id}
              style={styles.cellContainer}
              onPress={() => handleCellPress(cell.id)}
              disabled={!isPlaying || isShowingPattern}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.cell,
                  { transform: [{ scale: cellAnims[index] }] },
                ]}
              >
                <LinearGradient
                  colors={
                    cell.isRevealed || cell.isActive
                      ? ['#667EEA', '#764BA2']
                      : isDark
                        ? ['#2A2A2A', '#1A1A1A']
                        : ['#F5F5F5', '#E5E5E5']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cellGradient}
                >
                  {(cell.isRevealed || cell.isActive) && (
                    <Text style={styles.cellEmoji}>🔷</Text>
                  )}
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Start Button */}
      {
        !isPlaying && (
          <View style={styles.startContainer}>
            <View style={[styles.startCard, { backgroundColor: cardBg }]}>
              <Text style={styles.startEmoji}>🔷</Text>
              <Text style={[styles.startTitle, { color: textColor }]}>
                Pattern Challenge
              </Text>
              <Text style={[styles.startDescription, { color: subText }]}>
                Watch the pattern, then recreate it from memory.
              </Text>

              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#9C27B0', '#7B1FA2']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Start Challenge</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )
      }

      {/* Info */}
      {
        !isPlaying && (
          <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.infoTitle, { color: textColor }]}>Benefits</Text>

            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={[styles.infoText, { color: subText }]}>Memory training</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={[styles.infoText, { color: subText }]}>Pattern recognition</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoBullet}>•</Text>
              <Text style={[styles.infoText, { color: subText }]}>Neural development</Text>
            </View>
          </View>
        )
      }
    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
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
  placeholder: {
    width: 60,
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
  statusText: {
    fontSize: 16,
    fontWeight: '700',
  },
  gridContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  cellGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellEmoji: {
    fontSize: 24,
  },
  startContainer: {
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  startCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  startEmoji: {
    fontSize: 40,
    marginBottom: 10,
  },
  startTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  startDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
  },
  startButton: {
    width: '100%',
  },
  startButtonGradient: {
    paddingVertical: 12,
    borderRadius: 10,
  },
  startButtonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  infoCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoBullet: {
    fontSize: 16,
    marginRight: 6,
  },
  infoText: {
    fontSize: 12,
  },
});
