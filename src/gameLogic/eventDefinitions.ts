  import { MIN_STAT_VALUE, MAX_STAT_VALUE, MAX_ENERGY, MAX_MORALE } from "../constants";
  import { clamp } from "../utils";
  import { Player, GameEvent, Choice, PlayerStats} from "../types";
  
  export const createDailyChoiceEvent = (player: Player): GameEvent => {
    const choices: Choice[] = [
      {
        id: 'train_shooting', text: 'Train Shooting', description: 'Hit the gym to work on your jumper.', cost: { stat: 'energy', amount: 20 },
        action: (p) => {
          const newStats = { ...p.stats }; const gain = Math.random() < (newStats.professionalism / MAX_STAT_VALUE) ? 2 : 1;
          newStats.shooting = clamp(newStats.shooting + gain, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY);
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Focused on shooting. ${gain > 1 ? "Felt a real improvement!" : "Good session."} Shooting +${gain}, Energy -20.`};
        },
        disabled: (p) => p.stats.energy < 20,
      },
      {
        id: 'train_athleticism', text: 'Train Athleticism', description: 'Conditioning and strength training.', cost: { stat: 'energy', amount: 25 },
        action: (p) => {
          const newStats = { ...p.stats }; const gain = Math.random() < (newStats.professionalism / MAX_STAT_VALUE) ? 2 : 1;
          newStats.athleticism = clamp(newStats.athleticism + gain, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.energy = clamp(newStats.energy - 25, 0, MAX_ENERGY);
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Pushed hard on athleticism. ${gain > 1 ? "Feeling stronger!" : "Solid workout."} Athleticism +${gain}, Energy -25.`};
        },
        disabled: (p) => p.stats.energy < 25,
      },
      {
        id: 'study_film', text: 'Study Film', description: 'Analyze game footage to improve your BBIQ.', cost: { stat: 'energy', amount: 10 },
        action: (p) => {
          const newStats = { ...p.stats }; const gain = Math.random() < (newStats.professionalism / MAX_STAT_VALUE) ? 2 : 1;
          newStats.basketballIQ = clamp(newStats.basketballIQ + gain, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY);
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `Spent time studying film. ${gain > 1 ? "Key insights gained!" : "Learned a few things."} BBIQ +${gain}, Energy -10.`};
        },
        disabled: (p) => p.stats.energy < 10,
      },
      {
        id: 'rest', text: 'Rest & Recover', description: 'Take a day off to recover energy and morale.',
        action: (p) => {
          const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy + 30 + Math.floor(Math.random() * 11), 0, MAX_ENERGY);
          newStats.morale = clamp(newStats.morale + 5 + Math.floor(Math.random() * 6), 0, MAX_MORALE);
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: 'Took a much-needed rest day. Feeling refreshed. Energy and Morale increased.'};
        },
      },
      {
        id: 'social_event', text: 'Attend Social Event', description: 'Hang out with teammates or attend a public function.', cost: { stat: 'energy', amount: 15 },
        action: (p) => {
          const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy - 15, 0, MAX_ENERGY); let outcomeMessage = 'Attended a social event. ';
          const charismaRoll = Math.random();
          if (charismaRoll < 0.3) { newStats.charisma = clamp(newStats.charisma - 2, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE); outcomeMessage += 'It was a bit awkward. Charisma -2, Morale -5.'; }
          else if (charismaRoll < 0.7) { newStats.charisma = clamp(newStats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE); outcomeMessage += 'Made a few connections. Charisma +1.'; }
          else { newStats.charisma = clamp(newStats.charisma + 3, MIN_STAT_VALUE, MAX_STAT_VALUE); newStats.morale = clamp(newStats.morale + 10, 0, MAX_MORALE); outcomeMessage += 'It was a great time! Charisma +3, Morale +10.';}
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
        },
        disabled: (p) => p.stats.energy < 15,
      },
    ];
    return { id: 'daily_choices', title: `Season ${player.currentSeason}, Day ${player.currentDayInSeason} (${player.age} y.o.)`, description: 'What will you focus on today?', choices: choices };
  };

  export const minorInjuryEvent: GameEvent = {
    id: 'minor_injury', title: 'Minor Injury!', description: 'You tweaked something during a light workout. Aches and pains are part of the game.', isMandatory: true,
    choices: [{
        id: 'acknowledge_injury', text: 'Okay, I need to be careful.',
        action: (p) => {
          const newStats = { ...p.stats }; const statToHit = ['athleticism', 'shooting'][Math.floor(Math.random() * 2)] as keyof PlayerStats;
          const reduction = 1 + Math.floor(Math.random() * 3); newStats[statToHit] = clamp(newStats[statToHit] as number - reduction, MIN_STAT_VALUE, MAX_STAT_VALUE);
          newStats.energy = clamp(newStats.energy - 10, 0, MAX_ENERGY); newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE);
          return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage: `The injury set you back a bit. ${statToHit} -${reduction}, Energy -10, Morale -5.`};
        },
    }],
  };

  export const gameDayEvent = (player: Player): GameEvent => {
    return {
      id: 'game_day', title: `Game Day! (Season ${player.currentSeason}, Day ${player.currentDayInSeason})`, description: "It's time to hit the court. How will you approach this game?", isMandatory: true,
      choices: [
        {
          id: 'play_hard', text: 'Play Hard (High Risk/Reward)', cost: { stat: 'energy', amount: 30 },
          action: (p) => {
            const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy - 30 - Math.floor(Math.random() * 10), 0, MAX_ENERGY); let outcomeMessage = 'You played hard! ';
            const performanceScore = (newStats.shooting + newStats.athleticism + newStats.basketballIQ) / 3 + (Math.random() * 20 - 10);
            if (performanceScore > 65) { newStats.morale = clamp(newStats.morale + 15, 0, MAX_MORALE); const statBoost = ['shooting', 'athleticism', 'basketballIQ'][Math.floor(Math.random() * 3)] as keyof PlayerStats; newStats[statBoost] = clamp(newStats[statBoost] as number + 1, MIN_STAT_VALUE, MAX_STAT_VALUE); outcomeMessage += `Stellar performance! You led the team. Morale +15, ${statBoost} +1.`; }
            else if (performanceScore > 45) { newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE); outcomeMessage += 'Solid contribution to the team. Morale +5.'; }
            else { newStats.morale = clamp(newStats.morale - 10, 0, MAX_MORALE); outcomeMessage += "Tough game, couldn't find your rhythm. Morale -10."; }
            return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
          },
          disabled: (p) => p.stats.energy < 40,
        },
        {
          id: 'play_cautiously', text: 'Play Cautiously (Low Risk/Reward)', cost: { stat: 'energy', amount: 20 },
          action: (p) => {
            const newStats = { ...p.stats }; newStats.energy = clamp(newStats.energy - 20, 0, MAX_ENERGY); let outcomeMessage = 'You played cautiously. ';
            const performanceScore = (newStats.shooting + newStats.athleticism + newStats.basketballIQ) / 3 + (Math.random() * 10 - 5);
            if (performanceScore > 55) { newStats.morale = clamp(newStats.morale + 5, 0, MAX_MORALE); outcomeMessage += 'Played your role effectively. Morale +5.'; }
            else { newStats.morale = clamp(newStats.morale - 5, 0, MAX_MORALE); outcomeMessage += "Quiet game, didn't make much of an impact. Morale -5."; }
            return { updatedPlayer: { ...p, stats: newStats }, outcomeMessage };
          },
          disabled: (p) => p.stats.energy < 20,
        },
      ],
    };
  };

  export const agentMeetingEvent = (player: Player): GameEvent => {
    return {
        id: 'agent_meeting', title: 'Agent Meeting', description: `Your agent, ${player.traits.includes('Good Agent') ? 'the reliable Sarah Chen,' : 'the somewhat shady Vinny "The Shark" Gambino,'} wants to discuss your future.`, isMandatory: true,
        choices: [
            { id: 'discuss_contract', text: 'Discuss Contract Situation', action: (p) => { let outcomeMessage = "You discussed your contract. "; if (p.stats.charisma > 60 || p.traits.includes('Good Agent')) { outcomeMessage += "Your agent seems confident they can get you a good deal soon."; p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE); } else { outcomeMessage += "The conversation was a bit tense. No clear path forward yet."; p.stats.morale = clamp(p.stats.morale - 3, 0, MAX_MORALE); } return { updatedPlayer: p, outcomeMessage }; }},
            { id: 'seek_endorsement', text: 'Seek Endorsement Opportunities', action: (p) => { let outcomeMessage = "Your agent will look into endorsement deals. "; if (p.stats.charisma > 70 && p.stats.shooting + p.stats.athleticism > 120) { outcomeMessage += "A local shoe store offers you a small deal! Morale +10."; p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE); } else if (p.traits.includes('Good Agent')) { outcomeMessage += "Sarah thinks she can find something if you keep performing well."; } else { outcomeMessage += "Vinny says 'Leave it to me, kid!' but you're not so sure."; } return { updatedPlayer: p, outcomeMessage }; }},
            { id: 'ignore_agent', text: 'Politely Decline for Now', action: (p) => { return { updatedPlayer: p, outcomeMessage: "You told your agent you're focused on the game right now." }; }}
        ]
    };
  };
