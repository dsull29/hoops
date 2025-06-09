import { MAX_ENERGY, MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../constants';
import type { Choice, GameEvent, GameStatLine, Player, PlayerStats } from '../types';
import { clamp } from '../utils';
import { generatePlayerGameStats } from './playerGameStats';

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

const getDiminishingReturnsGain = (currentStatValue: number, professionalism: number): number => {
    let gain = 1; // Base gain
    const randomFactor = Math.random();
    const professionalBonusChance = professionalism > 75 ? 0.25 : professionalism > 50 ? 0.15 : 0.05;

    if (currentStatValue < 50) {
        gain = randomFactor < 0.65 ? 2 : 1; // 65% chance of +2
    } else if (currentStatValue < 70) {
        gain = randomFactor < 0.45 ? 2 : 1; // 45% chance of +2
    } else if (currentStatValue < 85) {
        gain = randomFactor < 0.25 ? 1 : (randomFactor < 0.35 ? 2 : 1); // 25% chance of +1 (base), 10% chance of +2 (total 35% for >=1)
        gain = randomFactor < 0.75 ? 1 : 0; // More likely +1, harder for +2
    } else if (currentStatValue < 95) {
        gain = randomFactor < 0.4 ? 1 : 0; // 40% chance of +1
    } else {
        gain = randomFactor < 0.15 ? 1 : 0; // 15% chance of +1 (very hard)
    }

    // Professionalism bonus: small chance to add an extra point to the gain, if gain is not already max for this attempt
    if (gain > 0 && gain < 2 && Math.random() < professionalBonusChance) {
        gain += 1;
    }
    return Math.min(gain, 2); // Max gain of 2 per session
};

export const createDailyChoiceEvent = (player: Player): GameEvent => {
  const choices: Choice[] = [
    {
      id: 'train_shooting', text: 'Train Shooting', description: 'Hit the gym to work on your jumper.',
      cost: { stat: 'energy', amount: 20 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.shooting, newStats.professionalism);
        if (gain > 0) newStats.shooting = clamp(newStats.shooting + gain, MIN_STAT_VALUE, MAX_STAT_VALUE);
        newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `Shooting +${gain}.` : "No improvement this time.";
        return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Focused on shooting. ${gainMsg} Energy -20.` };
      },
      disabled: (p) => p.stats.energy < 20,
    },
    {
      id: 'train_athleticism', text: 'Train Athleticism', description: 'Conditioning and strength training.',
      cost: { stat: 'energy', amount: 25 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.athleticism, newStats.professionalism);
        if (gain > 0) newStats.athleticism = clamp(newStats.athleticism + gain, MIN_STAT_VALUE, MAX_STAT_VALUE);
        newStats.energy = clamp(newStats.energy - 25, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `Athleticism +${gain}.` : "No improvement this time.";
        return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Pushed hard on athleticism. ${gainMsg} Energy -25.` };
      },
      disabled: (p) => p.stats.energy < 25,
    },
    {
      id: 'study_film', text: 'Study Film', description: 'Analyze game footage to improve your BBIQ.',
      cost: { stat: 'energy', amount: 10 },
      action: (p) => {
        const newStats = { ...p.stats };
        const gain = getDiminishingReturnsGain(newStats.basketballIQ, newStats.professionalism);
         if (gain > 0) newStats.basketballIQ = clamp(newStats.basketballIQ + gain, MIN_STAT_VALUE, MAX_STAT_VALUE);
        newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY);
        const gainMsg = gain > 0 ? `BBIQ +${gain}.` : "No new insights this time.";
        return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Spent time studying film. ${gainMsg} Energy -10.` };
      },
      disabled: (p) => p.stats.energy < 10,
    },
    // ... Rest & Social Event choices remain the same as before ...
    { id: 'rest', text: 'Rest & Recover', description: 'Take a day off to recover energy and morale.', action: (p) => { const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy + 30 + Math.floor(Math.random() * 11), 0, MAX_ENERGY); newStats.morale = clamp(newStats.morale + 5 + Math.floor(Math.random() * 6), 0, MAX_MORALE); return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: 'Took a much-needed rest day. Feeling refreshed. Energy and Morale increased.'}; }, },
    { id: 'social_event', text: 'Attend Social Event', description: 'Hang out with teammates or attend a public function.', cost: { stat: 'energy', amount: 15 }, action: (p) => { const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy - 15, 0, MAX_ENERGY); let outcomeMessage = 'Attended a social event. '; const charismaRoll = Math.random(); if (charismaRoll < 0.3) { newStats.charisma = clamp(newStats.charisma - 2, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE); outcomeMessage += 'It was a bit awkward. Charisma -2, Morale -5.'; } else if (charismaRoll < 0.7) { newStats.charisma = clamp(newStats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE); outcomeMessage += 'Made a few connections. Charisma +1.'; } else { newStats.charisma = clamp(newStats.charisma + 3, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.morale = clamp(newStats.morale + 10, 0, MAX_MORALE); outcomeMessage += 'It was a great time! Charisma +3, Morale +10.';} return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage }; }, disabled: (p) => p.stats.energy < 15, },
  ];
  return { id: 'daily_choices', title: `Daily Focus`, description: `It's Day ${player.currentDayInSeason} of Season ${player.currentSeasonInMode}. What's the plan?`, choices: choices, };
};

export const gameDayEvent = (player: Player): GameEvent => {
  console.log(`Game Day Event Triggered for Player ID: ${player.name}, Game Mode: ${player.gameMode}, Season: ${player.currentSeasonInMode}, Day: ${player.currentDayInSeason}`);
  const createGameOutcomeMessage = (
    gamePerformance: { statLine: GameStatLine; teamWon: boolean },
    baseMessage: string
  ): string => {
    if (!gamePerformance || typeof gamePerformance.statLine === 'undefined') {
      console.error('Error: gamePerformance or gamePerformance.statLine is undefined in createGameOutcomeMessage.', gamePerformance);
      return `${baseMessage} Stat line unavailable.`;
    }
    const { statLine, teamWon } = gamePerformance;
    if (!statLine || typeof statLine.points === 'undefined' || typeof statLine.rebounds === 'undefined' || typeof statLine.assists === 'undefined' || typeof statLine.minutes === 'undefined') {
        console.error('Error: statLine is invalid in createGameOutcomeMessage.', statLine);
        return `${baseMessage} Game stats display error.`;
    }
    const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
    const statString = `In ${statLine.minutes} minutes, you finished with ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
    return `${baseMessage} ${statString} ${resultString}`;
  };

  return {
    id: 'game_day',
    title: `Game Day!`,
    description: "It's time to hit the court. How will you approach this game?",
    isMandatory: true,
    choices: [
      {
        id: 'play_hard', text: 'Play Hard (High Risk/Reward)', description: 'Go all out. Significant energy cost.',
        cost: { stat: 'energy', amount: 30 },
        action: (p_action) => {
          const newStats = { ...p_action.stats };
          newStats.energy = clamp(newStats.energy - 30 - Math.floor(Math.random() * 10), 0, MAX_ENERGY);
          const gamePerformance = generatePlayerGameStats(p_action, true);
          const { statLine, teamWon } = gamePerformance;
          if (teamWon) newStats.morale = clamp(newStats.morale + 10, 0, MAX_MORALE);
          else newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);
          if (statLine.points > 15 || statLine.rebounds > 7 || statLine.assists > 5) {
            newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE);
            const potentialBoosts: (keyof PlayerStats)[] = ['shooting', 'athleticism', 'basketballIQ'];
            const statToBoost = potentialBoosts[Math.floor(Math.random() * potentialBoosts.length)];
            // Apply diminishing returns to game-based stat boosts too
            const gameBoostGain = getDiminishingReturnsGain(newStats[statToBoost] as number, newStats.professionalism);
            if (gameBoostGain > 0) newStats[statToBoost] = clamp((newStats[statToBoost] as number) + gameBoostGain, MIN_STAT_VALUE, MAX_STAT_VALUE);
          } else { newStats.morale = clamp(newStats.morale - 3, 0, MAX_MORALE); }
          const outcomeMessage = createGameOutcomeMessage(gamePerformance, 'You played hard!');
          return { updatedPlayer: { ...p_action, stats: newStats }, outcomeMessage, gamePerformance };
        },
        disabled: (p) => p.stats.energy < 40,
      },
      {
        id: 'play_cautiously', text: 'Play Cautiously (Low Risk/Reward)', description: 'Play your role, conserve some energy.',
        cost: { stat: 'energy', amount: 20 },
        action: (p_action) => {
          const newStats = { ...p_action.stats };
          newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY);
          const gamePerformance = generatePlayerGameStats(p_action, false);
          const { statLine, teamWon } = gamePerformance;
          if (teamWon) newStats.morale = clamp(newStats.morale + 7, 0, MAX_MORALE);
          else newStats.morale = clamp(newStats.morale - 3, 0, MAX_MORALE);
          if (statLine.points > 10 || statLine.rebounds > 5 || statLine.assists > 3) {
            newStats.morale = clamp(newStats.morale + 3, 0, MAX_MORALE);
             // Smaller chance for stat boost on cautious play
            if(Math.random() < 0.25) {
                const potentialBoosts: (keyof PlayerStats)[] = ['shooting', 'athleticism', 'basketballIQ'];
                const statToBoost = potentialBoosts[Math.floor(Math.random() * potentialBoosts.length)];
                const gameBoostGain = getDiminishingReturnsGain(newStats[statToBoost] as number, newStats.professionalism);
                 if (gameBoostGain > 0 && gameBoostGain <=1) newStats[statToBoost] = clamp((newStats[statToBoost] as number) + gameBoostGain, MIN_STAT_VALUE, MAX_STAT_VALUE); // only +1 for cautious
            }
          }
          const outcomeMessage = createGameOutcomeMessage(gamePerformance, 'You played cautiously.');
          return { updatedPlayer: { ...p_action, stats: newStats }, outcomeMessage, gamePerformance };
        },
        disabled: (p) => p.stats.energy < 20,
      },
      {
        id: 'sit_out_game', text: 'Sit Out Game (Rest & Recover)', description: "You're not feeling up to playing or decide to conserve energy.",
        action: (p_action) => {
          const newStats = { ...p_action.stats };
          newStats.energy = clamp(newStats.energy + 15, 0, MAX_ENERGY);
          newStats.morale = clamp(newStats.morale - 3, 0, MAX_MORALE);
          const outcomeMessage = `You sat out the game to rest and recover. Energy +15, Morale -3.`;
          return { updatedPlayer: { ...p_action, stats: newStats }, outcomeMessage };
        },
        disabled: () => false,
      },
    ],
  };
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
          if (p.stats.charisma > 60 || p.traits.includes('Good Agent')) {
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
          } else if (p.traits.includes('Good Agent')) {
            outcomeMessage += 'Sarah thinks she can find something if you keep performing well.';
          } else {
            outcomeMessage += "Vinny says 'Leave it to me, kid!' but you're not so sure.";
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
      {
        id: 'ignore_agent',
        text: 'Politely Decline for Now',
        action: (p) => {
          return {
            updatedPlayer: p,
            outcomeMessage: "You told your agent you're focused on the game right now.",
          };
        },
      },
    ],
  };
};
