import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { useUIStore } from '../store/uiStore';

/**
 * A custom hook to manage the application's hydration process.
 * It ensures that once the persisted state is loaded from storage,
 * the rest of the application's state is correctly initialized.
 */
export const useHydration = () => {
  const { player, gamePhase, currentEvent } = useGameStore();
  const { setHasLoaded, setDarkMode, hasLoadedInitialState } = useUIStore();

  useEffect(() => {
    // Prevent this from running multiple times
    if (hasLoadedInitialState) return;

    // Set the theme based on localStorage
    const storedTheme = localStorage.getItem('HoopsTheme_v1');
    setDarkMode(storedTheme === 'dark');

    // FIX: Removed the call to the non-existent 'regenerateDailyEvent'.
    // With the new sim logic, the game correctly starts with no active event,
    // and the UI will show the simulation buttons. The logic that was here
    // is no longer needed.

    // Signal that the initial loading and hydration process is complete.
    setHasLoaded(true);
  }, [player, gamePhase, currentEvent, setHasLoaded, setDarkMode, hasLoadedInitialState]);
};
