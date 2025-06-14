// src/gameLogic/playerProgression.ts
import {
  COLLEGE_GRADUATION_AGE,
  COLLEGE_MAX_SEASONS,
  COLLEGE_ROLES,
  HIGH_SCHOOL_MAX_SEASONS,
  HIGH_SCHOOL_ROLES,
  PROFESSIONAL_ROLES,
} from '../constants';
import type { GameMode, Player, PlayerRole } from '../types';
import { calculatePerformanceScore } from '../utils';

/**
 * Evaluates the player's performance and determines if they should be promoted,
 * demoted, or graduated to the next game mode.
 * @param player - The current player object.
 * @returns An object containing the new role, new game mode, and any relevant log messages.
 */
export const evaluatePlayerProgress = (
  player: Player
): { newRole: PlayerRole; newMode: GameMode; logMessages: string[] } => {
  const { currentRole, gameMode, age, stats, currentSeasonInMode } = player;
  const logMessages: string[] = [];
  const performanceScore = calculatePerformanceScore(stats);
  let newMode = gameMode;
  let newRole: PlayerRole = currentRole;

  // --- Check for Graduation / Game Mode Change ---
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
  if (currentRoleIndex === -1) currentRoleIndex = 0;

  // --- Check for Promotion ---
  let targetRoleIndex = currentRoleIndex;
  if (newMode === 'High School') {
    if (performanceScore > 200)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-American Prospect'));
    else if (performanceScore > 170)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('District Star'));
    else if (performanceScore > 140)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Varsity Starter'));
    else if (performanceScore > 110)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('Varsity Rotation'));
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
  } else if (newMode === 'Professional') {
    if (performanceScore > 320)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('MVP Candidate'));
    else if (performanceScore > 300)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-League Player'));
    else if (performanceScore > 280)
      targetRoleIndex = Math.max(targetRoleIndex, roles.indexOf('All-Star Level Player'));
  }

  if (targetRoleIndex > currentRoleIndex) {
    newRole = roles[targetRoleIndex];
  } else {
    // --- Check for Demotion (at the end of a season) ---
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

  if (newRole !== player.currentRole) {
    logMessages.push(`Your performance has earned you a new role: ${newRole}!`);
  }

  return { newRole, newMode, logMessages };
};
