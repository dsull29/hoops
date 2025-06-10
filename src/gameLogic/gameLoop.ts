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
    return { newRole, newMode, logMessages };
  }

  // Fix: Use >= for college graduation as well for consistency.
  if (
    gameMode === 'College' &&
    (currentSeasonInMode >= COLLEGE_MAX_SEASONS || age >= COLLEGE_GRADUATION_AGE)
  ) {
    newMode = 'Professional';
    newRole = PROFESSIONAL_ROLES[0]; // Start as an Undrafted Free Agent
    logMessages.push(
      `--- Your College career ends. You're taking your talents to the pros as an ${newRole}! ---`
    );
    return { newRole, newMode, logMessages };
  }

  // --- 2. IN-MODE PROGRESSION (IF NOT GRADUATING) ---
  // FIX: Explicitly type `roles` as an array of the union type `PlayerRole`.
  // This prevents TypeScript from inferring a union of arrays, which causes the `indexOf` error.
  const roles: readonly PlayerRole[] =
    gameMode === 'High School'
      ? HIGH_SCHOOL_ROLES
      : gameMode === 'College'
      ? COLLEGE_ROLES
      : PROFESSIONAL_ROLES;

  let roleIndex = roles.indexOf(newRole);
  if (roleIndex === -1) {
    roleIndex = 0;
  }

  // --- FIX: Add mandatory year-based progression for High School ---
  if (gameMode === 'High School') {
    const nextSeasonInMode = currentSeasonInMode + 1; // The season we are about to start
    let minRoleIndex = -1;

    // FIX: Use the specific HIGH_SCHOOL_ROLES array when checking for string literals
    // to provide TypeScript with the correct type context.
    if (nextSeasonInMode === 2) {
      // Entering Sophomore year
      minRoleIndex = HIGH_SCHOOL_ROLES.indexOf('Sophomore Contender');
    } else if (nextSeasonInMode === 3) {
      // Entering Junior year
      minRoleIndex = HIGH_SCHOOL_ROLES.indexOf('Junior Varsity Player');
    } else if (nextSeasonInMode === 4) {
      // Entering Senior year
      minRoleIndex = HIGH_SCHOOL_ROLES.indexOf('Varsity Rotation');
    }

    if (minRoleIndex !== -1 && roleIndex < minRoleIndex) {
      roleIndex = minRoleIndex;
      const yearName = roles[roleIndex].split(' ')[0];
      logMessages.push(`A new school year begins! You're now a ${yearName}.`);
    }
  }

  // --- 3. PERFORMANCE-BASED PROGRESSION ---
  // Check for changes from the new baseline role (set by year, if applicable)
  const promotionThreshold = 100 + roleIndex * 15;
  const demotionThreshold = 70 + roleIndex * 10;

  if (performanceScore > promotionThreshold && roleIndex < roles.length - 1) {
    roleIndex++;
    logMessages.push(`Your hard work paid off! You've been promoted to: ${roles[roleIndex]}.`);
  } else if (performanceScore < demotionThreshold && roleIndex > 0) {
    // Determine the minimum role index for the current year to prevent demoting too far
    let minDemotionIndex = 0;
    if (gameMode === 'High School') {
      const nextSeasonInMode = currentSeasonInMode + 1;
      // FIX: Use the specific HIGH_SCHOOL_ROLES array here as well.
      if (nextSeasonInMode === 2)
        minDemotionIndex = HIGH_SCHOOL_ROLES.indexOf('Sophomore Contender');
      if (nextSeasonInMode === 3)
        minDemotionIndex = HIGH_SCHOOL_ROLES.indexOf('Junior Varsity Player');
      if (nextSeasonInMode === 4) minDemotionIndex = HIGH_SCHOOL_ROLES.indexOf('Varsity Rotation');
    }

    if (roleIndex > minDemotionIndex) {
      roleIndex--;
      logMessages.push(`A tough season. Your role has been adjusted to: ${roles[roleIndex]}.`);
    }
  }

  newRole = roles[roleIndex];

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
