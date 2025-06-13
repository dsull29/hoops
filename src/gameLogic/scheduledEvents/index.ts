import type { GameEvent, Player } from '../../types';
import { highSchoolScheduledEvents } from './highSchool';

// This interface is defined here and exported for other files to use.
export interface ScheduledEventDefinition {
  event: GameEvent;
  condition: (player: Player) => boolean;
}

// A master list that combines all scheduled events from different files.
const scheduledEvents: ScheduledEventDefinition[] = [
  ...highSchoolScheduledEvents,
  // When you add college events, you'll import them and add them here.
  // ...collegeScheduledEvents,
];

/**
 * This function is called by the game loop each day to check if a scheduled event should occur.
 * @param player The current player state.
 * @returns A GameEvent if a condition is met, otherwise null.
 */
export const getScheduledEvent = (player: Player): GameEvent | null => {
  for (const scheduled of scheduledEvents) {
    if (scheduled.condition(player)) {
      return scheduled.event;
    }
  }
  return null;
};
