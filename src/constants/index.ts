import type { CollegeRole, HighSchoolRole, ProfessionalRole } from '../types';

export const MAX_STAT_VALUE = 99;
export const MIN_STAT_VALUE = 10;
export const MAX_ENERGY = 100;
export const MAX_MORALE = 100;
export const DAYS_PER_SEASON = 20;

export const HIGH_SCHOOL_ROLES: HighSchoolRole[] = [
  'Freshman Newcomer',
  'Sophomore Contender',
  'Junior Varsity Player',
  'Varsity Rotation',
  'Varsity Starter',
  'Team Captain',
  'District Star',
  'All-State Contender',
  'All-American Prospect',
];
export const COLLEGE_ROLES: CollegeRole[] = [
  'Walk-On Hopeful',
  'Practice Squad Player',
  'Bench Warmer',
  'End of Bench Specialist',
  'Rotation Player',
  'Key Substitute (6th Man)',
  'Starter',
  'Conference Star',
  'All-American Candidate',
  'Top Draft Prospect',
];
export const PROFESSIONAL_ROLES: ProfessionalRole[] = [
  'Undrafted Free Agent',
  'G-League Assignee',
  'Two-Way Contract Player',
  'End of Bench Pro',
  'Rotation Contributor',
  'Valuable Sixth Man',
  'Starting Caliber Player',
  'Established Star',
  'All-Star Level Player',
  'All-League Performer',
  'MVP Candidate',
];

export const HIGH_SCHOOL_MAX_SEASONS = 4;
export const COLLEGE_MAX_SEASONS = 4;

export const HIGH_SCHOOL_GRADUATION_AGE = 18;
export const COLLEGE_GRADUATION_AGE = 22;
