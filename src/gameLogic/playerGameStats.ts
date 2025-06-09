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
  if (gameMode === 'High School') return 0.6; // Slightly increased
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

  // 1. Attribute-based "Talent Recognition" bonus for minutes
  const averageKeyAttributes = (stats.shooting + stats.athleticism + stats.basketballIQ) / 3;
  const modeAttributeBaseline = ATTRIBUTE_BASELINE_EXPECTATION[gameMode];
  const attributeDifference = averageKeyAttributes - modeAttributeBaseline;
  // For every 5 points above baseline, add 1 minute, capped at a significant portion of role minutes. Max bonus ~8-10 mins.
  const attributeMinuteBonus = clamp(
    Math.floor(attributeDifference / 4),
    0,
    gameMode === 'High School' ? 8 : 10
  );
  baseMinutesForRole += attributeMinuteBonus;

  // 2. Skill points (legacy/talent) influence on minutes
  const skillPointsMinuteBonus = Math.min(
    gameMode === 'High School' ? 4 : gameMode === 'College' ? 6 : 8,
    Math.floor(stats.skillPoints / 150)
  ); // More impact, higher cap
  baseMinutesForRole += skillPointsMinuteBonus;

  if (playedHard) baseMinutesForRole *= 1.1;

  let minutes = Math.floor(baseMinutesForRole * energyFactor * (0.9 + Math.random() * 0.2)); // Tighter randomness: 0.9 to 1.1
  minutes = clamp(minutes, 0, MAX_GAME_MINUTES[gameMode]);

  // --- Other Stats Generation ---
  const opportunityScale = minutes > 0 ? minutes / MAX_GAME_MINUTES[gameMode] : 0; // Scale by actual minutes opportunity

  const baseShootingPotential =
    (stats.shooting / 100) * roleMultiplier * modeScale * energyFactor * opportunityScale;
  const baseAthleticismPotential =
    (stats.athleticism / 100) * roleMultiplier * modeScale * energyFactor * opportunityScale;
  const baseIqPotential =
    (stats.basketballIQ / 100) * roleMultiplier * modeScale * energyFactor * opportunityScale;

  let points = 0,
    rebounds = 0,
    assists = 0;

  // (Stat generation formulas from previous version, now benefiting from better `opportunityScale`)
  let maxPoints = 0;
  if (position.includes('Guard')) maxPoints = 30 + baseShootingPotential * 25;
  else if (position.includes('Forward')) maxPoints = 25 + baseShootingPotential * 20;
  else if (position.includes('Center')) maxPoints = 22 + baseShootingPotential * 18;
  maxPoints = Math.min(Math.max(5, maxPoints), 60);
  points = Math.floor(Math.random() * (baseShootingPotential * maxPoints));
  if (playedHard) points = Math.floor(points * (1.05 + Math.random() * 0.3));
  let maxRebounds = 0;
  if (position.includes('Center')) maxRebounds = 15 + baseAthleticismPotential * 12;
  else if (position.includes('Forward')) maxRebounds = 12 + baseAthleticismPotential * 10;
  else if (position.includes('Guard')) maxRebounds = 8 + baseAthleticismPotential * 6;
  maxRebounds = Math.min(Math.max(2, maxRebounds), 25);
  rebounds = Math.floor(Math.random() * (baseAthleticismPotential * maxRebounds));
  if (playedHard) rebounds = Math.floor(rebounds * (1.05 + Math.random() * 0.25));
  let maxAssists = 0;
  if (position.includes('Point Guard')) maxAssists = 12 + baseIqPotential * 12;
  else if (position.includes('Guard')) maxAssists = 10 + baseIqPotential * 8;
  else if (position.includes('Forward')) maxAssists = 8 + baseIqPotential * 6;
  else if (position.includes('Center')) maxAssists = 5 + baseIqPotential * 4;
  maxAssists = Math.min(Math.max(1, maxAssists), 20);
  assists = Math.floor(Math.random() * (baseIqPotential * maxAssists));
  if (playedHard) assists = Math.floor(assists * (1.05 + Math.random() * 0.25));

  const finalPoints =
    typeof points === 'number' && !isNaN(points)
      ? Math.max(0, Math.min(Math.floor(points), 60))
      : 0;
  const finalRebounds =
    typeof rebounds === 'number' && !isNaN(rebounds)
      ? Math.max(0, Math.min(Math.floor(rebounds), 25))
      : 0;
  const finalAssists =
    typeof assists === 'number' && !isNaN(assists)
      ? Math.max(0, Math.min(Math.floor(assists), 20))
      : 0;
  const finalMinutes = Math.max(0, minutes);

  const resultStatLine: GameStatLine = {
    points: finalPoints,
    rebounds: finalRebounds,
    assists: finalAssists,
    minutes: finalMinutes,
  };
  const gameImpactScore =
    (finalPoints * 1.0 + finalRebounds * 1.2 + finalAssists * 1.5 + finalMinutes / 2) / 4;
  let winChance =
    0.45 + stats.basketballIQ / 500 + stats.professionalism / 600 + gameImpactScore / 200;
  if (playedHard && finalPoints > 15) winChance += 0.05;
  if (stats.energy < 20) winChance -= 0.15;
  const teamWon = Math.random() < clamp(winChance, 0.05, 0.95);
  return { statLine: resultStatLine, teamWon: teamWon };
};
