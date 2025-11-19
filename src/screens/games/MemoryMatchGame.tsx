import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SIZES } from '../../utils/theme';
import { useThemeStore } from '../../store/themeStore';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 60) / 4;

const EMOJIS = ['🎯', '🧠', '💪', '🔥', '⚡', '🌟', '🎮', '🏆'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchGameProps {
  onComplete: (score: number) => void;
  onBack: () => void;
}

export const MemoryMatchGame = ({ onComplete, onBack }: MemoryMatchGameProps) => {
  const colors = useThemeStore((state) => state.colors);
  const isDark = useThemeStore((state) => state.isDark);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      endGame(false);
    }
  }, [timeLeft, gameStarted, gameOver]);

  const initializeGame = () => {
    const shuffled = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
  };

  const handleCardPress = (id: number) => {
    if (!gameStarted) setGameStarted(true);
    if (flippedCards.length === 2 || cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      checkMatch(newFlipped);
    }
  };

  const checkMatch = (flipped: number[]) => {
    const [first, second] = flipped;
    
    if (cards[first].emoji === cards[second].emoji) {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isMatched = true;
        newCards[second].isMatched = true;
        setCards(newCards);
        setFlippedCards([]);
        
        const newMatches = matches + 1;
        setMatches(newMatches);
        
        if (newMatches === EMOJIS.length) {
          endGame(true);
        }
      }, 500);
    } else {
      setTimeout(() => {
        const newCards = [...cards];
        newCards[first].isFlipped = false;
        newCards[second].isFlipped = false;
        setCards(newCards);
        setFlippedCards([]);
      }, 1000);
    }
  };

  const endGame = (won: boolean) => {
    setGameOver(true);
    const score = won ? Math.max(1000 - (moves * 10) - ((60 - timeLeft) * 5), 100) : 0;
    
    setTimeout(() => {
      Alert.alert(
        won ? '🎉 Victory!' : '⏰ Time\'s Up!',
        won 
          ? `Great job! You matched all pairs in ${moves} moves!\n\nScore: ${score}`
          : 'Better luck next time!',
        [
          {
            text: 'Play Again',
            onPress: () => {
              initializeGame();
              setMoves(0);
              setMatches(0);
              setTimeLeft(60);
              setGameStarted(false);
              setGameOver(false);
            },
          },
          {
            text: 'Finish',
            onPress: () => onComplete(score),
          },
        ]
      );
    }, 500);
  };

  const textColor = isDark ? '#FFF' : '#000';
  const subText = isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  const cardBg = isDark ? 'rgba(25,25,25,0.9)' : 'rgba(255,255,255,0.95)';

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#000' : '#F9F9F9' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backText, { color: textColor }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: textColor }]}>Memory Match</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>{moves}</Text>
          <Text style={[styles.statLabel, { color: subText }]}>Moves</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: textColor }]}>
            {matches}/{EMOJIS.length}
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Matched</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: cardBg }]}>
          <Text style={[styles.statValue, { color: timeLeft < 10 ? '#FF5252' : textColor }]}>
            {timeLeft}s
          </Text>
          <Text style={[styles.statLabel, { color: subText }]}>Time</Text>
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.board}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, { backgroundColor: cardBg }]}
            onPress={() => handleCardPress(card.id)}
            activeOpacity={0.8}
            disabled={card.isFlipped || card.isMatched}
          >
            {card.isFlipped || card.isMatched ? (
              <LinearGradient
                colors={card.isMatched ? ['#00E676', '#00C853'] : ['#667EEA', '#764BA2']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardFront}
              >
                <Text style={styles.cardEmoji}>{card.emoji}</Text>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={['#9C27B0', '#673AB7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardBack}
              >
                <Text style={styles.cardQuestion}>?</Text>
              </LinearGradient>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Instructions */}
      <View style={[styles.instructions, { backgroundColor: cardBg }]}>
        <Text style={[styles.instructionsText, { color: subText}]}>
💡 Tap cards to flip and find matching pairs. Match all pairs before time runs out!
</Text>
</View>
</View>
);
};
const styles = StyleSheet.create({
container: {
flex: 1,
paddingTop: 40,
},
header: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
paddingHorizontal: SIZES.padding,
marginBottom: 20,
},
backButton: {
padding: 8,
},
backText: {
fontSize: 16,
fontWeight: '600',
},
title: {
fontSize: 20,
fontWeight: '700',
},
placeholder: {
width: 60,
},
statsRow: {
flexDirection: 'row',
justifyContent: 'space-around',
paddingHorizontal: SIZES.padding,
marginBottom: 20,
},
statBox: {
flex: 1,
marginHorizontal: 6,
borderRadius: 12,
padding: 12,
alignItems: 'center',
},
statValue: {
fontSize: 20,
fontWeight: '700',
},
statLabel: {
fontSize: 11,
marginTop: 4,
},
board: {
flexDirection: 'row',
flexWrap: 'wrap',
paddingHorizontal: SIZES.padding,
justifyContent: 'space-between',
},
card: {
width: CARD_SIZE,
height: CARD_SIZE,
borderRadius: 12,
marginBottom: 10,
overflow: 'hidden',
},
cardFront: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
cardBack: {
flex: 1,
justifyContent: 'center',
alignItems: 'center',
},
cardEmoji: {
fontSize: 40,
},
cardQuestion: {
fontSize: 32,
color: '#FFF',
fontWeight: '700',
},
instructions: {
marginHorizontal: SIZES.padding,
marginTop: 20,
padding: 16,
borderRadius: 12,
},
instructionsText: {
fontSize: 13,
textAlign: 'center',
lineHeight: 20,
},
});