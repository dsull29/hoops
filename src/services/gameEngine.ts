import {
  createInitialPlayer,
  createWeeklyChoiceEvent,
  processPlayerRetirement as logicProcessPlayerRetirement,
  processWeek,
} from '../gameLogic';
import type { Choice, GameEvent, Player } from '../types';

export const gameEngine = {
  startGame(metaSkillPoints: number) {
    const player = createInitialPlayer(metaSkillPoints);
    return {
      player,
      currentEvent: createWeeklyChoiceEvent(player),
      isLoading: false,
    };
  },

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
    const playerAfterChoiceAction = { ...updatedPlayer };

    // --- FIX: Record the game result directly onto the schedule ---
    if (gamePerformance) {
      const { statLine, teamWon } = gamePerformance;

      // Update the schedule item for the current week with the game's result
      const scheduleWithResult = playerAfterChoiceAction.schedule.schedule.map((item) => {
        if (item.week === playerAfterChoiceAction.currentWeek) {
          return { ...item, gameResult: { playerStats: statLine, teamWon } };
        }
        return item;
      });

      // Update the player's schedule object
      playerAfterChoiceAction.schedule = {
        ...playerAfterChoiceAction.schedule,
        schedule: scheduleWithResult,
        wins: teamWon
          ? playerAfterChoiceAction.schedule.wins + 1
          : playerAfterChoiceAction.schedule.wins,
        losses: !teamWon
          ? playerAfterChoiceAction.schedule.losses + 1
          : playerAfterChoiceAction.schedule.losses,
      };

      // Construct a detailed outcome message for the log
      const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
      const statString = `In ${statLine.minutes}m, you had ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
      processedOutcomeMessage = `${outcomeMessage} ${statString} ${resultString}`;
    }
    // --- End of FIX ---

    const newLogEntry = processedOutcomeMessage;
    const newLog = [...playerAfterChoiceAction.careerLog, newLogEntry];
    playerAfterChoiceAction.careerLog = newLog;

    const turnResult = processWeek(playerAfterChoiceAction, immediateEvent ?? null);

    return {
      nextPlayerState: turnResult.nextPlayerState,
      nextEvent: turnResult.nextEvent,
      isGameOver: turnResult.isGameOver,
      outcomeMessage: turnResult.gameOverMessage || processedOutcomeMessage,
      eventTriggerMessage: turnResult.eventTriggerMessage,
    };
  },

  processPlayerRetirement(
    player: Player,
    metaSkillPointsAtRunStart: number,
    retirementMessage?: string
  ) {
    return logicProcessPlayerRetirement(player, metaSkillPointsAtRunStart, retirementMessage);
  },

  regenerateWeeklyEvent(player: Player): GameEvent {
    return createWeeklyChoiceEvent(player);
  },
};
