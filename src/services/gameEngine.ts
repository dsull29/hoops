// src/services/gameEngine.ts
import {
  createDailyChoiceEvent,
  createInitialPlayer,
  processPlayerRetirement as logicProcessPlayerRetirement,
  processTurn,
} from '../gameLogic';
import type { Choice, GameEvent, GameState, Player } from '../types';

export const gameEngine = {
  /**
   * Starts a new game.
   * @param metaSkillPoints - The legacy points to start with.
   * @returns The initial state of the game.
   */
  startGame(metaSkillPoints: number): Omit<GameState, 'gamePhase'> {
    const player = createInitialPlayer(metaSkillPoints);
    return {
      player,
      currentEvent: createDailyChoiceEvent(player),
      isLoading: false,
    };
  },

  /**
   * Processes a player's choice for the current event.
   * @param currentPlayer - The current player object.
   * @param choice - The choice made by the player.
   * @returns The result of the turn, including the next state and any messages.
   */
  processPlayerChoice(
    currentPlayer: Player,
    choice: Choice
  ): {
    nextPlayerState: Player;
    nextEvent: GameEvent | null;
    isGameOver: boolean;
    outcomeMessage: string;
    eventTriggerMessage?: string;
  } {
    const { updatedPlayer, outcomeMessage, immediateEvent, gamePerformance } =
      choice.action(currentPlayer);

    let processedOutcomeMessage = outcomeMessage;
    if (gamePerformance) {
      const { statLine, teamWon } = gamePerformance;
      const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
      const statString = `In ${statLine.minutes}m, you had ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
      if (outcomeMessage && !outcomeMessage.includes(statString)) {
        processedOutcomeMessage = `${outcomeMessage} ${statString} ${resultString}`;
      } else {
        processedOutcomeMessage = `${statString} ${resultString}`;
      }
    }

    const newLogEntry = processedOutcomeMessage;
    const newLog = [...updatedPlayer.careerLog, newLogEntry];
    const playerAfterChoiceAction = { ...updatedPlayer, careerLog: newLog };

    const turnResult = processTurn(playerAfterChoiceAction, immediateEvent ?? null);

    return {
      nextPlayerState: turnResult.nextPlayerState,
      nextEvent: turnResult.nextEvent,
      isGameOver: turnResult.isGameOver,
      outcomeMessage: turnResult.gameOverMessage || processedOutcomeMessage,
      eventTriggerMessage: turnResult.eventTriggerMessage,
    };
  },

  /**
   * Finalizes the player state upon retirement.
   * @param player - The player object at the moment of retirement.
   * @param metaSkillPointsAtRunStart - Legacy points at the start of the run.
   * @param retirementMessage - Optional message for retirement.
   * @returns The final player state and the new total meta skill points.
   */
  processPlayerRetirement(
    player: Player,
    metaSkillPointsAtRunStart: number,
    retirementMessage?: string
  ) {
    return logicProcessPlayerRetirement(player, metaSkillPointsAtRunStart, retirementMessage);
  },

  /**
   * Regenerates a daily choice event for a player.
   * This is useful when loading a game from storage, as events with functions can't be serialized.
   * @param player - The player for whom to generate the event.
   * @returns A new GameEvent.
   */
  regenerateDailyEvent(player: Player): GameEvent {
    return createDailyChoiceEvent(player);
  },
};
