import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

/**
 * A custom hook to manage the application's hydration process.
 * It now returns a simple boolean that is only true once Zustand's
 * async storage hydration is fully complete.
 */
export const useHydration = (): boolean => {
  const [isHydrated, setIsHydrated] = useState(useGameStore.persist.hasHydrated);
  const { setHasLoaded, setDarkMode } = useUIStore.getState();

  useEffect(() => {
    // This listener is the most reliable way to know when hydration is finished.
    const unsubFinishHydration = useGameStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (isHydrated) {
      // Set the theme based on localStorage after hydration
      const storedTheme = localStorage.getItem('HoopsTheme_v1');
      setDarkMode(storedTheme === 'dark');
      // Signal to the rest of the app that we are loaded and ready to render.
      setHasLoaded(true);
    }
  }, [isHydrated, setDarkMode, setHasLoaded]);

  return isHydrated;
};
