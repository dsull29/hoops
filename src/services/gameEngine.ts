import {
  createDailyChoiceEvent,
  createInitialPlayer,
  processPlayerRetirement as logicProcessPlayerRetirement,
  processDay,
} from '../gameLogic';
import type { Choice, GameEvent, Player } from '../types';

export const gameEngine = {
  startGame(metaSkillPoints: number) {
    const player = createInitialPlayer(metaSkillPoints);
    return {
      player,
      currentEvent: createDailyChoiceEvent(player),
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

    if (gamePerformance) {
      const { statLine, teamWon } = gamePerformance;

      // FIX: Update logic to work with the daily schedule structure
      const scheduleWithResult = playerAfterChoiceAction.schedule.schedule.map((item) => {
        if (item.day === playerAfterChoiceAction.currentDayInSeason) {
          return { ...item, gameResult: { playerStats: statLine, teamWon }, isCompleted: true };
        }
        return item;
      });

      playerAfterChoiceAction.schedule = {
        ...playerAfterChoiceAction.schedule,
        schedule: scheduleWithResult,
        wins: teamWon
          ? playerAfterChoiceAction.schedule.wins + 1
          : playerAfterChoiceAction.schedule.wins,
        losses: !teamWon
          ? playerAfterChoiceAction.schedule.losses + 1
          : playerAfterChoiceAction.schedule.losses,
        // Mark the player as eliminated from playoffs on a loss in the 'Playoffs' or 'Championship'
        playoffEliminated:
          !teamWon && (choice.id === 'Playoffs' || choice.id === 'Championship')
            ? true
            : playerAfterChoiceAction.schedule.playoffEliminated,
      };

      const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
      const statString = `In ${statLine.minutes}m, you had ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
      processedOutcomeMessage = `${outcomeMessage} ${statString} ${resultString}`;
    }

    const newLogEntry = processedOutcomeMessage;
    const newLog = [...playerAfterChoiceAction.careerLog, newLogEntry];
    playerAfterChoiceAction.careerLog = newLog;

    // FIX: Call processDay instead of processWeek
    const turnResult = processDay(playerAfterChoiceAction, immediateEvent ?? null);

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

  // FIX: Rename to regenerateDailyEvent and use the correct function
  regenerateDailyEvent(player: Player): GameEvent {
    return createDailyChoiceEvent(player);
  },
};
