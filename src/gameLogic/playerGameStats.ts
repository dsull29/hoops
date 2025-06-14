import type { GameMode, GameStatLine, Player, PlayerRole } from '../types';
import { clamp } from '../utils';
import { TRAIT_DEFINITIONS } from './traits';

const getRoleMultiplier = (gameMode: GameMode, role: PlayerRole): number => {
  if (
    role.includes('Star') ||
    role.includes('All-American') ||
    role.includes('MVP') ||
    role.includes('All-League') ||
    role.includes('Top Draft Prospect')
  )
    return 1.4;
  if (role.includes('Starter') || role.includes('Captain') || role.includes('Conference Star'))
    return 1.15;
  if (role.includes('Rotation') || role.includes('Sixth Man') || role.includes('Substitute'))
    return 1.0;
  if (role.includes('Bench') || role.includes('Practice Squad')) return 0.75;
  return 0.65;
};

const getGameModeStatScale = (gameMode: GameMode): number => {
  if (gameMode === 'Professional') return 1.0;
  if (gameMode === 'College') return 0.8;
  if (gameMode === 'High School') return 0.7;
  return 0.7;
};

export const generatePlayerGameStats = (
  player: Player
): { statLine: GameStatLine; teamWon: boolean } => {
  const { stats, position, gameMode, currentRole, traits } = player;
  const roleMultiplier = getRoleMultiplier(gameMode, currentRole);
  const modeScale = getGameModeStatScale(gameMode);
  const durabilityFactor = 1 + (stats.durability - 50) / 100;

  // --- FIX: Apply GAME_PERFORMANCE trait effects ---
  let pointsMultiplier = 1;
  let assistsMultiplier = 1;
  let reboundsMultiplier = 1;
  let winChanceBonus = 0;

  for (const [traitName, level] of traits.entries()) {
    const traitDef = TRAIT_DEFINITIONS.get(traitName);
    // FIX: Add a guard clause to ensure traitDef is not undefined before use.
    if (!traitDef) continue;

    const levelDef = traitDef.levels.find((l) => l.level === level);
    if (!levelDef || traitDef.category !== 'GAME_PERFORMANCE') continue;

    const { effects } = levelDef;
    if (effects.performanceMultiplier) {
      if (effects.performanceMultiplier.stat === 'points')
        pointsMultiplier *= effects.performanceMultiplier.multiplier;
      if (effects.performanceMultiplier.stat === 'assists')
        assistsMultiplier *= effects.performanceMultiplier.multiplier;
      if (effects.performanceMultiplier.stat === 'rebounds')
        reboundsMultiplier *= effects.performanceMultiplier.multiplier;
    }
    if (effects.winChanceBonus) {
      winChanceBonus += effects.winChanceBonus;
    }
  }
  // --- END FIX ---

  let baseMinutesForRole = BASE_MINUTES[gameMode]?.[currentRole] ?? 12;
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

  let minutes = Math.floor(baseMinutesForRole * durabilityFactor * (0.9 + Math.random() * 0.2));
  minutes = clamp(minutes, 0, MAX_GAME_MINUTES[gameMode]);

  let points = 0,
    rebounds = 0,
    assists = 0;

  if (minutes > 0) {
    const pointsPerMin = 0.4 * modeScale;
    const reboundsPerMin = 0.25 * modeScale;
    const assistsPerMin = 0.15 * modeScale;

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

    points = Math.floor(
      minutes *
        pointsPerMin *
        posPointFactor *
        (stats.shooting / 50) *
        roleMultiplier *
        durabilityFactor *
        pointsMultiplier *
        (0.7 + Math.random() * 0.6)
    );
    rebounds = Math.floor(
      minutes *
        reboundsPerMin *
        posReboundFactor *
        (stats.athleticism / 55) *
        roleMultiplier *
        durabilityFactor *
        reboundsMultiplier *
        (0.7 + Math.random() * 0.6)
    );
    assists = Math.floor(
      minutes *
        assistsPerMin *
        posAssistFactor *
        (stats.basketballIQ / 60) *
        roleMultiplier *
        durabilityFactor *
        assistsMultiplier *
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

  const winChance =
    0.45 +
    stats.basketballIQ / 500 +
    stats.professionalism / 600 +
    gameImpactScore / 200 +
    winChanceBonus;
  const teamWon = Math.random() < clamp(winChance, 0.05, 0.95);
  return { statLine: resultStatLine, teamWon: teamWon };
};

const BASE_MINUTES: Record<GameMode, Partial<Record<PlayerRole, number>>> = {
  'High School': {
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
    'Top Draft Prospect': 30,
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
    'All-League Player': 36,
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
