import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Building2, Play, Pause, Trophy, Coins } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_COLS = 8;
const GRID_ROWS = 10;
const CELL_SIZE = (SCREEN_WIDTH - 40) / GRID_COLS;

interface Island {
  id: number;
  x: number;
  y: number;
  type: 'grass' | 'house' | 'tree' | 'empty';
  level: number;
}

export default function SkyIslandsBuilder() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100);
  const [level, setLevel] = useState(1);
  const [islands, setIslands] = useState<Island[]>([]);
  const [selectedType, setSelectedType] = useState<'house' | 'tree' | null>(null);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        setCoins((prev) => prev + 1);
        setScore((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score, coins')
      .eq('user_id', user.id)
      .eq('game_type', 'sky_islands_builder')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const initializeIslands = () => {
    const newIslands: Island[] = [];
    for (let y = 0; y < GRID_ROWS; y++) {
      for (let x = 0; x < GRID_COLS; x++) {
        newIslands.push({
          id: y * GRID_COLS + x,
          x,
          y,
          type: Math.random() > 0.7 ? 'grass' : 'empty',
          level: 0,
        });
      }
    }
    setIslands(newIslands);
  };

  const buildOnIsland = (islandId: number) => {
    if (!selectedType || coins < 10) return;
    
    const island = islands.find((i) => i.id === islandId);
    if (!island || island.type !== 'grass') return;
    
    const newIslands = islands.map((i) => {
      if (i.id === islandId) {
        return {
          ...i,
          type: selectedType,
          level: i.level + 1,
        };
      }
      return i;
    });
    
    setIslands(newIslands);
    setCoins(coins - 10);
    setScore(score + 20);
    setSelectedType(null);
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCoins(100);
    setLevel(1);
    initializeIslands();
  };

  const endGame = () => {
    setGameState('gameover');
    saveGameData();
  };

  const saveGameData = async () => {
    if (!user) return;
    const { data: existing } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'sky_islands_builder')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'sky_islands_builder',
          score,
          level,
          coins,
        }, {
          onConflict: 'user_id,game_type'
        });
      setHighScore(score);
    }
  };

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Building2 size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Sky Islands Builder</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Build your floating paradise
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
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Start Game</Text>
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
          <Text style={[styles.title, { color: theme.text.primary }]}>Game Over</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Final Score: {score}
          </Text>
          <TouchableOpacity
            onPress={startGame}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={[styles.button, { backgroundColor: theme.base.card, marginTop: 10 }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.primary }]}>Main Menu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      <View style={styles.gameHeader}>
        <TouchableOpacity onPress={() => setGameState(gameState === 'paused' ? 'playing' : 'paused')}>
          <Pause size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <View style={styles.coinContainer}>
            <Coins size={16} color={theme.accent} />
            <Text style={[styles.statText, { color: theme.text.primary }]}> {coins}</Text>
          </View>
        </View>
      </View>

      {gameState === 'paused' && (
        <View style={styles.pauseOverlay}>
          <Text style={[styles.pauseText, { color: theme.text.primary }]}>Paused</Text>
          <TouchableOpacity
            onPress={() => setGameState('playing')}
            style={[styles.button, { backgroundColor: theme.primary }]}
          >
            <Play size={24} color={theme.text.inverse} />
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>Resume</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.gridContainer}>
        {islands.map((island) => (
          <TouchableOpacity
            key={island.id}
            style={[
              styles.cell,
              {
                backgroundColor:
                  island.type === 'house'
                    ? theme.primary
                    : island.type === 'tree'
                    ? theme.status.success
                    : island.type === 'grass'
                    ? theme.base.surface
                    : theme.base.border,
              },
              selectedType && island.type === 'grass' && styles.selectedCell,
            ]}
            onPress={() => buildOnIsland(island.id)}
          >
            {island.type === 'house' && <Text style={styles.emoji}>🏠</Text>}
            {island.type === 'tree' && <Text style={styles.emoji}>🌳</Text>}
            {island.type === 'grass' && <Text style={styles.emoji}>🌱</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <View style={[styles.buildMenu, { backgroundColor: theme.base.card }]}>
        <Text style={[styles.buildTitle, { color: theme.text.primary }]}>Build:</Text>
        <TouchableOpacity
          style={[
            styles.buildButton,
            { backgroundColor: selectedType === 'house' ? theme.primary : theme.base.surface },
          ]}
          onPress={() => setSelectedType(selectedType === 'house' ? null : 'house')}
        >
          <Text style={styles.emoji}>🏠</Text>
          <Text style={[styles.buildText, { color: theme.text.primary }]}>House (10)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.buildButton,
            { backgroundColor: selectedType === 'tree' ? theme.status.success : theme.base.surface },
          ]}
          onPress={() => setSelectedType(selectedType === 'tree' ? null : 'tree')}
        >
          <Text style={styles.emoji}>🌳</Text>
          <Text style={[styles.buildText, { color: theme.text.primary }]}>Tree (10)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
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
    marginBottom: 20,
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
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    width: '100%',
  },
  stats: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  coinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    margin: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  emoji: {
    fontSize: 24,
  },
  buildMenu: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    gap: 10,
  },
  buildTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  buildButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  buildText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

