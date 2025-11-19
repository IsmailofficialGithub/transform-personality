export interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: string;
  benefits: string[];
  category: 'puzzle' | 'reflex' | 'memory' | 'strategy';
  isPremium: boolean;
}

export const GAMES: Game[] = [
  // FREE GAMES
  {
    id: 'memory-match',
    title: 'Memory Match',
    description: 'Match pairs of cards to improve memory and focus',
    icon: '🧠',
    difficulty: 'easy',
    estimatedTime: '3-5 mins',
    benefits: [
      'Improves memory',
      'Increases focus',
      'Distracts from urges',
      'Builds cognitive strength',
    ],
    category: 'memory',
    isPremium: false,
  },
  {
    id: 'breath-pacer',
    title: 'Breath Pacer',
    description: 'Follow the breathing pattern to calm your mind',
    icon: '🫁',
    difficulty: 'easy',
    estimatedTime: '2-3 mins',
    benefits: [
      'Reduces anxiety',
      'Calms nervous system',
      'Lowers urge intensity',
      'Improves self-control',
    ],
    category: 'strategy',
    isPremium: false,
  },
  {
    id: 'reaction-time',
    title: 'Reaction Challenge',
    description: 'Test and improve your reaction time',
    icon: '⚡',
    difficulty: 'medium',
    estimatedTime: '5 mins',
    benefits: [
      'Sharpens reflexes',
      'Improves focus',
      'Releases dopamine naturally',
      'Competitive distraction',
    ],
    category: 'reflex',
    isPremium: false,
  },

  // PREMIUM GAMES
  {
    id: 'urge-fighter',
    title: 'Urge Fighter',
    description: 'Battle your urges in this interactive game',
    icon: '⚔️',
    difficulty: 'medium',
    estimatedTime: '10 mins',
    benefits: [
      'Visualize overcoming urges',
      'Build mental strength',
      'Gamified recovery',
      'Track victories',
    ],
    category: 'strategy',
    isPremium: true,
  },
  {
    id: 'focus-master',
    title: 'Focus Master',
    description: 'Advanced focus training with increasing difficulty',
    icon: '🎯',
    difficulty: 'hard',
    estimatedTime: '15 mins',
    benefits: [
      'Elite focus training',
      'Advanced cognitive boost',
      'Competitive leaderboards',
      'Achievement system',
    ],
    category: 'puzzle',
    isPremium: true,
  },
  {
    id: 'zen-garden',
    title: 'Zen Garden',
    description: 'Create peaceful patterns to achieve mindfulness',
    icon: '🌸',
    difficulty: 'easy',
    estimatedTime: '10 mins',
    benefits: [
      'Deep relaxation',
      'Mindfulness practice',
      'Stress relief',
      'Creative expression',
    ],
    category: 'strategy',
    isPremium: true,
  },
  {
    id: 'pattern-master',
    title: 'Pattern Master',
    description: 'Complex pattern recognition and memory training',
    icon: '🔷',
    difficulty: 'hard',
    estimatedTime: '10 mins',
    benefits: [
      'Advanced memory training',
      'Pattern recognition',
      'Neural pathway building',
      'Cognitive enhancement',
    ],
    category: 'puzzle',
    isPremium: true,
  },
];

export const getGamesByCategory = (category: string) => {
  return GAMES.filter(game => game.category === category);
};

export const getFreeGames = () => {
  return GAMES.filter(game => !game.isPremium);
};

export const getPremiumGames = () => {
  return GAMES.filter(game => game.isPremium);
};

export const getGameById = (id: string) => {
  return GAMES.find(game => game.id === id);
};