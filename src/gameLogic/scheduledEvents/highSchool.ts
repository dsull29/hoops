import { MAX_MORALE } from '../../constants';
import type { GameEvent, Player } from '../../types';
import { clamp } from '../../utils';
import type { ScheduledEventDefinition } from './index';

// --- High School Senior Year Events ---

const lastPracticeEvent: GameEvent = {
  id: 'hs_senior_last_practice',
  title: 'The Last Practice',
  description:
    "The coach calls the team together after your final practice ever. He gives a speech about the journey and the bonds you've all formed.",
  type: 'scheduled',
  choices: [
    {
      id: 'thank_coach',
      text: 'Thank the coach for everything.',
      action: (p: Player) => {
        p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE);
        return {
          updatedPlayer: p,
          outcomeMessage:
            "It's an emotional moment. You feel immense gratitude for your team and coaches. Morale +10.",
        };
      },
    },
  ],
};

// --- Exported Array of High School Scheduled Events ---
export const highSchoolScheduledEvents: ScheduledEventDefinition[] = [
  {
    event: lastPracticeEvent,
    condition: (player: Player) => {
      if (player.gameMode !== 'High School' || player.currentSeasonInMode !== 4) {
        return false;
      }

      const schedule = player.schedule.schedule;
      // Find the day of the very last practice in the schedule
      const lastPracticeDay = [...schedule].reverse().find((d) => d.type === 'Practice')?.day;

      if (!lastPracticeDay) return false;

      return player.currentDayInSeason === lastPracticeDay;
    },
  },
];
