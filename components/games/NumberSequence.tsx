import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Hash, Play, Trophy } from 'lucide-react-native';

export default function NumberSequence() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [sequence, setSequence] = useState<number[]>([]);
  const [answer, setAnswer] = useState('');
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
      .eq('game_type', 'sky_islands_builder')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generateSequence = () => {
    const patterns = [
      () => [2, 4, 6, 8, 10], // +2
      () => [1, 4, 9, 16, 25], // squares
      () => [1, 3, 6, 10, 15], // triangular
      () => [2, 6, 12, 20, 30], // n*(n+1)
      () => [1, 2, 4, 8, 16], // powers of 2
      () => [1, 1, 2, 3, 5], // fibonacci
      () => [3, 6, 12, 24, 48], // *2
      () => [5, 10, 20, 40, 80], // *2
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const seq = pattern();
    const next = calculateNext(seq);
    setSequence(seq);
    return next;
  };

  const calculateNext = (seq: number[]): number => {
    if (seq[1] - seq[0] === seq[2] - seq[1]) {
      return seq[seq.length - 1] + (seq[1] - seq[0]);
    }
    if (seq[1] / seq[0] === seq[2] / seq[1]) {
      return seq[seq.length - 1] * (seq[1] / seq[0]);
    }
    if (seq.every((n, i) => n === (i + 1) * (i + 1))) {
      return (seq.length + 1) ** 2;
    }
    if (seq[2] === seq[0] + seq[1]) {
      return seq[seq.length - 1] + seq[seq.length - 2];
    }
    return seq[seq.length - 1] * 2;
  };

  const [correctAnswer, setCorrectAnswer] = useState(0);

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    setAnswer('');
    const next = generateSequence();
    setCorrectAnswer(next);
  };

  const checkAnswer = () => {
    if (parseInt(answer) === correctAnswer) {
      setScore(score + level * 10);
      setLevel(level + 1);
      setAnswer('');
      const next = generateSequence();
      setCorrectAnswer(next);
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
        game_type: 'sky_islands_builder',
        score,
        level,
      }, { onConflict: 'user_id,game_type' });
    if (score > highScore) setHighScore(score);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Hash size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Number Sequence</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Find the pattern and next number
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

      <View style={styles.sequenceContainer}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Sequence:</Text>
        <View style={styles.sequenceBox}>
          {sequence.map((num, idx) => (
            <View key={idx} style={[styles.numberBox, { backgroundColor: theme.base.card }]}>
              <Text style={[styles.numberText, { color: theme.text.primary }]}>{num}</Text>
            </View>
          ))}
          <View style={[styles.numberBox, { backgroundColor: theme.primary }]}>
            <Text style={[styles.numberText, { color: theme.text.inverse }]}>?</Text>
          </View>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Next number:</Text>
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
          placeholder="Enter number"
          placeholderTextColor={theme.text.tertiary}
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
  sequenceContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  sequenceBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  numberBox: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginTop: 30,
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 15,
    fontSize: 18,
    marginTop: 10,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

