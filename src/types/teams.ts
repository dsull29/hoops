// src/types/teams.ts
import type { GameMode } from './index';

// --- Team Style & Tendency Enums ---

export type TeamPace = 'Uptempo' | 'Balanced' | 'Gritty';
export type OffensiveFocus = 'Perimeter' | 'Interior' | 'Balanced';
export type DefensiveScheme = 'Man-to-Man' | 'Zone' | 'Press';

// --- Coach-related Types ---

export type CoachTrait =
  | 'Player Developer'
  | 'Offensive Guru'
  | 'Defensive Tactician'
  | 'Recruiting Ace'
  | 'Motivator';

export interface Coach {
  name: string;
  rating: number; // Overall coaching ability (1-100)
  trait: CoachTrait;
}

// --- Hierarchical League Structure ---

export interface HighSchoolLeague {
  division: string; // e.g., 'Class A', 'Class B'
  district: string; // e.g., 'District 5'
}

export interface CollegeLeague {
  division: 'NCAADivisionI' | 'NCAADivisionII' | 'NCAADivisionIII';
  conference: string; // e.g., 'Big East', 'Pac-12'
}

export interface ProfessionalLeague {
  conference: 'Eastern' | 'Western';
  division: 'Atlantic' | 'Central' | 'Southeast' | 'Northwest' | 'Pacific' | 'Southwest';
}

// --- Core Team Interface ---

export interface Team {
  id: string; // Unique identifier
  name: string; // e.g., 'Northwood High Eagles', 'Duke Blue Devils', 'Los Angeles Lakers'
  gameMode: GameMode;

  // Hierarchical league information
  league: HighSchoolLeague | CollegeLeague | ProfessionalLeague;

  // --- Core Ratings (1-100) ---
  offenseRating: number;
  defenseRating: number;
  prestige: number; // Represents historical success and reputation
  wins: number; // Current season wins
  losses: number; // Current season losses

  // --- Team Style & Tendencies ---
  pace: TeamPace;
  offensiveFocus: OffensiveFocus;
  defensiveScheme: DefensiveScheme;

  // --- Personnel & Development ---
  coach: Coach;
  facilities: number; // Quality of training facilities (1-100)
  teamChemistry: number; // Current team morale and cohesion (1-100)

  // --- Identity & Resources ---
  marketSize: 'Small Town' | 'College Town' | 'Metropolis';
  // Optional attribute, primarily for college teams
  academicStrength?: number; // (1-100)
}
