import { MAX_ENERGY, MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import type { Choice, GameEvent, Player, PlayerStats } from '../types';
import { clamp } from '../utils';
import { generatePlayerGameStats } from './playerGameStats';

const getDiminishingReturnsGain = (currentStatValue: number, professionalism: number): number => {
  let gain = 1;
  const randomFactor = Math.random();
  const professionalBonusChance = professionalism > 75 ? 0.25 : professionalism > 50 ? 0.15 : 0.05;

  if (currentStatValue < 50) gain = randomFactor < 0.65 ? 2 : 1;
  else if (currentStatValue < 70) gain = randomFactor < 0.45 ? 2 : 1;
  else if (currentStatValue < 85) gain = randomFactor < 0.75 ? 1 : 0;
  else if (currentStatValue < 95) gain = randomFactor < 0.4 ? 1 : 0;
  else gain = randomFactor < 0.15 ? 1 : 0;

  if (gain > 0 && gain < 2 && Math.random() < professionalBonusChance) {
    gain += 1;
  }
  return Math.min(gain, 2);
};

export const createDailyChoiceEvent = (player: Player): GameEvent => {
  const choices: Choice[] = [
    {
      id: 'train_shooting',
      text: 'Train Shooting',
      description: 'Hit the gym to work on your jumper.',
      cost: { stat: 'energy', amount: 20 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.shooting, newStats.professionalism);
        if (gain > 0)
          newStats.shooting = clamp(newStats.shooting + gain, MIN_STAT_VALUE, MAX_STAT_VALUE);
        newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `Shooting +${gain}.` : 'No improvement this time.';
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: `Focused on shooting. ${gainMsg} Energy -20.`,
        };
      },
      disabled: (p) => p.stats.energy < 20,
    },
    {
      id: 'train_athleticism',
      text: 'Train Athleticism',
      description: 'Conditioning and strength training.',
      cost: { stat: 'energy', amount: 25 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.athleticism, newStats.professionalism);
        if (gain > 0)
          newStats.athleticism = clamp(newStats.athleticism + gain, MIN_STAT_VALUE, MAX_STAT_VALUE);
        newStats.energy = clamp(newStats.energy - 25, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `Athleticism +${gain}.` : 'No improvement this time.';
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: `Pushed hard on athleticism. ${gainMsg} Energy -25.`,
        };
      },
      disabled: (p) => p.stats.energy < 25,
    },
    {
      id: 'study_film',
      text: 'Study Film',
      description: 'Analyze game footage to improve your BBIQ.',
      cost: { stat: 'energy', amount: 10 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.basketballIQ, newStats.professionalism);
        if (gain > 0)
          newStats.basketballIQ = clamp(
            newStats.basketballIQ + gain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
        newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `BBIQ +${gain}.` : 'No new insights this time.';
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: `Spent time studying film. ${gainMsg} Energy -10.`,
        };
      },
      disabled: (p) => p.stats.energy < 10,
    },
    {
      id: 'rest',
      text: 'Rest & Recover',
      description: 'Take a day off to recover energy.',
      action: (p) => {
        const newStats = { ...p.stats };
        newStats.energy = clamp(
          newStats.energy + 30 + Math.floor(Math.random() * 11),
          0,
          MAX_ENERGY
        );
        newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE);
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: 'Took a much-needed rest day. Energy and Morale increased.',
        };
      },
    },
  ];
  return {
    id: 'daily_choices',
    title: `Day ${player.currentDayInSeason} Focus`,
    description: `What's the plan for today?`,
    choices: choices,
    type: 'daily',
  };
};

export const gameDayEvent = (player: Player, opponent: string): GameEvent => {
  return {
    id: 'game_day',
    title: `Game Day vs ${opponent}!`,
    description:
      "It's time to hit the court. Your energy and preparation will determine your performance.",
    isMandatory: true,
    choices: [
      {
        id: 'play_game',
        text: 'Play the Game',
        description: `Your energy is ${player.stats.energy}. Let's see how you do.`,
        action: (p_action) => {
          const newStats = { ...p_action.stats };
          const playedHard = p_action.stats.energy > 60;
          const energyCost = playedHard ? 35 : 25;
          newStats.energy = clamp(newStats.energy - energyCost, 0, MAX_ENERGY);

          const gamePerformance = generatePlayerGameStats(p_action, playedHard);
          const { teamWon } = gamePerformance;

          if (teamWon) newStats.morale = clamp(newStats.morale + 10, 0, MAX_MORALE);
          else newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);

          return {
            updatedPlayer: { ...p_action, stats: newStats },
            outcomeMessage: `Game finished.`,
            gamePerformance,
          };
        },
      },
    ],
  };
};

export const minorInjuryEvent: GameEvent = {
  id: 'minor_injury',
  title: 'Minor Injury!',
  description:
    'You tweaked something during a light workout. Aches and pains are part of the game.',
  isMandatory: true,
  choices: [
    {
      id: 'acknowledge_injury',
      text: 'Okay, I need to be careful.',
      action: (p) => {
        const newStats = { ...p.stats };
        const statToHit = ['athleticism', 'shooting'][
          Math.floor(Math.random() * 2)
        ] as keyof PlayerStats;
        const reduction = 1 + Math.floor(Math.random() * 3);
        newStats[statToHit] = clamp(
          (newStats[statToHit] as number) - reduction,
          MIN_STAT_VALUE,
          MAX_STAT_VALUE
        );
        newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY);
        newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: `The injury set you back a bit. ${statToHit} -${reduction}, Energy -10, Morale -5.`,
        };
      },
    },
  ],
};

export const agentMeetingEvent = (player: Player): GameEvent | null => {
  if (
    player.gameMode === 'High School' ||
    (player.gameMode === 'College' && player.currentSeasonInMode < 3)
  ) {
    return null;
  }
  return {
    id: 'agent_meeting',
    title: 'Agent Meeting',
    description: `Your agent wants to discuss your future.`,
    isMandatory: true,
    choices: [
      {
        id: 'discuss_contract',
        text: 'Discuss Contract Situation',
        action: (p) => {
          let outcomeMessage = 'You discussed your contract. ';
          if (p.stats.charisma > 60) {
            outcomeMessage += 'Your agent seems confident they can get you a good deal soon.';
            p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          } else {
            outcomeMessage += 'The conversation was a bit tense. No clear path forward yet.';
            p.stats.morale = clamp(p.stats.morale - 3, 0, MAX_MORALE);
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
      {
        id: 'seek_endorsement',
        text: 'Seek Endorsement Opportunities',
        action: (p) => {
          let outcomeMessage = 'Your agent will look into endorsement deals. ';
          if (p.stats.charisma > 70 && p.stats.shooting + p.stats.athleticism > 120) {
            outcomeMessage += 'A local shoe store offers you a small deal! Morale +10.';
            p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE);
          } else {
            outcomeMessage += 'The market seems quiet right now, but your agent is on it.';
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
    ],
  };
};
