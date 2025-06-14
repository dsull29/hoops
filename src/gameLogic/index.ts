// This is a "barrel" file. It re-exports modules to create a single,
// consistent import point for the rest of the application.

export {
  agentMeetingEvent, // Replaced createDailyChoiceEvent
  gameDayEvent,
  handleAutomatedPracticeDay,
  minorInjuryEvent,
} from './eventDefinitions';

export { advanceDay, type AdvanceDayResult } from './gameLoop';

export { generatePlayerGameStats } from './playerGameStats';

export { createInitialPlayer, processPlayerRetirement } from './playerLogic';

export { getModeRoleContextualEvent } from './contextualEvents/contextualEventRunner';

export { generateSeasonSchedule } from './seasonLogic';
