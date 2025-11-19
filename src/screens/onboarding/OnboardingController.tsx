import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WelcomeScreen } from './WelcomeScreen';
import { PersonalityQuizScreen } from './PersonalityQuizScreen';

type OnboardingStep = 'welcome' | 'quiz';
interface OnboardingControllerProps {
  onComplete: () => void;
}

export const OnboardingController = ({ onComplete }: OnboardingControllerProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep | null>(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const isComplete = await AsyncStorage.getItem('onboardingComplete');
        if (isComplete === 'true') {
          // user already finished onboarding before
          onComplete();
        } else {
          setCurrentStep('welcome');
        }
      } catch (error) {
        console.error('Error reading onboarding status:', error);
        setCurrentStep('welcome');
      }
    };

    checkOnboardingStatus();
  }, []);

  const transitionToStep = (nextStep: OnboardingStep | 'done') => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(async () => {
      if (nextStep === 'done') {
        await AsyncStorage.setItem('onboardingComplete', 'true');
        onComplete();
      } else {
        setCurrentStep(nextStep);
      }
    });
  };

  const handleWelcomeContinue = () => transitionToStep('quiz');

  const handleQuizComplete = async (answers: Record<string, string>) => {
    try {
      await AsyncStorage.setItem('quizAnswers', JSON.stringify(answers));
    } catch (error) {
      console.error('Error saving quiz answers:', error);
    }
    transitionToStep('done');
  };

  if (!currentStep) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      {currentStep === 'welcome' && <WelcomeScreen onContinue={handleWelcomeContinue} />}
      {currentStep === 'quiz' && <PersonalityQuizScreen onComplete={handleQuizComplete} />}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
