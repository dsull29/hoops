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
          let outcomeMessage =
            'You made some good progress on your applications, but you feel like you missed valuable training time. ';
          const professionalismGain = 1 + Math.floor(Math.random() * 2); // Gain 1 or 2
          const moraleLoss = 2 + Math.floor(Math.random() * 3); // Lose 2, 3, or 4
          p.stats.professionalism = clamp(
            p.stats.professionalism + professionalismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
          outcomeMessage += `Professionalism +${professionalismGain}, Morale -${moraleLoss}.`;
          return {
            updatedPlayer: p,
            outcomeMessage,
          };
        },
      },
      {
        id: 'procrastinate_apps',
        text: 'Basketball is your ticket. The apps can wait.',
        action: (p: Player) => {
          let outcomeMessage =
            'You had a great practice, but the application deadlines are looming, causing some background stress. ';
          const shootingGain = Math.random() < 0.75 ? 1 : 0; // 75% chance to gain
          const professionalismLoss = 1 + Math.floor(Math.random() * 2);
          if (shootingGain > 0) {
            p.stats.shooting = clamp(
              p.stats.shooting + shootingGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += `Shooting +${shootingGain}. `;
          }
          p.stats.professionalism = clamp(
            p.stats.professionalism - professionalismLoss,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          outcomeMessage += `Professionalism -${professionalismLoss}.`;
          return {
            updatedPlayer: p,
            outcomeMessage,
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
          const moraleGain = 10 + Math.floor(Math.random() * 11); // Gain 10-20
          const charismaGain = Math.random() < 0.5 ? 1 : 2; // Gain 1 or 2
          const durabilityLoss = 1;
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          p.stats.charisma = clamp(p.stats.charisma + charismaGain, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.durability = clamp(
            p.stats.durability - durabilityLoss,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `You had an unforgettable night, but staying out late took its toll. Morale +${moraleGain}, Charisma +${charismaGain}, Durability -${durabilityLoss}.`,
          };
        },
      },
      {
        id: 'skip_prom',
        text: 'Skip prom. The team needs you at 100%.',
        action: (p: Player) => {
          const professionalismGain = 2 + Math.floor(Math.random() * 2); // Gain 2 or 3
          const moraleLoss = 3 + Math.floor(Math.random() * 4); // Lose 3-6
          p.stats.professionalism = clamp(
            p.stats.professionalism + professionalismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: `Your sacrifice for the team was noted by everyone, but you can't help feeling like you missed out. Professionalism +${professionalismGain}, Morale -${moraleLoss}.`,
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
          const moraleGain = 5 + Math.floor(Math.random() * 6); // Gain 5-10
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: `The emotion of the night fuels you. You feel a deep connection to your hometown and team. Morale +${moraleGain}.`,
          };
        },
      },
    ],
  },
  // {
  //   id: 'hs_senior_scholarship_offer',
  //   title: 'A Scholarship Offer!',
  //   description:
  //     "A coach from a Division II school calls you personally. They're impressed with your tape and are offering you a partial scholarship.",
  //   type: 'contextual',
  //   choices: [
  //     {
  //       id: 'accept_D2_offer',
  //       text: 'This is a dream come true!',
  //       action: (p: Player) => {
  //         if (p.traits.has('College Bound (D-II)')) {
  //           p.stats.morale = clamp(p.stats.morale + 5, 0, MAX_MORALE);
  //           return {
  //             updatedPlayer: p,
  //             outcomeMessage:
  //               'Another school showing interest! It feels good to be wanted. Morale +5.',
  //           };
  //         }
  //         p.stats.morale = clamp(p.stats.morale + 20, 0, MAX_MORALE);
  //         p.traits.set('College Bound (D-II)', 1);
  //         return {
  //           updatedPlayer: p,
  //           outcomeMessage:
  //             'You have a confirmed path to play college basketball! The weight off your shoulders is immense. Morale +20, Gained Trait: College Bound (D-II).',
  //         };
  //       },
  //     },
  //     {
  //       id: 'wait_for_better',
  //       text: 'Thank them, but hold out for a D-I offer.',
  //       action: (p: Player) => {
  //         const professionalismGain = Math.random() < 0.6 ? 1 : 2;
  //         const moraleGain = Math.random() < 0.6 ? 5 : 3;
  //         p.stats.professionalism = clamp(
  //           p.stats.professionalism + professionalismGain,
  //           MIN_STAT_VALUE,
  //           MAX_STAT_VALUE
  //         );
  //         p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
  //         return {
  //           updatedPlayer: p,
  //           outcomeMessage: `You bet on yourself. It’s a risky move, but you believe in your talent. Professionalism +${professionalismGain}, Morale +${moraleGain}.`,
  //         };
  //       },
  //     },
  //   ],
  // },
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
          const moraleGain = 8 + Math.floor(Math.random() * 5); // 8-12
          const charismaGain = 1;
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          p.stats.charisma = clamp(p.stats.charisma + charismaGain, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage: `The message from your captain is a huge confidence booster. Morale +${moraleGain}, Charisma +${charismaGain}.`,
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
          let outcomeMessage =
            'You aced your exams, but the lack of sleep has left you feeling drained. ';
          const professionalismGain = Math.random() < p.stats.professionalism / 100 ? 2 : 1;
          const durabilityLoss = Math.random() < p.stats.durability / 100 ? 1 : 2;
          p.stats.professionalism = clamp(
            p.stats.professionalism + professionalismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          p.stats.durability = clamp(
            p.stats.durability - durabilityLoss,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          outcomeMessage += `Professionalism +${professionalismGain}, Durability -${durabilityLoss}.`;
          return {
            updatedPlayer: p,
            outcomeMessage,
          };
        },
      },
      {
        id: 'balance_study_hoops',
        text: 'Find a balance between studying and practice.',
        action: (p: Player) => {
          let outcomeMessage =
            'You managed your time well, feeling prepared for both your exams and the game. ';
          const iqGain = Math.random() < p.stats.basketballIQ / 100 ? 2 : 1;
          p.stats.basketballIQ = clamp(
            p.stats.basketballIQ + iqGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          outcomeMessage += `Basketball IQ +${iqGain}.`;
          return {
            updatedPlayer: p,
            outcomeMessage,
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
          const moraleGain = 3 + Math.floor(Math.random() * 5); // 3-7
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: `It's been a long road. You feel a mix of sadness and excitement. Morale +${moraleGain}.`,
          };
        },
      },
      {
        id: 'feel_anxious',
        text: 'Feel anxious about the uncertainty.',
        action: (p: Player) => {
          const moraleLoss = 3 + Math.floor(Math.random() * 5); // 3-7
          p.stats.morale = clamp(p.stats.morale - moraleLoss, 0, MAX_MORALE);
          return {
            updatedPlayer: p,
            outcomeMessage: `Not knowing what comes next is starting to get to you. Morale -${moraleLoss}.`,
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
          let msg = 'You went to the workout and held your own against top competition. ';
          const roll = Math.random();
          const skillCheck = (p.stats.athleticism + p.stats.shooting) / 200; // Value between 0.1 and 0.99
          if (roll < skillCheck) {
            const profGain = 2;
            p.stats.professionalism = clamp(
              p.stats.professionalism + profGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            msg += `You definitely turned some heads! Professionalism +${profGain}.`;
          } else {
            const profGain = 1;
            p.stats.professionalism = clamp(
              p.stats.professionalism + profGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            msg += `It was a valuable learning experience. Professionalism +${profGain}.`;
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
          const charismaGain = 1;
          const professionalismLoss = Math.random() < 0.5 ? 1 : 2;
          p.stats.charisma = clamp(p.stats.charisma + charismaGain, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.professionalism = clamp(
            p.stats.professionalism - professionalismLoss,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `The prank was hilarious and you feel closer to your classmates. Charisma +${charismaGain}, Professionalism -${professionalismLoss}.`,
          };
        },
      },
      {
        id: 'sit_out_prank',
        text: "No, it's childish and risky.",
        action: (p: Player) => {
          const professionalismGain = Math.random() < 0.5 ? 1 : 2;
          p.stats.professionalism = clamp(
            p.stats.professionalism + professionalismGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
          return {
            updatedPlayer: p,
            outcomeMessage: `You decide to stay out of it, not wanting to risk any trouble before graduation. Professionalism +${professionalismGain}.`,
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
          const durabilityGain = Math.random() < 0.3 ? 1 : 0; // 30% chance for a permanent lesson
          const moraleGain = 5 + Math.floor(Math.random() * 3); // 5-7
          let outcomeMessage = 'The scare makes you appreciate your health. ';
          if (durabilityGain > 0) {
            p.stats.durability = clamp(
              p.stats.durability + durabilityGain,
              MIN_STAT_VALUE,
              MAX_STAT_VALUE
            );
            outcomeMessage += `You commit to taking better care of your body. Durability +${durabilityGain}. `;
          }
          p.stats.morale = clamp(p.stats.morale + moraleGain, 0, MAX_MORALE);
          outcomeMessage += `Morale +${moraleGain}.`;
          return {
            updatedPlayer: p,
            outcomeMessage: outcomeMessage,
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
          const charismaGain = 1;
          const iqGain = 1;
          p.stats.charisma = clamp(p.stats.charisma + charismaGain, MIN_STAT_VALUE, MAX_STAT_VALUE);
          p.stats.basketballIQ = clamp(
            p.stats.basketballIQ + iqGain,
            MIN_STAT_VALUE,
            MAX_STAT_VALUE
          );
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
          const charismaLoss = 1;
          p.stats.charisma = clamp(p.stats.charisma - charismaLoss, MIN_STAT_VALUE, MAX_STAT_VALUE);
          return {
            updatedPlayer: p,
            outcomeMessage: `You brush off the request. Your focus is elsewhere. Charisma -${charismaLoss}.`,
          };
        },
      },
    ],
  },
];
