import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Lock, Play, Trophy } from 'lucide-react-native';

const CODE_LENGTH = 4;
const COLORS = ['R', 'G', 'B', 'Y', 'P', 'O'];

export default function CodeBreaker() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [secretCode, setSecretCode] = useState<string[]>([]);
  const [guesses, setGuesses] = useState<Array<{ code: string[]; feedback: string }>>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [attempts, setAttempts] = useState(0);
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
      .eq('game_type', 'dungeon_explorer_rpg')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateCode = () => {
    const code: string[] = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      code.push(COLORS[Math.floor(Math.random() * COLORS.length)]);
    }
    setSecretCode(code);
  };

  const getFeedback = (guess: string[]): string => {
    let correct = 0;
    let wrongPosition = 0;
    const codeCounts: { [key: string]: number } = {};
    const guessCounts: { [key: string]: number } = {};
    
    secretCode.forEach(c => codeCounts[c] = (codeCounts[c] || 0) + 1);
    guess.forEach(c => guessCounts[c] = (guessCounts[c] || 0) + 1);
    
    guess.forEach((c, i) => {
      if (c === secretCode[i]) {
        correct++;
        codeCounts[c]--;
        guessCounts[c]--;
      }
    });
    
    guess.forEach((c, i) => {
      if (c !== secretCode[i] && codeCounts[c] > 0 && guessCounts[c] > 0) {
        wrongPosition++;
        codeCounts[c]--;
        guessCounts[c]--;
      }
    });
    
    return `${correct} correct, ${wrongPosition} wrong position`;
  };

  const handleColorPress = (color: string) => {
    if (currentGuess.length < CODE_LENGTH) {
      setCurrentGuess([...currentGuess, color]);
    }
  };

  const handleSubmit = () => {
    if (currentGuess.length !== CODE_LENGTH) return;
    
    const feedback = getFeedback(currentGuess);
    setGuesses([...guesses, { code: [...currentGuess], feedback }]);
    setAttempts(attempts + 1);
    
    if (currentGuess.join('') === secretCode.join('')) {
      const finalScore = (10 - attempts) * 100;
      setScore(finalScore);
      setGameState('gameover');
      saveGameData(finalScore);
    } else {
      setCurrentGuess([]);
      if (attempts >= 9) {
        setGameState('gameover');
        saveGameData(0);
      }
    }
  };

  const handleClear = () => {
    setCurrentGuess([]);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setAttempts(0);
    setGuesses([]);
    setCurrentGuess([]);
    generateCode();
  };

  const saveGameData = async (finalScore: number) => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'dungeon_explorer_rpg',
        score: finalScore,
      }, { onConflict: 'user_id,game_type' });
    if (finalScore > highScore) setHighScore(finalScore);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Lock size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Code Breaker</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Crack the 4-color code
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
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {score > 0 ? 'Code Cracked!' : 'Game Over'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Score: {score}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Code was: {secretCode.join('')}
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
          Attempts: {attempts}/10
        </Text>
      </View>

      <View style={styles.guessesContainer}>
        {guesses.map((guess, idx) => (
          <View key={idx} style={styles.guessRow}>
            <View style={styles.guessCode}>
              {guess.code.map((c, i) => (
                <View
                  key={i}
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor:
                        c === 'R' ? '#ef4444' :
                        c === 'G' ? '#10b981' :
                        c === 'B' ? '#3b82f6' :
                        c === 'Y' ? '#eab308' :
                        c === 'P' ? '#8b5cf6' : '#f59e0b',
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={[styles.feedbackText, { color: theme.text.secondary }]}>
              {guess.feedback}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.currentGuessContainer}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Your guess:</Text>
        <View style={styles.currentGuess}>
          {Array(CODE_LENGTH).fill(null).map((_, i) => (
            <View
              key={i}
              style={[
                styles.guessSlot,
                {
                  backgroundColor: currentGuess[i]
                    ? currentGuess[i] === 'R' ? '#ef4444' :
                      currentGuess[i] === 'G' ? '#10b981' :
                      currentGuess[i] === 'B' ? '#3b82f6' :
                      currentGuess[i] === 'Y' ? '#eab308' :
                      currentGuess[i] === 'P' ? '#8b5cf6' : '#f59e0b'
                    : theme.base.card,
                  borderColor: theme.base.border,
                },
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.colorPad}>
        {COLORS.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              {
                backgroundColor:
                  color === 'R' ? '#ef4444' :
                  color === 'G' ? '#10b981' :
                  color === 'B' ? '#3b82f6' :
                  color === 'Y' ? '#eab308' :
                  color === 'P' ? '#8b5cf6' : '#f59e0b',
              },
            ]}
            onPress={() => handleColorPress(color)}
          />
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={handleClear}
          style={[styles.actionButton, { backgroundColor: theme.base.card }]}
        >
          <Text style={[styles.actionText, { color: theme.text.primary }]}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSubmit}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
          disabled={currentGuess.length !== CODE_LENGTH}
        >
          <Text style={[styles.actionText, { color: theme.text.inverse }]}>Submit</Text>
        </TouchableOpacity>
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
  guessesContainer: {
    flex: 1,
    padding: 10,
  },
  guessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 15,
  },
  guessCode: {
    flexDirection: 'row',
    gap: 5,
  },
  colorDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  feedbackText: {
    fontSize: 14,
  },
  currentGuessContainer: {
    padding: 15,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  currentGuess: {
    flexDirection: 'row',
    gap: 10,
  },
  guessSlot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
  },
  colorPad: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    padding: 15,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    padding: 15,
  },
  actionButton: {
    padding: 15,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

