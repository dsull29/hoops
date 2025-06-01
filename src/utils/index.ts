import { firstNames, lastNames } from "../data/names";

export const getRandomName = (): string => {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
};

export const getRandomPosition = (): string => {
  const positions = [
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
  ];
  return positions[Math.floor(Math.random() * positions.length)];
};

export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(value, max));
