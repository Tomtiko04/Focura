import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported themes across the app
export const THEME_KEYS = ['system', 'light', 'dark', 'teal', 'rose'];

const useThemeStore = create(
  persist(
    (set, get) => ({
      selectedTheme: 'system', // 'system' | 'light' | 'dark' | 'teal' | 'rose'
      setSelectedTheme: (key) => set({ selectedTheme: key }),
      cycleTheme: () => {
        const current = get().selectedTheme;
        const idx = THEME_KEYS.indexOf(current);
        const next = THEME_KEYS[(idx + 1) % THEME_KEYS.length];
        set({ selectedTheme: next });
      },
    }),
    {
      name: 'focura-theme-pref',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);

export default useThemeStore;
