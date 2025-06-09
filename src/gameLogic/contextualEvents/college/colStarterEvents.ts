import { MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../../../constants';
import type { GameEvent, Player } from '../../../types';
import { clamp } from '../../../utils';

export const colStarterEvents: GameEvent[] = [
  {
    id: 'college_starter_scout_visit',
    title: 'Scout in the Stands',
    description: "You hear a pro scout might be attending tonight's game. The pressure is on!",
    type: 'contextual',
    choices: [
      {
        id: 'focus_on_game',
        text: 'Focus on your game plan',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          newStats.professionalism = clamp(
            newStats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage: 'You decide to stick to your preparation. Professionalism +1.',
          };
        },
      },
      {
        id: 'try_to_impress',
        text: 'Try to impress the scout (Risky)',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          let outcomeMessage = 'You tried to put on a show. ';
          if (p.stats.basketballIQ > 65 && Math.random() < 0.6) {
            newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE);
            outcomeMessage += 'You played well under pressure! Morale +5.';
          } else {
            newStats.morale = clamp(newStats.morale - 7, 0, MAX_MORALE);
            newStats.shooting = clamp(newStats.shooting - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
            outcomeMessage +=
              'You forced things a bit too much. Morale -7, Shooting -1 for next game (mental block).';
          }
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
        },
      },
    ],
  },
];
