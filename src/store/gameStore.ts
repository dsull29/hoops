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
  handleRetire: () => void; // FIX: This action no longer returns a value.
  clearSavedGame: () => void;
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
        if (choice.cost && player.stats[choice.cost.stat] < choice.cost.amount) {
          console.error(`Not enough ${choice.cost?.stat}!`);
          return;
        }
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
      // FIX: handleRetire now only manages state and doesn't return anything.
      // The UI component is responsible for showing any confirmation messages.
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
      // This action resets the state to its initial values, and the persist middleware
      // will then overwrite the saved data in IndexedDB with this cleared state.
      clearSavedGame: () => {
        set({
          player: null,
          currentEvent: null,
          gamePhase: 'menu',
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
      // FIX: onRehydrateStorage now uses the store's `setState` method,
      // which is a cleaner way to update non-persisted state after loading.
      onRehydrateStorage: () => {
        return (hydratedState) => {
          if (hydratedState && hydratedState.player && hydratedState.gamePhase === 'playing') {
            useGameStore.setState({
              currentEvent: gameEngine.regenerateWeeklyEvent(hydratedState.player),
            });
          }
        };
      },
    } as PersistOptions<FullStore, PersistedState>
  )
);
