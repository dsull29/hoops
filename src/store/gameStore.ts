import { message } from 'antd';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { LOCAL_STORAGE_KEY_GAME_STATE } from '../constants';
import { gameEngine } from '../services/gameEngine';
import type { Choice, GameState } from '../types';

// The state will only contain game-related data now.
interface HoopsGameState extends Omit<GameState, 'isLoading'> {
  metaSkillPoints: number;
  metaSkillPointsAtRunStart: number;
}

// Actions are separated for clarity
interface HoopsActions {
  startGame: () => void;
  handleChoice: (choice: Choice) => void;
  handleRetire: () => { retired: boolean; message: string };
  loadGame: () => void;
  clearSavedGame: () => void;
}

// We keep a separate, non-persisted state for transient UI properties like loading spinners.
interface NonPersistedState {
  isLoading: boolean;
}

// FIX: Added 'export const useGameStore = ' to correctly export the store.
export const useGameStore = create<HoopsGameState & HoopsActions & NonPersistedState>()(
  persist(
    (set, get) => ({
      // --- PERSISTED STATE ---
      player: null,
      currentEvent: null,
      gamePhase: 'menu',
      metaSkillPoints: 0,
      metaSkillPointsAtRunStart: 0,

      // --- NON-PERSISTED STATE ---
      isLoading: false,

      // --- ACTIONS ---
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
          message.error(`Not enough ${choice.cost?.stat}!`);
          return;
        }

        set({ isLoading: true });

        setTimeout(() => {
          const { player: currentPlayer, metaSkillPointsAtRunStart } = get();
          const { nextPlayerState, nextEvent, isGameOver, outcomeMessage, eventTriggerMessage } =
            gameEngine.processPlayerChoice(currentPlayer!, choice);

          // Use Ant Design's message API to show outcomes
          message.success(outcomeMessage, 3.5);

          if (eventTriggerMessage) {
            const messages = eventTriggerMessage
              .split('&')
              .map((s) => s.trim())
              .filter(Boolean);
            messages.forEach((msg, index) => {
              setTimeout(() => message.info(msg, 3.5), 500 + index * 700);
            });
          }

          if (isGameOver) {
            const { finalPlayerState, newTotalMetaSkillPoints } =
              gameEngine.processPlayerRetirement(
                nextPlayerState,
                metaSkillPointsAtRunStart,
                outcomeMessage
              );
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
      handleRetire: () => {
        const { player, metaSkillPointsAtRunStart } = get();
        if (!player) {
          return { retired: false, message: 'No active game to retire from.' };
        }
        const { finalPlayerState, newTotalMetaSkillPoints } = gameEngine.processPlayerRetirement(
          player,
          metaSkillPointsAtRunStart
        );
        set({
          player: finalPlayerState,
          gamePhase: 'gameOver',
          currentEvent: null,
          metaSkillPoints: newTotalMetaSkillPoints,
        });
        return { retired: true, message: 'You have retired. Your legacy awaits!' };
      },
      loadGame: () => {
        const { player } = get();
        if (player) {
          const regeneratedEvent = gameEngine.regenerateDailyEvent(player);
          set({ currentEvent: regeneratedEvent, gamePhase: 'playing' });
          message.success('Game loaded!');
        } else {
          message.error('Could not load game data.');
        }
      },
      clearSavedGame: () => {
        // This should clear the persisted state and reset to the menu.
        // Zustand's persist middleware doesn't have a direct clear(),
        // so we reset the state and let the middleware overwrite the storage.
        set({
          player: null,
          currentEvent: null,
          gamePhase: 'menu',
          metaSkillPointsAtRunStart: 0,
          // We don't clear metaSkillPoints, as that's a career-long value.
        });
        message.info('Saved game cleared.');
      },
    }),
    {
      name: LOCAL_STORAGE_KEY_GAME_STATE,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        player: state.player,
        gamePhase: state.gamePhase,
        metaSkillPoints: state.metaSkillPoints,
        metaSkillPointsAtRunStart: state.metaSkillPointsAtRunStart,
      }),
      // When rehydrating, we don't need to do anything special here anymore,
      // as the UI store and App.tsx handle the initial load sequence.
    }
  )
);
