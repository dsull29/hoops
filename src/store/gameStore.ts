// src/store/gameStore.ts
import { create } from 'zustand';
import { persist, type PersistOptions } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY_GAME_STATE } from '../constants';
import { generateWorld } from '../gameLogic/teamGenerator';
import { archiveCareer, idbStorage } from '../services/db';
import { gameEngine } from '../services/gameEngine';
import type { Choice, GameEvent, Player } from '../types';
import type { Team } from '../types/teams';

// The state that will be persisted to IndexedDB
type PersistedState = {
  player: Player | null;
  teams: Team[]; // Ensure 'teams' is part of the persisted state
  gamePhase: 'menu' | 'playing' | 'gameOver';
  metaSkillPoints: number;
  metaSkillPointsAtRunStart: number;
};

// The full in-memory store state
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
      // --- STATE ---
      player: null,
      teams: [], // Initialize teams array
      currentEvent: null,
      gamePhase: 'menu',
      metaSkillPoints: 0,
      metaSkillPointsAtRunStart: 0,
      isLoading: false,

      // --- ACTIONS ---
      setCurrentEvent: (event) => set({ currentEvent: event }),

      startGame: () => {
        console.log('[gameStore] Starting new game...');
        const { metaSkillPoints } = get();
        const { teams } = generateWorld(); // Generate the world first
        const initialState = gameEngine.startGame(metaSkillPoints, teams);
        console.log('[gameStore] Initial player created:', initialState.player);
        set({
          ...initialState,
          teams: teams,
          gamePhase: 'playing',
          metaSkillPointsAtRunStart: metaSkillPoints,
          currentEvent: null, // Ensure no lingering event from a previous game
        });
      },

      handleChoice: (choice: Choice) => {
        if (!get().player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, teams: currentTeams, metaSkillPointsAtRunStart } = get();
          // Pass the 'currentTeams' array to the game engine
          const { nextPlayerState, nextEvent, isGameOver, outcomeMessage } =
            gameEngine.processPlayerChoice(currentPlayer!, choice, currentTeams);
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
        if (!get().player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, teams: currentTeams, metaSkillPointsAtRunStart } = get();
          // Pass 'currentTeams' and the number of days (1)
          const {
            player: nextPlayerState,
            event: nextEvent,
            isGameOver,
            gameOverMessage,
          } = gameEngine.simulateDays(currentPlayer!, currentTeams, 1);
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
        if (!get().player) return;
        set({ isLoading: true });
        setTimeout(() => {
          const { player: currentPlayer, teams: currentTeams, metaSkillPointsAtRunStart } = get();
          // Pass 'currentTeams' and the max number of days (365)
          const {
            player: nextPlayerState,
            event: nextEvent,
            isGameOver,
            gameOverMessage,
          } = gameEngine.simulateDays(currentPlayer!, currentTeams, 365);
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

      clearSavedGame: () => {
        console.log('[gameStore] Clearing all saved game data and resetting state.');
        set({
          player: null,
          teams: [],
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
      // This function determines which parts of the state are saved.
      // It now correctly includes the 'teams' array.
      partialize: (state): PersistedState => ({
        player: state.player,
        teams: state.teams,
        gamePhase: state.gamePhase,
        metaSkillPoints: state.metaSkillPoints,
        metaSkillPointsAtRunStart: state.metaSkillPointsAtRunStart,
      }),
      onRehydrateStorage: () => {
        return (_state, error) => {
          if (error) {
            console.error('[gameStore] An error occurred during hydration:', error);
          } else {
            console.log('[gameStore] Hydration finished.');
          }
        };
      },
    } as PersistOptions<FullStore, PersistedState>
  )
);
