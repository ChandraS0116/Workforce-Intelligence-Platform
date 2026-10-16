import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const THEMES = {
  'executive-blue': '',
  'cyber-teal': 'theme-cyber',
  'aurora-analytics': 'theme-aurora',
  'midnight-gold': 'theme-midnight-gold',
  'crimson-executive': 'theme-crimson',
  'emerald-matrix': 'theme-emerald',
  'arctic-intelligence': 'theme-arctic',
  'neon-pulse': 'theme-neon',
  'graphite-enterprise': 'theme-graphite',
  'royal-violet': 'theme-violet',
  'quantum-orange': 'theme-orange',
  'sapphire-insight': 'theme-sapphire',
  'obsidian-platinum': 'theme-obsidian'
} as const;

export type Theme = keyof typeof THEMES;

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const applyThemeToBody = (theme: Theme) => {
  document.body.className = '';
  const className = THEMES[theme];
  if (className) {
    document.body.classList.add(className);
  }
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'executive-blue',
      setTheme: (theme) => {
        set({ theme });
        applyThemeToBody(theme);
      },
    }),
    {
      name: 'theme-storage',
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyThemeToBody(state.theme);
        }
      },
    }
  )
);
