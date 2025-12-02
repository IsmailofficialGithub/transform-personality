import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const CARDS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'];

export default function MemoryMatch() {
  const [cards, setCards] = useState<string[]>([]);
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
    const pairs = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5);
    setCards(pairs);
    setFlipped([]);
    setSolved([]);
    setDisabled(false);
  };

  return (
    <View className="flex-1 items-center justify-center p-4 w-full">
      <Text className="text-2xl font-bold mb-4">Memory Match</Text>
      <View className="flex-row flex-wrap justify-center">
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            className={`w-16 h-16 m-2 items-center justify-center rounded-lg ${
              flipped.includes(index) || solved.includes(index)
                ? 'bg-blue-500'
                : 'bg-gray-300'
            }`}
            onPress={() => handlePress(index)}
          >
            <Text className="text-2xl">
              {flipped.includes(index) || solved.includes(index) ? card : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity
        className="mt-6 bg-green-500 p-3 rounded-lg"
        onPress={resetGame}
      >
        <Text className="text-white font-bold">Reset Game</Text>
      </TouchableOpacity>
    </View>
  );
}
