import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Key, Play, Trophy } from 'lucide-react-native';

const CODE_LENGTH = 4;
const NUMBERS = [1, 2, 3, 4, 5, 6];

export default function Mastermind() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [secretCode, setSecretCode] = useState<number[]>([]);
  const [guesses, setGuesses] = useState<Array<{ code: number[]; feedback: { correct: number; wrongPos: number } }>>([]);
  const [currentGuess, setCurrentGuess] = useState<number[]>([]);
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
      .eq('game_type', 'bubble_pop_adventure')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateCode = () => {
    const code: number[] = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      code.push(NUMBERS[Math.floor(Math.random() * NUMBERS.length)]);
    }
    setSecretCode(code);
  };

  const getFeedback = (guess: number[]): { correct: number; wrongPos: number } => {
    let correct = 0;
    let wrongPos = 0;
    const codeCounts: { [key: number]: number } = {};
    const guessCounts: { [key: number]: number } = {};
    
    secretCode.forEach(n => codeCounts[n] = (codeCounts[n] || 0) + 1);
    guess.forEach(n => guessCounts[n] = (guessCounts[n] || 0) + 1);
    
    guess.forEach((n, i) => {
      if (n === secretCode[i]) {
        correct++;
        codeCounts[n]--;
        guessCounts[n]--;
      }
    });
    
    guess.forEach((n, i) => {
      if (n !== secretCode[i] && codeCounts[n] > 0 && guessCounts[n] > 0) {
        wrongPos++;
        codeCounts[n]--;
        guessCounts[n]--;
      }
    });
    
    return { correct, wrongPos };
  };

  const handleNumberPress = (num: number) => {
    if (currentGuess.length < CODE_LENGTH) {
      setCurrentGuess([...currentGuess, num]);
    }
  };

  const handleSubmit = () => {
    if (currentGuess.length !== CODE_LENGTH) return;
    
    const feedback = getFeedback(currentGuess);
    setGuesses([...guesses, { code: [...currentGuess], feedback }]);
    setAttempts(attempts + 1);
    
    if (feedback.correct === CODE_LENGTH) {
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
        game_type: 'bubble_pop_adventure',
        score: finalScore,
      }, { onConflict: 'user_id,game_type' });
    if (finalScore > highScore) setHighScore(finalScore);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Key size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Mastermind</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Crack the 4-digit code
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
              {guess.code.map((num, i) => (
                <View
                  key={i}
                  style={[styles.numberBox, { backgroundColor: theme.base.card }]}
                >
                  <Text style={[styles.numberText, { color: theme.text.primary }]}>{num}</Text>
                </View>
              ))}
            </View>
            <View style={styles.feedbackBox}>
              <Text style={[styles.feedbackText, { color: theme.text.secondary }]}>
                ✓ {guess.feedback.correct} | ○ {guess.feedback.wrongPos}
              </Text>
            </View>
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
                  backgroundColor: currentGuess[i] ? theme.primary : theme.base.card,
                  borderColor: theme.base.border,
                },
              ]}
            >
              {currentGuess[i] && (
                <Text style={[styles.guessText, { color: theme.text.inverse }]}>
                  {currentGuess[i]}
                </Text>
              )}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.numberPad}>
        {NUMBERS.map((num) => (
          <TouchableOpacity
            key={num}
            style={[styles.numberButton, { backgroundColor: theme.base.card }]}
            onPress={() => handleNumberPress(num)}
          >
            <Text style={[styles.numberText, { color: theme.text.primary }]}>{num}</Text>
          </TouchableOpacity>
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
  numberBox: {
    width: 35,
    height: 35,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedbackBox: {
    flex: 1,
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
    width: 45,
    height: 45,
    borderRadius: 8,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guessText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  numberPad: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    padding: 15,
  },
  numberButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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

