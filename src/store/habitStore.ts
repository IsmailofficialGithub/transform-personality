import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Habit {
  id: string;
  type: string;
  customName?: string;
  quitDate: string;
  currentStreak: number;
  longestStreak: number;
  totalRelapses: number;
  severity: 'mild' | 'moderate' | 'severe';
  createdAt: string;
  updatedAt: string;
}

interface UrgeLog {
  id: string;
  habitId: string;
  timestamp: string;
  intensity: number;
  trigger: string;
  notes: string;
  overcome: boolean;
}

interface HabitStore {
  habits: Habit[];
  urgeLogs: UrgeLog[];
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  logUrge: (urge: Omit<UrgeLog, 'id' | 'timestamp'>) => void;
  loadHabits: () => Promise<void>;
  saveHabits: () => Promise<void>;
}

export const useHabitStore = create<HabitStore>((set, get) => ({
  habits: [],
  urgeLogs: [],
  
  addHabit: (habit) => {
    const newHabit: Habit = {
      ...habit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    set((state) => ({ habits: [...state.habits, newHabit] }));
    get().saveHabits();
  },
  
  updateHabit: (id, updates) => {
    set((state) => ({
      habits: state.habits.map((h) =>
        h.id === id ? { ...h, ...updates, updatedAt: new Date().toISOString() } : h
      ),
    }));
    get().saveHabits();
  },
  
  deleteHabit: (id) => {
    set((state) => ({
      habits: state.habits.filter((h) => h.id !== id),
    }));
    get().saveHabits();
  },
  
  logUrge: (urge) => {
    const newLog: UrgeLog = {
      ...urge,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    
    set((state) => ({ urgeLogs: [...state.urgeLogs, newLog] }));
    
    // Update habit stats if relapse
    if (!urge.overcome) {
      const habit = get().habits.find(h => h.id === urge.habitId);
      if (habit) {
        get().updateHabit(urge.habitId, {
          totalRelapses: habit.totalRelapses + 1,
          currentStreak: 0,
          quitDate: new Date().toISOString(), // Reset quit date
        });
      }
    }
    
    get().saveHabits();
  },
  
  loadHabits: async () => {
    try {
      const storedHabits = await AsyncStorage.getItem('habits');
      const storedLogs = await AsyncStorage.getItem('urgeLogs');
      
      if (storedHabits) {
        set({ habits: JSON.parse(storedHabits) });
      }
      if (storedLogs) {
        set({ urgeLogs: JSON.parse(storedLogs) });
      }
    } catch (error) {
      console.error('Error loading habits:', error);
    }
  },
  
  saveHabits: async () => {
    try {
      const { habits, urgeLogs } = get();
      await AsyncStorage.setItem('habits', JSON.stringify(habits));
      await AsyncStorage.setItem('urgeLogs', JSON.stringify(urgeLogs));
    } catch (error) {
      console.error('Error saving habits:', error);
    }
  },
}));