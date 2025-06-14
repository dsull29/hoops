// src/gameLogic/playerLogic.ts
import { MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import type { Player, PlayerTrait } from '../types';
import type { Team } from '../types/teams';
import { clamp, getRandomName, getRandomPosition } from '../utils/index';
import { generateSeasonSchedule } from './seasonLogic';
import { TRAIT_DEFINITIONS, TraitCategory } from './traits';

export const createInitialPlayer = (metaSkillPoints: number = 0, teams: Team[]): Player => {
  const validMetaPoints =
    typeof metaSkillPoints === 'number' && !isNaN(metaSkillPoints) ? metaSkillPoints : 0;

  const legacyBonus = Math.min(20, Math.floor(validMetaPoints / 15));
  const baseStat = 35 + legacyBonus;

  // --- Select a team based on legacy points ---
  const legacyTier = Math.floor(validMetaPoints / 50); // 0 = low, 1 = mid, 2+ = high

  const lowPrestigeTeams = teams.filter((t) => t.prestige < 25);
  const midPrestigeTeams = teams.filter((t) => t.prestige >= 25 && t.prestige < 40);
  const highPrestigeTeams = teams.filter((t) => t.prestige >= 40);

  let potentialTeams: Team[];
  if (legacyTier >= 2 && highPrestigeTeams.length > 0) {
    potentialTeams = highPrestigeTeams;
  } else if (legacyTier >= 1 && midPrestigeTeams.length > 0) {
    potentialTeams = midPrestigeTeams;
  } else {
    // Fallback to any team if the preferred tier is empty
    potentialTeams = lowPrestigeTeams.length > 0 ? lowPrestigeTeams : teams;
  }

  const selectedTeam = potentialTeams[Math.floor(Math.random() * potentialTeams.length)];

  const initialSchedule = generateSeasonSchedule('High School', 3, teams, selectedTeam.id);
  const careerLog = [
    `Your High School career begins as a Junior at ${selectedTeam.name}. Time to make a name for yourself!`,
  ];
  if (legacyBonus > 0) {
    careerLog.push(
      `--- Your legacy provides a starting boost! (+${legacyBonus} to base stats) ---`
    );
  }

  const stats = {
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
  };

  const startingTraits = new Map<PlayerTrait, number>();

  const possibleTraits = Array.from(TRAIT_DEFINITIONS.values());
  const traitRoll = Math.random();

  if (traitRoll < 1.0) {
    let assigned = false;
    while (!assigned) {
      const randomTraitDef = possibleTraits[Math.floor(Math.random() * possibleTraits.length)];
      if (randomTraitDef.category !== TraitCategory.CAREER_PROGRESSION) {
        startingTraits.set(randomTraitDef.name, 1);
        careerLog.push(
          `--- You start your career with a natural gift: ${randomTraitDef.name}! ---`
        );

        const level1 = randomTraitDef.levels[0];
        if (level1.effects.statBoost) {
          const { stat, value } = level1.effects.statBoost;
          stats[stat] = clamp(stats[stat] + value, MIN_STAT_VALUE, MAX_STAT_VALUE);
          careerLog.push(
            `--- Your "${randomTraitDef.name}" trait gives you +${value} ${stat}! ---`
          );
        }

        assigned = true;
      }
    }
  }

  return {
    name: getRandomName(),
    position: getRandomPosition(),
    age: 16,
    teamId: selectedTeam.id,
    gameMode: 'High School',
    currentRole: 'Junior Varsity Player',
    stats,
    traits: startingTraits,
    currentSeason: 3,
    currentSeasonInMode: 3,
    currentDayInSeason: 1,
    totalDaysPlayed: 0,
    schedule: initialSchedule,
    careerOver: false,
    careerLog,
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

  const pointsFromStats = Math.floor((shooting + athleticism) / 10);
  const pointsEarned = Math.floor(updatedPlayer.totalDaysPlayed / 10) + pointsFromStats;

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
