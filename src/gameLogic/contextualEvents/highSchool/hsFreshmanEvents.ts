import { MAX_ENERGY, MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../../../constants';
import type { GameEvent, Player } from '../../../types';
import { clamp } from '../../../utils';

export const hsFreshmanEvents: GameEvent[] = [
  {
    id: 'hs_freshman_locker_prank',
    title: 'Locker Room Prank',
    description:
      "Some upperclassmen played a prank on you, hiding your practice jersey. It's a bit embarrassing.",
    type: 'contextual',
    choices: [
      {
        id: 'laugh_it_off',
        text: 'Laugh it off (Charisma Check)',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          let outcomeMessage = 'You laughed it off. ';
          if (p.stats.charisma > 40 || Math.random() < 0.5) {
            newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE);
            newStats.charisma = clamp(newStats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
            outcomeMessage += 'The team appreciated your good humor. Morale +5, Charisma +1.';
          } else {
            newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);
            outcomeMessage += 'It still felt a bit humiliating. Morale -5.';
          }
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
        },
      },
      {
        id: 'get_annoyed',
        text: 'Get Annoyed',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          newStats.morale = clamp(newStats.morale - 10, 0, MAX_MORALE);
          newStats.professionalism = clamp(
            newStats.professionalism - 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage:
              "You got visibly upset, which didn't help team chemistry. Morale -10, Professionalism -1.",
          };
        },
      },
    ],
  },
  {
    id: 'hs_freshman_first_big_practice',
    title: 'First Intense Practice',
    description:
      'Coach put the team through a grueling first full-contact practice. It was tougher than you expected.',
    type: 'contextual',
    choices: [
      {
        id: 'push_through',
        text: 'Push through it (+Athleticism, -Energy)',
        cost: { stat: 'energy', amount: 10 },
        action: (p: Player) => {
          const newStats = { ...p.stats };
          newStats.athleticism = clamp(newStats.athleticism + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY); // Extra hit
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage:
              'You pushed through the tough practice. Felt like you got a bit stronger. Athleticism +1, Energy -20.',
          };
        },
        disabled: (p) => p.stats.energy < 25,
      },
      {
        id: 'pace_yourself',
        text: 'Pace yourself',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY);
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage: 'You paced yourself to get through the practice. Energy -10.',
          };
        },
      },
    ],
  },
];
