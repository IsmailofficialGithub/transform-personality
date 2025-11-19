import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

interface ConfettiCelebrationProps {
  active: boolean;
}

const { width, height } = Dimensions.get('window');

export const ConfettiCelebration = ({ active }: ConfettiCelebrationProps) => {
  const confettiPieces = useRef(
    Array.from({ length: 50 }, () => ({
      translateY: useRef(new Animated.Value(-50)).current,
      translateX: useRef(new Animated.Value(Math.random() * width)).current,
      rotate: useRef(new Animated.Value(0)).current,
      color: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'][Math.floor(Math.random() * 5)],
    }))
  ).current;

  useEffect(() => {
    if (active) {
      confettiPieces.forEach((piece, index) => {
        Animated.parallel([
          Animated.timing(piece.translateY, {
            toValue: height + 100,
            duration: 3000 + Math.random() * 2000,
            useNativeDriver: true,
            delay: Math.random() * 500,
          }),
          Animated.loop(
            Animated.timing(piece.rotate, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            })
          ),
        ]).start();
      });
    } else {
      confettiPieces.forEach((piece) => {
        piece.translateY.setValue(-50);
        piece.rotate.setValue(0);
      });
    }
  }, [active]);

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {confettiPieces.map((piece, index) => (
        <Animated.View
          key={index}
          style={[
            styles.confetti,
            {
              backgroundColor: piece.color,
              transform: [
                { translateY: piece.translateY },
                { translateX: piece.translateX },
                {
                  rotate: piece.rotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});