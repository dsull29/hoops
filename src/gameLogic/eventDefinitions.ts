// src/gameLogic/eventDefinitions.ts
import { MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import type { GameEvent, Player, PlayerStats } from '../types';
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

export const handleAutomatedPracticeDay = (
  player: Player
): { updatedPlayer: Player; outcomeMessage: string } => {
  const newStats = { ...player.stats };
  let logMessage = `Day ${player.currentDayInSeason}: A standard day of practice.`;

  if (Math.random() < 0.4) {
    const statsToImprove: (keyof PlayerStats)[] = [
      'shooting',
      'athleticism',
      'basketballIQ',
      'durability',
    ];
    const statToFocus = statsToImprove[Math.floor(Math.random() * statsToImprove.length)];
    const gain = getDiminishingReturnsGain(
      newStats[statToFocus] as number,
      newStats.professionalism
    );

    if (gain > 0) {
      newStats[statToFocus] = clamp(
        (newStats[statToFocus] as number) + gain,
        MIN_STAT_VALUE,
        MAX_STAT_VALUE
      );
      logMessage += ` You made progress in ${statToFocus.replace(
        'basketballIQ',
        'BBIQ'
      )} (+${gain}).`;
    }
  }

  return {
    updatedPlayer: { ...player, stats: newStats },
    outcomeMessage: logMessage,
  };
};

export const gameDayEvent = (
  player: Player,
  opponentName: string,
  opponentId?: string
): GameEvent => {
  return {
    id: `game_day_${opponentId || opponentName}`,
    title: `Game Day vs ${opponentName}!`,
    description:
      "It's time to hit the court. Your performance will depend on your skills, your team, and your opponent.",
    isMandatory: true,
    choices: [
      {
        id: 'play_game',
        text: 'Play the Game',
        description: `Morale is at ${player.stats.morale}%. Let's see how you do.`,
        action: (p_action) => {
          const newStats = { ...p_action.stats };

          // The generatePlayerGameStats could be enhanced in the future
          // to use opponentId to look up the opponent's stats.
          const gamePerformance = generatePlayerGameStats(p_action);
          const { teamWon } = gamePerformance;

          if (teamWon) newStats.morale = clamp(newStats.morale + 10, 0, MAX_MORALE);
          else newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);

          return {
            updatedPlayer: { ...p_action, stats: newStats },
            outcomeMessage: `Game finished against ${opponentName}.`,
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
        newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);
        return {
          updatedPlayer: { ...p, stats: newStats },
          outcomeMessage: `The injury set you back a bit. ${statToHit} -${reduction}, Morale -5.`,
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
