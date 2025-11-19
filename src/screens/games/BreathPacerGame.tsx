import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');

interface BreathPacerGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

export const BreathPacerGame = ({ onComplete, onBack }: BreathPacerGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('inhale');
  const [cyclesCompleted, setCyclesCompleted] = useState(0);
  const [timeLeft, setTimeLeft] = useState(4);
  const [totalTime, setTotalTime] = useState(0);

  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setTotalTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          moveToNextPhase();
          return getPhaseTime(getNextPhase());
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  useEffect(() => {
    animateCircle();
  }, [phase, isActive]);

  const getNextPhase = (): BreathPhase => {
    switch (phase) {
      case 'inhale': return 'hold';
      case 'hold': return 'exhale';
      case 'exhale': return 'rest';
      case 'rest': return 'inhale';
    }
  };

  const getPhaseTime = (currentPhase: BreathPhase): number => {
    switch (currentPhase) {
      case 'inhale': return 4;
      case 'hold': return 7;
      case 'exhale': return 8;
      case 'rest': return 2;
    }
  };

  const moveToNextPhase = () => {
    const nextPhase = getNextPhase();
    setPhase(nextPhase);
    
    if (nextPhase === 'inhale') {
      setCyclesCompleted(prev => prev + 1);
    }

    if (cyclesCompleted >= 5) {
      completeSession();
    }
  };

  const animateCircle = () => {
    const targetScale = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.5 : 0.75;
    const targetOpacity = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.3 : 0.6;
    const duration = phase === 'inhale' ? 4000 : phase === 'exhale' ? 8000 : 
                     phase === 'hold' ? 7000 : 2000;

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: targetScale,
        duration,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: targetOpacity,
        duration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const completeSession = () => {
    setIsActive(false);
    const score = cyclesCompleted * 100;
    setTimeout(() => {
      onComplete(score);
    }, 1000);
  };

  const startSession = () => {
    setIsActive(true);
    setPhase('inhale');
    setTimeLeft(4);
    setCyclesCompleted(0);
    setTotalTime(0);
  };

  const getPhaseInstruction = (): string => {
    switch (phase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'rest': return 'Rest';
    }
  };

  const getPhaseColor = (): string[] => {
    switch (phase) {
      case 'inhale': return ['#00E676', '#00C853'];
      case 'hold': return ['#2196F3', '#1976D2'];
      case 'exhale': return ['#9C27B0', '#7B1FA2'];
      case 'rest': return ['#FF9800', '#F57C00'];
    }
  };

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
        <Text style={[styles.title, { color: textColor }]}>Breath Pacer</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {cyclesCompleted}/6
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Cycles</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {Math.floor(totalTime / 60)}:{(totalTime % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Time</Text>
        </View>
      </View>

      {/* Breathing Circle */}
      <View style={styles.circleContainer}>
        <Animated.View
          style={[
            styles.circle,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <LinearGradient
            colors={getPhaseColor()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.circleGradient}
          >
            <Text style={styles.circleText}>{getPhaseInstruction()}</Text>
            {isActive && (
              <Text style={styles.circleTimer}>{timeLeft}s</Text>
            )}
          </LinearGradient>
        </Animated.View>
      </View>

      {/* Instructions */}
      <View style={[styles.instructionsCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.instructionsTitle, { color: textColor }]}>
          💨 {isActive ? 'Follow the circle' : 'Ready to begin?'}
        </Text>
        <Text style={[styles.instructionsText, { color: subText }]}>
          {isActive
            ? 'Breathe in sync with the expanding and contracting circle. Complete 6 cycles.'
            : 'Tap Start to begin a guided breathing session. This helps reduce anxiety and calm urges.'}
        </Text>
      </View>

      {/* Control Button */}
      {!isActive && (
        <TouchableOpacity
          style={styles.startButton}
          onPress={startSession}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#00E676', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startButtonGradient}
          >
            <Text style={styles.startButtonText}>
              {cyclesCompleted > 0 ? 'Continue Session' : 'Start Session'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      )}

      {isActive && (
        <TouchableOpacity
          style={styles.stopButton}
          onPress={() => setIsActive(false)}
          activeOpacity={0.8}
        >
          <Text style={[styles.stopButtonText, { color: '#FF5252' }]}>
            Pause Session
          </Text>
        </TouchableOpacity>
      )}

      {/* Benefits */}
      <View style={[styles.benefitsCard, { backgroundColor: cardBg }]}>
        <Text style={[styles.benefitsTitle, { color: textColor }]}>
          🌟 Benefits
        </Text>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitBullet}>•</Text>
          <Text style={[styles.benefitText, { color: subText }]}>
            Reduces anxiety by 60%
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitBullet}>•</Text>
          <Text style={[styles.benefitText, { color: subText }]}>
            Calms nervous system
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Text style={styles.benefitBullet}>•</Text>
          <Text style={[styles.benefitText, { color: subText }]}>
            Lowers urge intensity immediately
          </Text>
        </View>
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
    marginBottom: 30,
  },
  statBox: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
  },
  circleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  circle: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    overflow: 'hidden',
  },
  circleGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 10,
  },
  circleTimer: {
    fontSize: 48,
    fontWeight: '700',
    color: '#FFF',
  },
  instructionsCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 13,
    lineHeight: 20,
  },
  startButton: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
  stopButton: {
    marginHorizontal: SIZES.padding,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF5252',
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  stopButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  benefitsCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  benefitBullet: {
    fontSize: 16,
    color: '#00E676',
    marginRight: 8,
    marginTop: -2,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
});