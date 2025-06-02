import {
  COLLEGE_GRADUATION_AGE,
  COLLEGE_MAX_SEASONS,
  COLLEGE_ROLES,
  DAYS_PER_SEASON,
  HIGH_SCHOOL_GRADUATION_AGE,
  HIGH_SCHOOL_MAX_SEASONS,
  HIGH_SCHOOL_ROLES,
  PROFESSIONAL_ROLES,
} from '../constants';
import type { GameEvent, GameMode, Player, PlayerRole } from '../types';
import { calculatePerformanceScore } from '../utils';
import {
  agentMeetingEvent,
  createDailyChoiceEvent,
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';

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
  let newRole: PlayerRole = currentRole; // Explicitly type newRole

  // 1. Mode Transition Logic (sets newMode and initial newRole if mode changes)
  if (
    gameMode === 'High School' &&
    (currentSeasonInMode >= HIGH_SCHOOL_MAX_SEASONS || age >= HIGH_SCHOOL_GRADUATION_AGE)
  ) {
    newMode = 'College';
    newRole = COLLEGE_ROLES[0]; // newRole is now a CollegeRole
    logMessages.push(
      `--- You've graduated High School and are now entering College as a ${newRole}! ---`
    );
  } else if (
    gameMode === 'College' &&
    (currentSeasonInMode >= COLLEGE_MAX_SEASONS || age >= COLLEGE_GRADUATION_AGE)
  ) {
    newMode = 'Professional';
    newRole = PROFESSIONAL_ROLES[0]; // newRole is now a ProfessionalRole
    logMessages.push(
      `--- Your College career ends. You're taking your talents to the Professional level as an ${newRole}! ---`
    );
  }

  // 2. Determine the roles array for the current effective mode (newMode)
  const currentEffectiveRolesArray =
    newMode === 'High School'
      ? HIGH_SCHOOL_ROLES
      : newMode === 'College'
      ? COLLEGE_ROLES
      : PROFESSIONAL_ROLES;

  let currentIndex = (currentEffectiveRolesArray as PlayerRole[]).indexOf(newRole);

  if (currentIndex === -1) {
    // This can happen if newRole was player.currentRole and it's not in currentEffectiveRolesArray
    // (e.g. if mode just changed, newRole is already set to currentEffectiveRolesArray[0])
    // Or if currentRole was somehow invalid for the initial gameMode.
    // We ensure newRole is set to the first role of the currentEffectiveRolesArray.
    newRole = currentEffectiveRolesArray[0];
    currentIndex = 0; // Should be 0 now
    if (gameMode === newMode) {
      // Only log this warning if mode didn't change (i.e. it was an invalid initial role)
      console.warn(`Role ${currentRole} was invalid for mode ${newMode}. Reset to ${newRole}.`);
    }
  }

  // 3. Promotion/Demotion Logic
  const promotionThresholdBase =
    newMode === 'High School' ? 100 : newMode === 'College' ? 150 : 200;
  const demotionThresholdBase = newMode === 'High School' ? 70 : newMode === 'College' ? 120 : 170;

  const promotionThreshold = promotionThresholdBase + currentIndex * 15;
  const demotionThreshold = demotionThresholdBase + currentIndex * 10;

  if (
    performanceScore > promotionThreshold &&
    currentIndex < currentEffectiveRolesArray.length - 1
  ) {
    const promotedRole = currentEffectiveRolesArray[currentIndex + 1];
    // Check if it's genuinely a different role than the one set by mode transition
    if (promotedRole !== newRole || gameMode === newMode) {
      // ensures we log if it's a promotion within the same mode
      newRole = promotedRole;
      logMessages.push(`Your hard work paid off! You've been promoted to: ${newRole}.`);
    }
  } else if (performanceScore < demotionThreshold && currentIndex > 0 && gameMode === newMode) {
    // Only demote if the mode hasn't just changed
    newRole = currentEffectiveRolesArray[currentIndex - 1];
    logMessages.push(`A tough season. Your role has been adjusted to: ${newRole}.`);
  }

  // 4. Final Safeguard (this is the block from your screenshot with the fix)
  // This ensures that the determined newRole is valid for the newMode, especially after promotion/demotion logic.
  if (newMode !== gameMode) {
    // If mode changed
    const finalModeRoles =
      newMode === 'High School'
        ? HIGH_SCHOOL_ROLES
        : newMode === 'College'
        ? COLLEGE_ROLES
        : PROFESSIONAL_ROLES;

    // Cast 'finalModeRoles' to PlayerRole[] so 'includes' works correctly with 'newRole' (which is PlayerRole)
    if (!(finalModeRoles as PlayerRole[]).includes(newRole)) {
      console.warn(
        `Safeguard: Role ${newRole} was not valid for new mode ${newMode}. Resetting to ${finalModeRoles[0]}.`
      );
      newRole = finalModeRoles[0];
    }
  }

  return { newRole, newMode, logMessages };
};

export interface ProcessTurnResult {
  nextPlayerState: Player;
  nextEvent: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
  eventTriggerMessage?: string;
}

export const processTurn = (
  currentPlayer: Player,
  choiceOutcomeImmediateEvent: GameEvent | null
): ProcessTurnResult => {
  const nextPlayerState = { ...currentPlayer };
  let nextEvent: GameEvent | null = choiceOutcomeImmediateEvent;
  let isGameOver = false;
  let gameOverMessage: string | undefined;
  let eventTriggerMessage: string | undefined;

  if (!nextEvent) {
    nextPlayerState.totalDaysPlayed += 1;
    nextPlayerState.currentDayInSeason += 1;

    if (nextPlayerState.currentDayInSeason > DAYS_PER_SEASON) {
      nextPlayerState.currentDayInSeason = 1;
      nextPlayerState.currentSeason += 1;
      nextPlayerState.currentSeasonInMode += 1;
      nextPlayerState.age += 1;

      const progressResult = evaluatePlayerProgress(nextPlayerState);
      if (nextPlayerState.gameMode !== progressResult.newMode) {
        // Mode changed
        nextPlayerState.currentSeasonInMode = 1; // Reset season in mode
      }
      nextPlayerState.gameMode = progressResult.newMode;
      nextPlayerState.currentRole = progressResult.newRole;

      nextPlayerState.careerLog = [...nextPlayerState.careerLog, ...progressResult.logMessages];
      eventTriggerMessage = `--- End of Season ${nextPlayerState.currentSeason - 1}. Age: ${
        nextPlayerState.age
      }. ---`;
      if (progressResult.logMessages.length > 0) {
        const modeChangeMsg = progressResult.logMessages.find((msg) => msg.startsWith('---'));
        const roleChangeMsg = progressResult.logMessages.find((msg) => !msg.startsWith('---'));
        if (modeChangeMsg)
          eventTriggerMessage += ' ' + modeChangeMsg.replace('---', '').replace('---', '').trim();
        if (roleChangeMsg) eventTriggerMessage += ' ' + roleChangeMsg;
      }
    }

    if (Math.random() < 0.1 && nextPlayerState.stats.energy < 30 && !nextEvent) {
      nextEvent = minorInjuryEvent;
      nextPlayerState.careerLog = [
        ...nextPlayerState.careerLog,
        '--- Random Event: Minor Injury ---',
      ];
      eventTriggerMessage =
        (eventTriggerMessage ? eventTriggerMessage + ' & ' : '') + 'Minor Injury!';
    } else if (
      nextPlayerState.totalDaysPlayed > 0 &&
      nextPlayerState.totalDaysPlayed % 4 === 0 &&
      !nextEvent
    ) {
      nextEvent = gameDayEvent(nextPlayerState);
      nextPlayerState.careerLog = [...nextPlayerState.careerLog, '--- Scheduled: Game Day ---'];
      eventTriggerMessage = (eventTriggerMessage ? eventTriggerMessage + ' & ' : '') + 'Game Day!';
    } else if (
      nextPlayerState.totalDaysPlayed > 0 &&
      nextPlayerState.totalDaysPlayed % 30 === 0 &&
      !nextEvent
    ) {
      const agentEvent = agentMeetingEvent(nextPlayerState);
      if (agentEvent) {
        nextEvent = agentEvent;
        nextPlayerState.careerLog = [
          ...nextPlayerState.careerLog,
          '--- Scheduled: Agent Meeting ---',
        ];
        eventTriggerMessage =
          (eventTriggerMessage ? eventTriggerMessage + ' & ' : '') + 'Agent Meeting!';
      }
    }

    if (!nextEvent) {
      nextEvent = createDailyChoiceEvent(nextPlayerState);
    }
  }

  if (nextPlayerState.age > 40 && nextPlayerState.gameMode === 'Professional') {
    isGameOver = true;
    gameOverMessage = "After a long and storied career, it's time to retire.";
  }
  if (nextPlayerState.stats.energy <= 0 && Math.random() < 0.2) {
    isGameOver = true;
    gameOverMessage = 'You suffered a severe burnout and had to retire.';
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
