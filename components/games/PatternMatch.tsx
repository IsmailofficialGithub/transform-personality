import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Layers, Play, Trophy } from 'lucide-react-native';

export default function PatternMatch() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [pattern, setPattern] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
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
      .eq('game_type', 'ninja_shadow_strike')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const generatePattern = () => {
    const shapes = ['●', '■', '▲', '◆'];
    const colors = ['🔴', '🔵', '🟢', '🟡'];
    const patterns = [
      () => ['●', '■', '●', '■', '●'], // alternating
      () => ['🔴', '🔵', '🔴', '🔵', '🔴'], // color pattern
      () => ['●', '●', '■', '■', '●'], // repeat pattern
      () => ['▲', '◆', '▲', '◆', '▲'], // shape pattern
    ];
    
    const patternFunc = patterns[Math.floor(Math.random() * patterns.length)];
    const pat = patternFunc();
    const next = findNextInPattern(pat);
    
    setPattern(pat);
    const wrongOptions = [
      shapes[Math.floor(Math.random() * shapes.length)],
      colors[Math.floor(Math.random() * colors.length)],
      pat[0],
    ].filter(o => o !== next);
    setOptions([next, ...wrongOptions].sort(() => Math.random() - 0.5));
  };

  const findNextInPattern = (pat: string[]): string => {
    if (pat[0] === pat[2] && pat[1] === pat[3]) {
      return pat[0];
    }
    if (pat[0] === pat[1] && pat[2] === pat[3]) {
      return pat[4] || pat[0];
    }
    return pat[0];
  };

  const [correctAnswer, setCorrectAnswer] = useState('');

  const startGame = () => {
    setGameState('playing');
    setLevel(1);
    setScore(0);
    const next = generatePattern();
    setCorrectAnswer(next);
  };

  const handleAnswer = (answer: string) => {
    if (answer === correctAnswer) {
      setScore(score + level * 10);
      setLevel(level + 1);
      const next = generatePattern();
      setCorrectAnswer(next);
    } else {
      setScore(Math.max(0, score - 5));
    }
  };

  const saveGameData = async () => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'ninja_shadow_strike',
        score,
        level,
      }, { onConflict: 'user_id,game_type' });
    if (score > highScore) setHighScore(score);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Layers size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Pattern Match</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Find the pattern and continue
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

      <View style={styles.patternContainer}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Pattern:</Text>
        <View style={styles.patternBox}>
          {pattern.map((item, idx) => (
            <View key={idx} style={[styles.patternItem, { backgroundColor: theme.base.card }]}>
              <Text style={[styles.patternText, { color: theme.text.primary }]}>{item}</Text>
            </View>
          ))}
          <View style={[styles.patternItem, { backgroundColor: theme.primary }]}>
            <Text style={[styles.patternText, { color: theme.text.inverse }]}>?</Text>
          </View>
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <Text style={[styles.label, { color: theme.text.secondary }]}>Choose next:</Text>
        <View style={styles.optionsBox}>
          {options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.optionButton, { backgroundColor: theme.base.card }]}
              onPress={() => handleAnswer(option)}
            >
              <Text style={[styles.optionText, { color: theme.text.primary }]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  patternContainer: {
    marginVertical: 30,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 15,
  },
  patternBox: {
    flexDirection: 'row',
    gap: 10,
  },
  patternItem: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patternText: {
    fontSize: 24,
  },
  optionsContainer: {
    marginTop: 40,
  },
  optionsBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
    marginTop: 15,
  },
  optionButton: {
    width: 70,
    height: 70,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 32,
  },
});

