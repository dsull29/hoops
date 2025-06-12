import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY_GAME_STATE } from '../constants';
import { archiveCareer, idbStorage } from '../services/db';
import { gameEngine } from '../services/gameEngine';
import type { Choice, GameEvent, Player } from '../types';

type PersistedState = {
  player: Player | null;
  gamePhase: 'menu' | 'playing' | 'gameOver';
  metaSkillPoints: number;
  metaSkillPointsAtRunStart: number;
};

type FullStore = PersistedState & {
  currentEvent: GameEvent | null;
  isLoading: boolean;
  startGame: () => void;
  handleChoice: (choice: Choice) => void;
  handleRetire: () => void;
  clearSavedGame: () => void;
  setCurrentEvent: (event: GameEvent | null) => void;
  simDay: () => void;
  simToNextEvent: () => void;
};

export const useGameStore = create<FullStore>()(
  persist(
    (set, get) => ({
      player: null,
      currentEvent: null,
      gamePhase: 'menu',
      metaSkillPoints: 0,
      metaSkillPointsAtRunStart: 0,
      isLoading: false,

      setCurrentEvent: (event) => set({ currentEvent: event }),

      startGame: () => {
        const { metaSkillPoints } = get();
        const initialState = gameEngine.startGame(metaSkillPoints);
        set({
          ...initialState,
          gamePhase: 'playing',
          metaSkillPointsAtRunStart: metaSkillPoints,
        });
      },

      handleChoice: (choice: Choice) => {
        const { player } = get();
        if (!player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, metaSkillPointsAtRunStart } = get();
          const { nextPlayerState, nextEvent, isGameOver, outcomeMessage } =
            gameEngine.processPlayerChoice(currentPlayer!, choice);
          if (isGameOver) {
            const { finalPlayerState, newTotalMetaSkillPoints } =
              gameEngine.processPlayerRetirement(
                nextPlayerState,
                metaSkillPointsAtRunStart,
                outcomeMessage
              );
            archiveCareer(finalPlayerState);
            set({
              player: finalPlayerState,
              gamePhase: 'gameOver',
              currentEvent: null,
              metaSkillPoints: newTotalMetaSkillPoints,
              isLoading: false,
            });
          } else {
            set({
              player: nextPlayerState,
              currentEvent: nextEvent,
              isLoading: false,
            });
          }
        }, 300);
      },

      simDay: () => {
        const { player } = get();
        if (!player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, metaSkillPointsAtRunStart } = get();
          const {
            player: nextPlayerState,
            event: nextEvent,
            isGameOver,
            gameOverMessage,
          } = gameEngine.simulateDays(currentPlayer!, 1);
          if (isGameOver) {
            const { finalPlayerState, newTotalMetaSkillPoints } =
              gameEngine.processPlayerRetirement(
                nextPlayerState,
                metaSkillPointsAtRunStart,
                gameOverMessage
              );
            archiveCareer(finalPlayerState);
            set({
              player: finalPlayerState,
              gamePhase: 'gameOver',
              currentEvent: null,
              metaSkillPoints: newTotalMetaSkillPoints,
              isLoading: false,
            });
          } else {
            set({ player: nextPlayerState, currentEvent: nextEvent, isLoading: false });
          }
        }, 100);
      },

      simToNextEvent: () => {
        const { player } = get();
        if (!player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, metaSkillPointsAtRunStart } = get();
          const {
            player: nextPlayerState,
            event: nextEvent,
            isGameOver,
            gameOverMessage,
          } = gameEngine.simulateDays(currentPlayer!, 365);
          if (isGameOver) {
            const { finalPlayerState, newTotalMetaSkillPoints } =
              gameEngine.processPlayerRetirement(
                nextPlayerState,
                metaSkillPointsAtRunStart,
                gameOverMessage
              );
            archiveCareer(finalPlayerState);
            set({
              player: finalPlayerState,
              gamePhase: 'gameOver',
              currentEvent: null,
              metaSkillPoints: newTotalMetaSkillPoints,
              isLoading: false,
            });
          } else {
            set({ player: nextPlayerState, currentEvent: nextEvent, isLoading: false });
          }
        }, 500);
      },

      handleRetire: () => {
        const { player, metaSkillPointsAtRunStart } = get();
        if (!player) {
          console.warn('Attempted to retire with no active player.');
          return;
        }
        const { finalPlayerState, newTotalMetaSkillPoints } = gameEngine.processPlayerRetirement(
          player,
          metaSkillPointsAtRunStart
        );
        archiveCareer(finalPlayerState);
        set({
          player: finalPlayerState,
          gamePhase: 'gameOver',
          currentEvent: null,
          metaSkillPoints: newTotalMetaSkillPoints,
          isLoading: false,
        });
      },

      // FIX: Now also resets metaSkillPoints to prevent NaN errors after a crash.
      clearSavedGame: () => {
        set({
          player: null,
          currentEvent: null,
          gamePhase: 'menu',
          metaSkillPoints: 0,
          metaSkillPointsAtRunStart: 0,
        });
      },
    }),
    {
      name: LOCAL_STORAGE_KEY_GAME_STATE,
      storage: idbStorage,
      partialize: (state): PersistedState => ({
        player: state.player,
        gamePhase: state.gamePhase,
        metaSkillPoints: state.metaSkillPoints,
        metaSkillPointsAtRunStart: state.metaSkillPointsAtRunStart,
      }),
    } as PersistOptions<FullStore, PersistedState>
  )
);
