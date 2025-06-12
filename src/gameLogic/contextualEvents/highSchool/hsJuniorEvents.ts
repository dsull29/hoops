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
          if (p.stats.professionalism > 50 || Math.random() < 0.5) {
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
          if (p.stats.charisma > 55 && Math.random() < 0.4) {
            newStats.basketballIQ = clamp(
              newStats.basketballIQ - 2,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += 'You made a few flashy but poor decisions. Basketball IQ -2.';
          } else {
            newStats.shooting = clamp(newStats.shooting + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
            outcomeMessage +=
              'Your confidence was infectious, and you hit some tough shots. Shooting +1.';
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
          newStats.charisma = clamp(newStats.charisma + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          newStats.professionalism = clamp(
            newStats.professionalism - 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage:
              'You had a great time at the party and made some new friends, but you felt a step slow in practice the next day. Charisma +2, Professionalism -2.',
          };
        },
      },
      {
        id: 'skip_party',
        text: 'Skip it and get some rest',
        action: (p: Player) => {
          const newStats = { ...p.stats };
          newStats.professionalism = clamp(
            newStats.professionalism + 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: { ...p, stats: newStats },
            outcomeMessage:
              'You skipped the party to focus on basketball. The coaches noticed your dedication. Professionalism +2.',
          };
        },
      },
    ],
  },
  // --- NEW EVENTS ---
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
          if (p.stats.charisma > 60) {
            outcomeMessage += 'Your comeback was legendary! Morale +5.';
            p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          } else {
            outcomeMessage += 'You probably should have just stayed quiet. Morale -5.';
            p.stats.morale = clamp(p.stats.morale - 5, 0, MAX_MORALE);
          }
          return { updatedPlayer: p, outcomeMessage };
        },
      },
      {
        id: 'ignore_rival',
        text: 'Ignore it. "Actions speak louder than words."',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: 'You took the high road and ignored the noise. Professionalism +1.',
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
          p.stats.professionalism = clamp(
            p.stats.professionalism + 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.basketballIQ = clamp(p.stats.basketballIQ + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You spent the week catching up on schoolwork. Your grades are back on track. Professionalism +2, Basketball IQ +1.',
          };
        },
      },
      {
        id: 'ask_teammate_for_help',
        text: 'Ask the team captain for tutoring help.',
        action: (p: Player) => {
          let outcomeMessage = 'You asked the captain for help. ';
          if (p.stats.charisma > 50) {
            p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
            outcomeMessage += 'They were happy to help, and you both learned something. Morale +5.';
          } else {
            p.stats.morale = clamp(p.stats.morale - 2, 0, MAX_MORALE);
            outcomeMessage += 'It was a little awkward, but you got the help you needed.';
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
          p.stats.athleticism = clamp(p.stats.athleticism + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.durability = clamp(p.stats.durability + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You feel stronger and more imposing on the court. Athleticism +2, Durability +1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_film_session',
    title: 'Coach Film Session',
    description:
      'The head coach has invited you to a one-on-one film session to break down your recent performances.',
    type: 'contextual',
    choices: [
      {
        id: 'attend_film_session',
        text: 'Go and absorb everything you can.',
        action: (p: Player) => {
          p.stats.basketballIQ = clamp(p.stats.basketballIQ + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The session was incredibly helpful. You see the game in a new light. Basketball IQ +2, Professionalism +1.',
          };
        },
      },
      {
        id: 'decline_film_session',
        text: "Politely decline, you'd rather get shots up.",
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism - 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: 'The coach seemed disappointed with your decision. Professionalism -2.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_newspaper_article',
    title: 'Local Paper Feature',
    description:
      'The local newspaper ran a small article about your improving play and potential as a key player for the team.',
    type: 'contextual',
    choices: [
      {
        id: 'get_big_headed',
        text: 'Let it get to your head.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You let the hype get to you, becoming a little too cocky in practice. Charisma +2, Professionalism -1.',
          };
        },
      },
      {
        id: 'stay_humble',
        text: 'Appreciate it, but stay focused.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You appreciated the recognition but know the work is just beginning. Morale +5, Professionalism +1.',
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
          p.stats.shooting = clamp(p.stats.shooting + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You lived in the gym and finally broke through the slump, your confidence restored. Shooting +1, Professionalism +1.',
          };
        },
      },
      {
        id: 'mental_break',
        text: 'Take a day off from shooting to clear your head.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You took a day to relax and came back to practice feeling refreshed. Morale +5.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_argument',
    title: 'Teammate Argument',
    description:
      'You and a teammate get into a heated argument over a missed defensive assignment in practice.',
    type: 'contextual',
    choices: [
      {
        id: 'apologize',
        text: 'Apologize and smooth things over.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              "You talked it out after practice and squashed the beef. It's all good. Charisma +1, Morale +5.",
          };
        },
      },
      {
        id: 'hold_ground',
        text: 'Hold your ground. You were right.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale - 5, 0, MAX_MORALE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              "The tension didn't go away, making the next few practices awkward. Morale -5, Professionalism -1.",
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_volunteer',
    title: 'Youth Clinic',
    description:
      'The team has been asked to help run a basketball clinic for local kids this weekend.',
    type: 'contextual',
    choices: [
      {
        id: 'volunteer_eagerly',
        text: 'Jump at the chance to help.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You had a blast teaching the kids and the community appreciated it. Charisma +2, Morale +5.',
          };
        },
      },
      {
        id: 'do_minimum',
        text: 'Go, but do the bare minimum.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You showed up, but your lack of enthusiasm was noticeable. Charisma -1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_date_night',
    title: 'A New Admirer',
    description: "Someone you've had your eye on in school asks you out on a date this Friday.",
    type: 'contextual',
    choices: [
      {
        id: 'say_yes_to_date',
        text: 'Say yes! There is more to life than basketball.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You had a great time and feel more balanced as a person. Charisma +2, Morale +5, Professionalism -1.',
          };
        },
      },
      {
        id: 'say_no_to_date',
        text: 'Politely decline. You have to practice.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'Your dedication is unwavering. The coaches love to see it. Professionalism +2.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_family_pressure',
    title: 'Scholarship Pressure',
    description:
      "Your parents sit you down for a 'serious' talk about the importance of getting a college scholarship.",
    type: 'contextual',
    choices: [
      {
        id: 'use_as_motivation',
        text: 'Use their pressure as fuel.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale - 2, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              "The pressure is a lot, but you're determined to use it to push yourself harder. Professionalism +1, Morale -2.",
          };
        },
      },
      {
        id: 'let_it_get_to_you',
        text: 'Let the pressure get to you.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale - 10, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The weight of their expectations is crushing, making it hard to enjoy the game. Morale -10.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_twisted_ankle',
    title: 'Twisted Ankle',
    description:
      "You land awkwardly on a teammate's foot in practice and twist your ankle. It's not a major injury, but it's painful.",
    type: 'contextual',
    choices: [
      {
        id: 'acknowledge_ankle_twist',
        text: 'This sucks.',
        action: (p: Player) => {
          p.stats.durability = clamp(p.stats.durability - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.morale = clamp(p.stats.morale - 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              "It's a minor setback, but a reminder of how fragile a career can be. Durability -1, Morale -5.",
          };
        },
      },
    ],
  },
  {
    id: 'hs_junior_captain_praise',
    title: "Captain's Praise",
    description:
      'The team captain pulls you aside after practice and praises your hard work and improvement this season.',
    type: 'contextual',
    choices: [
      {
        id: 'accept_praise',
        text: 'Thank them sincerely.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE);
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              "The captain's words mean a lot and motivate you to keep grinding. Morale +10, Professionalism +1.",
          };
        },
      },
    ],
  },
];
