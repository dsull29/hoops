import { MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import type { Player } from '../types';
import { clamp, getRandomName, getRandomPosition } from '../utils/index';
import { generateSeasonSchedule } from './seasonLogic';

export const createInitialPlayer = (metaSkillPoints: number = 0): Player => {
  const validMetaPoints =
    typeof metaSkillPoints === 'number' && !isNaN(metaSkillPoints) ? metaSkillPoints : 0;
  // Increased base stats for a more experienced player
  const baseStat = 35 + Math.floor(validMetaPoints / 2);

  const initialSchedule = generateSeasonSchedule('High School', 3); // Start in year 3

  return {
    name: getRandomName(),
    position: getRandomPosition(),
    age: 16, // Starting age for a junior
    gameMode: 'High School',
    currentRole: 'Junior Varsity Player', // Start as a JV Player
    stats: {
      shooting: clamp(
        baseStat + Math.floor(Math.random() * 15) - 7,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 20
      ),
      athleticism: clamp(
        baseStat + Math.floor(Math.random() * 20) - 10,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 15
      ),
      basketballIQ: clamp(
        baseStat + Math.floor(Math.random() * 15) - 7,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE - 20
      ),
      charisma: clamp(25 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
      professionalism: clamp(20 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
      durability: clamp(25 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
      morale: 75,
      skillPoints: validMetaPoints,
    },
    traits: [],
    currentSeason: 3, // Start in the 3rd season of High School
    currentSeasonInMode: 3,
    currentDayInSeason: 1,
    totalDaysPlayed: 0,
    schedule: initialSchedule,
    careerOver: false,
    careerLog: [
      'Your High School career begins as a Junior on the JV team. Time to make a name for yourself!',
    ],
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
