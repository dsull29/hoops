import type { GameEvent, Player } from '../../types';
import { colStarterEvents } from './college/colStarterEvents';
import { hsJuniorEvents } from './highSchool/hsJuniorEvents';
import { hsSeniorEvents } from './highSchool/hsSeniorEvents';

export const getModeRoleContextualEvent = (player: Player): GameEvent | null => {
  const { gameMode, currentSeasonInMode } = player;
  const potentialEvents: GameEvent[] = [];

  if (gameMode === 'High School') {
    if (currentSeasonInMode === 3) {
      potentialEvents.push(...hsJuniorEvents);
    }
    // FIX: Added senior year events
    if (currentSeasonInMode === 4) {
      potentialEvents.push(...hsSeniorEvents);
    }
  } else if (gameMode === 'College') {
    if (player.currentRole === 'Starter' || player.currentRole === 'Conference Star') {
      potentialEvents.push(...colStarterEvents);
    }
  }

  if (potentialEvents.length > 0) {
    const lastEvent =
      player.careerLog.length > 0 ? player.careerLog[player.careerLog.length - 1] : null;
    let availableEvents = potentialEvents;
    if (lastEvent && lastEvent.startsWith('--- Contextual Event:')) {
      const lastEventTitle = lastEvent.substring('--- Contextual Event: '.length).split(' ---')[0];
      availableEvents = potentialEvents.filter((event) => event.title !== lastEventTitle);
    }

    if (availableEvents.length > 0) {
      return availableEvents[Math.floor(Math.random() * availableEvents.length)];
    } else if (potentialEvents.length > 0) {
      return potentialEvents[Math.floor(Math.random() * potentialEvents.length)];
    }
  }
  return null;
};
