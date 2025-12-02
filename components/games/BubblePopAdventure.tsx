import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, GestureResponderEvent } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Sparkles, Play, Pause, Trophy } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_WIDTH = SCREEN_WIDTH - 40;
const GAME_HEIGHT = SCREEN_HEIGHT * 0.6;
const BUBBLE_SIZE = 40;
const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

interface Bubble {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function BubblePopAdventure() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [shooterBubble, setShooterBubble] = useState<Bubble | null>(null);
  const [angle, setAngle] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const bubbleIdRef = useRef(0);

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
      .eq('game_type', 'bubble_pop_adventure')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const generateBubbles = () => {
    const newBubbles: Bubble[] = [];
    const rows = 5;
    const cols = Math.floor(GAME_WIDTH / BUBBLE_SIZE);
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (Math.random() > 0.3) {
          newBubbles.push({
            id: bubbleIdRef.current++,
            x: col * BUBBLE_SIZE + BUBBLE_SIZE / 2,
            y: row * BUBBLE_SIZE + 20,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            size: BUBBLE_SIZE,
          });
        }
      }
    }
    setBubbles(newBubbles);
    setShooterBubble({
      id: bubbleIdRef.current++,
      x: GAME_WIDTH / 2,
      y: GAME_HEIGHT - 50,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: BUBBLE_SIZE,
    });
  };

  const shootBubble = () => {
    if (!shooterBubble || gameState !== 'playing') return;
    
    const radians = (angle * Math.PI) / 180;
    const speed = 5;
    let bubbleX = shooterBubble.x;
    let bubbleY = shooterBubble.y;
    
    const moveBubble = () => {
      bubbleX += Math.sin(radians) * speed;
      bubbleY -= Math.cos(radians) * speed;
      
      // Check collision with walls
      if (bubbleX <= BUBBLE_SIZE / 2 || bubbleX >= GAME_WIDTH - BUBBLE_SIZE / 2) {
        const newAngle = 180 - angle;
        setAngle(newAngle);
        return;
      }
      
      // Check collision with bubbles
      const collidedBubble = bubbles.find((b) => {
        const distance = Math.sqrt(
          Math.pow(bubbleX - b.x, 2) + Math.pow(bubbleY - b.y, 2)
        );
        return distance < BUBBLE_SIZE;
      });
      
      if (collidedBubble) {
        if (collidedBubble.color === shooterBubble.color) {
          // Pop matching bubbles
          const matchingBubbles = bubbles.filter((b) => b.color === shooterBubble.color);
          setBubbles((prev) => prev.filter((b) => !matchingBubbles.includes(b)));
          setScore(score + matchingBubbles.length * 10);
          
          if (bubbles.length - matchingBubbles.length === 0) {
            setLevel(level + 1);
            generateBubbles();
          }
        } else {
          // Add bubble to board
          setBubbles((prev) => [
            ...prev,
            {
              ...shooterBubble,
              x: bubbleX,
              y: bubbleY,
            },
          ]);
        }
        
        setShooterBubble({
          id: bubbleIdRef.current++,
          x: GAME_WIDTH / 2,
          y: GAME_HEIGHT - 50,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: BUBBLE_SIZE,
        });
        return;
      }
      
      // Check if bubble went off screen
      if (bubbleY < 0) {
        setShooterBubble({
          id: bubbleIdRef.current++,
          x: GAME_WIDTH / 2,
          y: GAME_HEIGHT - 50,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          size: BUBBLE_SIZE,
        });
        return;
      }
      
      requestAnimationFrame(moveBubble);
    };
    
    moveBubble();
  };

  const handleTouch = (evt: GestureResponderEvent) => {
    if (gameState !== 'playing') return;
    const { locationX, locationY } = evt.nativeEvent;
    const centerX = GAME_WIDTH / 2;
    const centerY = GAME_HEIGHT - 50;
    const dx = locationX - centerX;
    const dy = locationY - centerY;
    const newAngle = (Math.atan2(dx, -dy) * 180) / Math.PI;
    setAngle(newAngle);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setAngle(0);
    generateBubbles();
  };

  const endGame = () => {
    setGameState('gameover');
    saveGameData();
  };

  const saveGameData = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'bubble_pop_adventure')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'bubble_pop_adventure',
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
          <Sparkles size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Bubble Pop Adventure</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Pop matching bubbles
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
            Level Reached: {level}
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
        }}>
          <Pause size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Level: {level}</Text>
        </View>
      </View>

      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <Text style={[styles.pauseText, { color: theme.text.primary }]}>Paused</Text>
          <TouchableOpacity
            onPress={() => setGameState('playing')}
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
        {/* Bubbles */}
        {bubbles.map((bubble) => (
          <View
            key={bubble.id}
            style={[
              styles.bubble,
              {
                left: bubble.x - BUBBLE_SIZE / 2,
                top: bubble.y - BUBBLE_SIZE / 2,
                backgroundColor: bubble.color,
              },
            ]}
          />
        ))}

        {/* Shooter bubble */}
        {shooterBubble && (
          <View
            style={[
              styles.shooter,
              {
                left: shooterBubble.x - BUBBLE_SIZE / 2,
                top: shooterBubble.y - BUBBLE_SIZE / 2,
                backgroundColor: shooterBubble.color,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        )}

        {/* Aim line */}
        {shooterBubble && (
          <View
            style={[
              styles.aimLine,
              {
                left: shooterBubble.x,
                top: shooterBubble.y,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        )}
      </View>

      <TouchableOpacity
        onPress={shootBubble}
        style={[styles.shootButton, { backgroundColor: theme.primary }]}
      >
        <Text style={[styles.shootText, { color: theme.text.inverse }]}>Shoot</Text>
      </TouchableOpacity>
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
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    alignSelf: 'center',
    marginTop: 20,
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
  },
  shooter: {
    position: 'absolute',
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
  },
  aimLine: {
    position: 'absolute',
    width: 2,
    height: 100,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  shootButton: {
    alignSelf: 'center',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  shootText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

