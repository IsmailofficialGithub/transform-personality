import { useRef, useEffect } from 'react';
import { Animated, Easing } from 'react-native';

export const useAnimatedValue = (initialValue: number = 0) => {
  const animatedValue = useRef(new Animated.Value(initialValue)).current;

  const animateTo = (
    toValue: number,
    duration: number = 400,
    easing: (value: number) => number = Easing.out(Easing.exp),
    useNativeDriver: boolean = true
  ) => {
    Animated.timing(animatedValue, {
      toValue,
      duration,
      easing,
      useNativeDriver,
    }).start();
  };

  const springTo = (
    toValue: number,
    config: Partial<Animated.SpringAnimationConfig> = {}
  ) => {
    Animated.spring(animatedValue, {
      toValue,
      useNativeDriver: true,
      tension: 40,
      friction: 8,
      ...config,
    }).start();
  };

  const reset = (value: number = 0) => {
    animatedValue.setValue(value);
  };

  return { animatedValue, animateTo, springTo, reset };
};
