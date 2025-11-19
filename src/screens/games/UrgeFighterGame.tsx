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

interface UrgeFighterGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

interface Urge {
  id: number;
  x: number;
  y: number;
  intensity: number;
  speed: number;
}

export const UrgeFighterGame = ({ onComplete, onBack }: UrgeFighterGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [wave, setWave] = useState(1);
  const [urges, setUrges] = useState<Urge[]>([]);
  const [combo, setCombo] = useState(0);
  const [defeatedUrges, setDefeatedUrges] = useState(0);

  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const urgeIdCounter = useRef(0);

  useEffect(() => {
    if (isPlaying) {
      startGameLoop();
    } else {
      stopGameLoop();
    }

    return () => stopGameLoop();
  }, [isPlaying]);

  const startGameLoop = () => {
    gameLoopRef.current = setInterval(() => {
      moveUrges();
      spawnUrge();
    }, 100);
  };

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      clearInterval(gameLoopRef.current);
    }
  };

  const spawnUrge = () => {
    if (Math.random() < 0.02 * wave) {
      const newUrge: Urge = {
        id: urgeIdCounter.current++,
        x: Math.random() * (width - 60),
        y: -60,
        intensity: Math.floor(Math.random() * 3) + 1,
        speed: 2 + wave * 0.5,
      };
      setUrges(prev => [...prev, newUrge]);
    }
  };

  const moveUrges = () => {
    setUrges(prev => {
      const moved = prev.map(urge => ({
        ...urge,
        y: urge.y + urge.speed,
      }));

      // Check if any urge reached bottom
      const reachedBottom = moved.filter(urge => urge.y > height - 200);
      if (reachedBottom.length > 0) {
        setHealth(h => {
          const newHealth = h - (reachedBottom.length * 10);
          if (newHealth <= 0) {
            endGame();
          }
          return Math.max(0, newHealth);
        });
        setCombo(0);
      }

      return moved.filter(urge => urge.y < height - 200);
    });
  };

  const hitUrge = (urgeId: number, intensity: number) => {
    setUrges(prev => prev.filter(u => u.id !== urgeId));
    
    const points = intensity * 10 * (combo + 1);
    setScore(s => s + points);
    setCombo(c => c + 1);
    setDefeatedUrges(d => {
      const newCount = d + 1;
      if (newCount % 10 === 0) {
        setWave(w => w + 1);
      }
      return newCount;
    });
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setHealth(100);
    setWave(1);
    setUrges([]);
    setCombo(0);
    setDefeatedUrges(0);
    urgeIdCounter.current = 0;
  };

  const endGame = () => {
    setIsPlaying(false);
    
    setTimeout(() => {
      Alert.alert(
        health <= 0 ? '💔 Defeated!' : '🏆 Victory!',
        `Wave: ${wave}\nUrges Defeated: ${defeatedUrges}\nFinal Score: ${score}`,
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

  const getUrgeColor = (intensity: number): string[] => {
    switch (intensity) {
      case 1: return ['#FF9800', '#F57C00'];
      case 2: return ['#FF5722', '#E64A19'];
      case 3: return ['#FF5252', '#D32F2F'];
      default: return ['#9E9E9E', '#757575'];
    }
  };

  const getUrgeEmoji = (intensity: number): string => {
    switch (intensity) {
      case 1: return '😐';
      case 2: return '😟';
      case 3: return '😰';
      default: return '😐';
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
        <View style={styles.headerCenter}>
          <Text style={[styles.title, { color: textColor }]}>Urge Fighter</Text>
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
        <View style={styles.placeholder} />
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <View style={[styles.hudItem, { backgroundColor: cardBg }]}>
          <Text style={[styles.hudLabel, { color: subText }]}>Score</Text>
          <Text style={[styles.hudValue, { color: textColor }]}>{score}</Text>
        </View>

        <View style={[styles.hudItem, { backgroundColor: cardBg }]}>
          <Text style={[styles.hudLabel, { color: subText }]}>Wave</Text>
          <Text style={[styles.hudValue, { color: textColor }]}>{wave}</Text>
        </View>

        <View style={[styles.hudItem, { backgroundColor: cardBg }]}>
          <Text style={[styles.hudLabel, { color: subText }]}>Combo</Text>
          <Text style={[styles.hudValue, { color: '#FFD700' }]}>x{combo}</Text>
        </View>
      </View>

      {/* Health Bar */}
      <View style={[styles.healthBarContainer, { backgroundColor: cardBg }]}>
        <View style={styles.healthBarInner}>
          <LinearGradient
            colors={health > 50 ? ['#00E676', '#00C853'] : health > 25 ? ['#FF9800', '#F57C00'] : ['#FF5252', '#D32F2F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[styles.healthBarFill, { width: `${health}%` }]}
          />
        </View>
        <Text style={[styles.healthText, { color: textColor }]}>
          ❤️ {health}%
        </Text>
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        {isPlaying ? (
          <>
            {urges.map(urge => (
              <TouchableOpacity
                key={urge.id}
                style={[
                  styles.urge,
                  {
                    left: urge.x,
                    top: urge.y,
                  },
                ]}
                onPress={() => hitUrge(urge.id, urge.intensity)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={getUrgeColor(urge.intensity)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.urgeGradient}
                >
                  <Text style={styles.urgeEmoji}>{getUrgeEmoji(urge.intensity)}</Text>
                  <Text style={styles.urgeIntensity}>{urge.intensity}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}

            <View style={styles.defenseZone}>
              <Text style={[styles.defenseText, { color: subText }]}>
                🛡️ DEFENSE ZONE
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.startContainer}>
            <View style={[styles.startCard, { backgroundColor: cardBg }]}>
              <Text style={styles.startEmoji}>⚔️</Text>
              <Text style={[styles.startTitle, { color: textColor }]}>
                Ready to Fight?
              </Text>
              <Text style={[styles.startDescription, { color: subText }]}>
                Tap the urges before they reach the bottom. Higher intensity urges give more points!
              </Text>
              
              <TouchableOpacity
                style={styles.startButton}
                onPress={startGame}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#00E676', '#00C853']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.startButtonGradient}
                >
                  <Text style={styles.startButtonText}>Start Battle</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Info */}
      {!isPlaying && (
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.infoTitle, { color: textColor }]}>
            🎮 How to Play
          </Text>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Tap urges before they reach the defense zone
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Build combos for bonus points
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>•</Text>
            <Text style={[styles.infoText, { color: subText }]}>
              Survive waves to increase difficulty
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
  hud: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    marginBottom: 12,
    gap: 8,
  },
  hudItem: {
    flex: 1,
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  hudLabel: {
    fontSize: 10,
    marginBottom: 4,
  },
  hudValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  healthBarContainer: {
    marginHorizontal: SIZES.padding,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
  healthBarInner: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  healthBarFill: {
    height: '100%',
  },
  healthText: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  gameArea: {
    flex: 1,
    position: 'relative',
  },
  urge: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  urgeGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  urgeEmoji: {
    fontSize: 24,
  },
  urgeIntensity: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFF',
    marginTop: 2,
  },
  defenseZone: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    borderTopWidth: 3,
    borderTopColor: '#FF5252',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
  },
  defenseText: {
    fontSize: 14,
    fontWeight: '700',
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  startCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  startEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  startTitle: {
    fontSize: 24,
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
  infoCard: {
    marginHorizontal: SIZES.padding,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
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