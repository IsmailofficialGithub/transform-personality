// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
  isPremium: boolean;
}

// Habit Types
export interface Habit {
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

// Urge Types
export interface UrgeLog {
  id: string;
  habitId: string;
  timestamp: string;
  intensity: number;
  trigger: string;
  notes: string;
  overcome: boolean;
}

// Achievement Types
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  requirement: number;
  current: number;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
  HabitSelection: undefined;
  Dashboard: undefined;
  Statistics: undefined;
  Achievements: undefined;
  Profile: undefined;
  PanicButton: undefined;
  LogUrge: { habitId: string };
};

// Theme Types
export interface ThemeColors {
  primary: string;
  success: string;
  error: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  gradientPurple: string[];
  gradientBlue: string[];
  gradientGreen: string[];
  gradientOrange: string[];
}
