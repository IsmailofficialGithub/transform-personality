import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  getEffectiveTheme: () => 'light' | 'dark';
  initTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = 'app_theme_mode';

export const useThemeStore = create<ThemeState>((set, get) => ({
  themeMode: 'auto',
  setThemeMode: async (mode: ThemeMode) => {
    set({ themeMode: mode });
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  },
  getEffectiveTheme: () => {
    const { themeMode } = get();
    if (themeMode === 'auto') {
      return 'light'; // fallback, actual value comes from useColorScheme
    }
    return themeMode;
  },
  initTheme: async () => {
    try {
      const value = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
      if (value === 'light' || value === 'dark' || value === 'auto') {
        set({ themeMode: value });
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  },
}));

