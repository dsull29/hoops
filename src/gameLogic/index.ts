// src/gameLogic/index.ts
// This is a "barrel" file. It re-exports modules to create a single,
// consistent import point for the rest of the application. This helps
// enforce modularity and makes it clear what parts of the game logic
// are intended for external use (by the gameEngine service).

export {
  agentMeetingEvent,
  createDailyChoiceEvent,
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';

export { processTurn } from './gameLoop';

export { generatePlayerGameStats } from './playerGameStats';

export { createInitialPlayer, processPlayerRetirement } from './playerLogic';

export { getModeRoleContextualEvent } from './contextualEvents/contextualEventRunner';
