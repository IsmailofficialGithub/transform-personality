import { Pause, Play, Shield, Star, Target, Trophy, Zap } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Dimensions, GestureResponderEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import { useTheme } from '../../hooks/useTheme';
import { supabase } from '../../services/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_HEIGHT = SCREEN_HEIGHT * 0.7;
const PLAYER_SIZE = 50;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 60;
const OBSTACLE_SPEED = 5;
const POWERUP_SIZE = 30;

interface Obstacle {
  id: number;
  x: number;
  y: number;
  type: 'normal' | 'spike';
}

interface PowerUp {
  id: number;
  x: number;
  y: number;
  type: 'speed' | 'shield' | 'coin';
}

export default function GalaxyRunner() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [playerY, setPlayerY] = useState(GAME_HEIGHT / 2);
  const [obstacles, setObstacles] = useState<Obstacle[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [hasShield, setHasShield] = useState(false);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(1);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);
  const powerUpIdRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const playerYAnimated = useSharedValue(GAME_HEIGHT / 2);

  useEffect(() => {
    loadGameData();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
    } else {
      stopGameLoop();
    }
    return () => stopGameLoop();
  }, [gameState, gameSpeed, playerY]);

  const loadGameData = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', 'galaxy_runner')
        .single();

      if (data) {
        setHighScore(data.score || 0);
        setLevel(data.level || 1);
        setCoins(data.coins || 0);
      }
    } catch (error) {
      console.log('Error loading game data:', error);
    }
  };

  const saveGameData = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'galaxy_runner',
          score: Math.max(score, highScore),
          level: level,
          coins: coins,
          distance: distance,
          time_played: 0,
        }, {
          onConflict: 'user_id,game_type'
        });

      if (error) throw error;
    } catch (error) {
      console.log('Error saving game data:', error);
    }
  };

  const startGameLoop = () => {
    const loop = () => {
      if (gameState !== 'playing') return;

      // Update distance and score
      setDistance((prev) => {
        const newDistance = prev + 1;
        setScore((prevScore) => prevScore + 1);
        
        if (newDistance % 500 === 0) {
          setLevel((prevLevel) => {
            const newLevel = prevLevel + 1;
            setGameSpeed((prevSpeed) => Math.min(prevSpeed + 0.1, 3));
            return newLevel;
          });
        }
        
        return newDistance;
      });

      // Move obstacles
      setObstacles((prev) => {
        const moved = prev
          .map((obs) => ({ ...obs, x: obs.x - OBSTACLE_SPEED * gameSpeed }))
          .filter((obs) => obs.x > -OBSTACLE_WIDTH);

        // Add new obstacles
        if (Math.random() < 0.02) {
          const newObstacle: Obstacle = {
            id: obstacleIdRef.current++,
            x: SCREEN_WIDTH,
            y: Math.random() * (GAME_HEIGHT - OBSTACLE_HEIGHT),
            type: Math.random() > 0.7 ? 'spike' : 'normal',
          };
          moved.push(newObstacle);
        }

        // Check collisions
        moved.forEach((obs) => {
          if (
            obs.x < SCREEN_WIDTH / 2 + PLAYER_SIZE / 2 &&
            obs.x + OBSTACLE_WIDTH > SCREEN_WIDTH / 2 - PLAYER_SIZE / 2 &&
            obs.y < playerY + PLAYER_SIZE / 2 &&
            obs.y + OBSTACLE_HEIGHT > playerY - PLAYER_SIZE / 2
          ) {
            if (!hasShield) {
              endGame();
            } else {
              setHasShield(false);
              obs.x = -1000;
            }
          }
        });

        return moved;
      });

      // Move power-ups
      setPowerUps((prev) => {
        const moved = prev
          .map((p) => ({ ...p, x: p.x - OBSTACLE_SPEED * gameSpeed }))
          .filter((p) => p.x > -POWERUP_SIZE);

        // Add new power-ups
        if (Math.random() < 0.01) {
          const types: ('speed' | 'shield' | 'coin')[] = ['speed', 'shield', 'coin'];
          const newPowerUp: PowerUp = {
            id: powerUpIdRef.current++,
            x: SCREEN_WIDTH,
            y: Math.random() * (GAME_HEIGHT - POWERUP_SIZE),
            type: types[Math.floor(Math.random() * types.length)],
          };
          moved.push(newPowerUp);
        }

        // Check power-up collection
        moved.forEach((p) => {
          if (
            p.x < SCREEN_WIDTH / 2 + PLAYER_SIZE / 2 &&
            p.x + POWERUP_SIZE > SCREEN_WIDTH / 2 - PLAYER_SIZE / 2 &&
            p.y < playerY + PLAYER_SIZE / 2 &&
            p.y + POWERUP_SIZE > playerY - PLAYER_SIZE / 2
          ) {
            collectPowerUp(p.type);
          }
        });

        return moved.filter((p) => {
          const collected =
            p.x < SCREEN_WIDTH / 2 + PLAYER_SIZE / 2 &&
            p.x + POWERUP_SIZE > SCREEN_WIDTH / 2 - PLAYER_SIZE / 2 &&
            p.y < playerY + PLAYER_SIZE / 2 &&
            p.y + POWERUP_SIZE > playerY - PLAYER_SIZE / 2;
          return !collected;
        });
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };
    loop();
  };

  const stopGameLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const collectPowerUp = (type: 'speed' | 'shield' | 'coin') => {
    if (type === 'shield') {
      setHasShield(true);
      setTimeout(() => setHasShield(false), 5000);
    } else if (type === 'speed') {
      setSpeedBoost(true);
      setGameSpeed((prev) => Math.min(prev + 0.5, 3));
      setTimeout(() => {
        setSpeedBoost(false);
        setGameSpeed((prev) => Math.max(prev - 0.5, 1));
      }, 3000);
    } else if (type === 'coin') {
      const newCoins = coins + 10;
      setCoins(newCoins);
      if (user) {
        supabase
          .from('game_scores')
          .upsert({
            user_id: user.id,
            game_type: 'galaxy_runner',
            coins: newCoins,
          }, {
            onConflict: 'user_id,game_type'
          });
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setPlayerY(GAME_HEIGHT / 2);
    playerYAnimated.value = GAME_HEIGHT / 2;
    setObstacles([]);
    setPowerUps([]);
    setHasShield(false);
    setSpeedBoost(false);
    setGameSpeed(1);
    obstacleIdRef.current = 0;
    powerUpIdRef.current = 0;
  };

  const endGame = () => {
    setGameState('gameover');
    stopGameLoop();
    if (score > highScore) {
      setHighScore(score);
    }
    saveGameData();
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    if (gameState !== 'playing') return;
    
    const { locationY } = evt.nativeEvent;
    const newY = Math.max(
      PLAYER_SIZE / 2,
      Math.min(locationY, GAME_HEIGHT - PLAYER_SIZE / 2)
    );
    
    setPlayerY(newY);
    playerYAnimated.value = withTiming(newY, { duration: 100 });
  };

  const playerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: playerYAnimated.value - PLAYER_SIZE / 2 }],
    };
  });

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Text style={[styles.dinoEmoji, { fontSize: 64 }]}>🦖</Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>Galaxy Runner</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Endless space adventure
          </Text>

          <View style={[styles.statsContainer, { backgroundColor: theme.base.card }]}>
            <View style={styles.statItem}>
              <Trophy size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {highScore}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                High Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Star size={24} color={theme.accent} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                Level {level}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Level
              </Text>
            </View>
            <View style={styles.statItem}>
              <Target size={24} color={theme.status.warning} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {coins}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Coins
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              Start Game
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'gameover') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Game Over</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Distance: {distance}m
          </Text>
          <Text style={[styles.scoreText, { color: theme.primary }]}>Score: {score}</Text>
          {score > highScore && (
            <Text style={[styles.newRecord, { color: theme.status.success }]}>
              New Record! 🎉
            </Text>
          )}

          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={[styles.startButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              Main Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={[styles.hudText, { color: theme.text.primary }]}>
            Score: {score}
          </Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={[styles.hudText, { color: theme.text.primary }]}>
            Distance: {distance}m
          </Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={[styles.hudText, { color: theme.text.primary }]}>
            Level: {level}
          </Text>
        </View>
        {hasShield && (
          <View style={[styles.powerUpIndicator, { backgroundColor: theme.status.info }]}>
            <Shield size={20} color={theme.text.inverse} />
          </View>
        )}
        {speedBoost && (
          <View style={[styles.powerUpIndicator, { backgroundColor: theme.status.warning }]}>
            <Zap size={20} color={theme.text.inverse} />
          </View>
        )}
      </View>

      {/* Game Area */}
      <View
        style={[styles.gameArea, { backgroundColor: theme.base.surface }]}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
      >
        {/* Player - Dinosaur */}
        <Animated.View
          style={[
            styles.player,
            playerStyle,
            {
              backgroundColor: 'transparent',
            },
          ]}
        >
          <Text style={[styles.dinoEmoji, { fontSize: 50 }]}>
            {hasShield ? '🦕' : '🦖'}
          </Text>
        </Animated.View>

        {/* Obstacles - Dinosaurs */}
        {obstacles.map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              {
                left: obs.x,
                top: obs.y,
                backgroundColor: 'transparent',
              },
            ]}
          >
            <Text style={[styles.dinoEmoji, { fontSize: 40 }]}>
              {obs.type === 'spike' ? '🦕' : '🦖'}
            </Text>
          </View>
        ))}

        {/* Power-ups */}
        {powerUps.map((p) => (
          <View
            key={p.id}
            style={[
              styles.powerUp,
              {
                left: p.x,
                top: p.y,
                backgroundColor:
                  p.type === 'shield'
                    ? theme.status.info
                    : p.type === 'speed'
                    ? theme.status.warning
                    : theme.accent,
              },
            ]}
          >
            {p.type === 'shield' && <Shield size={20} color={theme.text.inverse} />}
            {p.type === 'speed' && <Zap size={20} color={theme.text.inverse} />}
            {p.type === 'coin' && <Star size={20} color={theme.text.inverse} />}
          </View>
        ))}
      </View>

      {/* Pause/Resume Button */}
      <TouchableOpacity
        onPress={() => {
          if (gameState === 'playing') {
            setGameState('paused');
            stopGameLoop();
          } else if (gameState === 'paused') {
            setGameState('playing');
            startGameLoop();
          }
        }}
        style={[styles.pauseButton, { backgroundColor: theme.base.card }]}
      >
        {gameState === 'playing' ? (
          <Pause size={24} color={theme.text.primary} />
        ) : (
          <Play size={24} color={theme.text.primary} />
        )}
      </TouchableOpacity>

      {/* Paused Overlay */}
      {gameState === 'paused' && (
        <View style={[styles.pausedOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.pausedContent, { backgroundColor: theme.base.card }]}>
            <Text style={[styles.pausedTitle, { color: theme.text.primary }]}>Paused</Text>
            <Text style={[styles.pausedText, { color: theme.text.secondary }]}>
              Score: {score}
            </Text>
            <Text style={[styles.pausedText, { color: theme.text.secondary }]}>
              Distance: {distance}m
            </Text>
            <TouchableOpacity
              onPress={() => {
                setGameState('playing');
                startGameLoop();
              }}
              style={[styles.resumeButton, { backgroundColor: theme.primary }]}
            >
              <Play size={20} color={theme.text.inverse} />
              <Text style={[styles.resumeButtonText, { color: theme.text.inverse }]}>
                Resume
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={endGame}
              style={[styles.quitButton, { borderColor: theme.base.border }]}
            >
              <Text style={[styles.quitButtonText, { color: theme.text.secondary }]}>
                Quit Game
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  newRecord: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  hudItem: {
    flex: 1,
    alignItems: 'center',
  },
  hudText: {
    fontSize: 14,
    fontWeight: '600',
  },
  powerUpIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  gameArea: {
    width: SCREEN_WIDTH,
    height: GAME_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    left: SCREEN_WIDTH / 2 - PLAYER_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacle: {
    position: 'absolute',
    width: OBSTACLE_WIDTH,
    height: OBSTACLE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  powerUp: {
    position: 'absolute',
    width: POWERUP_SIZE,
    height: POWERUP_SIZE,
    borderRadius: POWERUP_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pauseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pausedContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pausedText: {
    fontSize: 16,
    marginBottom: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 2,
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dinoEmoji: {
    textAlign: 'center',
  },
});
