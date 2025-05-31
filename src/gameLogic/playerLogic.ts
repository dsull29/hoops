  import { getRandomName, getRandomPosition, clamp } from '../utils/index';
  import { MIN_STAT_VALUE, MAX_STAT_VALUE } from '../constants';
  import { Player } from '../types';
  
  export const createInitialPlayer = (metaSkillPoints: number = 0): Player => {
    const baseStat = 30 + Math.floor(metaSkillPoints / 2);
    return {
      name: getRandomName(),
      position: getRandomPosition(),
      stats: {
        shooting: clamp(baseStat + Math.floor(Math.random() * 20) - 10, MIN_STAT_VALUE, MAX_STAT_VALUE),
        athleticism: clamp(baseStat + Math.floor(Math.random() * 20) - 10, MIN_STAT_VALUE, MAX_STAT_VALUE),
        basketballIQ: clamp(baseStat + Math.floor(Math.random() * 20) - 10, MIN_STAT_VALUE, MAX_STAT_VALUE),
        charisma: clamp(30 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
        professionalism: clamp(30 + Math.floor(Math.random() * 20), MIN_STAT_VALUE, MAX_STAT_VALUE),
        energy: 80,
        morale: 70,
        skillPoints: metaSkillPoints,
      },
      traits: [],
      currentSeason: 1,
      currentDayInSeason: 1,
      totalDaysPlayed: 0,
      careerOver: false,
      careerLog: ['Your career begins!'],
      age: 18,
    };
  };

  