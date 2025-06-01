import { firstNames, lastNames } from '../data/names';
import type { PlayerStats } from '../types';

export const getRandomName = (): string => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

export const getRandomPosition = (): string => {
  const positions = ['Point Guard', 'Shooting Guard', 'Small Forward', 'Power Forward', 'Center'];
  return positions[Math.floor(Math.random() * positions.length)];
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));

export const calculatePerformanceScore = (stats: PlayerStats): number => {
  return Math.round(
    stats.shooting * 1.2 +
      stats.athleticism * 1.1 +
      stats.basketballIQ * 1.0 +
      stats.professionalism * 0.5 +
      stats.charisma * 0.2
  );
};
