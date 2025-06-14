// src/gameLogic/teamGenerator.ts
import { highSchoolMascots, highSchoolPrefixes } from '../data/teams';
import type {
  Coach,
  CoachTrait,
  DefensiveScheme,
  HighSchoolLeague,
  OffensiveFocus,
  Team,
  TeamPace,
} from '../types/teams';
import { getRandomName } from '../utils';

// Helper function to get a random element from an array
const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper function to generate a random number within a range
const randomBetween = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1) + min);

/**
 * Generates a single random coach.
 * @returns A Coach object.
 */
const generateCoach = (): Coach => {
  const traits: CoachTrait[] = [
    'Player Developer',
    'Offensive Guru',
    'Defensive Tactician',
    'Recruiting Ace',
    'Motivator',
  ];
  return {
    name: getRandomName(),
    rating: randomBetween(30, 70), // High school coaches have a wide skill range
    trait: getRandomElement(traits),
  };
};

/**
 * Procedurally generates a list of unique high school teams for a given league.
 * @param league - The HighSchoolLeague object containing division and district info.
 * @param count - The number of teams to generate for this league.
 * @returns An array of Team objects.
 */
export const generateHighSchoolTeams = (league: HighSchoolLeague, count: number = 8): Team[] => {
  const teams: Team[] = [];
  const usedNames = new Set<string>();

  for (let i = 0; i < count; i++) {
    let teamName = '';
    // Ensure team names are unique within the generated set
    do {
      teamName = `${getRandomElement(highSchoolPrefixes)} ${getRandomElement(highSchoolMascots)}`;
    } while (usedNames.has(teamName));
    usedNames.add(teamName);

    const paces: TeamPace[] = ['Uptempo', 'Balanced', 'Gritty'];
    const offenses: OffensiveFocus[] = ['Perimeter', 'Interior', 'Balanced'];
    const defenses: DefensiveScheme[] = ['Man-to-Man', 'Zone', 'Press'];

    const team: Team = {
      id: `hs-${league.division}-${league.district}-${i}`,
      name: teamName,
      gameMode: 'High School',
      league: league,

      // Core ratings are generally lower for HS teams
      offenseRating: randomBetween(25, 65),
      defenseRating: randomBetween(25, 65),
      prestige: randomBetween(10, 50),
      wins: 0, // Initialize wins
      losses: 0, // Initialize losses

      // Randomly assign team styles
      pace: getRandomElement(paces),
      offensiveFocus: getRandomElement(offenses),
      defensiveScheme: getRandomElement(defenses),

      // Generate personnel and resources
      coach: generateCoach(),
      facilities: randomBetween(20, 60),
      teamChemistry: randomBetween(40, 80), // Start with decent chemistry

      // Most high schools are in 'Small Town' markets for this sim
      marketSize: 'Small Town',
    };

    teams.push(team);
  }

  return teams;
};

/**
 * Generates the entire high school basketball world for a new career.
 * This function creates multiple divisions, each populated with procedurally generated teams.
 * @returns An object containing the array of all generated teams.
 */
export const generateWorld = (): { teams: Team[] } => {
  const divisions = ['A', 'B', 'C', 'D'];
  const districtsPerDivision = 2;
  const teamsPerDistrict = 8;
  let allTeams: Team[] = [];

  divisions.forEach((division) => {
    for (let i = 1; i <= districtsPerDivision; i++) {
      const league: HighSchoolLeague = {
        division: division,
        district: `District ${i}`,
      };
      const districtTeams = generateHighSchoolTeams(league, teamsPerDistrict);
      allTeams = allTeams.concat(districtTeams);
    }
  });

  return { teams: allTeams };
};
