import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Shield, Star, Swords, Target, Trophy, Zap, Play, Pause } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GAME_SIZE = Math.min(SCREEN_WIDTH - 40, SCREEN_HEIGHT * 0.65);
const PLAYER_SIZE = 45;
const ZOMBIE_SIZE = 40;
const BULLET_SIZE = 10;
const BOSS_SIZE = 65;
const ZOMBIE_SPEED = 1.2;
const BULLET_SPEED = 10;
const PLAYER_SPEED = 4;

interface Zombie {
  id: number;
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  type: 'normal' | 'fast' | 'boss';
}

interface Bullet {
  id: number;
  x: number;
  y: number;
  angle: number;
}

interface Resource {
  id: number;
  x: number;
  y: number;
  type: 'ammo' | 'health' | 'coin';
}

export default function ZombieEscape() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'paused' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [wave, setWave] = useState(1);
  const [coins, setCoins] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [playerX, setPlayerX] = useState(GAME_SIZE / 2);
  const [playerY, setPlayerY] = useState(GAME_SIZE / 2);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [maxHealth, setMaxHealth] = useState(100);
  const [ammo, setAmmo] = useState(30);
  const [maxAmmo, setMaxAmmo] = useState(30);
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [zombies, setZombies] = useState<Zombie[]>([]);
  const [bullets, setBullets] = useState<Bullet[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [zombiesKilled, setZombiesKilled] = useState(0);
  const [zombiesInWave, setZombiesInWave] = useState(0);
  const [zombiesSpawned, setZombiesSpawned] = useState(0);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const zombieIdRef = useRef(0);
  const bulletIdRef = useRef(0);
  const resourceIdRef = useRef(0);
  const lastShootTime = useRef(0);
  const damageCooldownRef = useRef(0);
  const shootCooldown = 150;
  const touchXRef = useRef(0);
  const touchYRef = useRef(0);
  const isTouchingRef = useRef(false);

  const playerXAnimated = useSharedValue(GAME_SIZE / 2);
  const playerYAnimated = useSharedValue(GAME_SIZE / 2);

  useEffect(() => {
    loadGameData();
  }, []);

  useEffect(() => {
    if (gameState === 'playing') {
      startGameLoop();
      spawnWave();
    } else {
      stopGameLoop();
    }
    return () => stopGameLoop();
  }, [gameState, wave]);

  const loadGameData = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('game_scores')
        .select('*')
        .eq('user_id', user.id)
        .eq('game_type', 'zombie_escape')
        .single();

      if (data) {
        setHighScore(data.score || 0);
        setLevel(data.level || 1);
        setCoins(data.coins || 0);
      }
    } catch (error) {
      console.log('Error loading game data:', error);
    }
  };

  const saveGameData = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'zombie_escape',
          score: Math.max(score, highScore),
          level: level,
          coins: coins,
          distance: wave,
          time_played: 0,
        }, {
          onConflict: 'user_id,game_type'
        });

      if (error) throw error;
    } catch (error) {
      console.log('Error saving game data:', error);
    }
  };

  const spawnWave = () => {
    const zombiesToSpawn = 5 + wave * 2;
    setZombiesInWave(zombiesToSpawn);
    setZombiesSpawned(0);
  };

  const spawnZombie = () => {
    if (zombiesSpawned >= zombiesInWave) return;

    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let y = 0;
    const spawnDistance = 100;

    if (side === 0) {
      x = Math.random() * GAME_SIZE;
      y = -spawnDistance;
    } else if (side === 1) {
      x = GAME_SIZE + spawnDistance;
      y = Math.random() * GAME_SIZE;
    } else if (side === 2) {
      x = Math.random() * GAME_SIZE;
      y = GAME_SIZE + spawnDistance;
    } else {
      x = -spawnDistance;
      y = Math.random() * GAME_SIZE;
    }

    // Ensure zombie doesn't spawn too close to player
    const distanceToPlayer = Math.sqrt(
      Math.pow(x - playerX, 2) + Math.pow(y - playerY, 2)
    );
    if (distanceToPlayer < 150) {
      if (side === 0) y = -spawnDistance * 2;
      else if (side === 1) x = GAME_SIZE + spawnDistance * 2;
      else if (side === 2) y = GAME_SIZE + spawnDistance * 2;
      else x = -spawnDistance * 2;
    }

    const isBoss = wave % 5 === 0 && zombiesSpawned === 0;
    const isFast = Math.random() > 0.7 && !isBoss;

    const newZombie: Zombie = {
      id: zombieIdRef.current++,
      x,
      y,
      health: isBoss ? 5 : isFast ? 1 : 2,
      maxHealth: isBoss ? 5 : isFast ? 1 : 2,
      type: isBoss ? 'boss' : isFast ? 'fast' : 'normal',
    };

    setZombies((prev) => [...prev, newZombie]);
    setZombiesSpawned((prev) => prev + 1);
  };

  const handleShoot = (targetX: number, targetY: number) => {
    if (ammo <= 0) return;

    const angle = Math.atan2(targetY - playerY, targetX - playerX);

    const newBullet: Bullet = {
      id: bulletIdRef.current++,
      x: playerX,
      y: playerY,
      angle,
    };

    setBullets((prev) => [...prev, newBullet]);
    setAmmo((prev) => Math.max(0, prev - 1));
  };

  const handleTouchStart = (evt: any) => {
    if (gameState !== 'playing') return;
    const { locationX, locationY } = evt.nativeEvent;
    touchXRef.current = locationX;
    touchYRef.current = locationY;
    isTouchingRef.current = true;

    // Move player to touch position
    const newX = Math.max(PLAYER_SIZE / 2, Math.min(locationX, GAME_SIZE - PLAYER_SIZE / 2));
    const newY = Math.max(PLAYER_SIZE / 2, Math.min(locationY, GAME_SIZE - PLAYER_SIZE / 2));
    
    setPlayerX(newX);
    setPlayerY(newY);
    playerXAnimated.value = newX;
    playerYAnimated.value = newY;

    handleShoot(locationX, locationY);
  };

  const handleTouchMove = (evt: any) => {
    if (gameState !== 'playing' || !isTouchingRef.current) return;
    const { locationX, locationY } = evt.nativeEvent;
    touchXRef.current = locationX;
    touchYRef.current = locationY;

    // Move player towards touch position smoothly
    const newX = Math.max(PLAYER_SIZE / 2, Math.min(locationX, GAME_SIZE - PLAYER_SIZE / 2));
    const newY = Math.max(PLAYER_SIZE / 2, Math.min(locationY, GAME_SIZE - PLAYER_SIZE / 2));
    
    setPlayerX(newX);
    setPlayerY(newY);
    playerXAnimated.value = withTiming(newX, { duration: 50 });
    playerYAnimated.value = withTiming(newY, { duration: 50 });

    // Auto-shoot
    const now = Date.now();
    if (now - lastShootTime.current > shootCooldown && ammo > 0) {
      handleShoot(locationX, locationY);
      lastShootTime.current = now;
    }
  };

  const handleTouchEnd = () => {
    isTouchingRef.current = false;
  };

  const startGameLoop = () => {
    let zombieSpawnTimer = 0;

    const loop = () => {
      if (gameState !== 'playing') return;

      zombieSpawnTimer++;
      damageCooldownRef.current++;

      if (zombieSpawnTimer > 60 && zombiesSpawned < zombiesInWave) {
        spawnZombie();
        zombieSpawnTimer = 0;
      }

      // Move zombies towards player
      setZombies((prev) => {
        return prev.map((zombie) => {
          const dx = playerX - zombie.x;
          const dy = playerY - zombie.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const speed = zombie.type === 'fast' ? ZOMBIE_SPEED * 1.5 : zombie.type === 'boss' ? ZOMBIE_SPEED * 0.7 : ZOMBIE_SPEED;

          if (distance > 0) {
            const newX = zombie.x + (dx / distance) * speed;
            const newY = zombie.y + (dy / distance) * speed;

            // Check collision with player (with cooldown)
            const playerDistance = Math.sqrt(
              Math.pow(newX - playerX, 2) + Math.pow(newY - playerY, 2)
            );

            if (playerDistance < (PLAYER_SIZE + ZOMBIE_SIZE) / 2 && damageCooldownRef.current > 30) {
              runOnJS(damagePlayer)(zombie.type === 'boss' ? 20 : 10);
              damageCooldownRef.current = 0;
            }

            return {
              ...zombie,
              x: newX,
              y: newY,
            };
          }
          return zombie;
        });
      });

      // Move bullets
      setBullets((prev) => {
        return prev
          .map((bullet) => ({
            ...bullet,
            x: bullet.x + Math.cos(bullet.angle) * BULLET_SPEED,
            y: bullet.y + Math.sin(bullet.angle) * BULLET_SPEED,
          }))
          .filter(
            (bullet) =>
              bullet.x > -BULLET_SIZE &&
              bullet.x < GAME_SIZE + BULLET_SIZE &&
              bullet.y > -BULLET_SIZE &&
              bullet.y < GAME_SIZE + BULLET_SIZE
          );
      });

      // Check bullet-zombie collisions
      setBullets((prevBullets) => {
        const updatedBullets: Bullet[] = [];
        const hitZombieIds = new Set<number>();

        prevBullets.forEach((bullet) => {
          let hit = false;
          zombies.forEach((zombie) => {
            if (hitZombieIds.has(zombie.id)) return;
            const distance = Math.sqrt(
              Math.pow(bullet.x - zombie.x, 2) + Math.pow(bullet.y - zombie.y, 2)
            );
            if (distance < (ZOMBIE_SIZE + BULLET_SIZE) / 2) {
              runOnJS(hitZombieWithBullet)(zombie.id);
              hitZombieIds.add(zombie.id);
              hit = true;
            }
          });
          if (!hit) {
            updatedBullets.push(bullet);
          }
        });

        return updatedBullets;
      });

      // Check if wave is complete
      if (zombies.length === 0 && zombiesSpawned >= zombiesInWave) {
        runOnJS(completeWave)();
      }

      gameLoopRef.current = setTimeout(loop, 16);
    };
    loop();
  };

  const stopGameLoop = () => {
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const hitZombieWithBullet = (zombieId: number) => {
    setZombies((prev) => {
      const updated = prev.map((zombie) => {
        if (zombie.id === zombieId) {
          const newHealth = zombie.health - weaponLevel;
          if (newHealth <= 0) {
            runOnJS(killZombie)(zombie);
            return null;
          }
          return { ...zombie, health: newHealth };
        }
        return zombie;
      });
      return updated.filter((z) => z !== null) as Zombie[];
    });
  };

  const killZombie = (zombie: Zombie) => {
    setZombiesKilled((prev) => prev + 1);
    const points = zombie.type === 'boss' ? 100 : zombie.type === 'fast' ? 15 : 10;
    setScore((prev) => prev + points);
    setCoins((prev) => {
      const newCoins = prev + (zombie.type === 'boss' ? 50 : 5);
      if (user) {
        supabase
          .from('game_scores')
          .upsert({
            user_id: user.id,
            game_type: 'zombie_escape',
            coins: newCoins,
          }, {
            onConflict: 'user_id,game_type'
          });
      }
      return newCoins;
    });

    // Drop resource
    if (Math.random() > 0.7) {
      const resourceTypes: ('ammo' | 'health' | 'coin')[] = ['ammo', 'health', 'coin'];
      const newResource: Resource = {
        id: resourceIdRef.current++,
        x: zombie.x,
        y: zombie.y,
        type: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
      };
      setResources((prev) => [...prev, newResource]);
    }
  };

  const damagePlayer = (damage: number) => {
    setPlayerHealth((prev) => {
      const newHealth = Math.max(0, prev - damage);
      if (newHealth <= 0) {
        runOnJS(endGame)();
      }
      return newHealth;
    });
  };

  const collectResource = (resource: Resource) => {
    if (resource.type === 'ammo') {
      setAmmo((prev) => Math.min(maxAmmo, prev + 10));
    } else if (resource.type === 'health') {
      setPlayerHealth((prev) => Math.min(maxHealth, prev + 20));
    } else if (resource.type === 'coin') {
      setCoins((prev) => prev + 10);
    }
    setResources((prev) => prev.filter((r) => r.id !== resource.id));
  };

  const completeWave = () => {
    setWave((prev) => {
      const newWave = prev + 1;
      setLevel((prevLevel) => {
        if (newWave % 3 === 0) {
          return prevLevel + 1;
        }
        return prevLevel;
      });
      setAmmo(maxAmmo);
      setPlayerHealth((prev) => Math.min(maxHealth, prev + 10));
      spawnWave();
      return newWave;
    });
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setWave(1);
    const startX = GAME_SIZE / 2;
    const startY = GAME_SIZE / 2;
    setPlayerX(startX);
    setPlayerY(startY);
    setPlayerHealth(100);
    setAmmo(30);
    setZombies([]);
    setBullets([]);
    setResources([]);
    setZombiesKilled(0);
    setZombiesSpawned(0);
    zombieIdRef.current = 0;
    bulletIdRef.current = 0;
    resourceIdRef.current = 0;
    damageCooldownRef.current = 0;
    playerXAnimated.value = startX;
    playerYAnimated.value = startY;
    spawnWave();
  };

  const endGame = () => {
    setGameState('gameover');
    stopGameLoop();
    if (score > highScore) {
      setHighScore(score);
    }
    saveGameData();
  };

  const upgradeWeapon = () => {
    if (coins >= 100 * weaponLevel) {
      setCoins((prev) => prev - 100 * weaponLevel);
      setWeaponLevel((prev) => prev + 1);
      setMaxAmmo((prev) => prev + 10);
      setAmmo((prev) => prev + 10);
    }
  };

  const playerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: playerXAnimated.value - PLAYER_SIZE / 2 },
        { translateY: playerYAnimated.value - PLAYER_SIZE / 2 },
      ],
    };
  });

  if (gameState === 'menu') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Text style={[styles.dinoEmoji, { fontSize: 64 }]}>🧟</Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>Zombie Escape</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Top-down survival horror
          </Text>

          <View style={[styles.statsContainer, { backgroundColor: theme.base.card }]}>
            <View style={styles.statItem}>
              <Trophy size={24} color={theme.primary} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {highScore}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                High Score
              </Text>
            </View>
            <View style={styles.statItem}>
              <Star size={24} color={theme.accent} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                Level {level}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Level
              </Text>
            </View>
            <View style={styles.statItem}>
              <Target size={24} color={theme.status.warning} />
              <Text style={[styles.statValue, { color: theme.text.primary }]}>
                {coins}
              </Text>
              <Text style={[styles.statLabel, { color: theme.text.secondary }]}>
                Coins
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={startGame}
            style={[styles.startButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              Start Game
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (gameState === 'gameover') {
    return (
      <View style={[styles.container, { backgroundColor: theme.base.background }]}>
        <View style={styles.menuContainer}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Game Over</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Wave: {wave}
          </Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Zombies Killed: {zombiesKilled}
          </Text>
          <Text style={[styles.scoreText, { color: theme.primary }]}>Score: {score}</Text>
          {score > highScore && (
            <Text style={[styles.newRecord, { color: theme.status.success }]}>
              New Record! 🎉
            </Text>
          )}

          <TouchableOpacity
            onPress={() => setGameState('menu')}
            style={[styles.startButton, { backgroundColor: theme.primary }]}
          >
            <Text style={[styles.buttonText, { color: theme.text.inverse }]}>
              Main Menu
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.base.background }]}>
      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.hudItem}>
          <Text style={[styles.hudText, { color: theme.text.primary }]}>
            Wave: {wave}
          </Text>
        </View>
        <View style={styles.hudItem}>
          <Text style={[styles.hudText, { color: theme.text.primary }]}>
            Score: {score}
          </Text>
        </View>
        <View style={styles.hudItem}>
          <Swords size={16} color={theme.text.primary} />
          <Text style={[styles.hudText, { color: theme.text.primary, marginLeft: 4 }]}>
            Lv.{weaponLevel}
          </Text>
        </View>
      </View>

      {/* Health and Ammo Bar */}
      <View style={styles.barsContainer}>
        <View style={styles.barContainer}>
          <Shield size={16} color={theme.status.error} />
          <View style={[styles.bar, { backgroundColor: theme.base.border }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(playerHealth / maxHealth) * 100}%`,
                  backgroundColor: theme.status.error,
                },
              ]}
            />
          </View>
          <Text style={[styles.barText, { color: theme.text.secondary }]}>
            {playerHealth}/{maxHealth}
          </Text>
        </View>
        <View style={styles.barContainer}>
          <Zap size={16} color={theme.status.warning} />
          <View style={[styles.bar, { backgroundColor: theme.base.border }]}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${(ammo / maxAmmo) * 100}%`,
                  backgroundColor: theme.status.warning,
                },
              ]}
            />
          </View>
          <Text style={[styles.barText, { color: theme.text.secondary }]}>
            {ammo}/{maxAmmo}
          </Text>
        </View>
      </View>

      {/* Game Area */}
      <View
        style={[styles.gameArea, { backgroundColor: theme.base.surface, width: GAME_SIZE, height: GAME_SIZE, borderColor: theme.base.border }]}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Player */}
        <Animated.View style={[styles.player, playerStyle]}>
          <Text style={[styles.dinoEmoji, { fontSize: 45 }]}>🧑</Text>
        </Animated.View>

        {/* Zombies */}
        {zombies.map((zombie) => (
          <View
            key={zombie.id}
            style={[
              styles.zombie,
              {
                left: zombie.x - (zombie.type === 'boss' ? BOSS_SIZE : ZOMBIE_SIZE) / 2,
                top: zombie.y - (zombie.type === 'boss' ? BOSS_SIZE : ZOMBIE_SIZE) / 2,
              },
            ]}
          >
            <Text style={[styles.dinoEmoji, { fontSize: zombie.type === 'boss' ? 55 : 40 }]}>
              {zombie.type === 'boss' ? '👹' : zombie.type === 'fast' ? '🧟‍♂️' : '🧟'}
            </Text>
            {zombie.health < zombie.maxHealth && (
              <View style={[styles.healthBar, { backgroundColor: theme.base.border }]}>
                <View
                  style={[
                    styles.healthBarFill,
                    {
                      width: `${(zombie.health / zombie.maxHealth) * 100}%`,
                      backgroundColor: theme.status.error,
                    },
                  ]}
                />
              </View>
            )}
          </View>
        ))}

        {/* Bullets */}
        {bullets.map((bullet) => (
          <View
            key={bullet.id}
            style={[
              styles.bullet,
              {
                left: bullet.x - BULLET_SIZE / 2,
                top: bullet.y - BULLET_SIZE / 2,
                backgroundColor: theme.status.warning,
              },
            ]}
          />
        ))}

        {/* Resources */}
        {resources.map((resource) => {
          const distance = Math.sqrt(
            Math.pow(resource.x - playerX, 2) + Math.pow(resource.y - playerY, 2)
          );
          if (distance < (PLAYER_SIZE + 25) / 2) {
            collectResource(resource);
            return null;
          }
          return (
            <TouchableOpacity
              key={resource.id}
              onPress={() => collectResource(resource)}
              style={[
                styles.resource,
                {
                  left: resource.x - 15,
                  top: resource.y - 15,
                  backgroundColor:
                    resource.type === 'ammo'
                      ? theme.status.warning
                      : resource.type === 'health'
                      ? theme.status.error
                      : theme.accent,
                },
              ]}
            >
              <Text style={{ fontSize: 24 }}>
                {resource.type === 'ammo' ? '🔫' : resource.type === 'health' ? '❤️' : '💰'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Upgrade Button */}
      <TouchableOpacity
        onPress={upgradeWeapon}
        disabled={coins < 100 * weaponLevel}
        style={[
          styles.upgradeButton,
          {
            backgroundColor: coins >= 100 * weaponLevel ? theme.primary : theme.base.border,
          },
        ]}
      >
        <Swords size={20} color={coins >= 100 * weaponLevel ? theme.text.inverse : theme.text.tertiary} />
        <Text
          style={[
            styles.upgradeText,
            {
              color: coins >= 100 * weaponLevel ? theme.text.inverse : theme.text.tertiary,
            },
          ]}
        >
          Upgrade Weapon ({100 * weaponLevel} coins)
        </Text>
      </TouchableOpacity>

      {/* Pause Button */}
      <TouchableOpacity
        onPress={() => {
          if (gameState === 'playing') {
            setGameState('paused');
            stopGameLoop();
          } else if (gameState === 'paused') {
            setGameState('playing');
            startGameLoop();
          }
        }}
        style={[styles.pauseButton, { backgroundColor: theme.base.card }]}
      >
        {gameState === 'playing' ? (
          <Pause size={24} color={theme.text.primary} />
        ) : (
          <Play size={24} color={theme.text.primary} />
        )}
      </TouchableOpacity>

      {/* Paused Overlay */}
      {gameState === 'paused' && (
        <View style={[styles.pausedOverlay, { backgroundColor: theme.overlay }]}>
          <View style={[styles.pausedContent, { backgroundColor: theme.base.card }]}>
            <Text style={[styles.pausedTitle, { color: theme.text.primary }]}>Paused</Text>
            <Text style={[styles.pausedText, { color: theme.text.secondary }]}>
              Wave: {wave}
            </Text>
            <Text style={[styles.pausedText, { color: theme.text.secondary }]}>
              Score: {score}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setGameState('playing');
                startGameLoop();
              }}
              style={[styles.resumeButton, { backgroundColor: theme.primary }]}
            >
              <Play size={20} color={theme.text.inverse} />
              <Text style={[styles.resumeButtonText, { color: theme.text.inverse }]}>
                Resume
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={endGame}
              style={[styles.quitButton, { borderColor: theme.base.border }]}
            >
              <Text style={[styles.quitButtonText, { color: theme.text.secondary }]}>
                Quit Game
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  menuContainer: {
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  startButton: {
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 16,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: 'bold',
    marginVertical: 20,
  },
  newRecord: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  hud: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: 10,
    width: '100%',
  },
  hudItem: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hudText: {
    fontSize: 14,
    fontWeight: '600',
  },
  barsContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  barText: {
    fontSize: 12,
    minWidth: 50,
    textAlign: 'right',
  },
  gameArea: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 2,
  },
  player: {
    position: 'absolute',
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  zombie: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthBar: {
    position: 'absolute',
    bottom: -8,
    width: ZOMBIE_SIZE,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  healthBarFill: {
    height: '100%',
  },
  bullet: {
    position: 'absolute',
    width: BULLET_SIZE,
    height: BULLET_SIZE,
    borderRadius: BULLET_SIZE / 2,
  },
  resource: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
  },
  upgradeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pauseButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  pausedContent: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 250,
  },
  pausedTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pausedText: {
    fontSize: 16,
    marginBottom: 8,
  },
  resumeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  resumeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  quitButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
    borderWidth: 2,
  },
  quitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dinoEmoji: {
    textAlign: 'center',
  },
});
