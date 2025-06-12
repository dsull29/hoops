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

// FIX: This function now runs immediately to get the theme from localStorage
// before the store is even created. This prevents the "flash" of the wrong theme.
const getInitialDarkMode = (): boolean => {
  // Check if we are in a browser environment before accessing localStorage
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    const isDark = storedTheme === 'dark';
    // Also set the attribute on the HTML tag right away
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    return isDark;
  }
  return false; // Default to light mode for server-side rendering or other environments
};

/**
 * Zustand store for managing global UI state.
 */
export const useUIStore = create<UIState>((set) => ({
  // --- STATE ---
  // FIX: The initial state is now correctly set from localStorage on load.
  isDarkMode: getInitialDarkMode(),
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
