// src/services/gameEngine.ts
import {
  advanceDay,
  type AdvanceDayResult,
  createInitialPlayer,
  processPlayerRetirement as logicProcessPlayerRetirement,
} from '../gameLogic';
import type { Choice, GameEvent, Player } from '../types';
import type { Team } from '../types/teams';

interface SimulationResult {
  player: Player;
  event: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
}

export const gameEngine = {
  startGame(metaSkillPoints: number, teams: Team[]) {
    const player = createInitialPlayer(metaSkillPoints, teams);
    return {
      player,
      currentEvent: null,
      isLoading: false,
    };
  },

  simulateDays(currentPlayer: Player, allTeams: Team[], maxDays: number = 1): SimulationResult {
    let playerState = { ...currentPlayer };
    let dayCounter = 0;
    let turnResult: AdvanceDayResult;

    while (dayCounter < maxDays) {
      // Pass the full list of teams to the game loop
      turnResult = advanceDay(playerState, allTeams);
      playerState = turnResult.nextPlayerState;
      dayCounter++;

      if (turnResult.isGameOver) {
        return {
          player: playerState,
          event: null,
          isGameOver: true,
          gameOverMessage: turnResult.gameOverMessage,
        };
      }

      if (turnResult.nextEvent) {
        return { player: playerState, event: turnResult.nextEvent, isGameOver: false };
      }
    }

    return { player: playerState, event: null, isGameOver: false };
  },

  processPlayerChoice(
    currentPlayer: Player,
    choice: Choice,
    allTeams: Team[]
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

    // Pass allTeams to the subsequent simulation step
    const turnResult = this.simulateDays(playerAfterChoiceAction, allTeams, 1);

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
