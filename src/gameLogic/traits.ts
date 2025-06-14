import type { PlayerStats, PlayerTrait } from '../types';

export type TraitCategory = 'GAME_PERFORMANCE' | 'STAT_BOOST' | 'CAREER_PROGRESSION';

export const TraitCategory = {
  GAME_PERFORMANCE: 'GAME_PERFORMANCE' as TraitCategory,
  STAT_BOOST: 'STAT_BOOST' as TraitCategory,
  CAREER_PROGRESSION: 'CAREER_PROGRESSION' as TraitCategory,
};

interface TraitLevel {
  level: number;
  description: string;
  effects: {
    statBoost?: {
      stat: keyof PlayerStats;
      value: number;
    };
    performanceMultiplier?: {
      stat: 'points' | 'rebounds' | 'assists';
      multiplier: number;
    };
    winChanceBonus?: number;
  };
}

export interface TraitDefinition {
  name: PlayerTrait;
  category: TraitCategory;
  levels: TraitLevel[];
}

export const TRAIT_DEFINITIONS: Map<PlayerTrait, TraitDefinition> = new Map([
  [
    "Coach's Son",
    {
      name: "Coach's Son",
      category: TraitCategory.STAT_BOOST,
      levels: [
        {
          level: 1,
          description: 'Starts with a significant boost to Basketball IQ.',
          effects: { statBoost: { stat: 'basketballIQ', value: 10 } },
        },
      ],
    },
  ],
  [
    'Gym Rat',
    {
      name: 'Gym Rat',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Slightly improves all in-game actions.',
          effects: { winChanceBonus: 0.02 },
        },
        {
          level: 2,
          description: 'Improves all in-game actions.',
          effects: { winChanceBonus: 0.04 },
        },
        {
          level: 3,
          description: 'Greatly improves all in-game actions.',
          effects: { winChanceBonus: 0.06 },
        },
      ],
    },
  ],
  [
    'Floor Raiser',
    {
      name: 'Floor Raiser',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Boosts assist generation.',
          effects: { performanceMultiplier: { stat: 'assists', multiplier: 1.1 } },
        },
        {
          level: 2,
          description: 'Significantly boosts assist generation.',
          effects: {
            performanceMultiplier: { stat: 'assists', multiplier: 1.15 },
            winChanceBonus: 0.03,
          },
        },
        {
          level: 3,
          description: 'Greatly boosts assists and improves team win chance.',
          effects: {
            performanceMultiplier: { stat: 'assists', multiplier: 1.2 },
            winChanceBonus: 0.05,
          },
        },
      ],
    },
  ],
  [
    'Sniper',
    {
      name: 'Sniper',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'A deadly shooter who gets a boost to scoring.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.08 } },
        },
        {
          level: 2,
          description: 'A lethal shooter who gets a significant boost to scoring.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.12 } },
        },
        {
          level: 3,
          description: 'One of the best shooters alive, with a massive boost to scoring.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.16 } },
        },
      ],
    },
  ],
  [
    'Rim Runner',
    {
      name: 'Rim Runner',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Excels at scoring near the basket.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.05 } },
        },
        {
          level: 2,
          description: 'A powerful force driving to the hoop.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.1 } },
        },
      ],
    },
  ],
  [
    'Shot Blocker',
    {
      name: 'Shot Blocker',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        { level: 1, description: 'A solid defensive presence.', effects: { winChanceBonus: 0.03 } },
        {
          level: 2,
          description: 'A dominant defensive anchor.',
          effects: {
            winChanceBonus: 0.06,
            performanceMultiplier: { stat: 'rebounds', multiplier: 1.05 },
          },
        },
      ],
    },
  ],

  // --- SCORING ---
  [
    'Microwave',
    {
      name: 'Microwave',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Can get hot in an instant, providing a small random boost to scoring.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.05 } },
        },
      ],
    },
  ],
  [
    'Clutch Gene',
    {
      name: 'Clutch Gene',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Performs better in big moments, increasing win chance in playoff games.',
          effects: { winChanceBonus: 0.05 },
        },
      ],
    },
  ],
  [
    'And-One King',
    {
      name: 'And-One King',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Adept at drawing contact, boosting morale after high-scoring games.',
          effects: {},
        },
      ],
    },
  ], // Effect handled via events
  [
    'Post Scorer',
    {
      name: 'Post Scorer',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Effective at scoring with their back to the basket.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.07 } },
        },
      ],
    },
  ],
  [
    'Slasher',
    {
      name: 'Slasher',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Gets a bonus to scoring by driving to the hoop.',
          effects: { performanceMultiplier: { stat: 'points', multiplier: 1.06 } },
        },
      ],
    },
  ],

  // --- PLAYMAKING ---
  [
    'Dimer',
    {
      name: 'Dimer',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'A gifted passer with a higher ceiling for assist totals.',
          effects: { performanceMultiplier: { stat: 'assists', multiplier: 1.1 } },
        },
      ],
    },
  ],
  [
    'Pick & Roll Maestro',
    {
      name: 'Pick & Roll Maestro',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Thrives in the two-man game.',
          effects: {
            performanceMultiplier: { stat: 'assists', multiplier: 1.05 },
            winChanceBonus: 0.02,
          },
        },
      ],
    },
  ],
  [
    'Lob City Passer',
    {
      name: 'Lob City Passer',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Boosts team morale with flashy, high-flying assists.',
          effects: {},
        },
      ],
    },
  ], // Effect handled via events
  [
    'Steady Hand',
    {
      name: 'Steady Hand',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'Less prone to negative outcomes from high-pressure events.',
          effects: {},
        },
      ],
    },
  ],

  // --- DEFENSE ---
  [
    'Perimeter Lockdown',
    {
      name: 'Perimeter Lockdown',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'An elite on-ball defender who makes it tough on opposing scorers.',
          effects: { winChanceBonus: 0.04 },
        },
      ],
    },
  ],
  [
    'Pick Pocket',
    {
      name: 'Pick Pocket',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Adept at creating turnovers.',
          effects: { winChanceBonus: 0.02 },
        },
      ],
    },
  ],
  [
    'Defensive Anchor',
    {
      name: 'Defensive Anchor',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'The cornerstone of the defense.',
          effects: { winChanceBonus: 0.05 },
        },
      ],
    },
  ],
  [
    'Rebound Chaser',
    {
      name: 'Rebound Chaser',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Has a nose for the ball, boosting rebound numbers.',
          effects: { performanceMultiplier: { stat: 'rebounds', multiplier: 1.15 } },
        },
      ],
    },
  ],

  // --- PHYSICAL ---
  [
    'Iron Man',
    {
      name: 'Iron Man',
      category: TraitCategory.STAT_BOOST,
      levels: [
        {
          level: 1,
          description: 'Extremely durable and less prone to injury.',
          effects: { statBoost: { stat: 'durability', value: 15 } },
        },
      ],
    },
  ],
  [
    'Second Wind',
    {
      name: 'Second Wind',
      category: TraitCategory.GAME_PERFORMANCE,
      levels: [
        {
          level: 1,
          description: 'Seems to get stronger as the game goes on.',
          effects: { winChanceBonus: 0.03 },
        },
      ],
    },
  ],
  [
    'High Motor',
    {
      name: 'High Motor',
      category: TraitCategory.STAT_BOOST,
      levels: [
        {
          level: 1,
          description: 'A tireless player who gives maximum effort.',
          effects: { statBoost: { stat: 'durability', value: 5 } },
        },
      ],
    },
  ],
  [
    'Natural Athlete',
    {
      name: 'Natural Athlete',
      category: TraitCategory.STAT_BOOST,
      levels: [
        {
          level: 1,
          description: 'Gifted with a high level of raw athleticism.',
          effects: { statBoost: { stat: 'athleticism', value: 8 } },
        },
      ],
    },
  ],
  [
    'Glass Cannon',
    {
      name: 'Glass Cannon',
      category: TraitCategory.STAT_BOOST,
      levels: [
        {
          level: 1,
          description: 'An offensive force with very low durability.',
          effects: { statBoost: { stat: 'shooting', value: 10 } },
        },
      ],
    },
  ], // The durability penalty is applied at creation

  // --- MENTAL & CAREER ---
  [
    'Team Leader',
    {
      name: 'Team Leader',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'The vocal leader of the team, boosts morale after wins.',
          effects: {},
        },
      ],
    },
  ],
  [
    'Media Darling',
    {
      name: 'Media Darling',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'Handles the media with ease, gaining extra charisma.',
          effects: { statBoost: { stat: 'charisma', value: 10 } },
        },
      ],
    },
  ],
  [
    'Fan Favorite',
    {
      name: 'Fan Favorite',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'Beloved by the home crowd, boosting morale in home games.',
          effects: {},
        },
      ],
    },
  ],
  [
    'Late Bloomer',
    {
      name: 'Late Bloomer',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'Slower initial progression, but unlocks higher potential later.',
          effects: {},
        },
      ],
    },
  ],
  [
    'Student of the Game',
    {
      name: 'Student of the Game',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [{ level: 1, description: 'Gains Basketball IQ slightly faster.', effects: {} }],
    },
  ],
  [
    'Enigmatic',
    {
      name: 'Enigmatic',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [{ level: 1, description: 'Prone to wild swings in morale.', effects: {} }],
    },
  ],
  [
    'Underrated',
    {
      name: 'Underrated',
      category: TraitCategory.CAREER_PROGRESSION,
      levels: [
        {
          level: 1,
          description: 'Starts with a lower role but has a higher chance for breakout events.',
          effects: {},
        },
      ],
    },
  ],
]);
