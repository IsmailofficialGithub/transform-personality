import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import {
  Heart,
  Star,
  Moon,
  Sun,
  Flower,
  Leaf,
  Sparkles,
  Zap,
} from 'lucide-react-native';

const CARD_ICONS = [
  { Icon: Heart, color: '#ef4444' },
  { Icon: Star, color: '#f59e0b' },
  { Icon: Moon, color: '#6366f1' },
  { Icon: Sun, color: '#eab308' },
  { Icon: Flower, color: '#ec4899' },
  { Icon: Leaf, color: '#10b981' },
  { Icon: Sparkles, color: '#8b5cf6' },
  { Icon: Zap, color: '#3b82f6' },
];

export default function MemoryMatch() {
  const theme = useTheme();
  const [cards, setCards] = useState<number[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    if (flipped.length === 2) {
      setDisabled(true);
      const [first, second] = flipped;
      if (cards[first] === cards[second]) {
        setSolved([...solved, first, second]);
        setFlipped([]);
        setDisabled(false);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setDisabled(false);
        }, 1000);
      }
    }
  }, [flipped]);

  const handlePress = (index: number) => {
    if (disabled || flipped.includes(index) || solved.includes(index)) return;
    setFlipped([...flipped, index]);
  };

  const resetGame = () => {
    const pairs = [...CARD_ICONS.map((_, i) => i), ...CARD_ICONS.map((_, i) => i)].sort(
      () => Math.random() - 0.5
    );
    setCards(pairs);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
  };

  const cardIcon = (cardIndex: number) => {
    const iconData = CARD_ICONS[cards[cardIndex]];
    return iconData ? <iconData.Icon size={28} color={iconData.color} /> : null;
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.base.background }} className="items-center justify-center p-4 w-full">
      <Text style={{ color: theme.text.primary }} className="text-2xl font-bold mb-6">
        Memory Match
      </Text>
      <View className="flex-row flex-wrap justify-center max-w-xs">
        {cards.map((card, index) => {
          const isFlipped = flipped.includes(index) || solved.includes(index);
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handlePress(index)}
              style={{
                width: 60,
                height: 60,
                margin: 6,
                backgroundColor: isFlipped
                  ? theme.primary
                  : theme.base.card,
                borderColor: theme.base.border,
                borderWidth: 2,
              }}
              className="items-center justify-center rounded-xl"
              disabled={disabled}
            >
              {isFlipped ? (
                cardIcon(index)
              ) : (
                <Text style={{ color: theme.text.tertiary }} className="text-xl font-bold">
                  ?
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity
        onPress={resetGame}
        style={{ backgroundColor: theme.status.success }}
        className="mt-6 px-6 py-3 rounded-xl"
      >
        <Text style={{ color: theme.text.inverse }} className="font-bold text-lg">
          Reset Game
        </Text>
      </TouchableOpacity>
    </View>
  );
}
