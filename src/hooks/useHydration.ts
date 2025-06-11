import { useEffect } from 'react';
import { gameEngine } from '../services/gameEngine';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

/**
 * A custom hook to manage the application's hydration process.
 * It ensures that once the persisted state is loaded from storage,
 * the rest of the application's state (like the current event)
 * is correctly initialized.
 */
export const useHydration = () => {
  // Get the necessary state and actions from our stores.
  const { player, gamePhase, currentEvent, setCurrentEvent } = useGameStore();
  const { setHasLoaded, setDarkMode } = useUIStore();

  useEffect(() => {
    // This effect runs whenever the core persisted state changes.
    // 1. Set the theme based on localStorage.
    const storedTheme = localStorage.getItem('HoopsTheme_v1');
    setDarkMode(storedTheme === 'dark');

    // 2. After the initial hydration from IndexedDB, `player` will be populated if a game was saved.
    // If we are in the 'playing' phase but don't have an event yet, it means we need to generate one.
    if (player && gamePhase === 'playing' && !currentEvent) {
      const initialEvent = gameEngine.regenerateDailyEvent(player);
      setCurrentEvent(initialEvent);
    }

    // 3. Signal that the initial loading and hydration process is complete.
    setHasLoaded(true);
  }, [player, gamePhase, currentEvent, setCurrentEvent, setHasLoaded, setDarkMode]);
};
