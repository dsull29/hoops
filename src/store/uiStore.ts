import { create } from 'zustand';
import { LOCAL_STORAGE_KEY_THEME } from '../constants';

/**
 * Defines the shape of the UI state and its actions.
 */
interface UIState {
  isDarkMode: boolean;
  hasLoadedInitialState: boolean;
  setDarkMode: (isDark: boolean) => void;
  setHasLoaded: (loaded: boolean) => void;
}

/**
 * Zustand store for managing global UI state.
 * This includes theme settings and initial asset loading state.
 * It's kept separate from the core game state for better separation of concerns.
 */
export const useUIStore = create<UIState>((set) => ({
  // --- STATE ---
  isDarkMode: false, // Default value, will be updated on initial load
  hasLoadedInitialState: false,

  // --- ACTIONS ---
  /**
   * Toggles dark mode on or off and persists the setting to localStorage.
   * @param {boolean} isDark - Whether to enable dark mode.
   */
  setDarkMode: (isDark) => {
    set({ isDarkMode: isDark });
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  },

  /**
   * Sets the flag indicating the initial state and assets have been loaded.
   * @param {boolean} loaded - Whether the initial load is complete.
   */
  setHasLoaded: (loaded) => set({ hasLoadedInitialState: loaded }),
}));
