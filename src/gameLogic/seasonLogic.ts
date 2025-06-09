import type { GameMode, ScheduleItem, SeasonSchedule } from '../types';

const HIGH_SCHOOL_SEASON_WEEKS = 16;
const COLLEGE_SEASON_WEEKS = 20;
const PRO_SEASON_WEEKS = 28;

/**
 * Generates a schedule for a single season based on the player's career mode.
 * @param gameMode - The current mode (High School, College, Professional).
 * @param year - The current season year.
 * @returns A fully generated SeasonSchedule object.
 */
export const generateSeasonSchedule = (gameMode: GameMode, year: number): SeasonSchedule => {
  let seasonLength: number;
  const games: { week: number; type: ScheduleItem['type'] }[] = [];

  switch (gameMode) {
    case 'High School':
      seasonLength = HIGH_SCHOOL_SEASON_WEEKS;
      // Simple structure: 1 pre-season, 8 regular season games, 1 playoff game
      games.push({ week: 2, type: 'Pre-Season Game' });
      for (let i = 0; i < 8; i++) {
        games.push({ week: 4 + i, type: 'Regular Season Game' });
      }
      games.push({ week: 14, type: 'Playoff Game' });
      games.push({ week: 16, type: 'Championship' });
      break;

    case 'College':
      seasonLength = COLLEGE_SEASON_WEEKS;
      // More complex: 2 pre-season, conference games, tournament
      games.push({ week: 2, type: 'Pre-Season Game' });
      games.push({ week: 4, type: 'Pre-Season Game' });
      for (let i = 0; i < 12; i++) {
        games.push({ week: 6 + i, type: 'Regular Season Game' });
      }
      games.push({ week: 19, type: 'Playoff Game' }); // Conference Tournament
      games.push({ week: 20, type: 'Championship' }); // National Tournament Final
      break;

    case 'Professional':
      seasonLength = PRO_SEASON_WEEKS;
      // Long season, more games
      games.push({ week: 1, type: 'Pre-Season Game' });
      games.push({ week: 2, type: 'Pre-Season Game' });
      for (let i = 0; i < 20; i++) {
        // approx. 1 game per week with some bye weeks
        if (i % 3 !== 0) {
          games.push({ week: 4 + Math.floor(i * 1.2), type: 'Regular Season Game' });
        }
      }
      games.push({ week: 26, type: 'Playoff Game' });
      games.push({ week: 28, type: 'Championship' });
      break;
  }

  const schedule: ScheduleItem[] = [];
  const gameWeeks = new Set(games.map((g) => g.week));

  for (let i = 1; i <= seasonLength; i++) {
    if (gameWeeks.has(i)) {
      schedule.push({
        week: i,
        type: games.find((g) => g.week === i)!.type,
        opponent: `Rival Team ${i}`, // Placeholder opponent
      });
    } else {
      schedule.push({
        week: i,
        type: 'Training',
      });
    }
  }

  return {
    year,
    gameMode,
    schedule,
    wins: 0,
    losses: 0,
  };
};
