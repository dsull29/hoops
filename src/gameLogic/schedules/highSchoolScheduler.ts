// src/gameLogic/schedules/highSchoolScheduler.ts
import type { DailyScheduleItem, SeasonSchedule } from '../../types';
import type { HighSchoolLeague, Team } from '../../types/teams';

const HIGH_SCHOOL_SEASON_DAYS = 90;
const REGULAR_SEASON_GAMES = 18;

/**
 * Shuffles an array in place.
 * @param array The array to shuffle.
 * @returns The shuffled array.
 */
function shuffleArray<T>(array: T[]): T[] {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Generates a full high school season schedule with a more realistic cadence.
 * Starts with a week of practice, then follows a rhythm of one main game per week,
 * with an additional mid-week game.
 */
export const generateHighSchoolSchedule = (
  year: number,
  allTeams: Team[],
  playerTeamId: string
): SeasonSchedule => {
  const schedule: DailyScheduleItem[] = [];
  const playerTeam = allTeams.find((t) => t.id === playerTeamId);

  if (!playerTeam || !(playerTeam.league as HighSchoolLeague).district) {
    throw new Error('Player team not found or is not a high school team.');
  }

  const playerLeague = playerTeam.league as HighSchoolLeague;

  const districtOpponents = allTeams.filter(
    (t) =>
      t.id !== playerTeamId &&
      (t.league as HighSchoolLeague).district === playerLeague.district &&
      (t.league as HighSchoolLeague).division === playerLeague.division
  );

  const outOfDistrictOpponents = allTeams.filter(
    (t) =>
      t.id !== playerTeamId && (t.league as HighSchoolLeague).district !== playerLeague.district
  );

  // --- Generate List of Games ---
  const regularSeasonGames: DailyScheduleItem[] = [];
  districtOpponents.forEach((opponent) => {
    regularSeasonGames.push({
      day: 0,
      type: 'Game',
      opponent: opponent.name,
      opponentId: opponent.id,
      isCompleted: false,
    });
    regularSeasonGames.push({
      day: 0,
      type: 'Game',
      opponent: `${opponent.name} (Away)`,
      opponentId: opponent.id,
      isCompleted: false,
    });
  });

  const remainingGamesCount = REGULAR_SEASON_GAMES - regularSeasonGames.length;
  if (remainingGamesCount > 0 && outOfDistrictOpponents.length > 0) {
    for (let i = 0; i < remainingGamesCount; i++) {
      const opponent = outOfDistrictOpponents[i % outOfDistrictOpponents.length];
      regularSeasonGames.push({
        day: 0,
        type: 'Game',
        opponent: opponent.name,
        opponentId: opponent.id,
        isCompleted: false,
      });
    }
  }

  // --- Distribute Games with a Realistic Cadence ---
  const gameDays: number[] = [];
  let currentDay = 8; // Start games on Day 8 (after 7 days of practice)

  // Creates a schedule with a game every 3-4 days (e.g., Tuesday & Friday)
  for (let i = 0; i < REGULAR_SEASON_GAMES; i++) {
    gameDays.push(currentDay);
    // Alternate between a 3-day and 4-day gap
    currentDay += i % 2 === 0 ? 3 : 4;
  }

  shuffleArray(regularSeasonGames).forEach((game, index) => {
    if (gameDays[index]) {
      schedule.push({ ...game, day: gameDays[index] });
    }
  });

  // --- Generate Playoff Games ---
  const lastGameDay = gameDays[gameDays.length - 1] || 70; // Fallback
  const playoffStartDay = lastGameDay + 5; // Start playoffs after a short break

  schedule.push({
    day: playoffStartDay,
    type: 'Playoffs',
    opponent: 'District Championship',
    isCompleted: false,
  });
  schedule.push({
    day: playoffStartDay + 4,
    type: 'Playoffs',
    opponent: 'Regional Semi-Final',
    isCompleted: false,
  });
  schedule.push({
    day: playoffStartDay + 8,
    type: 'Championship',
    opponent: 'State Championship',
    isCompleted: false,
  });

  // --- Fill in the rest of the days with Practice ---
  for (let i = 1; i <= HIGH_SCHOOL_SEASON_DAYS; i++) {
    if (!schedule.some((item) => item.day === i)) {
      schedule.push({ day: i, type: 'Practice', isCompleted: false });
    }
  }

  // Sort the final schedule by day
  schedule.sort((a, b) => a.day - b.day);

  return {
    year,
    gameMode: 'High School',
    schedule,
    wins: 0,
    losses: 0,
    playoffEliminated: false,
  };
};
