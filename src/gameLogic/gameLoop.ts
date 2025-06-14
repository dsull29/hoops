// src/gameLogic/gameLoop.ts
import {
  COLLEGE_GRADUATION_AGE,
  COLLEGE_MAX_SEASONS,
  COLLEGE_ROLES,
  HIGH_SCHOOL_MAX_SEASONS,
  HIGH_SCHOOL_ROLES,
  PROFESSIONAL_ROLES,
} from '../constants';
import type { GameEvent, GameMode, Player, PlayerRole } from '../types';
import type { Team } from '../types/teams'; // Correctly imported from types/teams
import { calculatePerformanceScore } from '../utils';
import { getModeRoleContextualEvent } from './contextualEvents/contextualEventRunner';
import {
  agentMeetingEvent,
  gameDayEvent,
  handleAutomatedPracticeDay,
  minorInjuryEvent,
} from './eventDefinitions';
import { getScheduledEvent } from './scheduledEvents';
import { generateSeasonSchedule } from './seasonLogic';

export interface AdvanceDayResult {
  nextPlayerState: Player;
  // The teams state is no longer modified in this loop, so we remove it from the result
  // nextTeamsState: Team[];
  nextEvent: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
}

const evaluatePlayerProgress = (
  player: Player
): { newRole: PlayerRole; newMode: GameMode; logMessages: string[] } => {
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
  let currentRoleIndex = roles.indexOf(newRole);
  if (currentRoleIndex === -1) currentRoleIndex = 0;

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
  }

  if (targetRoleIndex > currentRoleIndex) {
    newRole = roles[targetRoleIndex];
  } else {
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

export const advanceDay = (currentPlayer: Player, allTeams: Team[]): AdvanceDayResult => {
  const nextPlayerState = { ...currentPlayer };
  let nextEvent: GameEvent | null = null;

  nextPlayerState.totalDaysPlayed += 1;
  nextPlayerState.currentDayInSeason += 1;

  // --- Handle New Season Transition ---
  if (nextPlayerState.currentDayInSeason > nextPlayerState.schedule.schedule.length) {
    nextPlayerState.currentDayInSeason = 1;
    nextPlayerState.currentSeason += 1;
    nextPlayerState.age += 1;

    // NOTE: The progressive AI simulation was removed to fix errors.
    // It can be added back here later. For now, we just reset player-facing state.

    const progressResult = evaluatePlayerProgress(nextPlayerState);
    nextPlayerState.gameMode = progressResult.newMode;
    nextPlayerState.currentRole = progressResult.newRole;
    nextPlayerState.careerLog.push(...progressResult.logMessages);
    if (nextPlayerState.gameMode !== currentPlayer.gameMode) {
      nextPlayerState.currentSeasonInMode = 1;
      // TODO: Add logic for player changing teams
    } else {
      nextPlayerState.currentSeasonInMode += 1;
    }

    nextPlayerState.schedule = generateSeasonSchedule(
      nextPlayerState.gameMode,
      nextPlayerState.currentSeason,
      allTeams,
      nextPlayerState.teamId
    );

    nextEvent = {
      id: 'new_season_started',
      title: `Welcome to a New Season!`,
      description: `A new year begins. Records are reset, and hope springs eternal.`,
      isMandatory: true,
      choices: [
        {
          id: 'continue',
          text: "Let's get to it.",
          action: (p) => ({
            updatedPlayer: p,
            outcomeMessage: 'A new season of challenges and opportunities awaits.',
          }),
        },
      ],
    };
  }

  // --- Player-Specific Events ---
  if (!nextEvent) {
    const playerToday = nextPlayerState.schedule.schedule.find(
      (item) => item.day === nextPlayerState.currentDayInSeason
    );
    const scheduledEvent = getScheduledEvent(nextPlayerState);

    if (scheduledEvent) {
      nextEvent = scheduledEvent;
    } else if (playerToday) {
      if (
        playerToday.type === 'Game' ||
        playerToday.type === 'Playoffs' ||
        playerToday.type === 'Championship'
      ) {
        nextEvent = gameDayEvent(nextPlayerState, playerToday.opponent!, playerToday.opponentId);
      } else {
        // In-season promotion check
        if (nextPlayerState.currentDayInSeason % 30 === 0) {
          const midSeasonEval = evaluatePlayerProgress(nextPlayerState);
          if (midSeasonEval.newRole !== nextPlayerState.currentRole) {
            nextPlayerState.currentRole = midSeasonEval.newRole;
            // TODO: create event for this
          }
        }

        // Random daily events
        const injuryChance = 0.05 - (nextPlayerState.stats.durability - 50) * 0.001;
        if (Math.random() < injuryChance) {
          nextEvent = minorInjuryEvent;
        } else if (
          nextPlayerState.totalDaysPlayed > 0 &&
          nextPlayerState.totalDaysPlayed % 45 === 0
        ) {
          nextEvent = agentMeetingEvent(nextPlayerState);
        } else if (Math.random() < 0.25) {
          nextEvent = getModeRoleContextualEvent(nextPlayerState);
        }
      }
    }
  }

  if (!nextEvent) {
    const { updatedPlayer, outcomeMessage } = handleAutomatedPracticeDay(nextPlayerState);
    nextPlayerState.stats = updatedPlayer.stats;
    nextPlayerState.careerLog.push(outcomeMessage);
  }

  // Since we are not simulating AI games right now, we just return the current teams state.
  return { nextPlayerState, nextEvent, isGameOver: false };
};
