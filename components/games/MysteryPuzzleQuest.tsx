import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Brain, Puzzle, Trophy, Play, Pause, Lightbulb } from 'lucide-react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 4;
const CELL_SIZE = (SCREEN_WIDTH - 60) / GRID_SIZE;

interface PuzzlePiece {
  id: number;
  value: number;
  position: number;
  isLocked: boolean;
}

export default function MysteryPuzzleQuest() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [puzzle, setPuzzle] = useState<PuzzlePiece[]>([]);
  const [highScore, setHighScore] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'mystery_puzzle_quest')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const generatePuzzle = () => {
    const numbers = Array.from({ length: GRID_SIZE * GRID_SIZE - 1 }, (_, i) => i + 1);
    const shuffled = [...numbers].sort(() => Math.random() - 0.5);
    const pieces: PuzzlePiece[] = shuffled.map((value, index) => ({
      id: index,
      value,
      position: index,
      isLocked: false,
    }));
    pieces.push({ id: GRID_SIZE * GRID_SIZE - 1, value: 0, position: GRID_SIZE * GRID_SIZE - 1, isLocked: false });
    setPuzzle(pieces);
  };

  const movePiece = (index: number) => {
    if (gameState !== 'playing') return;
    
    const emptyIndex = puzzle.findIndex((p) => p.value === 0);
    const piece = puzzle[index];
    
    if (piece.isLocked) return;
    
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    const emptyRow = Math.floor(emptyIndex / GRID_SIZE);
    const emptyCol = emptyIndex % GRID_SIZE;
    
    const isAdjacent = 
      (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
      (col === emptyCol && Math.abs(row - emptyRow) === 1);
    
    if (isAdjacent) {
      const newPuzzle = [...puzzle];
      newPuzzle[emptyIndex].position = piece.position;
      newPuzzle[index].position = emptyIndex;
      newPuzzle[emptyIndex].value = piece.value;
      newPuzzle[index].value = 0;
      setPuzzle(newPuzzle);
      setMoves(moves + 1);
      checkWin(newPuzzle);
    }
  };

  const checkWin = (currentPuzzle: PuzzlePiece[]) => {
    const isSolved = currentPuzzle.every((piece, index) => {
      if (index === GRID_SIZE * GRID_SIZE - 1) return piece.value === 0;
      return piece.value === index + 1;
    });
    
    if (isSolved) {
      const newScore = score + (level * 100) - moves + (timeLeft * 2);
      setScore(newScore);
      setLevel(level + 1);
      setMoves(0);
      setTimeLeft(120 + level * 10);
      generatePuzzle();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setMoves(0);
    setTimeLeft(120);
    generatePuzzle();
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
      .eq('game_type', 'mystery_puzzle_quest')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'mystery_puzzle_quest',
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
          <Puzzle size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Mystery Puzzle Quest</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Solve sliding puzzles to progress
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
        <TouchableOpacity onPress={() => setGameState(gameState === 'paused' ? 'playing' : 'paused')}>
          <Pause size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Level: {level}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Time: {timeLeft}s</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Moves: {moves}</Text>
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

      <View style={styles.puzzleContainer}>
        {puzzle.map((piece, index) => {
          if (piece.value === 0) {
            return <View key={piece.id} style={[styles.cell, styles.emptyCell]} />;
          }
          return (
            <TouchableOpacity
              key={piece.id}
              style={[
                styles.cell,
                {
                  backgroundColor: piece.isLocked ? theme.base.border : theme.primary,
                },
              ]}
              onPress={() => movePiece(index)}
            >
              <Text style={[styles.cellText, { color: theme.text.inverse }]}>
                {piece.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    width: '100%',
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
  puzzleContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: SCREEN_WIDTH - 40,
    justifyContent: 'center',
    padding: 10,
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCell: {
    backgroundColor: 'transparent',
  },
  cellText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

