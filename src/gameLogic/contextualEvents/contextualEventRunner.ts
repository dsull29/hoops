import type { GameEvent, Player } from '../../types'; // Adjust path
import { colStarterEvents } from './college/colStarterEvents'; // Adjust path
import { hsFreshmanEvents } from './highSchool/hsFreshmanEvents'; // Adjust path

export const getModeRoleContextualEvent = (player: Player): GameEvent | null => {
  const { gameMode, currentRole } = player;
  const potentialEvents: GameEvent[] = [];

  if (gameMode === 'High School') {
    if (currentRole === 'Freshman Newcomer' || currentRole === 'Sophomore Contender') {
      potentialEvents.push(...hsFreshmanEvents); // Use the imported array
    }
    // Example: if (currentRole === 'Varsity Starter') { potentialEvents.push(...hsStarterEvents); }
  } else if (gameMode === 'College') {
    if (currentRole === 'Starter' || currentRole === 'Conference Star') {
      potentialEvents.push(...colStarterEvents); // Use the imported array
    }
    // Example: if (currentRole === 'Walk-On Hopeful') { potentialEvents.push(...colWalkOnEvents); }
  } else if (gameMode === 'Professional') {
    // Example:
    // if (currentRole === 'Rookie') { potentialEvents.push(...proRookieEvents); }
    // if (currentRole === 'Established Star') { potentialEvents.push(...proStarEvents); }
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
