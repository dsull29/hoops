// src/gameLogic/seasonLogic.ts
import type { GameMode, SeasonSchedule } from '../types';
import type { Team } from '../types/teams';
import { generateHighSchoolSchedule } from './schedules/highSchoolScheduler';

/**
 * Generates a realistic daily schedule for a basketball season by dispatching
 * to the appropriate game-mode-specific generator.
 * @param gameMode - The player's current game mode.
 * @param year - The current season year.
 * @param allTeams - The array of all teams in the game world.
 * @param playerTeamId - The ID of the player's team.
 * @returns A fully generated SeasonSchedule object.
 */
export const generateSeasonSchedule = (
  gameMode: GameMode,
  year: number,
  allTeams: Team[],
  playerTeamId: string
): SeasonSchedule => {
  switch (gameMode) {
    case 'High School':
      return generateHighSchoolSchedule(year, allTeams, playerTeamId);

    case 'College':
      // TODO: Implement generateCollegeSchedule in its own file
      // For now, we can have a placeholder or fallback
      console.warn('College schedule generation not yet implemented. Using fallback.');
      return generateHighSchoolSchedule(year, allTeams, playerTeamId); // Fallback for now

    case 'Professional':
      // TODO: Implement generateProfessionalSchedule in its own file
      console.warn('Professional schedule generation not yet implemented. Using fallback.');
      return generateHighSchoolSchedule(year, allTeams, playerTeamId); // Fallback for now

    default:
      throw new Error(`Unknown game mode: ${gameMode}`);
  }
};
