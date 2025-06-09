export type GameMode = 'High School' | 'College' | 'Professional';
export type HighSchoolRole =
  | 'Freshman Newcomer'
  | 'Sophomore Contender'
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
  | 'All-League Performer'
  | 'MVP Candidate';
export type PlayerRole = HighSchoolRole | CollegeRole | ProfessionalRole;

export interface PlayerStats {
  shooting: number;
  athleticism: number;
  basketballIQ: number;
  charisma: number;
  professionalism: number;
  energy: number;
  morale: number;
  skillPoints: number;
}

export interface Player {
  name: string;
  position: string;
  age: number;
  gameMode: GameMode;
  currentRole: PlayerRole;
  stats: PlayerStats;
  traits: string[];
  currentSeason: number;
  currentSeasonInMode: number;
  currentDayInSeason: number;
  totalDaysPlayed: number;
  careerOver: boolean;
  careerLog: string[];
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
    gamePerformance?: { statLine: GameStatLine; teamWon: boolean }; // For game day event
  };
  cost?: { stat: keyof PlayerStats; amount: number };
  disabled?: (player: Player) => boolean;
}

export interface GameEvent {
  id: string;
  title: string;
  description: string;
  choices: Choice[];
  isMandatory?: boolean;
  type?: 'daily' | 'gameDay' | 'injury' | 'agent' | 'contextual';
}

export interface GameState {
  player: Player | null;
  currentEvent: GameEvent | null;
  isLoading: boolean;
  gamePhase: 'menu' | 'playing' | 'gameOver';
}
