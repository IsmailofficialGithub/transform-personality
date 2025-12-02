import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Search, Play, Trophy } from 'lucide-react-native';

const GRID_SIZE = 10;
const WORDS = ['PUZZLE', 'LOGIC', 'BRAIN', 'SOLVE', 'THINK'];

export default function WordSearch() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Array<{ row: number; col: number }>>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) loadHighScore();
  }, [user]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'mystery_puzzle_quest')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateGrid = () => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    // Place words
    WORDS.forEach((word) => {
      let placed = false;
      while (!placed) {
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);
        const direction = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        
        if (direction === 'horizontal' && col + word.length <= GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row][col + i] !== '' && newGrid[row][col + i] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row][col + i] = word[i];
            }
            placed = true;
          }
        } else if (direction === 'vertical' && row + word.length <= GRID_SIZE) {
          let canPlace = true;
          for (let i = 0; i < word.length; i++) {
            if (newGrid[row + i][col] !== '' && newGrid[row + i][col] !== word[i]) {
              canPlace = false;
              break;
            }
          }
          if (canPlace) {
            for (let i = 0; i < word.length; i++) {
              newGrid[row + i][col] = word[i];
            }
            placed = true;
          }
        }
      }
    });
    
    // Fill empty cells
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (newGrid[i][j] === '') {
          newGrid[i][j] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    setGrid(newGrid);
  };

  const handleCellPress = (row: number, col: number) => {
    if (selectedCells.length === 0) {
      setSelectedCells([{ row, col }]);
    } else {
      const last = selectedCells[selectedCells.length - 1];
      const isAdjacent = Math.abs(row - last.row) <= 1 && Math.abs(col - last.col) <= 1;
      if (isAdjacent) {
        const newSelected = [...selectedCells, { row, col }];
        setSelectedCells(newSelected);
        checkWord(newSelected);
      } else {
        setSelectedCells([{ row, col }]);
      }
    }
  };

  const checkWord = (cells: Array<{ row: number; col: number }>) => {
    const word = cells.map(c => grid[c.row][c.col]).join('');
    const reversed = word.split('').reverse().join('');
    
    if (WORDS.includes(word) || WORDS.includes(reversed)) {
      if (!foundWords.includes(word) && !foundWords.includes(reversed)) {
        setFoundWords([...foundWords, word]);
        setScore(score + 100);
        setSelectedCells([]);
        if (foundWords.length + 1 === WORDS.length) {
          setGameState('gameover');
          saveGameData();
        }
      }
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setFoundWords([]);
    setSelectedCells([]);
    generateGrid();
  };

  const saveGameData = async () => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'mystery_puzzle_quest',
        score: score + 500,
      }, { onConflict: 'user_id,game_type' });
    setHighScore(score + 500);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Search size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Word Search</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Find all hidden words
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
            Score: {score + 500}
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
          Score: {score} | Found: {foundWords.length}/{WORDS.length}
        </Text>
      </View>

      <View style={styles.gridContainer}>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => {
              const isSelected = selectedCells.some(c => c.row === rowIdx && c.col === colIdx);
              return (
                <TouchableOpacity
                  key={colIdx}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.base.card,
                      borderColor: theme.base.border,
                    },
                  ]}
                  onPress={() => handleCellPress(rowIdx, colIdx)}
                >
                  <Text
                    style={[
                      styles.cellText,
                      { color: isSelected ? theme.text.inverse : theme.text.primary },
                    ]}
                  >
                    {cell}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      <View style={styles.wordsContainer}>
        <Text style={[styles.wordsTitle, { color: theme.text.primary }]}>Words to find:</Text>
        {WORDS.map((word, idx) => (
          <Text
            key={idx}
            style={[
              styles.wordText,
              {
                color: foundWords.includes(word) ? theme.status.success : theme.text.secondary,
                textDecorationLine: foundWords.includes(word) ? 'line-through' : 'none',
              },
            ]}
          >
            {word}
          </Text>
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
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cellText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  wordsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  wordsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    width: '100%',
    marginBottom: 5,
  },
  wordText: {
    fontSize: 14,
    marginRight: 10,
  },
});

