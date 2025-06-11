import { MAX_ENERGY, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import { HIGH_SCHOOL_ROLES } from '../constants/index';
import type { Player } from '../types';
import { clamp, getRandomName, getRandomPosition } from '../utils/index';
import { generateSeasonSchedule } from './seasonLogic';

export const createInitialPlayer = (metaSkillPoints: number = 0): Player => {
  // FIX: Ensure metaSkillPoints is always a valid number to prevent NaN calculations.
  const validMetaPoints =
    typeof metaSkillPoints === 'number' && !isNaN(metaSkillPoints) ? metaSkillPoints : 0;
  const baseStat = 25 + Math.floor(validMetaPoints / 2);

  const initialSchedule = generateSeasonSchedule('High School', 1);

  return {
    name: getRandomName(),
    position: getRandomPosition(),
    age: 14,
    gameMode: 'High School',
    currentRole: HIGH_SCHOOL_ROLES[0],
    stats: {
      shooting: clamp(
        baseStat + Math.floor(Math.random() * 15) - 7,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 30
      ),
      athleticism: clamp(
        baseStat + Math.floor(Math.random() * 20) - 10,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 25
      ),
      basketballIQ: clamp(
        baseStat + Math.floor(Math.random() * 15) - 7,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 30
      ),
      charisma: clamp(20 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
      professionalism: clamp(15 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
      energy: MAX_ENERGY,
      morale: 70,
      skillPoints: validMetaPoints, // Use the sanitized value
    },
    traits: [],
    currentSeason: 1,
    currentSeasonInMode: 1,
    currentDayInSeason: 1,
    totalDaysPlayed: 0,
    schedule: initialSchedule,
    careerOver: false,
    careerLog: ['Your High School career begins as a Freshman Newcomer!'],
  };
};

interface RetirementProcessingResult {
  finalPlayerState: Player;
  newTotalMetaSkillPoints: number;
}

export const processPlayerRetirement = (
  currentPlayer: Player,
  metaSkillPointsAtRunStart: number,
  retirementMessage: string = '--- CAREER OVER: You decided to retire voluntarily. ---'
): RetirementProcessingResult => {
  const updatedPlayer = {
    ...currentPlayer,
    careerOver: true,
    careerLog: [...currentPlayer.careerLog, retirementMessage],
  };

  // FIX: Ensure stats are numbers before calculating points earned.
  const shooting =
    typeof updatedPlayer.stats.shooting === 'number' ? updatedPlayer.stats.shooting : 0;
  const athleticism =
    typeof updatedPlayer.stats.athleticism === 'number' ? updatedPlayer.stats.athleticism : 0;

  const pointsEarned = Math.floor(updatedPlayer.totalDaysPlayed / 5) + shooting + athleticism;

  const newTotalMetaSkillPoints = (metaSkillPointsAtRunStart || 0) + pointsEarned;

  const finalPlayerState: Player = {
    ...updatedPlayer,
    stats: {
      ...updatedPlayer.stats,
      skillPoints: newTotalMetaSkillPoints,
    },
  };

  return { finalPlayerState, newTotalMetaSkillPoints };
};
