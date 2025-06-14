// src/gameLogic/standingsLogic.ts
import type { Team } from '../types/teams';

/**
 * A simplified win probability calculator based on team ratings.
 * @param teamA The first team.
 * @param teamB The second team.
 * @returns The win probability for teamA against teamB.
 */
const getWinProbability = (teamA: Team, teamB: Team): number => {
  const teamA_Power = (teamA.offenseRating + teamA.defenseRating) / 2;
  const teamB_Power = (teamB.offenseRating + teamB.defenseRating) / 2;
  const difference = teamA_Power - teamB_Power;

  // Base 50% chance, adjusted by the difference in power ratings
  const probability = 0.5 + difference / 100;

  // Clamp probability between 5% and 95% to allow for upsets
  return Math.max(0.05, Math.min(0.95, probability));
};

/**
 * Simulates a full season for a single AI team to generate a win/loss record.
 * This is a simplified simulation for displaying standings.
 * @param team - The team to simulate the season for.
 * @param allTeams - The list of all teams in the league for finding opponents.
 * @returns An object containing the number of wins and losses.
 */
export const simulateTeamSeason = (
  team: Team,
  allTeams: Team[]
): { wins: number; losses: number } => {
  let wins = 0;
  const REGULAR_SEASON_GAMES = 18; // For High School

  const potentialOpponents = allTeams.filter(
    (t) => t.id !== team.id && t.gameMode === team.gameMode
  );

  if (potentialOpponents.length === 0) {
    return { wins: 0, losses: REGULAR_SEASON_GAMES };
  }

  for (let i = 0; i < REGULAR_SEASON_GAMES; i++) {
    const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
    const winProb = getWinProbability(team, opponent);
    if (Math.random() < winProb) {
      wins++;
    }
  }

  return {
    wins,
    losses: REGULAR_SEASON_GAMES - wins,
  };
};
