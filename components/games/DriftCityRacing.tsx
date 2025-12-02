import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, PanResponder } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Car, Play, Pause, Trophy, Zap } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const TRACK_WIDTH = SCREEN_WIDTH;
const TRACK_HEIGHT = SCREEN_HEIGHT * 0.6;
const CAR_SIZE = 60;
const LANE_WIDTH = TRACK_WIDTH / 3;

export default function DriftCityRacing() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [lane, setLane] = useState(1); // 0, 1, 2
  const [obstacles, setObstacles] = useState<Array<{ id: number; lane: number; y: number }>>([]);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const obstacleIdRef = useRef(0);
  const laneAnimated = useSharedValue(1);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score, distance')
      .eq('user_id', user.id)
      .eq('game_type', 'drift_city_racing')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) return;
    
    const loop = () => {
      if (gameState !== 'playing') return;
      
      setDistance((prev) => prev + speed);
      setScore((prev) => prev + Math.floor(speed));
      setSpeed((prev) => Math.min(prev + 0.01, 5));
      
      // Spawn obstacles
      if (Math.random() < 0.02) {
        const newObstacle = {
          id: obstacleIdRef.current++,
          lane: Math.floor(Math.random() * 3),
          y: -50,
        };
        setObstacles((prev) => [...prev, newObstacle]);
      }
      
      // Move obstacles
      setObstacles((prev) => {
        const moved = prev.map((obs) => ({
          ...obs,
          y: obs.y + speed * 5,
        }));
        
        // Check collisions
        const carY = TRACK_HEIGHT - 100;
        const collided = moved.some(
          (obs) => obs.lane === lane && obs.y > carY - 30 && obs.y < carY + 30
        );
        
        if (collided) {
          endGame();
          return [];
        }
        
        return moved.filter((obs) => obs.y < TRACK_HEIGHT + 50);
      });
      
      gameLoopRef.current = setTimeout(loop, 16);
    };
    loop();
  };

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const changeLane = (newLane: number) => {
    if (newLane < 0 || newLane > 2) return;
    setLane(newLane);
    laneAnimated.value = withTiming(newLane, { duration: 200 });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt) => {
      if (gameState !== 'playing') return;
      const { moveX } = evt.nativeEvent;
      const newLane = Math.floor(moveX / LANE_WIDTH);
      if (newLane !== lane && newLane >= 0 && newLane <= 2) {
        changeLane(newLane);
      }
    },
  });

  const carStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: laneAnimated.value * LANE_WIDTH + LANE_WIDTH / 2 - CAR_SIZE / 2 }],
    };
  });

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setDistance(0);
    setSpeed(1);
    setLane(1);
    laneAnimated.value = 1;
    setObstacles([]);
    obstacleIdRef.current = 0;
    startGameLoop();
  };

  const endGame = () => {
    setGameState('gameover');
    stopGameLoop();
    saveGameData();
  };

  const saveGameData = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'drift_city_racing')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'drift_city_racing',
          score,
          distance: Math.floor(distance),
        }, {
          onConflict: 'user_id,game_type'
        });
      setHighScore(score);
    }
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Car size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Drift City Racing</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Race through the city streets
          </Text>
          {highScore > 0 && (
            <Text style={[styles.highScore, { color: theme.text.secondary }]}>
              High Score: {highScore}
            </Text>
          )}
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Start Game</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'gameover') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Trophy size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Game Over</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Final Score: {score}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Distance: {Math.floor(distance)}m
          </Text>
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={[styles.button, { backgroundColor: theme.base.card, marginTop: 10 }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => {
          setGameState('paused');
          stopGameLoop();
        }}>
          <Pause size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Speed: {speed.toFixed(1)}x</Text>
        </View>
      </View>

      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <Text style={[styles.pauseText, { color: theme.text.primary }]}>Paused</Text>
          <TouchableOpacity
            onPress={() => {
              setGameState('playing');
              startGameLoop();
            }}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Resume</Text>
          </TouchableOpacity>
        </View>
      )}

      <View
        style={[styles.track, { backgroundColor: theme.base.surface }]}
        {...panResponder.panHandlers}
      >
        {/* Lane dividers */}
        {[1, 2].map((divider) => (
          <View
            key={divider}
            style={[
              styles.laneDivider,
              { left: divider * LANE_WIDTH, backgroundColor: theme.base.border },
            ]}
          />
        ))}

        {/* Obstacles */}
        {obstacles.map((obs) => (
          <View
            key={obs.id}
            style={[
              styles.obstacle,
              {
                left: obs.lane * LANE_WIDTH + LANE_WIDTH / 2 - 25,
                top: obs.y,
                backgroundColor: theme.status.error,
              },
            ]}
          >
            <Text style={styles.emoji}>🚗</Text>
          </View>
        ))}

        {/* Player car */}
        <Animated.View
          style={[
            styles.car,
            carStyle,
            {
              backgroundColor: theme.primary,
              top: TRACK_HEIGHT - 100,
            },
          ]}
        >
          <Car size={40} color={theme.text.inverse} />
        </Animated.View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.base.card }]}
          onPress={() => changeLane(Math.max(0, lane - 1))}
        >
          <Text style={[styles.controlText, { color: theme.text.primary }]}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.base.card }]}
          onPress={() => changeLane(Math.min(2, lane + 1))}
        >
          <Text style={[styles.controlText, { color: theme.text.primary }]}>→</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  highScore: {
    fontSize: 18,
    marginBottom: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    minWidth: 150,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    position: 'relative',
  },
  laneDivider: {
    position: 'absolute',
    width: 2,
    height: TRACK_HEIGHT,
  },
  car: {
    position: 'absolute',
    width: CAR_SIZE,
    height: CAR_SIZE,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  obstacle: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 30,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    padding: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

