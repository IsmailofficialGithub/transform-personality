import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';

const { width, height } = Dimensions.get('window');

interface ReactionTimeGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type GameState = 'waiting' | 'ready' | 'active' | 'tooSoon' | 'result';

export const ReactionTimeGame = ({ onComplete, onBack }: ReactionTimeGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<number[]>([]);
  const [round, setRound] = useState(1);
  
  const startTimeRef = useRef<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (gameState === 'ready') {
      // Random delay between 2-5 seconds
      const delay = 2000 + Math.random() * 3000;
      
      timeoutRef.current = setTimeout(() => {
        setGameState('active');
        startTimeRef.current = Date.now();
      }, delay);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [gameState]);

  const startRound = () => {
    setGameState('ready');
    setReactionTime(0);
  };

  const handlePress = () => {
    if (gameState === 'waiting') {
      startRound();
    } else if (gameState === 'ready') {
      setGameState('tooSoon');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setTimeout(() => {
        setGameState('waiting');
      }, 1500);
    } else if (gameState === 'active') {
      const time = Date.now() - startTimeRef.current;
      setReactionTime(time);
      setAttempts([...attempts, time]);
      setGameState('result');

      if (round >= 5) {
        completeGame([...attempts, time]);
      }
    } else if (gameState === 'result') {
      if (round < 5) {
        setRound(round + 1);
        setGameState('waiting');
      }
    }
  };

  const completeGame = (allAttempts: number[]) => {
    const avgTime = allAttempts.reduce((a, b) => a + b, 0) / allAttempts.length;
    const bestTime = Math.min(...allAttempts);
    const score = Math.max(1000 - Math.floor(avgTime), 100);

    setTimeout(() => {
      Alert.alert(
        '🎉 Game Complete!',
        `Average: ${Math.floor(avgTime)}ms\nBest: ${bestTime}ms\n\nScore: ${score}`,
        [
          {
            text: 'Play Again',
            onPress: () => {
              setAttempts([]);
              setRound(1);
              setGameState('waiting');
            },
          },
          {
            text: 'Finish',
            onPress: () => onComplete(score),
          },
        ]
      );
    }, 1000);
  };

  const getStateColor = (): string[] => {
    switch (gameState) {
      case 'waiting':
        return ['#2196F3', '#1976D2'];
      case 'ready':
        return ['#FF9800', '#F57C00'];
      case 'active':
        return ['#00E676', '#00C853'];
      case 'tooSoon':
        return ['#FF5252', '#D32F2F'];
      case 'result':
        return ['#9C27B0', '#7B1FA2'];
    }
  };

  const getStateText = (): string => {
    switch (gameState) {
      case 'waiting':
        return 'Tap to Start';
      case 'ready':
        return 'Wait for Green...';
      case 'active':
        return 'TAP NOW!';
      case 'tooSoon':
        return 'Too Soon!';
      case 'result':
        return `${reactionTime}ms`;
    }
  };

  const getStateSubtext = (): string => {
    switch (gameState) {
      case 'waiting':
        return 'Get ready to test your reflexes';
      case 'ready':
        return 'Screen will turn green...';
      case 'active':
        return 'Tap as fast as you can!';
      case 'tooSoon':
        return 'Wait for green!';
      case 'result':
        return round < 5 ? 'Tap to continue' : 'Calculating results...';
    }
  };

  const avgReaction = attempts.length > 0
    ? Math.floor(attempts.reduce((a, b) => a + b, 0) / attempts.length)
    : 0;

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Reaction Challenge</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {round}/5
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Round</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {avgReaction}ms
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Average</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {attempts.length > 0 ? Math.min(...attempts) : 0}ms
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Best</Text>
        </View>
      </View>

      {/* Game Area */}
      <TouchableOpacity
        style={styles.gameArea}
        onPress={handlePress}
        activeOpacity={1}
      >
        <Animated.View
          style={[
            styles.targetArea,
            gameState === 'active' && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <LinearGradient
            colors={getStateColor()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.targetGradient}
          >
            <Text style={styles.stateText}>{getStateText()}</Text>
            <Text style={styles.stateSubtext}>{getStateSubtext()}</Text>
          </LinearGradient>
        </Animated.View>
      </TouchableOpacity>

      {/* Previous Attempts */}
      {attempts.length > 0 && (
        <View style={[styles.attemptsCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.attemptsTitle, { color: textColor }]}>
            Previous Attempts
          </Text>
          <View style={styles.attemptsList}>
            {attempts.map((time, index) => (
              <View key={index} style={styles.attemptItem}>
                <Text style={[styles.attemptNumber, { color: subText }]}>
                  #{index + 1}
                </Text>
                <Text style={[styles.attemptTime, { color: textColor }]}>
                  {time}ms
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={[styles.instructionsCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.instructionsText, { color: subText }]}>
          ⚡ Tap when the screen turns green. Complete 5 rounds to see your average reaction time!
        </Text>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  backText: {
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 60,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: SIZES.padding,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
  },
  targetArea: {
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: (width * 0.8) / 2,
    overflow: 'hidden',
  },
  targetGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  stateText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  stateSubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
  },
  attemptsCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  attemptsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  attemptsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attemptItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(108, 92, 231, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  attemptNumber: {
    fontSize: 12,
    marginRight: 6,
  },
  attemptTime: {
    fontSize: 12,
    fontWeight: '700',
  },
  instructionsCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  instructionsText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});