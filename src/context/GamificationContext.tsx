import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { differenceInDays } from 'date-fns';

export type Achievement = {
  id: string;
  title: string;
  description: string;
  unlockedAt: string;
};

type GamificationContextType = {
  streak: number;
  achievements: Achievement[];
  lastRelapseDate: string | null;
  logRelapse: () => void;
  resetProgress: () => void;
};

const GamificationContext = createContext<GamificationContextType>({
  streak: 0,
  achievements: [],
  lastRelapseDate: null,
  logRelapse: () => {},
  resetProgress: () => {},
});

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [streak, setStreak] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [lastRelapseDate, setLastRelapseDate] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const storedDate = await AsyncStorage.getItem('lastRelapseDate');
    if (storedDate) {
      setLastRelapseDate(storedDate);
      const diff = differenceInDays(new Date(), new Date(storedDate));
      setStreak(diff);
      checkAchievements(diff);
    }
  };

  const saveData = async (date: string) => {
    await AsyncStorage.setItem('lastRelapseDate', date);
  };

  const logRelapse = async () => {
    const today = new Date().toISOString();
    await saveData(today);
    setLastRelapseDate(today);
    setStreak(0);
  };

  const resetProgress = async () => {
    await AsyncStorage.removeItem('lastRelapseDate');
    setStreak(0);
    setAchievements([]);
  };

  const checkAchievements = (currentStreak: number) => {
    const newAchievements: Achievement[] = [];

    if (currentStreak >= 3 && !achievements.find(a => a.id === '3days')) {
      newAchievements.push({
        id: '3days',
        title: '3-Day Clean',
        description: 'First mini-milestone reached!',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (currentStreak >= 7 && !achievements.find(a => a.id === '1week')) {
      newAchievements.push({
        id: '1week',
        title: '1 Week Champion',
        description: 'You’ve been clean for 7 days!',
        unlockedAt: new Date().toISOString(),
      });
    }

    if (newAchievements.length) {
      setAchievements(prev => [...prev, ...newAchievements]);
    }
  };

  return (
    <GamificationContext.Provider
      value={{ streak, achievements, lastRelapseDate, logRelapse, resetProgress }}
    >
      {children}
    </GamificationContext.Provider>
  );
};
