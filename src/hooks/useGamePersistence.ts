import { message } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { createDailyChoiceEvent } from '../gameLogic/eventDefinitions';
import type { GameState, Player } from '../types';

import {
  LOCAL_STORAGE_KEY_GAME_STATE,
  LOCAL_STORAGE_KEY_META_POINTS,
  LOCAL_STORAGE_KEY_THEME,
} from '../constants';

interface UseGamePersistenceReturn {
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  metaSkillPoints: number;
  setMetaSkillPoints: React.Dispatch<React.SetStateAction<number>>;
  metaSkillPointsAtRunStart: number;
  setMetaSkillPointsAtRunStart: React.Dispatch<React.SetStateAction<number>>;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  hasLoadedInitialState: boolean;
  saveGameToStorage: (
    currentGameState: GameState,
    currentMetaStartPoints: number,
    silent?: boolean
  ) => void;
  loadGameFromStorage: () => GameState | null;
  clearSavedGameFromStorage: () => void;
}
export const useGamePersistence = (): UseGamePersistenceReturn => {
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    currentEvent: null,
    isLoading: false,
    gamePhase: 'menu',
  });
  const [metaSkillPoints, setMetaSkillPoints] = useState<number>(() => {
    const storedPoints = localStorage.getItem(LOCAL_STORAGE_KEY_META_POINTS);
    return storedPoints ? parseInt(storedPoints, 10) : 0;
  });
  const [metaSkillPointsAtRunStart, setMetaSkillPointsAtRunStart] = useState<number>(0);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return storedTheme === 'dark';
  });
  const [hasLoadedInitialState, setHasLoadedInitialState] = useState(false);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_META_POINTS, metaSkillPoints.toString());
  }, [metaSkillPoints]);
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  useEffect(() => {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_STATE);
    if (storedState) {
      try {
        const parsedSaveData = JSON.parse(storedState) as Omit<GameState, 'currentEvent'> & {
          metaSkillPointsAtRunStart?: number;
          player: Player;
        };
        if (parsedSaveData.player && parsedSaveData.gamePhase) {
          const regeneratedEvent = createDailyChoiceEvent(parsedSaveData.player);
          setGameState({
            player: parsedSaveData.player,
            currentEvent: regeneratedEvent,
            isLoading: false,
            gamePhase: parsedSaveData.gamePhase,
          });
          setMetaSkillPointsAtRunStart(parsedSaveData.metaSkillPointsAtRunStart ?? metaSkillPoints);
        } else {
          localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
        }
      } catch (error) {
        console.error('Error loading state from local storage:', error);
        localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
      }
    }
    setHasLoadedInitialState(true);
  }, [metaSkillPoints]);
  const saveGameToStorage = useCallback(
    (currentGameState: GameState, currentMetaStartPoints: number, silent: boolean = false) => {
      if (currentGameState.player && currentGameState.gamePhase === 'playing') {
        const stateToSave = {
          player: currentGameState.player,
          isLoading: false,
          gamePhase: currentGameState.gamePhase,
          metaSkillPointsAtRunStart: currentMetaStartPoints,
        };
        localStorage.setItem(LOCAL_STORAGE_KEY_GAME_STATE, JSON.stringify(stateToSave));
        if (!silent) {
          message.success('Game saved!');
        }
      } else if (currentGameState.gamePhase !== 'menu' && !silent) {
        message.warning('No active game to save.');
      }
    },
    []
  );
  const loadGameFromStorage = useCallback((): GameState | null => {
    const storedState = localStorage.getItem(LOCAL_STORAGE_KEY_GAME_STATE);
    if (storedState) {
      try {
        const parsedSaveData = JSON.parse(storedState) as Omit<GameState, 'currentEvent'> & {
          metaSkillPointsAtRunStart?: number;
          player: Player;
        };
        if (parsedSaveData.player && parsedSaveData.gamePhase) {
          const regeneratedEvent = createDailyChoiceEvent(parsedSaveData.player);
          setMetaSkillPointsAtRunStart(parsedSaveData.metaSkillPointsAtRunStart ?? metaSkillPoints);
          message.success('Game loaded!');
          return {
            player: parsedSaveData.player,
            currentEvent: regeneratedEvent,
            isLoading: false,
            gamePhase: parsedSaveData.gamePhase,
          };
        } else {
          throw new Error('Invalid saved game structure.');
        }
      } catch (error) {
        console.error('Error loading saved game:', error);
        message.error('Could not load saved game. It might be corrupted.');
        localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
      }
    } else {
      message.info('No saved game found.');
    }
    return null;
  }, [metaSkillPoints]);
  const clearSavedGameFromStorage = useCallback(() => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
    message.info('Saved game cleared.');
  }, []);
  return {
    gameState,
    setGameState,
    metaSkillPoints,
    setMetaSkillPoints,
    metaSkillPointsAtRunStart,
    setMetaSkillPointsAtRunStart,
    isDarkMode,
    setIsDarkMode,
    hasLoadedInitialState,
    saveGameToStorage,
    loadGameFromStorage,
    clearSavedGameFromStorage,
  };
};
