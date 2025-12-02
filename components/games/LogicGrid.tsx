import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Grid, Play, Trophy } from 'lucide-react-native';

const CATEGORIES = ['Color', 'Shape', 'Size'];
const VALUES = ['Red', 'Blue', 'Green', 'Circle', 'Square', 'Triangle', 'Small', 'Medium', 'Large'];

export default function LogicGrid() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [grid, setGrid] = useState<Array<Array<string | null>>>([]);
  const [clues, setClues] = useState<string[]>([]);
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
      .eq('game_type', 'drift_city_racing')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generatePuzzle = () => {
    const newGrid: Array<Array<string | null>> = Array(3).fill(null).map(() => Array(3).fill(null));
    const newClues = [
      'Red is not in the first row',
      'Circle is in the middle column',
      'Large is in the bottom row',
      'Blue and Square are in the same row',
    ];
    setGrid(newGrid);
    setClues(newClues);
  };

  const handleCellPress = (row: number, col: number) => {
    // Simple logic grid - user selects values
    const newGrid = grid.map(r => [...r]);
    const current = newGrid[row][col];
    const options = VALUES.filter(v => !newGrid.flat().includes(v));
    if (options.length > 0) {
      newGrid[row][col] = options[0];
    } else {
      newGrid[row][col] = null;
    }
    setGrid(newGrid);
    checkSolution(newGrid);
  };

  const checkSolution = (currentGrid: Array<Array<string | null>>) => {
    const isComplete = currentGrid.every(row => row.every(cell => cell !== null));
    if (isComplete) {
      setScore(score + 100);
      setGameState('gameover');
      saveGameData();
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    generatePuzzle();
  };

  const saveGameData = async () => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'drift_city_racing',
        score: score + 100,
      }, { onConflict: 'user_id,game_type' });
    setHighScore(score + 100);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Grid size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Logic Grid</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Solve using logical deduction
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
            Score: {score + 100}
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

      <View style={styles.cluesContainer}>
        <Text style={[styles.cluesTitle, { color: theme.text.primary }]}>Clues:</Text>
        {clues.map((clue, idx) => (
          <Text key={idx} style={[styles.clueText, { color: theme.text.secondary }]}>
            {idx + 1}. {clue}
          </Text>
        ))}
      </View>

      <View style={styles.gridContainer}>
        {grid.map((row, rowIdx) => (
          <View key={rowIdx} style={styles.row}>
            {row.map((cell, colIdx) => (
              <TouchableOpacity
                key={colIdx}
                style={[
                  styles.cell,
                  {
                    backgroundColor: cell ? theme.primary : theme.base.card,
                    borderColor: theme.base.border,
                  },
                ]}
                onPress={() => handleCellPress(rowIdx, colIdx)}
              >
                <Text
                  style={[
                    styles.cellText,
                    { color: cell ? theme.text.inverse : theme.text.tertiary },
                  ]}
                >
                  {cell || '?'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
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
  cluesContainer: {
    padding: 15,
    marginBottom: 20,
  },
  cluesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clueText: {
    fontSize: 14,
    marginBottom: 5,
  },
  gridContainer: {
    alignSelf: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    margin: 2,
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

