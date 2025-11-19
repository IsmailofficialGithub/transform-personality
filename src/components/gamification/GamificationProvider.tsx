import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useHabitStore } from '../../store/habitStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface GamificationContextType {
  level: number;
  xp: number;
  xpToNextLevel: number;
  achievements: Achievement[];
  totalPoints: number;
  checkAchievements: () => void;
  addXP: (amount: number) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

interface GamificationProviderProps {
  children: ReactNode;
}

export const GamificationProvider = ({ children }: GamificationProviderProps) => {
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  
  // Safely get habits and urgeLogs with fallback
  const habits = useHabitStore((state) => state.habits) || [];
  const urgeLogs = useHabitStore((state) => state.urgeLogs) || [];

  // XP required for next level (exponential growth)
  const xpToNextLevel = level * 100;

  useEffect(() => {
    loadGamificationData();
  }, []);

  useEffect(() => {
    if (habits.length > 0 || urgeLogs.length > 0) {
      checkAchievements();
    }
  }, [habits.length, urgeLogs.length]);

  const loadGamificationData = async () => {
    try {
      const storedLevel = await AsyncStorage.getItem('gamification_level');
      const storedXP = await AsyncStorage.getItem('gamification_xp');
      const storedAchievements = await AsyncStorage.getItem('gamification_achievements');
      const storedPoints = await AsyncStorage.getItem('gamification_points');

      if (storedLevel) setLevel(parseInt(storedLevel));
      if (storedXP) setXP(parseInt(storedXP));
      if (storedPoints) setTotalPoints(parseInt(storedPoints));
      if (storedAchievements) {
        setAchievements(JSON.parse(storedAchievements));
      } else {
        initializeAchievements();
      }
    } catch (error) {
      console.error('Error loading gamification data:', error);
      initializeAchievements();
    }
  };

  const saveGamificationData = async () => {
    try {
      await AsyncStorage.setItem('gamification_level', level.toString());
      await AsyncStorage.setItem('gamification_xp', xp.toString());
      await AsyncStorage.setItem('gamification_points', totalPoints.toString());
      await AsyncStorage.setItem('gamification_achievements', JSON.stringify(achievements));
    } catch (error) {
      console.error('Error saving gamification data:', error);
    }
  };

  const initializeAchievements = () => {
    const defaultAchievements: Achievement[] = [
      {
        id: 'first_day',
        title: 'First Step',
        description: 'Complete your first day clean',
        icon: '🎯',
        unlocked: false,
      },
      {
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Reach a 7-day streak',
        icon: '⚔️',
        unlocked: false,
      },
      {
        id: 'month_master',
        title: 'Month Master',
        description: 'Achieve 30 days clean',
        icon: '👑',
        unlocked: false,
      },
      {
        id: 'urge_victor',
        title: 'Urge Victor',
        description: 'Successfully overcome 10 urges',
        icon: '💪',
        unlocked: false,
      },
      {
        id: 'multi_habit',
        title: 'Multi-Tasker',
        description: 'Track 3 or more habits',
        icon: '🎭',
        unlocked: false,
      },
      {
        id: 'century_club',
        title: 'Century Club',
        description: 'Reach 100 total days clean',
        icon: '💯',
        unlocked: false,
      },
    ];
    setAchievements(defaultAchievements);
  };

  const addXP = async (amount: number) => {
    const newXP = xp + amount;
    const newPoints = totalPoints + amount;
    
    setXP(newXP);
    setTotalPoints(newPoints);

    // Check for level up
    if (newXP >= xpToNextLevel) {
      const newLevel = level + 1;
      setLevel(newLevel);
      setXP(newXP - xpToNextLevel);
      
      // Show level up notification
      console.log(`🎉 Level Up! You're now level ${newLevel}!`);
    }

    await saveGamificationData();
  };

  const calculateDaysClean = (quitDate: string): number => {
    const now = new Date();
    const quit = new Date(quitDate);
    const diffTime = Math.abs(now.getTime() - quit.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const checkAchievements = async () => {
    if (!habits || habits.length === 0) return;
    
    let updated = false;
    const newAchievements = [...achievements];

    // Calculate total days clean across all habits
    const totalDaysClean = habits.reduce((sum, habit) => {
      return sum + calculateDaysClean(habit.quitDate);
    }, 0);

    // Calculate urges overcome
    const urgesOvercome = urgeLogs ? urgeLogs.filter(log => log.overcome).length : 0;

    // Check each achievement
    newAchievements.forEach(achievement => {
      if (achievement.unlocked) return;

      let shouldUnlock = false;

      switch (achievement.id) {
        case 'first_day':
          shouldUnlock = totalDaysClean >= 1;
          break;
        case 'week_warrior':
          shouldUnlock = habits.some(h => calculateDaysClean(h.quitDate) >= 7);
          break;
        case 'month_master':
          shouldUnlock = habits.some(h => calculateDaysClean(h.quitDate) >= 30);
          break;
        case 'urge_victor':
          shouldUnlock = urgesOvercome >= 10;
          break;
        case 'multi_habit':
          shouldUnlock = habits.length >= 3;
          break;
        case 'century_club':
          shouldUnlock = totalDaysClean >= 100;
          break;
      }

      if (shouldUnlock) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date().toISOString();
        updated = true;
        
        // Award XP for unlocking achievement
        addXP(50);
        
        console.log(`🏆 Achievement Unlocked: ${achievement.title}!`);
      }
    });

    if (updated) {
      setAchievements(newAchievements);
      await saveGamificationData();
    }
  };

  const value: GamificationContextType = {
    level,
    xp,
    xpToNextLevel,
    achievements,
    totalPoints,
    checkAchievements,
    addXP,
  };

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  );
};

export const useGamification = () => {
  const context = useContext(GamificationContext);
  if (!context) {
    throw new Error('useGamification must be used within GamificationProvider');
  }
  return context;
};