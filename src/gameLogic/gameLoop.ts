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
  createDailyChoiceEvent,
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';
import { generateSeasonSchedule } from './seasonLogic';

interface EvaluatePlayerProgressResult {
  newRole: PlayerRole;
  newMode: GameMode;
  logMessages: string[];
}

/**
 * Evaluates the player's current performance to determine their appropriate role and game mode.
 * This is used at the end of a season for major progression and mid-season for promotions.
 */
const evaluatePlayerProgress = (player: Player): EvaluatePlayerProgressResult => {
  const { currentRole, gameMode, age, stats, currentSeasonInMode } = player;
  const logMessages: string[] = [];
  const performanceScore = calculatePerformanceScore(stats);
  let newMode = gameMode;
  let newRole: PlayerRole = currentRole;

  // --- End-of-Career Mode Changes ---
  // This logic only triggers when a player meets the graduation/age requirements.
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

  let currentRoleIndex = roles.indexOf(newRole);
  if (currentRoleIndex === -1) {
    currentRoleIndex = 0;
  }

  // --- Tier-Based Role Calculation ---
  let targetRoleIndex = currentRoleIndex;

  // Determine the target role based on performance score tiers
  if (newMode === 'High School') {
    if (performanceScore > 200)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-American Prospect'));
    else if (performanceScore > 170)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('District Star'));
    else if (performanceScore > 140)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Varsity Starter'));
    else if (performanceScore > 110)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Varsity Rotation'));
    else if (performanceScore > 80)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Junior Varsity Player'));
  } else if (newMode === 'College') {
    if (performanceScore > 280)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Top Draft Prospect'));
    else if (performanceScore > 250)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-American Candidate'));
    else if (performanceScore > 220)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Conference Star'));
    else if (performanceScore > 190)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Starter'));
    else if (performanceScore > 160)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Key Substitute (6th Man)'));
    else if (performanceScore > 130)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Rotation Player'));
  } else if (newMode === 'Professional') {
    if (performanceScore > 320)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('MVP Candidate'));
    else if (performanceScore > 300)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-League Performer'));
    else if (performanceScore > 280)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-Star Level Player'));
    else if (performanceScore > 250)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Established Star'));
    else if (performanceScore > 220)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Starting Caliber Player'));
    else if (performanceScore > 190)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Valuable Sixth Man'));
    else if (performanceScore > 160)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Rotation Contributor'));
  }

  // If the target role is a promotion, set the new role.
  if (targetRoleIndex > currentRoleIndex) {
    newRole = roles[targetRoleIndex];
  } else {
    // If no tier-based promotion, check for demotion (only at end of season)
    const demotionThreshold = 70 + currentRoleIndex * 10;
    if (
      player.currentDayInSeason > player.schedule.schedule.length &&
      performanceScore < demotionThreshold &&
      currentRoleIndex > 0
    ) {
      currentRoleIndex--;
      newRole = roles[currentRoleIndex];
      logMessages.push(`A tough season. Your role has been adjusted to: ${newRole}.`);
    }
  }

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

  // FIX: Define roles based on the current player's game mode to make it available in this scope
  const roles: readonly PlayerRole[] =
    nextPlayerState.gameMode === 'High School'
      ? HIGH_SCHOOL_ROLES
      : nextPlayerState.gameMode === 'College'
      ? COLLEGE_ROLES
      : PROFESSIONAL_ROLES;

  if (!nextEvent) {
    nextPlayerState.totalDaysPlayed += 1;
    nextPlayerState.currentDayInSeason += 1;

    // --- End of Season Progression ---
    if (nextPlayerState.currentDayInSeason > nextPlayerState.schedule.schedule.length) {
      nextPlayerState.currentDayInSeason = 1;
      nextPlayerState.currentSeason += 1;
      nextPlayerState.age += 1;
      nextPlayerState.stats.energy = MAX_ENERGY;

      const progressResult = evaluatePlayerProgress(nextPlayerState);

      // Handle mode change
      if (nextPlayerState.gameMode !== progressResult.newMode) {
        nextPlayerState.currentSeasonInMode = 1;
        nextPlayerState.gameMode = progressResult.newMode;
      } else {
        nextPlayerState.currentSeasonInMode += 1;
      }

      // Handle role change and logging
      if (nextPlayerState.currentRole !== progressResult.newRole) {
        progressResult.logMessages.push(
          `Your performance has earned you a new role: ${progressResult.newRole}!`
        );
      }
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
    // --- NEW: Monthly check for in-season promotion ---
    else if (nextPlayerState.currentDayInSeason % 30 === 0) {
      const originalRole = nextPlayerState.currentRole;
      const midSeasonEval = evaluatePlayerProgress(nextPlayerState);

      const originalRoleIndex = roles.indexOf(originalRole);
      const newRoleIndex = roles.indexOf(midSeasonEval.newRole);

      if (midSeasonEval.newRole !== originalRole && newRoleIndex > originalRoleIndex) {
        nextPlayerState.currentRole = midSeasonEval.newRole;
        const logMessage = `Your hard work is paying off! You've been promoted to: ${midSeasonEval.newRole}!`;
        nextPlayerState.careerLog.push(logMessage);
        // Trigger a special event to announce the promotion
        nextEvent = {
          id: 'in_season_promotion',
          title: 'In-Season Promotion!',
          description: logMessage,
          choices: [
            {
              id: 'acknowledge_promotion',
              text: "Let's go!",
              action: (p) => ({
                updatedPlayer: p,
                outcomeMessage: 'The coaches have recognized your improvement.',
              }),
            },
          ],
          isMandatory: true,
        };
      }
    }

    // Determine the main event for the day, if a promotion event wasn't just created
    if (!nextEvent) {
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
          // Logic for non-game day events (practice, injury, etc.)
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
        // Fallback if today's schedule item isn't found for some reason
        nextEvent = createDailyChoiceEvent(nextPlayerState);
      }
    }
  }

  // --- Career End Check ---
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
