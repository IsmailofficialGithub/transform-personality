import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DARK_COLORS = {
  primary: '#6C5CE7',
  success: '#00E676',
  error: '#FF5252',
  background: '#0F0F0F',
  surface: '#1F1F1F',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textTertiary: '#6B7280',
  border: '#2D2D2D',
  gradientPurple: ['#667EEA', '#764BA2'] as [string, string],
};

const LIGHT_COLORS = {
  primary: '#6C5CE7',
  success: '#00E676',
  error: '#FF5252',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#1F1F1F',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  gradientPurple: ['#667EEA', '#764BA2'] as [string, string],
};

interface ThemeStore {
  isDark: boolean;
  colors: typeof DARK_COLORS;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDark: true,
  colors: DARK_COLORS,
  
  toggleTheme: async () => {
    try {
      const currentState = get();
      const newIsDark = !currentState.isDark;
      const newColors = newIsDark ? DARK_COLORS : LIGHT_COLORS;
      
      await AsyncStorage.setItem('theme', newIsDark ? 'dark' : 'light');
      set({ isDark: newIsDark, colors: newColors });
    } catch (error) {
      console.error('Error toggling theme:', error);
    }
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      const isDark = savedTheme !== 'light'; // Default to dark
      const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
      
      set({ isDark, colors });
    } catch (error) {
      console.error('Error loading theme:', error);
      // Keep defaults on error
      set({ isDark: true, colors: DARK_COLORS });
    }
  },
}));