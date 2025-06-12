import type { GameMode, GameStatLine, Player, PlayerRole } from '../types';
import { clamp } from '../utils'; // Assuming clamp is in utils, and constants are accessible

const BASE_MINUTES: Record<GameMode, Partial<Record<PlayerRole, number>>> = {
  'High School': {
    'Freshman Newcomer': 8,
    'Sophomore Contender': 10,
    'Junior Varsity Player': 14,
    'Varsity Rotation': 18,
    'Varsity Starter': 24,
    'Team Captain': 26,
    'District Star': 28,
    'All-State Contender': 30,
    'All-American Prospect': 32,
  },
  College: {
    'Walk-On Hopeful': 5,
    'Practice Squad Player': 0,
    'Bench Warmer': 8,
    'End of Bench Specialist': 10,
    'Rotation Player': 18,
    'Key Substitute (6th Man)': 24,
    Starter: 28,
    'Conference Star': 32,
    'All-American Candidate': 34,
    'Top Draft Prospect': 30, // Usually less than senior stars
  },
  Professional: {
    'Undrafted Free Agent': 4,
    'G-League Assignee': 30,
    'Two-Way Contract Player': 8,
    'End of Bench Pro': 10,
    'Rotation Contributor': 18,
    'Valuable Sixth Man': 26,
    'Starting Caliber Player': 30,
    'Established Star': 34,
    'All-Star Level Player': 35,
    'All-League Performer': 36,
    'MVP Candidate': 37,
  },
};

const MAX_GAME_MINUTES: Record<GameMode, number> = {
  'High School': 32,
  College: 40,
  Professional: 48,
};
const ATTRIBUTE_BASELINE_EXPECTATION: Record<GameMode, number> = {
  'High School': 45,
  College: 60,
  Professional: 75,
};

const getRoleMultiplier = (gameMode: GameMode, role: PlayerRole): number => {
  console.log(`Calculating role multiplier for ${role} in ${gameMode}`);
  if (
    role.includes('Star') ||
    role.includes('All-American') ||
    role.includes('MVP') ||
    role.includes('All-League') ||
    role.includes('Top Draft Prospect')
  )
    return 1.4; // Slightly reduced from 1.5
  if (role.includes('Starter') || role.includes('Captain') || role.includes('Conference Star'))
    return 1.15; // Slightly reduced from 1.2
  if (role.includes('Rotation') || role.includes('Sixth Man') || role.includes('Substitute'))
    return 1.0;
  if (role.includes('Bench') || role.includes('Practice Squad')) return 0.75; // Slightly increased
  return 0.65; // Increased for lower roles
};

const getGameModeStatScale = (gameMode: GameMode): number => {
  if (gameMode === 'Professional') return 1.0;
  if (gameMode === 'College') return 0.8; // Slightly increased
  if (gameMode === 'High School') return 0.7; // FIX: Increased from 0.6
  return 0.7;
};

export const generatePlayerGameStats = (
  player: Player,
  playedHard: boolean
): { statLine: GameStatLine; teamWon: boolean } => {
  const { stats, position, gameMode, currentRole } = player;
  const roleMultiplier = getRoleMultiplier(gameMode, currentRole);
  const modeScale = getGameModeStatScale(gameMode);
  const energyFactor = Math.max(0.3, stats.energy / 100);

  // --- Minutes Calculation ---
  let baseMinutesForRole = BASE_MINUTES[gameMode]?.[currentRole] ?? 12; // Default if role not perfectly mapped

  const averageKeyAttributes = (stats.shooting + stats.athleticism + stats.basketballIQ) / 3;
  const modeAttributeBaseline = ATTRIBUTE_BASELINE_EXPECTATION[gameMode];
  const attributeDifference = averageKeyAttributes - modeAttributeBaseline;
  const attributeMinuteBonus = clamp(
    Math.floor(attributeDifference / 4),
    0,
    gameMode === 'High School' ? 8 : 10
  );
  baseMinutesForRole += attributeMinuteBonus;

  const skillPointsMinuteBonus = Math.min(
    gameMode === 'High School' ? 4 : gameMode === 'College' ? 6 : 8,
    Math.floor(stats.skillPoints / 150)
  );
  baseMinutesForRole += skillPointsMinuteBonus;

  if (playedHard) baseMinutesForRole *= 1.1;

  let minutes = Math.floor(baseMinutesForRole * energyFactor * (0.9 + Math.random() * 0.2));
  minutes = clamp(minutes, 0, MAX_GAME_MINUTES[gameMode]);

  // --- Other Stats Generation (FIXED LOGIC) ---
  let points = 0,
    rebounds = 0,
    assists = 0;

  if (minutes > 0) {
    // Base per-minute rates adjusted by game mode scale
    const pointsPerMin = 0.4 * modeScale;
    const reboundsPerMin = 0.25 * modeScale;
    const assistsPerMin = 0.15 * modeScale;

    // Position adjustments
    const posPointFactor = position.includes('Guard') ? 1.1 : position.includes('Center') ? 0.9 : 1;
    const posReboundFactor = position.includes('Center')
      ? 1.2
      : position.includes('Guard')
      ? 0.8
      : 1;
    const posAssistFactor = position.includes('Point Guard')
      ? 1.3
      : position.includes('Guard')
      ? 1.1
      : 0.9;

    // Calculate stats based on minutes, skill, and some randomness
    points = Math.floor(
      minutes *
        pointsPerMin *
        posPointFactor *
        (stats.shooting / 50) *
        roleMultiplier *
        energyFactor *
        (0.7 + Math.random() * 0.6)
    );
    rebounds = Math.floor(
      minutes *
        reboundsPerMin *
        posReboundFactor *
        (stats.athleticism / 55) *
        roleMultiplier *
        energyFactor *
        (0.7 + Math.random() * 0.6)
    );
    assists = Math.floor(
      minutes *
        assistsPerMin *
        posAssistFactor *
        (stats.basketballIQ / 60) *
        roleMultiplier *
        energyFactor *
        (0.7 + Math.random() * 0.6)
    );
  }

  const resultStatLine: GameStatLine = {
    points: clamp(points, 0, 70),
    rebounds: clamp(rebounds, 0, 30),
    assists: clamp(assists, 0, 25),
    minutes: minutes,
  };
  const gameImpactScore =
    (resultStatLine.points * 1.0 +
      resultStatLine.rebounds * 1.2 +
      resultStatLine.assists * 1.5 +
      resultStatLine.minutes / 2) /
    4;
  let winChance =
    0.45 + stats.basketballIQ / 500 + stats.professionalism / 600 + gameImpactScore / 200;
  if (playedHard && resultStatLine.points > 15) winChance += 0.05;
  if (stats.energy < 20) winChance -= 0.15;
  const teamWon = Math.random() < clamp(winChance, 0.05, 0.95);
  return { statLine: resultStatLine, teamWon: teamWon };
};
