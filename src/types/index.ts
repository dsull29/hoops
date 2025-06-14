// src/types/index.ts
import type { Team } from './teams';

export type GameMode = 'High School' | 'College' | 'Professional';
export type HighSchoolRole =
  | 'Junior Varsity Player'
  | 'Varsity Rotation'
  | 'Varsity Starter'
  | 'Team Captain'
  | 'District Star'
  | 'All-State Contender'
  | 'All-American Prospect';
export type CollegeRole =
  | 'Walk-On Hopeful'
  | 'Practice Squad Player'
  | 'Bench Warmer'
  | 'End of Bench Specialist'
  | 'Rotation Player'
  | 'Key Substitute (6th Man)'
  | 'Starter'
  | 'Conference Star'
  | 'All-American Candidate'
  | 'Top Draft Prospect';
export type ProfessionalRole =
  | 'Undrafted Free Agent'
  | 'G-League Assignee'
  | 'Two-Way Contract Player'
  | 'End of Bench Pro'
  | 'Rotation Contributor'
  | 'Valuable Sixth Man'
  | 'Starting Caliber Player'
  | 'Established Star'
  | 'All-Star Level Player'
  | 'All-League Player'
  | 'MVP Candidate';
export type PlayerRole = HighSchoolRole | CollegeRole | ProfessionalRole;

export interface PlayerStats {
  shooting: number;
  athleticism: number;
  basketballIQ: number;
  charisma: number;
  professionalism: number;
  // FIX: Replaced energy with durability
  durability: number;
  morale: number;
  skillPoints: number;
}

export type ScheduleItemType = 'Practice' | 'Game' | 'Playoffs' | 'Championship' | 'Rest';

export interface DailyScheduleItem {
  day: number;
  type: ScheduleItemType;
  opponent?: string;
  opponentId?: string; // Add opponentId for linking to the team object
  gameResult?: {
    playerStats: GameStatLine;
    teamWon: boolean;
  };
  isCompleted: boolean;
}

export interface SeasonSchedule {
  year: number;
  gameMode: GameMode;
  schedule: DailyScheduleItem[];
  wins: number;
  losses: number;
  playoffEliminated: boolean;
}

export type PlayerTrait =
  | "Coach's Son"
  | 'Gym Rat'
  | 'Floor Raiser'
  | 'Rim Runner'
  | 'Shot Blocker'
  | 'Sniper'
  // Scoring
  | 'Microwave'
  | 'Clutch Gene'
  | 'And-One King'
  | 'Post Scorer'
  | 'Slasher'
  // Playmaking
  | 'Dimer'
  | 'Pick & Roll Maestro'
  | 'Lob City Passer'
  | 'Steady Hand'
  // Defense
  | 'Perimeter Lockdown'
  | 'Pick Pocket'
  | 'Defensive Anchor'
  | 'Rebound Chaser'
  // Physical
  | 'Iron Man'
  | 'Second Wind'
  | 'High Motor'
  | 'Natural Athlete'
  | 'Glass Cannon'
  // Mental & Career
  | 'Team Leader'
  | 'Media Darling'
  | 'Fan Favorite'
  | 'Late Bloomer'
  | 'Student of the Game'
  | 'Enigmatic'
  | 'Underrated';

export interface Player {
  name: string;
  position: string;
  age: number;
  teamId: string; // The ID of the team the player is currently on
  gameMode: GameMode;
  currentRole: PlayerRole;
  stats: PlayerStats;
  traits: Map<PlayerTrait, number>;
  currentSeason: number;
  currentSeasonInMode: number;
  careerOver: boolean;
  careerLog: string[];

  currentDayInSeason: number;
  totalDaysPlayed: number;
  schedule: SeasonSchedule;
}

export interface GameStatLine {
  points: number;
  rebounds: number;
  assists: number;
  minutes: number;
}

export interface Choice {
  id: string;
  text: string;
  description?: string;
  action: (player: Player) => {
    updatedPlayer: Player;
    outcomeMessage: string;
    immediateEvent?: GameEvent | null;
    gamePerformance?: { statLine: GameStatLine; teamWon: boolean };
  };
  cost?: { stat: keyof PlayerStats; amount: number };
  disabled?: (player: Player) => boolean;
}

export type GameEventType =
  | 'daily'
  | 'gameDay'
  | 'injury'
  | 'agent'
  | 'contextual'
  | 'weekly'
  | 'scheduled';

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  isMandatory?: boolean;
  type?: GameEventType;
}

export interface GameState {
  player: Player | null;
  teams: Team[]; // Array to hold all teams in the game world
  currentEvent: GameEvent | null;
  isLoading: boolean;
  gamePhase: 'menu' | 'playing' | 'gameOver';
}
