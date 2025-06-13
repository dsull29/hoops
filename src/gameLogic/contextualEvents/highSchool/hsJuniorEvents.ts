import { MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../../../constants';
import type { GameEvent, Player } from '../../../types';
import { clamp } from '../../../utils';

export const hsJuniorEvents: GameEvent[] = [
  {
    id: 'hs_junior_scout_rumor',
    title: 'Scout in the Stands',
    description:
      'A rumor is going around that a scout from a small local college is at the game tonight. The pressure feels a little higher than usual.',
    type: 'contextual',
    choices: [
      {
        id: 'ignore_scout',
        text: 'Ignore it and play your game',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          let outcomeMessage = 'You focused on the game plan. ';
          // Stat check against professionalism and a dice roll
          if (p.stats.professionalism > 50 && Math.random() < 0.75) {
            newStats.professionalism = clamp(
              newStats.professionalism + 1,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            newStats.morale = clamp(newStats.morale + 3, 0, MAX_MORALE);
            outcomeMessage += 'Your focus paid off. Professionalism +1, Morale +3.';
          } else {
            newStats.morale = clamp(newStats.morale - 3, 0, MAX_MORALE);
            outcomeMessage += 'The rumor was a bit distracting. Morale -3.';
          }
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
        },
      },
      {
        id: 'try_to_impress',
        text: 'Try to put on a show (Risky)',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          let outcomeMessage = 'You decided to play with a little extra flair. ';
          // Higher risk/reward based on charisma and a dice roll
          if (p.stats.charisma > 55 && Math.random() < 0.4) {
            const iqLoss = 1 + Math.floor(Math.random() * 2); // Lose 1 or 2
            newStats.basketballIQ = clamp(
              newStats.basketballIQ - iqLoss,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += `You made a few flashy but poor decisions. Basketball IQ -${iqLoss}.`;
          } else {
            const shootingGain = 1 + Math.floor(Math.random() * 2); // Gain 1 or 2
            newStats.shooting = clamp(
              newStats.shooting + shootingGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += `Your confidence was infectious, and you hit some tough shots. Shooting +${shootingGain}.`;
          }
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage,
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_party_invite',
    title: 'Weekend Party',
    description:
      'A popular senior is throwing a big party the night before a practice. Going could be fun and good for your social standing, but it might affect your performance.',
    type: 'contextual',
    choices: [
      {
        id: 'go_to_party',
        text: 'Go to the party',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          const charismaGain = 1 + Math.floor(Math.random() * 2);
          const professionalismLoss = 1 + Math.floor(Math.random() * 2);
          newStats.charisma = clamp(
            newStats.charisma + charismaGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          newStats.professionalism = clamp(
            newStats.professionalism - professionalismLoss,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage: `You had a great time at the party and made some new friends, but you felt a step slow in practice the next day. Charisma +${charismaGain}, Professionalism -${professionalismLoss}.`,
          };
        },
      },
      {
        id: 'skip_party',
        text: 'Skip it and get some rest',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          const professionalismGain = 1 + Math.floor(Math.random() * 2);
          newStats.professionalism = clamp(
            newStats.professionalism + professionalismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage: `You skipped the party to focus on basketball. The coaches noticed your dedication. Professionalism +${professionalismGain}.`,
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_rival_trash_talk',
    title: 'Rival Trash Talk',
    description:
      'The star player from your rival school finds you online and starts talking trash about the upcoming game.',
    type: 'contextual',
    choices: [
      {
        id: 'talk_back',
        text: 'Fire back with some trash talk of your own.',
        action: (p: Player) => {
          let outcomeMessage = 'You engaged in a war of words. ';
          // Stat check against charisma for the outcome
          if (p.stats.charisma > 60 && Math.random() < 0.6) {
            const moraleGain = 3 + Math.floor(Math.random() * 5); // 3-7
            p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
            outcomeMessage += `Your comeback was legendary! Morale +${moraleGain}.`;
          } else {
            const moraleLoss = 3 + Math.floor(Math.random() * 5); // 3-7
            p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
            outcomeMessage += `You probably should have just stayed quiet. Morale -${moraleLoss}.`;
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
      {
        id: 'ignore_rival',
        text: 'Ignore it. "Actions speak louder than words."',
        action: (p: Player) => {
          const profGain = Math.random() < 0.75 ? 1 : 2; // 75% chance of +1, 25% of +2
          p.stats.professionalism = clamp(
            p.stats.professionalism + profGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `You took the high road and ignored the noise. Professionalism +${profGain}.`,
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_grades_slipping',
    title: 'Grades are Slipping',
    description:
      'Your focus on basketball has caused your grades to slip. The coach pulls you aside and warns you about academic eligibility.',
    type: 'contextual',
    choices: [
      {
        id: 'hit_the_books',
        text: 'Dedicate extra time to studying.',
        action: (p: Player) => {
          const profGain = 2;
          const iqGain = Math.random() < 0.6 ? 1 : 0; // 60% chance of a small IQ gain
          p.stats.professionalism = clamp(
            p.stats.professionalism + profGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.basketballIQ = clamp(
            p.stats.basketballIQ + iqGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `You spent the week catching up on schoolwork. Your grades are back on track. Professionalism +${profGain}, Basketball IQ +${iqGain}.`,
          };
        },
      },
      {
        id: 'ask_teammate_for_help',
        text: 'Ask the team captain for tutoring help.',
        action: (p: Player) => {
          let outcomeMessage = 'You asked the captain for help. ';
          if (p.stats.charisma > 50 || Math.random() < 0.5) {
            const moraleGain = 3 + Math.floor(Math.random() * 4); // 3-6
            p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
            outcomeMessage += `They were happy to help, and you both learned something. Morale +${moraleGain}.`;
          } else {
            const moraleLoss = 2 + Math.floor(Math.random() * 2); // 2-3
            p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
            outcomeMessage += `It was a little awkward, but you got the help you needed. Morale -${moraleLoss}.`;
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
    ],
  },
  {
    id: 'hs_junior_growth_spurt',
    title: 'Growth Spurt',
    description: 'You hit a growth spurt over the summer and are now a couple of inches taller.',
    type: 'contextual',
    choices: [
      {
        id: 'embrace_growth',
        text: 'Awesome! Time to work on my new frame.',
        action: (p: Player) => {
          const athleticismGain = 1 + Math.floor(Math.random() * 2); // 1-2
          const durabilityGain = 1;
          p.stats.athleticism = clamp(
            p.stats.athleticism + athleticismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.durability = clamp(
            p.stats.durability + durabilityGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `You feel stronger and more imposing on the court. Athleticism +${athleticismGain}, Durability +${durabilityGain}.`,
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_slump',
    title: 'Shooting Slump',
    description:
      "You've hit a wall. For the last week, your shot just hasn't been falling in practice.",
    type: 'contextual',
    choices: [
      {
        id: 'shoot_through_it',
        text: 'Spend extra hours in the gym.',
        action: (p: Player) => {
          let outcomeMessage = 'You lived in the gym trying to find your rhythm again. ';
          // Chance to break through or just get tired
          if (p.stats.professionalism > 60 && Math.random() < 0.7) {
            const shootingGain = 1;
            p.stats.shooting = clamp(
              p.stats.shooting + shootingGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += `You finally broke through the slump! Shooting +${shootingGain}.`;
          } else {
            const moraleLoss = 3;
            p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
            outcomeMessage += `The slump continues, and the frustration is mounting. Morale -${moraleLoss}.`;
          }
          return {
            updatedPlayer: p,
            outcomeMessage,
          };
        },
      },
      {
        id: 'mental_break',
        text: 'Take a day off from shooting to clear your head.',
        action: (p: Player) => {
          const moraleGain = 4 + Math.floor(Math.random() * 4); // 4-7
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: `You took a day to relax and came back to practice feeling refreshed. Morale +${moraleGain}.`,
          };
        },
      },
    ],
  },
];
