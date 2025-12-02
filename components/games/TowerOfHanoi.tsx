import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Layers, Play, Trophy } from 'lucide-react-native';

const DISKS = 4;

export default function TowerOfHanoi() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [towers, setTowers] = useState<number[][]>([[], [], []]);
  const [selectedTower, setSelectedTower] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
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
      .eq('game_type', 'space_chess_tactics')
      .single();
    if (data) setHighScore(data.score || 0);
  };

  const initializeTowers = () => {
    const newTowers: number[][] = [[], [], []];
    for (let i = DISKS; i >= 1; i--) {
      newTowers[0].push(i);
    }
    setTowers(newTowers);
    setMoves(0);
    setSelectedTower(null);
  };

  const handleTowerPress = (towerIndex: number) => {
    if (selectedTower === null) {
      if (towers[towerIndex].length > 0) {
        setSelectedTower(towerIndex);
      }
    } else {
      if (selectedTower === towerIndex) {
        setSelectedTower(null);
      } else {
        const fromTower = towers[selectedTower];
        const toTower = towers[towerIndex];
        
        if (fromTower.length === 0) {
          setSelectedTower(null);
          return;
        }
        
        const disk = fromTower[fromTower.length - 1];
        const canMove = toTower.length === 0 || toTower[toTower.length - 1] > disk;
        
        if (canMove) {
          const newTowers = towers.map((t, i) => {
            if (i === selectedTower) {
              return t.slice(0, -1);
            }
            if (i === towerIndex) {
              return [...t, disk];
            }
            return t;
          });
          
          setTowers(newTowers);
          setMoves(moves + 1);
          setSelectedTower(null);
          checkWin(newTowers);
        } else {
          setSelectedTower(null);
        }
      }
    }
  };

  const checkWin = (currentTowers: number[][]) => {
    if (currentTowers[2].length === DISKS) {
      const finalScore = Math.max(0, 1000 - moves * 10);
      setScore(finalScore);
      setGameState('gameover');
      saveGameData(finalScore);
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    initializeTowers();
  };

  const saveGameData = async (finalScore: number) => {
    if (!user) return;
    await supabase
      .from('game_scores')
      .upsert({
        user_id: user.id,
        game_type: 'space_chess_tactics',
        score: finalScore,
      }, { onConflict: 'user_id,game_type' });
    if (finalScore > highScore) setHighScore(finalScore);
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Layers size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Tower of Hanoi</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Move all disks to the right tower
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
            Moves: {moves}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Score: {score}
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
          Moves: {moves}
        </Text>
      </View>

      <View style={styles.towersContainer}>
        {towers.map((tower, towerIndex) => (
          <TouchableOpacity
            key={towerIndex}
            style={[
              styles.towerContainer,
              {
                backgroundColor: selectedTower === towerIndex ? theme.primary : 'transparent',
              },
            ]}
            onPress={() => handleTowerPress(towerIndex)}
          >
            <View style={styles.towerBase}>
              {tower.map((disk, diskIndex) => (
                <View
                  key={diskIndex}
                  style={[
                    styles.disk,
                    {
                      width: disk * 25 + 30,
                      backgroundColor: theme.accent,
                    },
                  ]}
                >
                  <Text style={[styles.diskText, { color: theme.text.inverse }]}>{disk}</Text>
                </View>
              ))}
              <View style={[styles.towerPole, { backgroundColor: theme.base.border }]} />
            </View>
            <Text style={[styles.towerLabel, { color: theme.text.secondary }]}>
              Tower {towerIndex + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.instructions}>
        <Text style={[styles.instructionText, { color: theme.text.secondary }]}>
          Tap a tower to select, then tap another to move. Move all disks to Tower 3.
        </Text>
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
    padding: 15,
    alignItems: 'center',
  },
  statText: {
    fontSize: 18,
    fontWeight: '600',
  },
  towersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 30,
    flex: 1,
  },
  towerContainer: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    minWidth: 80,
  },
  towerBase: {
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  towerPole: {
    width: 8,
    height: 200,
    position: 'absolute',
    bottom: 0,
  },
  disk: {
    height: 25,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    borderWidth: 2,
    borderColor: '#fff',
  },
  diskText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  towerLabel: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  instructions: {
    padding: 15,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

