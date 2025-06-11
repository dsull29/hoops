// This is a "barrel" file. It re-exports modules to create a single,
// consistent import point for the rest of the application. This helps
// enforce modularity and makes it clear what parts of the game logic
// are intended for external use (by the gameEngine service).

export {
  agentMeetingEvent,
  createDailyChoiceEvent, // FIX: Exporting the correct daily function
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';

export { processDay } from './gameLoop'; // FIX: Changed from processWeek to processDay

export { generatePlayerGameStats } from './playerGameStats';

export { createInitialPlayer, processPlayerRetirement } from './playerLogic';

export { getModeRoleContextualEvent } from './contextualEvents/contextualEventRunner';

export { generateSeasonSchedule } from './seasonLogic';
