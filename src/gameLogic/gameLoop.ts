import { DAYS_PER_SEASON } from '../constants';
import type { GameEvent, Player } from '../types';
import {
  agentMeetingEvent,
  createDailyChoiceEvent,
  gameDayEvent,
  minorInjuryEvent,
} from './eventDefinitions';

export interface ProcessTurnResult {
  nextPlayerState: Player;
  nextEvent: GameEvent | null;
  isGameOver: boolean;
  gameOverMessage?: string;
  eventTriggerMessage?: string;
}

export const processTurn = (
  currentPlayer: Player,
  choiceOutcomeImmediateEvent: GameEvent | null
): ProcessTurnResult => {
  const nextPlayerState = { ...currentPlayer };
  let nextEvent: GameEvent | null = choiceOutcomeImmediateEvent;
  let isGameOver = false;
  let gameOverMessage: string | undefined;
  let eventTriggerMessage: string | undefined;

  if (!nextEvent) {
    // If no immediate event from choice, proceed with normal day progression
    nextPlayerState.totalDaysPlayed += 1;
    nextPlayerState.currentDayInSeason += 1;

    if (nextPlayerState.currentDayInSeason > DAYS_PER_SEASON) {
      nextPlayerState.currentDayInSeason = 1;
      nextPlayerState.currentSeason += 1;
      nextPlayerState.age += 1;
      const seasonMsg = `--- End of Season ${
        nextPlayerState.currentSeason - 1
      }. Welcome to Season ${nextPlayerState.currentSeason}! You are now ${
        nextPlayerState.age
      } y.o. ---`;
      nextPlayerState.careerLog = [...nextPlayerState.careerLog, seasonMsg];
      eventTriggerMessage = seasonMsg; // Use this to show a message
    }

    // --- Random Event Trigger ---
    if (Math.random() < 0.1 && nextPlayerState.stats.energy < 30) {
      nextEvent = minorInjuryEvent;
      nextPlayerState.careerLog = [
        ...nextPlayerState.careerLog,
        '--- Random Event Triggered: Minor Injury ---',
      ];
      eventTriggerMessage = eventTriggerMessage
        ? `${eventTriggerMessage} & Minor Injury!`
        : 'Minor Injury Triggered!';
    } else if (nextPlayerState.totalDaysPlayed > 0 && nextPlayerState.totalDaysPlayed % 7 === 0) {
      nextEvent = gameDayEvent(nextPlayerState);
      nextPlayerState.careerLog = [
        ...nextPlayerState.careerLog,
        '--- Scheduled Event: Game Day ---',
      ];
      eventTriggerMessage = eventTriggerMessage
        ? `${eventTriggerMessage} & Game Day!`
        : 'Game Day!';
    } else if (nextPlayerState.totalDaysPlayed > 0 && nextPlayerState.totalDaysPlayed % 30 === 0) {
      nextEvent = agentMeetingEvent(nextPlayerState);
      nextPlayerState.careerLog = [
        ...nextPlayerState.careerLog,
        '--- Scheduled Event: Agent Meeting ---',
      ];
      eventTriggerMessage = eventTriggerMessage
        ? `${eventTriggerMessage} & Agent Meeting!`
        : 'Agent Meeting Scheduled!';
    } else {
      nextEvent = createDailyChoiceEvent(nextPlayerState);
    }
  }

  // --- Game Over Conditions ---
  if (nextPlayerState.stats.energy <= 0 && Math.random() < 0.2) {
    // Burnout
    isGameOver = true;
    gameOverMessage = 'You suffered a severe burnout and had to retire.';
  }
  if (!isGameOver && nextPlayerState.age > 38 && Math.random() < 0.1 * (nextPlayerState.age - 38)) {
    // Old age retirement
    isGameOver = true;
    gameOverMessage = 'After a long career, you decided to hang up the old gym shoes.';
  }

  if (isGameOver && gameOverMessage) {
    nextPlayerState.careerOver = true;
    nextPlayerState.careerLog = [
      ...nextPlayerState.careerLog,
      `--- CAREER OVER: ${gameOverMessage} ---`,
    ];
  }

  return {
    nextPlayerState,
    nextEvent,
    isGameOver,
    gameOverMessage,
    eventTriggerMessage,
  };
};
