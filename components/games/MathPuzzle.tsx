import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Calculator, Play, Trophy } from 'lucide-react-native';

export default function MathPuzzle() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [level, setLevel] = useState(1);
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
      .eq('game_type', 'pet_world_tycoon')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, result;
    
    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      result = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * a);
      result = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      result = a * b;
    }
    
    setQuestion(`${a} ${op} ${b} = ?`);
    setCorrectAnswer(result);
    setAnswer('');
  };

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    generateQuestion();
  };

  const checkAnswer = () => {
    if (parseInt(answer) === correctAnswer) {
      setScore(score + level * 10);
      setLevel(level + 1);
      generateQuestion();
    } else {
      setScore(Math.max(0, score - 5));
      setAnswer('');
    }
  };

  const saveGameData = async () => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'pet_world_tycoon',
        score,
        level,
      }, { onConflict: 'user_id,game_type' });
    if (score > highScore) setHighScore(score);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Calculator size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Math Puzzle</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Solve math problems quickly
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

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      <View style={styles.header}>
        <Text style={[styles.statText, { color: theme.text.primary }]}>
          Level: {level} | Score: {score}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={[styles.questionText, { color: theme.text.primary }]}>{question}</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.base.card,
              color: theme.text.primary,
              borderColor: theme.base.border,
            },
          ]}
          value={answer}
          onChangeText={setAnswer}
          keyboardType="number-pad"
          placeholder="Enter answer"
          placeholderTextColor={theme.text.tertiary}
          autoFocus
        />
        <TouchableOpacity
          onPress={checkAnswer}
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
        >
          <Text style={[styles.submitText, { color: theme.text.inverse }]}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
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
    padding: 15,
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    fontWeight: '600',
  },
  questionContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  questionText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 20,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 15,
  },
  submitButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

