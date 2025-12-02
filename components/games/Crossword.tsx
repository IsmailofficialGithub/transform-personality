import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { FileText, Play, Trophy } from 'lucide-react-native';

const GRID_SIZE = 10;
const WORDS = [
  { word: 'PUZZLE', clue: 'A game that challenges your mind', row: 2, col: 2, across: true },
  { word: 'LOGIC', clue: 'Reasoning and thinking', row: 4, col: 1, across: false },
  { word: 'BRAIN', clue: 'Your thinking organ', row: 1, col: 4, across: false },
  { word: 'SOLVE', clue: 'To find the answer', row: 5, col: 3, across: true },
];

export default function Crossword() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedWord, setSelectedWord] = useState<number | null>(null);
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
      .eq('game_type', 'zombie_escape')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const initializeGrid = () => {
    const newGrid: string[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
    WORDS.forEach((w) => {
      for (let i = 0; i < w.word.length; i++) {
        if (w.across) {
          newGrid[w.row][w.col + i] = '';
        } else {
          newGrid[w.row + i][w.col] = '';
        }
      }
    });
    setGrid(newGrid);
  };

  const handleCellPress = (row: number, col: number) => {
    const wordIndex = WORDS.findIndex((w) => {
      if (w.across) {
        return row === w.row && col >= w.col && col < w.col + w.word.length;
      } else {
        return col === w.col && row >= w.row && row < w.row + w.word.length;
      }
    });
    if (wordIndex !== -1) {
      setSelectedWord(wordIndex);
      setSelectedCell({ row, col });
    }
  };

  const handleInput = (text: string) => {
    if (!selectedCell || selectedWord === null) return;
    const word = WORDS[selectedWord];
    const newGrid = grid.map(r => [...r]);
    
    for (let i = 0; i < word.word.length; i++) {
      if (word.across) {
        const col = word.col + i;
        if (i < text.length) {
          newGrid[word.row][col] = text[i].toUpperCase();
        }
      } else {
        const row = word.row + i;
        if (i < text.length) {
          newGrid[row][word.col] = text[i].toUpperCase();
        }
      }
    }
    
    setGrid(newGrid);
    checkWord(word, text.toUpperCase());
  };

  const checkWord = (word: { word: string }, input: string) => {
    if (input === word.word) {
      setScore(score + 100);
      checkWin();
    }
  };

  const checkWin = () => {
    const allCorrect = WORDS.every((w) => {
      let currentWord = '';
      for (let i = 0; i < w.word.length; i++) {
        if (w.across) {
          currentWord += grid[w.row][w.col + i];
        } else {
          currentWord += grid[w.row + i][w.col];
        }
      }
      return currentWord === w.word;
    });
    
    if (allCorrect) {
      setGameState('gameover');
      saveGameData();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setSelectedCell(null);
    setSelectedWord(null);
    initializeGrid();
  };

  const saveGameData = async () => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'zombie_escape',
        score: score + 500,
      }, { onConflict: 'user_id,game_type' });
    setHighScore(score + 500);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <FileText size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Crossword</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Fill in the words using clues
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
        <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.gridContainer}>
          {grid.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((cell, colIdx) => {
                const isWordCell = WORDS.some((w) => {
                  if (w.across) {
                    return rowIdx === w.row && colIdx >= w.col && colIdx < w.col + w.word.length;
                  } else {
                    return colIdx === w.col && rowIdx >= w.row && rowIdx < w.row + w.word.length;
                  }
                });
                const isSelected = selectedCell?.row === rowIdx && selectedCell?.col === colIdx;
                
                if (!isWordCell) {
                  return <View key={colIdx} style={[styles.cell, { backgroundColor: theme.base.border }]} />;
                }
                
                return (
                  <TouchableOpacity
                    key={colIdx}
                    style={[
                      styles.cell,
                      {
                        backgroundColor: isSelected ? theme.primary : theme.base.card,
                        borderColor: theme.base.border,
                        borderWidth: 1,
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

        <View style={styles.cluesContainer}>
          <Text style={[styles.cluesTitle, { color: theme.text.primary }]}>Clues:</Text>
          {WORDS.map((word, idx) => (
            <View key={idx} style={styles.clueItem}>
              <Text style={[styles.clueText, { color: theme.text.primary }]}>
                {idx + 1}. {word.clue} ({word.word.length} letters)
              </Text>
            </View>
          ))}
        </View>

        {selectedWord !== null && (
          <View style={styles.inputContainer}>
            <Text style={[styles.inputLabel, { color: theme.text.primary }]}>
              Enter word for clue {selectedWord + 1}:
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: theme.base.card,
                  color: theme.text.primary,
                  borderColor: theme.base.border,
                },
              ]}
              value=""
              onChangeText={handleInput}
              autoCapitalize="characters"
              maxLength={WORDS[selectedWord]?.word.length || 10}
              placeholder="Type word..."
              placeholderTextColor={theme.text.tertiary}
            />
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  gridContainer: {
    alignSelf: 'center',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cluesContainer: {
    padding: 15,
  },
  cluesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clueItem: {
    marginBottom: 8,
  },
  clueText: {
    fontSize: 14,
  },
  inputContainer: {
    padding: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

