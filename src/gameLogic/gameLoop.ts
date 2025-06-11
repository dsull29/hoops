import {
  COLLEGE_GRADUATION_AGE,
  COLLEGE_MAX_SEASONS,
  COLLEGE_ROLES,
  HIGH_SCHOOL_MAX_SEASONS,
  HIGH_SCHOOL_ROLES,
  MAX_ENERGY,
  PROFESSIONAL_ROLES,
} from '../constants';
import type { GameEvent, GameMode, Player, PlayerRole } from '../types';
import { calculatePerformanceScore } from '../utils';
import { getModeRoleContextualEvent } from './contextualEvents/contextualEventRunner';
import {
  agentMeetingEvent,
  createDailyChoiceEvent, // FIX: Changed from createWeeklyChoiceEvent
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

  if (gameMode === 'High School' && currentSeasonInMode >= HIGH_SCHOOL_MAX_SEASONS) {
    newMode = 'College';
    newRole = COLLEGE_ROLES[0];
    logMessages.push(
      `--- You've graduated High School and are now entering College as a ${newRole}! ---`
    );
  } else if (
    gameMode === 'College' &&
    (currentSeasonInMode >= COLLEGE_MAX_SEASONS || age >= COLLEGE_GRADUATION_AGE)
  ) {
    newMode = 'Professional';
    newRole = PROFESSIONAL_ROLES[0];
    logMessages.push(
      `--- Your College career ends. You're taking your talents to the pros as an ${newRole}! ---`
    );
  }

  const roles: readonly PlayerRole[] =
    newMode === 'High School'
      ? HIGH_SCHOOL_ROLES
      : newMode === 'College'
      ? COLLEGE_ROLES
      : PROFESSIONAL_ROLES;

  let roleIndex = roles.indexOf(newRole);
  if (roleIndex === -1) {
    roleIndex = 0;
  }

  const promotionThreshold = 100 + roleIndex * 15;
  const demotionThreshold = 70 + roleIndex * 10;

  if (performanceScore > promotionThreshold && roleIndex < roles.length - 1) {
    roleIndex++;
    logMessages.push(`Your hard work paid off! You've been promoted to: ${roles[roleIndex]}.`);
  } else if (performanceScore < demotionThreshold && roleIndex > 0) {
    roleIndex--;
    logMessages.push(`A tough season. Your role has been adjusted to: ${roles[roleIndex]}.`);
  }

  newRole = roles[roleIndex];
  return { newRole, newMode, logMessages };
};

export interface ProcessDayResult {
  nextPlayerState: Player;
  nextEvent: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
  eventTriggerMessage?: string;
}

export const processDay = (
  currentPlayer: Player,
  choiceOutcomeImmediateEvent: GameEvent | null
): ProcessDayResult => {
  const nextPlayerState = { ...currentPlayer };
  let nextEvent: GameEvent | null = choiceOutcomeImmediateEvent;
  let isGameOver = false;
  let gameOverMessage: string | undefined;
  let eventTriggerMessage: string | undefined;

  if (!nextEvent) {
    nextPlayerState.totalDaysPlayed += 1;
    nextPlayerState.currentDayInSeason += 1;

    if (nextPlayerState.currentDayInSeason > nextPlayerState.schedule.schedule.length) {
      nextPlayerState.currentDayInSeason = 1;
      nextPlayerState.currentSeason += 1;
      nextPlayerState.age += 1;
      nextPlayerState.stats.energy = MAX_ENERGY;
      const progressResult = evaluatePlayerProgress(nextPlayerState);
      if (nextPlayerState.gameMode !== progressResult.newMode) {
        nextPlayerState.currentSeasonInMode = 1;
      } else {
        nextPlayerState.currentSeasonInMode += 1;
      }
      nextPlayerState.gameMode = progressResult.newMode;
      nextPlayerState.currentRole = progressResult.newRole;
      nextPlayerState.careerLog.push(...progressResult.logMessages);
      nextPlayerState.schedule = generateSeasonSchedule(
        nextPlayerState.gameMode,
        nextPlayerState.currentSeason
      );
      eventTriggerMessage = `--- End of Season ${nextPlayerState.currentSeason - 1}. Age: ${
        nextPlayerState.age
      }. You feel rested for the new season! ---`;
    }

    const today = nextPlayerState.schedule.schedule.find(
      (item) => item.day === nextPlayerState.currentDayInSeason
    );
    if (today) {
      if (today.type === 'Game' || today.type === 'Playoffs' || today.type === 'Championship') {
        if (
          nextPlayerState.schedule.playoffEliminated &&
          (today.type === 'Playoffs' || today.type === 'Championship')
        ) {
          nextPlayerState.careerLog.push(
            `Day ${today.day}: Skipped playoff game due to prior elimination.`
          );
          nextEvent = createDailyChoiceEvent(nextPlayerState);
        } else {
          nextEvent = gameDayEvent(nextPlayerState, today.opponent || 'Rival');
        }
      } else {
        if (Math.random() < 0.05 && nextPlayerState.stats.energy < 40) {
          nextEvent = minorInjuryEvent;
        } else if (
          nextPlayerState.totalDaysPlayed > 0 &&
          nextPlayerState.totalDaysPlayed % 45 === 0
        ) {
          const agentEvent = agentMeetingEvent(nextPlayerState);
          if (agentEvent) {
            nextEvent = agentEvent;
          } else {
            nextEvent = createDailyChoiceEvent(nextPlayerState);
          }
        } else if (Math.random() < 0.15) {
          // Chance for a contextual story event
          const contextualEvent = getModeRoleContextualEvent(nextPlayerState);
          if (contextualEvent) {
            nextEvent = contextualEvent;
          } else {
            nextEvent = createDailyChoiceEvent(nextPlayerState);
          }
        } else {
          nextEvent = createDailyChoiceEvent(nextPlayerState);
        }
      }
    } else {
      nextEvent = createDailyChoiceEvent(nextPlayerState);
    }
  }

  if (nextPlayerState.age > 40 && nextPlayerState.gameMode === 'Professional') {
    isGameOver = true;
    gameOverMessage = "After a long and storied career, it's time to retire.";
  }

  if (isGameOver) {
    nextPlayerState.careerOver = true;
    if (gameOverMessage) {
      nextPlayerState.careerLog.push(`--- CAREER OVER: ${gameOverMessage} ---`);
    }
  }

  return { nextPlayerState, nextEvent, isGameOver, gameOverMessage, eventTriggerMessage };
};
