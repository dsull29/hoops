import type { DailyScheduleItem, GameMode, ScheduleItemType, SeasonSchedule } from '../types';

const HIGH_SCHOOL_SEASON_DAYS = 90;
const HIGH_SCHOOL_REGULAR_SEASON_GAMES = 18;
const HIGH_SCHOOL_PLAYOFF_ROUNDS = 3; // e.g., Quarter-Final, Semi-Final, Final

/**
 * Generates a realistic daily schedule for a high school basketball season.
 * @param gameMode - The player's current game mode.
 * @param year - The current season year.
 * @returns A fully generated SeasonSchedule object.
 */
export const generateSeasonSchedule = (gameMode: GameMode, year: number): SeasonSchedule => {
  const schedule: DailyScheduleItem[] = [];
  let seasonDays: number;
  let regularSeasonGames: number;
  let playoffRounds: number;

  // For now, we'll focus on a detailed High School schedule.
  // College and Pro schedules can be expanded later.
  switch (gameMode) {
    case 'College':
      seasonDays = 100;
      regularSeasonGames = 25;
      playoffRounds = 4;
      break;
    case 'Professional':
      seasonDays = 180;
      regularSeasonGames = 82; // This would need a more complex generator
      playoffRounds = 4;
      break;
    case 'High School':
    default:
      seasonDays = HIGH_SCHOOL_SEASON_DAYS;
      regularSeasonGames = HIGH_SCHOOL_REGULAR_SEASON_GAMES;
      playoffRounds = HIGH_SCHOOL_PLAYOFF_ROUNDS;
      break;
  }

  // --- Generate Regular Season ---
  const gameDays = new Set<number>();
  while (gameDays.size < regularSeasonGames) {
    // Spread games throughout the first ~75 days of the season
    const randomDay = Math.floor(Math.random() * (seasonDays - 15)) + 1;

    // Avoid scheduling games on back-to-back-to-back days for realism
    if (!gameDays.has(randomDay) && !gameDays.has(randomDay - 1) && !gameDays.has(randomDay + 1)) {
      gameDays.add(randomDay);
    }
  }

  // --- Generate Playoffs at the end of the season ---
  const playoffStartDay = seasonDays - playoffRounds * 3; // Space out playoff games
  for (let i = 0; i < playoffRounds; i++) {
    const playoffDay = playoffStartDay + i * 3;
    const type: ScheduleItemType = i === playoffRounds - 1 ? 'Championship' : 'Playoffs';
    schedule.push({
      day: playoffDay,
      type: type,
      opponent: `Playoff Opponent ${i + 1}`,
      isCompleted: false,
    });
  }

  // --- Assemble the final schedule array ---
  const gameDayArray = Array.from(gameDays).sort((a, b) => a - b);
  gameDayArray.forEach((day) => {
    schedule.push({ day: day, type: 'Game', opponent: `Rival Team #${day}`, isCompleted: false });
  });

  // Fill in the rest of the days with Practice
  for (let i = 1; i <= seasonDays; i++) {
    if (!schedule.some((item) => item.day === i)) {
      schedule.push({ day: i, type: 'Practice', isCompleted: false });
    }
  }

  // Sort the final schedule by day
  schedule.sort((a, b) => a.day - b.day);

  return {
    year,
    gameMode,
    schedule,
    wins: 0,
    losses: 0,
    playoffEliminated: false,
  };
};
