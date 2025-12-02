import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Grid3x3, Play, Trophy } from 'lucide-react-native';

const GRID_SIZE = 9;
const BOX_SIZE = 3;

export default function Sudoku() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [grid, setGrid] = useState<number[][]>([]);
  const [solution, setSolution] = useState<number[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) loadHighScore();
  }, [user]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameState === 'playing') {
      interval = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'galaxy_runner')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateSudoku = () => {
    const newGrid: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    const newSolution: number[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
    
    // Generate a valid solution
    solveSudoku(newSolution);
    
    // Remove some numbers to create puzzle
    const puzzle = newSolution.map(row => [...row]);
    const cellsToRemove = 40;
    let removed = 0;
    while (removed < cellsToRemove) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (puzzle[row][col] !== 0) {
        puzzle[row][col] = 0;
        removed++;
      }
    }
    
    setGrid(puzzle);
    setSolution(newSolution);
  };

  const solveSudoku = (board: number[][]): boolean => {
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (board[row][col] === 0) {
          const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
          for (const num of nums) {
            if (isValid(board, row, col, num)) {
              board[row][col] = num;
              if (solveSudoku(board)) return true;
              board[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const isValid = (board: number[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < GRID_SIZE; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    for (let i = boxRow; i < boxRow + BOX_SIZE; i++) {
      for (let j = boxCol; j < boxCol + BOX_SIZE; j++) {
        if (board[i][j] === num) return false;
      }
    }
    return true;
  };

  const handleCellPress = (row: number, col: number) => {
    if (grid[row][col] === 0) {
      setSelectedCell({ row, col });
    }
  };

  const handleNumberPress = (num: number) => {
    if (!selectedCell) return;
    const { row, col } = selectedCell;
    const newGrid = grid.map(r => [...r]);
    newGrid[row][col] = num;
    setGrid(newGrid);
    
    if (newGrid[row][col] === solution[row][col]) {
      setScore(score + 10);
      checkWin(newGrid);
    } else {
      setScore(Math.max(0, score - 5));
    }
    setSelectedCell(null);
  };

  const checkWin = (currentGrid: number[][]) => {
    const isComplete = currentGrid.every((row, r) =>
      row.every((cell, c) => cell === solution[r][c] && cell !== 0)
    );
    if (isComplete) {
      const finalScore = score + (1000 - time * 2);
      setScore(finalScore);
      setGameState('gameover');
      saveGameData(finalScore);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setTime(0);
    setSelectedCell(null);
    generateSudoku();
  };

  const saveGameData = async (finalScore: number) => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'galaxy_runner',
        score: finalScore,
      }, { onConflict: 'user_id,game_type' });
    if (finalScore > highScore) setHighScore(finalScore);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Grid3x3 size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Sudoku</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Fill the grid with numbers 1-9
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
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Start</Text>
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
          <Text style={[styles.title, { color: theme.text.primary }]}>Completed!</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Score: {score}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
          </Text>
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Play Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      <View style={styles.header}>
        <Text style={[styles.statText, { color: theme.text.primary }]}>
          Score: {score} | Time: {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
        </Text>
      </View>
      
      <View style={styles.gridContainer}>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => {
              const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
              const isBoxBorder = rowIdx % BOX_SIZE === 0 || colIdx % BOX_SIZE === 0;
              const isInitial = grid[rowIdx][colIdx] !== 0 && solution[rowIdx][colIdx] === grid[rowIdx][colIdx];
              
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.base.card,
                      borderColor: isBoxBorder ? theme.text.primary : theme.base.border,
                      borderWidth: isBoxBorder ? 2 : 1,
                    },
                  ]}
                  onPress={() => handleCellPress(rowIdx, colIdx)}
                >
                  <Text
                    style={[
                      styles.cellText,
                      {
                        color: isSelected
                          ? theme.text.inverse
                          : isInitial
                          ? theme.text.primary
                          : theme.text.secondary,
                        fontWeight: isInitial ? 'bold' : 'normal',
                      },
                    ]}
                  >
                    {cell !== 0 ? cell : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.numberButton, { backgroundColor: theme.base.card }]}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={[styles.numberText, { color: theme.text.primary }]}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  menuContainer: {
    flex: 1,
    justifyContent: 'center',
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
    marginBottom: 10,
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
    gap: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    padding: 10,
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
  },
  gridContainer: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 18,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: 10,
    gap: 10,
  },
  numberButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

