import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Sudoku from '../../components/games/Sudoku';
import Crossword from '../../components/games/Crossword';
import WordSearch from '../../components/games/WordSearch';
import NumberSequence from '../../components/games/NumberSequence';
import LogicGrid from '../../components/games/LogicGrid';
import PatternMatch from '../../components/games/PatternMatch';
import MathPuzzle from '../../components/games/MathPuzzle';
import CodeBreaker from '../../components/games/CodeBreaker';
import TowerOfHanoi from '../../components/games/TowerOfHanoi';
import Mastermind from '../../components/games/Mastermind';
import { useTheme } from '../../hooks/useTheme';
import { Gamepad2, Grid3x3, FileText, Search, Hash, Grid, Layers, Calculator, Lock, Key } from 'lucide-react-native';

type GameType = 'menu' | 'sudoku' | 'crossword' | 'word_search' | 'number_sequence' | 'logic_grid' | 'pattern_match' | 'math_puzzle' | 'code_breaker' | 'tower_of_hanoi' | 'mastermind';

export default function Games() {
  const theme = useTheme();
  const [selectedGame, setSelectedGame] = useState<GameType>('menu');

  const games = [
    {
      id: 'sudoku',
      name: 'Sudoku',
      description: 'Fill the 9x9 grid with numbers',
      icon: Grid3x3,
      color: theme.primary,
    },
    {
      id: 'crossword',
      name: 'Crossword',
      description: 'Fill in words using clues',
      icon: FileText,
      color: theme.secondary,
    },
    {
      id: 'word_search',
      name: 'Word Search',
      description: 'Find hidden words in grid',
      icon: Search,
      color: theme.accent,
    },
    {
      id: 'number_sequence',
      name: 'Number Sequence',
      description: 'Find the pattern in numbers',
      icon: Hash,
      color: theme.status.info,
    },
    {
      id: 'logic_grid',
      name: 'Logic Grid',
      description: 'Solve using logical deduction',
      icon: Grid,
      color: theme.status.success,
    },
    {
      id: 'pattern_match',
      name: 'Pattern Match',
      description: 'Continue the pattern',
      icon: Layers,
      color: theme.status.warning,
    },
    {
      id: 'math_puzzle',
      name: 'Math Puzzle',
      description: 'Solve math problems quickly',
      icon: Calculator,
      color: theme.primary,
    },
    {
      id: 'code_breaker',
      name: 'Code Breaker',
      description: 'Crack the color code',
      icon: Lock,
      color: theme.status.error,
    },
    {
      id: 'tower_of_hanoi',
      name: 'Tower of Hanoi',
      description: 'Move all disks to the right',
      icon: Layers,
      color: theme.secondary,
    },
    {
      id: 'mastermind',
      name: 'Mastermind',
      description: 'Crack the 4-digit code',
      icon: Key,
      color: theme.accent,
    },
  ];

  if (selectedGame === 'sudoku') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Grid3x3 size={24} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Sudoku
            </Text>
          </View>
          <Sudoku />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'crossword') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <FileText size={24} color={theme.secondary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Crossword
            </Text>
          </View>
          <Crossword />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'word_search') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Search size={24} color={theme.accent} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Word Search
            </Text>
          </View>
          <WordSearch />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'number_sequence') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Hash size={24} color={theme.status.info} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Number Sequence
            </Text>
          </View>
          <NumberSequence />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'logic_grid') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Grid size={24} color={theme.status.success} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Logic Grid
            </Text>
          </View>
          <LogicGrid />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'pattern_match') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Layers size={24} color={theme.status.warning} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Pattern Match
            </Text>
          </View>
          <PatternMatch />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'math_puzzle') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Calculator size={24} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Math Puzzle
            </Text>
          </View>
          <MathPuzzle />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'code_breaker') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Lock size={24} color={theme.status.error} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Code Breaker
            </Text>
          </View>
          <CodeBreaker />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'tower_of_hanoi') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Layers size={24} color={theme.secondary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Tower of Hanoi
            </Text>
          </View>
          <TowerOfHanoi />
        </View>
      </SafeAreaView>
    );
  }

  if (selectedGame === 'mastermind') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
        <View style={{ flex: 1 }}>
          <View
            style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
            className="px-4 py-3 border-b flex-row items-center"
          >
            <TouchableOpacity onPress={() => setSelectedGame('menu')} className="mr-3">
              <Text style={{ color: theme.primary }} className="font-bold">← Back</Text>
            </TouchableOpacity>
            <Key size={24} color={theme.accent} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Mastermind
            </Text>
          </View>
          <Mastermind />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.base.background }} edges={['top']}>
      <View style={{ flex: 1, backgroundColor: theme.base.background }}>
        <View
          style={{ backgroundColor: theme.base.card, borderBottomColor: theme.base.border }}
          className="px-4 py-3 border-b"
        >
          <View className="flex-row items-center">
            <Gamepad2 size={24} color={theme.primary} />
            <Text style={{ color: theme.text.primary }} className="text-xl font-bold ml-2">
              Distraction Games
            </Text>
          </View>
          <Text style={{ color: theme.text.secondary }} className="text-sm mt-1">
            Take a break and clear your mind
          </Text>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
        >
          <Text style={{ color: theme.text.primary }} className="text-lg font-bold mb-4">
            Available Games
          </Text>

          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <TouchableOpacity
                key={game.id}
                onPress={() => setSelectedGame(game.id as GameType)}
                style={{
                  backgroundColor: theme.base.card,
                  borderColor: theme.base.border,
                  borderWidth: 2,
                }}
                className="p-4 rounded-xl mb-3"
              >
                <View className="flex-row items-center">
                  <View
                    style={{ backgroundColor: game.color + '20' }}
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                  >
                    <IconComponent size={24} color={game.color} />
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: theme.text.primary }} className="text-lg font-bold">
                      {game.name}
                    </Text>
                    <Text style={{ color: theme.text.secondary }} className="text-sm">
                      {game.description}
                    </Text>
                  </View>
                  <Text style={{ color: theme.text.tertiary }}>→</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
