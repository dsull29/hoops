import { MAX_MORALE, MAX_STAT_VALUE, MIN_STAT_VALUE } from '../../../constants';
import type { GameEvent, Player } from '../../../types';
import { clamp } from '../../../utils';

export const hsSeniorEvents: GameEvent[] = [
  {
    id: 'hs_senior_college_apps',
    title: 'College Application Stress',
    description:
      "It's peak season for college applications. Balancing school, basketball, and your future is taking a toll.",
    type: 'contextual',
    choices: [
      {
        id: 'focus_on_apps',
        text: 'Take a night off from the gym to focus on applications.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale - 3, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You made some good progress on your applications, but you feel like you missed valuable training time. Professionalism +1, Morale -3.',
          };
        },
      },
      {
        id: 'procrastinate_apps',
        text: 'Basketball is your ticket. The apps can wait.',
        action: (p: Player) => {
          p.stats.shooting = clamp(p.stats.shooting + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - 2,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You had a great practice, but the application deadlines are looming, causing some background stress. Shooting +1, Professionalism -2.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_prom',
    title: 'Prom Night',
    description:
      'Prom is this weekend. It’s a major senior year event, but it’s also the night before a big playoff game.',
    type: 'contextual',
    choices: [
      {
        id: 'go_to_prom',
        text: 'You only get one senior prom. Go and have fun.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 15, 0, MAX_MORALE);
          p.stats.charisma = clamp(p.stats.charisma + 2, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.durability = clamp(p.stats.durability - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You had an unforgettable night, but staying out late definitely cost you some energy for the game. Morale +15, Charisma +2, Durability -1.',
          };
        },
      },
      {
        id: 'skip_prom',
        text: 'Skip prom. The team needs you at 100%.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 3,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale - 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'Your sacrifice for the team was noted by everyone, especially the coaches. Professionalism +3, Morale -5.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_last_home_game',
    title: 'Last Regular Season Home Game',
    description:
      'This is it... your last-ever home game during the regular season. The local crowd is buzzing.',
    type: 'contextual',
    choices: [
      {
        id: 'feel_the_emotion',
        text: 'Soak it all in. This is what you worked for.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The emotion of the night fuels you. You feel a deep connection to your hometown and team. Morale +10.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_scholarship_offer',
    title: 'A Scholarship Offer!',
    description:
      "A coach from a Division II school calls you personally. They're impressed with your tape and are offering you a partial scholarship.",
    type: 'contextual',
    choices: [
      {
        id: 'accept_D2_offer',
        text: 'This is a dream come true!',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 20, 0, MAX_MORALE);
          p.traits.push('College Bound (D-II)');
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You have a confirmed path to play college basketball! The weight off your shoulders is immense. Morale +20, Gained Trait: College Bound (D-II).',
          };
        },
      },
      {
        id: 'wait_for_better',
        text: 'Thank them, but hold out for a D-I offer.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You bet on yourself. It’s a risky move, but you believe in your talent. Professionalism +1, Morale +5.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_yearbook',
    title: 'Yearbook Signing',
    description:
      'Teammates are passing around yearbooks to sign. The team captain writes a long, heartfelt message in yours about your growth as a player.',
    type: 'contextual',
    choices: [
      {
        id: 'cherish_moment',
        text: "Acknowledge how far you've come.",
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 10, 0, MAX_MORALE);
          p.stats.charisma = clamp(p.stats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The message from your captain is a huge confidence booster. Morale +10, Charisma +1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_final_exam',
    title: 'Final Exams',
    description:
      "It's the week of final exams. It's tough to focus on the court with so much academic pressure.",
    type: 'contextual',
    choices: [
      {
        id: 'cram_for_exams',
        text: 'Pull an all-nighter to study.',
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.durability = clamp(p.stats.durability - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You aced your exams, but the lack of sleep has left you feeling drained. Professionalism +1, Durability -1.',
          };
        },
      },
      {
        id: 'balance_study_hoops',
        text: 'Find a balance between studying and practice.',
        action: (p: Player) => {
          p.stats.basketballIQ = clamp(p.stats.basketballIQ + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You managed your time well, feeling prepared for both your exams and the game. Basketball IQ +1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_future_talk',
    title: 'Talk of the Future',
    description:
      'In the locker room, all the other seniors are talking about their plans for next year. It makes you reflect on your own journey.',
    type: 'contextual',
    choices: [
      {
        id: 'feel_nostalgic',
        text: 'Get nostalgic about your time here.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              "It's been a long road. You feel a mix of sadness and excitement. Morale +5.",
          };
        },
      },
      {
        id: 'feel_anxious',
        text: 'Feel anxious about the uncertainty.',
        action: (p: Player) => {
          p.stats.morale = clamp(p.stats.morale - 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: 'Not knowing what comes next is starting to get to you. Morale -5.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_workout_invite',
    title: 'College Workout Invite',
    description:
      'A local D-I coach invites you to an open workout with some other top recruits. This is a huge opportunity.',
    type: 'contextual',
    choices: [
      {
        id: 'attend_workout',
        text: "Attend the workout and show them what you've got.",
        action: (p: Player) => {
          let msg = 'You held your own against top competition. ';
          if (p.stats.athleticism > 70 && p.stats.shooting > 70) {
            p.stats.professionalism = clamp(
              p.stats.professionalism + 2,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            msg += 'You definitely turned some heads. Professionalism +2.';
          } else {
            p.stats.professionalism = clamp(
              p.stats.professionalism + 1,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            msg += 'It was a valuable learning experience. Professionalism +1.';
          }
          return {
            updatedPlayer: p,
            outcomeMessage: msg,
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_prank',
    title: 'Senior Prank',
    description: "It's time for the annual senior prank. Do you participate?",
    type: 'contextual',
    choices: [
      {
        id: 'participate_in_prank',
        text: "Of course! It's a rite of passage.",
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The prank was hilarious and you feel closer to your classmates. Charisma +1, Professionalism -1.',
          };
        },
      },
      {
        id: 'sit_out_prank',
        text: "No, it's childish and risky.",
        action: (p: Player) => {
          p.stats.professionalism = clamp(
            p.stats.professionalism + 1,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage:
              'You decide to stay out of it, not wanting to risk any trouble before graduation. Professionalism +1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_injury_scare',
    title: 'Injury Scare',
    description:
      "You take a hard fall in practice and for a moment, you think it's a serious injury. Thankfully, it's just a bad bruise.",
    type: 'contextual',
    choices: [
      {
        id: 'feel_relieved',
        text: 'That was close...',
        action: (p: Player) => {
          p.stats.durability = clamp(p.stats.durability + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              'The scare makes you appreciate your health and commit to taking better care of your body. Durability +1, Morale +5.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_mentoring',
    title: 'Mentor a Freshman',
    description: 'A freshman on the team is struggling, and the coach asks you to mentor them.',
    type: 'contextual',
    choices: [
      {
        id: 'take_freshman_under_wing',
        text: 'Take them under your wing.',
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.basketballIQ = clamp(p.stats.basketballIQ + 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage:
              "Teaching the game helps you see it in a new way. You've become a real team leader. Charisma +1, Basketball IQ +1.",
          };
        },
      },
      {
        id: 'too_busy_for_freshman',
        text: "You're too busy focusing on your own future.",
        action: (p: Player) => {
          p.stats.charisma = clamp(p.stats.charisma - 1, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage: 'You brush off the request. Your focus is elsewhere. Charisma -1.',
          };
        },
      },
    ],
  },
  {
    id: 'hs_senior_last_practice',
    title: 'The Last Practice',
    description:
      "The coach calls the team together after your final practice ever. He gives a speech about the journey and the bonds you've all formed.",
    type: 'contextual',
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
  },
];
