import {
  COLLEGE_GRADUATION_AGE,
  COLLEGE_MAX_SEASONS,
  COLLEGE_ROLES,
  HIGH_SCHOOL_MAX_SEASONS,
  HIGH_SCHOOL_ROLES,
  MAX_ENERGY, // Import MAX_ENERGY
  PROFESSIONAL_ROLES,
} from '../constants';
import type { GameEvent, GameMode, Player, PlayerRole } from '../types';
import { calculatePerformanceScore } from '../utils';
import {
  agentMeetingEvent,
  createWeeklyChoiceEvent,
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';
import { generateSeasonSchedule } from './seasonLogic';

interface EvaluatePlayerProgressResult {
  newRole: PlayerRole;
  newMode: GameMode;
  logMessages: string[];
}
const evaluatePlayerProgress = (player: Player): EvaluatePlayerProgressResult => {
  const { currentRole, gameMode, age, stats, currentSeasonInMode } = player;
  const logMessages: string[] = [];
  const performanceScore = calculatePerformanceScore(stats);
  let newMode = gameMode;
  let newRole: PlayerRole = currentRole;
  if (gameMode === 'High School' && currentSeasonInMode > HIGH_SCHOOL_MAX_SEASONS) {
    newMode = 'College';
    newRole = COLLEGE_ROLES[0];
    logMessages.push(
      `--- You've graduated High School and are now entering College as a ${newRole}! ---`
    );
  } else if (
    gameMode === 'College' &&
    (currentSeasonInMode > COLLEGE_MAX_SEASONS || age >= COLLEGE_GRADUATION_AGE)
  ) {
    newMode = 'Professional';
    newRole = PROFESSIONAL_ROLES[0];
    logMessages.push(
      `--- Your College career ends. You're taking your talents to the pros as an ${newRole}! ---`
    );
  }
  const currentEffectiveRolesArray =
    newMode === 'High School'
      ? HIGH_SCHOOL_ROLES
      : newMode === 'College'
      ? COLLEGE_ROLES
      : PROFESSIONAL_ROLES;
  let currentIndex = (currentEffectiveRolesArray as PlayerRole[]).indexOf(newRole);
  if (currentIndex === -1) {
    newRole = currentEffectiveRolesArray[0];
    currentIndex = 0;
  }
  const promotionThreshold = 100 + currentIndex * 15;
  const demotionThreshold = 70 + currentIndex * 10;
  if (
    performanceScore > promotionThreshold &&
    currentIndex < currentEffectiveRolesArray.length - 1
  ) {
    newRole = currentEffectiveRolesArray[currentIndex + 1];
    logMessages.push(`Your hard work paid off! You've been promoted to: ${newRole}.`);
  } else if (performanceScore < demotionThreshold && currentIndex > 0) {
    newRole = currentEffectiveRolesArray[currentIndex - 1];
    logMessages.push(`A tough season. Your role has been adjusted to: ${newRole}.`);
  }
  return { newRole, newMode, logMessages };
};

export interface ProcessWeekResult {
  nextPlayerState: Player;
  nextEvent: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
  eventTriggerMessage?: string;
}

export const processWeek = (
  currentPlayer: Player,
  choiceOutcomeImmediateEvent: GameEvent | null
): ProcessWeekResult => {
  const nextPlayerState = { ...currentPlayer };
  let nextEvent: GameEvent | null = choiceOutcomeImmediateEvent;
  let isGameOver = false;
  let gameOverMessage: string | undefined;
  let eventTriggerMessage: string | undefined;

  if (!nextEvent) {
    nextPlayerState.totalWeeksPlayed += 1;
    nextPlayerState.currentWeek += 1;

    if (nextPlayerState.currentWeek > nextPlayerState.schedule.schedule.length) {
      // --- End of Season Logic ---
      nextPlayerState.currentWeek = 1;
      nextPlayerState.currentSeason += 1;
      nextPlayerState.age += 1;

      // FIX: Reset energy to full at the start of a new season.
      nextPlayerState.stats.energy = MAX_ENERGY;

      const progressResult = evaluatePlayerProgress(nextPlayerState);
      if (nextPlayerState.gameMode !== progressResult.newMode) {
        nextPlayerState.currentSeasonInMode = 1;
      } else {
        nextPlayerState.currentSeasonInMode += 1;
      }
      nextPlayerState.gameMode = progressResult.newMode;
      nextPlayerState.currentRole = progressResult.newRole;
      nextPlayerState.careerLog = [...nextPlayerState.careerLog, ...progressResult.logMessages];
      nextPlayerState.schedule = generateSeasonSchedule(
        nextPlayerState.gameMode,
        nextPlayerState.currentSeason
      );
      eventTriggerMessage = `--- End of Season ${nextPlayerState.currentSeason - 1}. Age: ${
        nextPlayerState.age
      }. You feel rested for the new season! ---`;
    }

    const currentWeekItem = nextPlayerState.schedule.schedule[nextPlayerState.currentWeek - 1];
    if (
      currentWeekItem &&
      (currentWeekItem.type.includes('Game') || currentWeekItem.type.includes('Championship'))
    ) {
      nextEvent = gameDayEvent(nextPlayerState, currentWeekItem.opponent || 'Rival');
    } else {
      if (Math.random() < 0.1 && nextPlayerState.stats.energy < 30) {
        nextEvent = minorInjuryEvent;
      } else if (nextPlayerState.currentWeek % 8 === 0) {
        const agentEvent = agentMeetingEvent(nextPlayerState);
        if (agentEvent) {
          nextEvent = agentEvent;
        } else {
          nextEvent = createWeeklyChoiceEvent(nextPlayerState);
        }
      } else {
        nextEvent = createWeeklyChoiceEvent(nextPlayerState);
      }
    }
  }

  if (nextPlayerState.age > 40 && nextPlayerState.gameMode === 'Professional') {
    isGameOver = true;
    gameOverMessage = "After a long and storied career, it's time to retire.";
  }

  if (isGameOver && gameOverMessage) {
    nextPlayerState.careerOver = true;
    nextPlayerState.careerLog = [
      ...nextPlayerState.careerLog,
      `--- CAREER OVER: ${gameOverMessage} ---`,
    ];
  }

  return { nextPlayerState, nextEvent, isGameOver, gameOverMessage, eventTriggerMessage };
};
