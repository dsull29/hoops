import {
  advanceDay,
  createInitialPlayer,
  processPlayerRetirement as logicProcessPlayerRetirement,
} from '../gameLogic';
import type { Choice, GameEvent, Player } from '../types';

interface SimulationResult {
  player: Player;
  event: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
}

export const gameEngine = {
  startGame(metaSkillPoints: number) {
    const player = createInitialPlayer(metaSkillPoints);
    return {
      player,
      currentEvent: null,
      isLoading: false,
    };
  },

  simulateDays(currentPlayer: Player, maxDays: number = 1): SimulationResult {
    let playerState = { ...currentPlayer };
    let dayCounter = 0;

    while (dayCounter < maxDays) {
      const { nextPlayerState, nextEvent, isGameOver, gameOverMessage } = advanceDay(playerState);
      playerState = nextPlayerState;
      dayCounter++;

      if (isGameOver) {
        return { player: playerState, event: null, isGameOver: true, gameOverMessage };
      }

      if (nextEvent) {
        return { player: playerState, event: nextEvent, isGameOver: false };
      }
    }

    return { player: playerState, event: null, isGameOver: false };
  },

  processPlayerChoice(
    currentPlayer: Player,
    choice: Choice
  ): {
    nextPlayerState: Player;
    nextEvent: GameEvent | null;
    isGameOver: boolean;
    outcomeMessage: string;
  } {
    const { updatedPlayer, outcomeMessage, gamePerformance } = choice.action(currentPlayer);

    let processedOutcomeMessage = outcomeMessage;
    const playerAfterChoiceAction = { ...updatedPlayer };

    if (gamePerformance) {
      const { statLine, teamWon } = gamePerformance;
      // FIX: Find the current day's schedule item to correctly check its type
      const today = playerAfterChoiceAction.schedule.schedule.find(
        (item) => item.day === playerAfterChoiceAction.currentDayInSeason
      );

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
        playoffEliminated:
          !teamWon && today && (today.type === 'Playoffs' || today.type === 'Championship')
            ? true
            : playerAfterChoiceAction.schedule.playoffEliminated,
      };
      const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
      const statString = `In ${statLine.minutes}m, you had ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
      processedOutcomeMessage = `${outcomeMessage} ${statString} ${resultString}`;
    }

    playerAfterChoiceAction.careerLog.push(processedOutcomeMessage);

    // After a choice, immediately try to advance to the next day/event
    const turnResult = this.simulateDays(playerAfterChoiceAction, 1);

    return {
      nextPlayerState: turnResult.player,
      nextEvent: turnResult.event,
      isGameOver: turnResult.isGameOver,
      outcomeMessage: turnResult.gameOverMessage || processedOutcomeMessage,
    };
  },

  processPlayerRetirement(
    player: Player,
    metaSkillPointsAtRunStart: number,
    retirementMessage?: string
  ) {
    return logicProcessPlayerRetirement(player, metaSkillPointsAtRunStart, retirementMessage);
  },
};
