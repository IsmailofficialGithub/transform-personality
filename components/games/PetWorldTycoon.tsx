import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { useAuthStore } from '../../stores/useAuthStore';
import { supabase } from '../../services/supabase';
import { Heart, Play, Trophy, Coins, ShoppingCart } from 'lucide-react-native';

interface Pet {
  id: number;
  name: string;
  type: 'dog' | 'cat' | 'bird' | 'fish';
  happiness: number;
  coinsPerSecond: number;
  cost: number;
  owned: boolean;
}

const PETS: Pet[] = [
  { id: 1, name: 'Dog', type: 'dog', happiness: 100, coinsPerSecond: 1, cost: 50, owned: false },
  { id: 2, name: 'Cat', type: 'cat', happiness: 100, coinsPerSecond: 2, cost: 100, owned: false },
  { id: 3, name: 'Bird', type: 'bird', happiness: 100, coinsPerSecond: 3, cost: 200, owned: false },
  { id: 4, name: 'Fish', type: 'fish', happiness: 100, coinsPerSecond: 5, cost: 500, owned: false },
];

export default function PetWorldTycoon() {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [score, setScore] = useState(0);
  const [coins, setCoins] = useState(100);
  const [pets, setPets] = useState<Pet[]>(PETS);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    if (user) {
      loadHighScore();
    }
  }, [user]);

  useEffect(() => {
    if (gameState === 'playing') {
      const interval = setInterval(() => {
        const totalIncome = pets.filter((p) => p.owned).reduce((sum, p) => sum + p.coinsPerSecond, 0);
        setCoins((prev) => prev + totalIncome);
        setScore((prev) => prev + totalIncome);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [gameState, pets]);

  const loadHighScore = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('game_scores')
      .select('score, coins')
      .eq('user_id', user.id)
      .eq('game_type', 'pet_world_tycoon')
      .single();
    if (data) {
      setHighScore(data.score || 0);
    }
  };

  const buyPet = (petId: number) => {
    const pet = pets.find((p) => p.id === petId);
    if (!pet || pet.owned || coins < pet.cost) return;
    
    setCoins(coins - pet.cost);
    setPets(pets.map((p) => (p.id === petId ? { ...p, owned: true } : p)));
  };

  const feedPet = (petId: number) => {
    if (coins < 10) return;
    setCoins(coins - 10);
    setPets(pets.map((p) => 
      p.id === petId ? { ...p, happiness: Math.min(100, p.happiness + 10), coinsPerSecond: p.coinsPerSecond + 0.5 } : p
    ));
  };

  const startGame = () => {
    setGameState('playing');
    setScore(0);
    setCoins(100);
    setPets(PETS.map((p) => ({ ...p, owned: false, happiness: 100 })));
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
      .eq('game_type', 'pet_world_tycoon')
      .single();
    
    if (!existing || score > existing.score) {
      await supabase
        .from('game_scores')
        .upsert({
          user_id: user.id,
          game_type: 'pet_world_tycoon',
          score,
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
          <Heart size={64} color={theme.primary} />
          <Text style={[styles.title, { color: theme.text.primary }]}>Pet World Tycoon</Text>
          <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
            Build your pet empire
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
      <View style={[styles.header, { backgroundColor: theme.base.card }]}>
        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Coins size={20} color={theme.accent} />
            <Text style={[styles.statText, { color: theme.text.primary }]}> {coins}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statText, { color: theme.text.primary }]}>Score: {score}</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={endGame}
          style={[styles.endButton, { backgroundColor: theme.status.error }]}
        >
          <Text style={[styles.endButtonText, { color: theme.text.inverse }]}>End Game</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>My Pets</Text>
        {pets.filter((p) => p.owned).map((pet) => (
          <View key={pet.id} style={[styles.petCard, { backgroundColor: theme.base.card }]}>
            <Text style={styles.emoji}>
              {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : pet.type === 'bird' ? '🐦' : '🐠'}
            </Text>
            <View style={styles.petInfo}>
              <Text style={[styles.petName, { color: theme.text.primary }]}>{pet.name}</Text>
              <Text style={[styles.petStats, { color: theme.text.secondary }]}>
                {pet.coinsPerSecond.toFixed(1)} coins/sec
              </Text>
              <View style={styles.happinessBar}>
                <View
                  style={[
                    styles.happinessFill,
                    {
                      width: `${pet.happiness}%`,
                      backgroundColor: theme.status.success,
                    },
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity
              onPress={() => feedPet(pet.id)}
              style={[styles.feedButton, { backgroundColor: theme.primary }]}
            >
              <Text style={[styles.feedText, { color: theme.text.inverse }]}>Feed (10)</Text>
            </TouchableOpacity>
          </View>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text.primary, marginTop: 20 }]}>
          Pet Shop
        </Text>
        {pets.filter((p) => !p.owned).map((pet) => (
          <View key={pet.id} style={[styles.petCard, { backgroundColor: theme.base.card }]}>
            <Text style={styles.emoji}>
              {pet.type === 'dog' ? '🐕' : pet.type === 'cat' ? '🐱' : pet.type === 'bird' ? '🐦' : '🐠'}
            </Text>
            <View style={styles.petInfo}>
              <Text style={[styles.petName, { color: theme.text.primary }]}>{pet.name}</Text>
              <Text style={[styles.petStats, { color: theme.text.secondary }]}>
                Earns {pet.coinsPerSecond} coins/sec
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => buyPet(pet.id)}
              disabled={coins < pet.cost}
              style={[
                styles.buyButton,
                {
                  backgroundColor: coins >= pet.cost ? theme.primary : theme.base.border,
                },
              ]}
            >
              <ShoppingCart size={16} color={coins >= pet.cost ? theme.text.inverse : theme.text.tertiary} />
              <Text
                style={[
                  styles.buyText,
                  { color: coins >= pet.cost ? theme.text.inverse : theme.text.tertiary },
                ]}
              >
                {pet.cost}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  stats: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontWeight: '600',
  },
  endButton: {
    padding: 10,
    borderRadius: 8,
  },
  endButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  petCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  emoji: {
    fontSize: 40,
    marginRight: 15,
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  petStats: {
    fontSize: 14,
    marginBottom: 5,
  },
  happinessBar: {
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 5,
  },
  happinessFill: {
    height: '100%',
  },
  feedButton: {
    padding: 10,
    borderRadius: 8,
  },
  feedText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  buyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    gap: 5,
  },
  buyText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

