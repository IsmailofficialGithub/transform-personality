import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Sword, Play, Pause, Trophy, Target } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_SIZE = Math.min(SCREEN_WIDTH - 40, SCREEN_HEIGHT * 0.6);
const NINJA_SIZE = 50;
const ENEMY_SIZE = 40;

interface Enemy {
  id: number;
  x: number;
  y: number;
  health: number;
  type: 'normal' | 'fast' | 'boss';
}

export default function NinjaShadowStrike() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [health, setHealth] = useState(100);
  const [ninjaX, setNinjaX] = useState(GAME_SIZE / 2);
  const [ninjaY, setNinjaY] = useState(GAME_SIZE - 80);
  const [enemies, setEnemies] = useState<Enemy[]>([]);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const enemyIdRef = useRef(0);
  const ninjaXAnimated = useSharedValue(GAME_SIZE / 2);
  const ninjaYAnimated = useSharedValue(GAME_SIZE - 80);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'ninja_shadow_strike')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const startGameLoop = () => {
    if (gameLoopRef.current) return;
    
    const loop = () => {
      if (gameState !== 'playing') return;
      
      // Spawn enemies
      if (Math.random() < 0.03 + level * 0.01) {
        const type = Math.random() < 0.1 ? 'boss' : Math.random() < 0.3 ? 'fast' : 'normal';
        const newEnemy: Enemy = {
          id: enemyIdRef.current++,
          x: Math.random() * (GAME_SIZE - ENEMY_SIZE),
          y: -ENEMY_SIZE,
          health: type === 'boss' ? 3 : 1,
          type,
        };
        setEnemies((prev) => [...prev, newEnemy]);
      }
      
      // Move enemies
      setEnemies((prev) => {
        const moved = prev.map((enemy) => ({
          ...enemy,
          y: enemy.y + (enemy.type === 'fast' ? 3 : enemy.type === 'boss' ? 2 : 1.5),
        }));
        
        // Check collisions
        const hitEnemies = moved.filter((enemy) => {
          const distance = Math.sqrt(
            Math.pow(enemy.x + ENEMY_SIZE / 2 - (ninjaX + NINJA_SIZE / 2), 2) +
            Math.pow(enemy.y + ENEMY_SIZE / 2 - (ninjaY + NINJA_SIZE / 2), 2)
          );
          return distance < (NINJA_SIZE + ENEMY_SIZE) / 2;
        });
        
        if (hitEnemies.length > 0) {
          setHealth((prev) => {
            const newHealth = prev - 10;
            if (newHealth <= 0) {
              endGame();
            }
            return newHealth;
          });
          return moved.filter((e) => !hitEnemies.includes(e));
        }
        
        return moved.filter((e) => e.y < GAME_SIZE + 50);
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

  const strikeEnemy = (enemyId: number) => {
    setEnemies((prev) => {
      const updated = prev.map((enemy) => {
        if (enemy.id === enemyId) {
          const newHealth = enemy.health - 1;
          if (newHealth <= 0) {
            setScore((prev) => prev + (enemy.type === 'boss' ? 50 : enemy.type === 'fast' ? 20 : 10));
            return null;
          }
          return { ...enemy, health: newHealth };
        }
        return enemy;
      });
      return updated.filter((e) => e !== null) as Enemy[];
    });
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    if (gameState !== 'playing') return;
    const { locationX, locationY } = evt.nativeEvent;
    const newX = Math.max(NINJA_SIZE / 2, Math.min(locationX, GAME_SIZE - NINJA_SIZE / 2));
    const newY = Math.max(NINJA_SIZE / 2, Math.min(locationY, GAME_SIZE - NINJA_SIZE / 2));
    setNinjaX(newX);
    setNinjaY(newY);
    ninjaXAnimated.value = withTiming(newX - NINJA_SIZE / 2, { duration: 100 });
    ninjaYAnimated.value = withTiming(newY - NINJA_SIZE / 2, { duration: 100 });
    
    // Check if touching an enemy
    enemies.forEach((enemy) => {
      const distance = Math.sqrt(
        Math.pow(enemy.x + ENEMY_SIZE / 2 - locationX, 2) +
        Math.pow(enemy.y + ENEMY_SIZE / 2 - locationY, 2)
      );
      if (distance < ENEMY_SIZE) {
        strikeEnemy(enemy.id);
      }
    });
  };

  const ninjaStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: ninjaXAnimated.value },
        { translateY: ninjaYAnimated.value },
      ],
    };
  });

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setHealth(100);
    setNinjaX(GAME_SIZE / 2);
    setNinjaY(GAME_SIZE - 80);
    ninjaXAnimated.value = GAME_SIZE / 2 - NINJA_SIZE / 2;
    ninjaYAnimated.value = GAME_SIZE - 80 - NINJA_SIZE / 2;
    setEnemies([]);
    enemyIdRef.current = 0;
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
      .eq('game_type', 'ninja_shadow_strike')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'ninja_shadow_strike',
          score,
          level,
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
          <Sword size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Ninja Shadow Strike</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Strike down your enemies
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
          <Text style={[styles.statText, { color: theme.text.primary }]}>Health: {health}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Level: {level}</Text>
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
        style={[styles.gameArea, { backgroundColor: theme.base.surface }]}
        onTouchStart={handleTouch}
        onTouchMove={handleTouch}
      >
        {/* Ninja */}
        <Animated.View
          style={[
            styles.ninja,
            ninjaStyle,
            { backgroundColor: theme.primary },
          ]}
        >
          <Sword size={30} color={theme.text.inverse} />
        </Animated.View>

        {/* Enemies */}
        {enemies.map((enemy) => (
          <TouchableOpacity
            key={enemy.id}
            style={[
              styles.enemy,
              {
                left: enemy.x,
                top: enemy.y,
                backgroundColor:
                  enemy.type === 'boss'
                    ? theme.status.error
                    : enemy.type === 'fast'
                    ? theme.status.warning
                    : theme.accent,
              },
            ]}
            onPress={() => strikeEnemy(enemy.id)}
          >
            <Target size={20} color={theme.text.inverse} />
            {enemy.health > 1 && (
              <Text style={[styles.healthText, { color: theme.text.inverse }]}>
                {enemy.health}
              </Text>
            )}
          </TouchableOpacity>
        ))}
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
  gameArea: {
    width: GAME_SIZE,
    height: GAME_SIZE,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  ninja: {
    position: 'absolute',
    width: NINJA_SIZE,
    height: NINJA_SIZE,
    borderRadius: NINJA_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  enemy: {
    position: 'absolute',
    width: ENEMY_SIZE,
    height: ENEMY_SIZE,
    borderRadius: ENEMY_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
  },
});

