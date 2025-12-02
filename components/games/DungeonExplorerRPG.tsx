import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Sword, Play, Pause, Trophy, Shield, Heart } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const GRID_SIZE = 8;
const CELL_SIZE = (SCREEN_WIDTH - 60) / GRID_SIZE;

interface Tile {
  x: number;
  y: number;
  type: 'empty' | 'wall' | 'enemy' | 'treasure' | 'exit';
  visited: boolean;
}

interface Player {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  level: number;
  exp: number;
}

export default function DungeonExplorerRPG() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [dungeon, setDungeon] = useState<Tile[][]>([]);
  const [player, setPlayer] = useState<Player>({ x: 0, y: 0, health: 100, maxHealth: 100, level: 1, exp: 0 });
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score')
      .eq('user_id', user.id)
      .eq('game_type', 'dungeon_explorer_rpg')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const generateDungeon = () => {
    const newDungeon: Tile[][] = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        let type: Tile['type'] = 'empty';
        if (Math.random() < 0.2) type = 'wall';
        else if (Math.random() < 0.15) type = 'enemy';
        else if (Math.random() < 0.1) type = 'treasure';
        row.push({ x, y, type, visited: false });
      }
      row.push();
    }
    // Set exit
    newDungeon[GRID_SIZE - 1][GRID_SIZE - 1].type = 'exit';
    // Set start
    newDungeon[0][0].type = 'empty';
    setDungeon(newDungeon);
    setPlayer({ x: 0, y: 0, health: 100, maxHealth: 100, level: 1, exp: 0 });
  };

  const movePlayer = (dx: number, dy: number) => {
    if (gameState !== 'playing') return;
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) return;
    
    const tile = dungeon[newY][newX];
    if (tile.type === 'wall') return;
    
    const newDungeon = dungeon.map((row) =>
      row.map((t) => (t.x === newX && t.y === newY ? { ...t, visited: true } : t))
    );
    setDungeon(newDungeon);
    
    if (tile.type === 'enemy') {
      const damage = Math.floor(Math.random() * 20) + 10;
      const newHealth = player.health - damage;
      const newExp = player.exp + 20;
      const newLevel = newExp >= player.level * 50 ? player.level + 1 : player.level;
      const newMaxHealth = newLevel > player.level ? player.maxHealth + 20 : player.maxHealth;
      
      setPlayer({
        ...player,
        x: newX,
        y: newY,
        health: Math.max(0, newHealth),
        maxHealth: newMaxHealth,
        level: newLevel,
        exp: newExp % (player.level * 50),
      });
      
      setScore(score + 50);
      
      if (newHealth <= 0) {
        endGame();
        return;
      }
      
      newDungeon[newY][newX].type = 'empty';
    } else if (tile.type === 'treasure') {
      setScore(score + 100);
      setPlayer({ ...player, x: newX, y: newY, health: Math.min(player.maxHealth, player.health + 20) });
      newDungeon[newY][newX].type = 'empty';
    } else if (tile.type === 'exit') {
      setScore(score + 500);
      generateDungeon();
      setPlayer((prev) => ({ ...prev, health: prev.maxHealth }));
    } else {
      setPlayer({ ...player, x: newX, y: newY });
    }
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    generateDungeon();
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
      .eq('game_type', 'dungeon_explorer_rpg')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'dungeon_explorer_rpg',
          score,
          level: player.level,
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
          <Sword size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Dungeon Explorer RPG</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Explore dungeons and defeat monsters
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
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Level Reached: {player.level}
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
        <TouchableOpacity onPress={() => setGameState('paused')}>
          <Pause size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <View style={styles.stats}>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          <Text style={[styles.statText, { color: theme.text.primary }]}>Lv: {player.level}</Text>
          <View style={styles.healthContainer}>
            <Heart size={16} color={theme.status.error} />
            <Text style={[styles.statText, { color: theme.text.primary }]}>
              {player.health}/{player.maxHealth}
            </Text>
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

      <View style={styles.dungeonContainer}>
        {dungeon.map((row, y) =>
          row.map((tile, x) => {
            const isPlayer = player.x === x && player.y === y;
            let backgroundColor = theme.base.surface;
            let emoji = '';
            
            if (isPlayer) {
              backgroundColor = theme.primary;
              emoji = '🧙';
            } else if (tile.type === 'wall') {
              backgroundColor = theme.base.border;
              emoji = '🧱';
            } else if (tile.type === 'enemy') {
              backgroundColor = theme.status.error;
              emoji = '👹';
            } else if (tile.type === 'treasure') {
              backgroundColor = theme.accent;
              emoji = '💎';
            } else if (tile.type === 'exit') {
              backgroundColor = theme.status.success;
              emoji = '🚪';
            } else if (tile.visited) {
              backgroundColor = theme.base.card;
            }
            
            return (
              <View
                key={`${x}-${y}`}
                style={[
                  styles.cell,
                  { backgroundColor },
                ]}
              >
                {emoji && <Text style={styles.emoji}>{emoji}</Text>}
              </View>
            );
          })
        )}
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.base.card }]}
            onPress={() => movePlayer(0, -1)}
          >
            <Text style={[styles.controlText, { color: theme.text.primary }]}>↑</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.base.card }]}
            onPress={() => movePlayer(-1, 0)}
          >
            <Text style={[styles.controlText, { color: theme.text.primary }]}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.base.card }]}
            onPress={() => movePlayer(1, 0)}
          >
            <Text style={[styles.controlText, { color: theme.text.primary }]}>→</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: theme.base.card }]}
            onPress={() => movePlayer(0, 1)}
          >
            <Text style={[styles.controlText, { color: theme.text.primary }]}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  menuContainer: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
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
  healthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  dungeonContainer: {
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
  emoji: {
    fontSize: 20,
  },
  controls: {
    padding: 20,
    alignItems: 'center',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

