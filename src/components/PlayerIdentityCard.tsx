// src/components/PlayerIdentityCard.tsx
import { Card, Descriptions, Tag, Typography } from 'antd';
import React from 'react';
import type { Player } from '../types';
import type { CollegeLeague, HighSchoolLeague, ProfessionalLeague, Team } from '../types/teams';

const { Text } = Typography;

interface PlayerIdentityCardProps {
  player: Player;
  team?: Team; // The player's full team object is now an optional prop
}

// Type guards to safely check the structure of the team's league object
function isHighSchoolLeague(league: unknown): league is HighSchoolLeague {
  return (
    typeof league === 'object' &&
    league !== null &&
    'division' in league &&
    typeof (league as Record<string, unknown>).division === 'string' &&
    'district' in league &&
    typeof (league as Record<string, unknown>).district === 'string'
  );
}
function isCollegeLeague(league: unknown): league is CollegeLeague {
  return (
    typeof league === 'object' &&
    league !== null &&
    'conference' in league &&
    typeof (league as Record<string, unknown>).conference === 'string' &&
    'division' in league &&
    typeof (league as Record<string, unknown>).division === 'string'
  );
}
function isProLeague(league: unknown): league is ProfessionalLeague {
  return (
    typeof league === 'object' &&
    league !== null &&
    'conference' in league &&
    typeof (league as Record<string, unknown>).conference === 'string' &&
    'division' in league &&
    typeof (league as Record<string, unknown>).division === 'string'
  );
}

/**
 * Displays the player's core identity information, including name, age, role, team, and record.
 * This component is part of the "Player Identity" column in the main game screen.
 */
export const PlayerIdentityCard: React.FC<PlayerIdentityCardProps> = ({ player, team }) => {
  // Helper function to get a formatted string for the team's league/division
  const getLeagueInfo = () => {
    if (!team) return null;

    if (isHighSchoolLeague(team.league)) {
      return `Class ${team.league.division}, ${team.league.district}`;
    }
    if (isCollegeLeague(team.league) || isProLeague(team.league)) {
      return `${team.league.conference} - ${team.league.division} Division`;
    }
    return 'Unknown League';
  };

  return (
    <Card
      title={`${player.name} - ${player.position}`}
      extra={<Text>Age: {player.age}</Text>}
      style={{ marginBottom: 16 }}
      styles={{ header: { padding: '0 16px' }, body: { padding: 16 } }}
      size="small"
    >
      <Descriptions column={1} size="small" layout="horizontal" bordered>
        <Descriptions.Item label="Status">
          <Tag color="purple">{player.gameMode}</Tag>
          <Tag color="blue">{player.currentRole}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Team">
          {/* Display the team name from the passed-in team object */}
          <Text>{team ? team.name : 'Unassigned'}</Text>
        </Descriptions.Item>
        {/* Conditionally render the league info if a team exists */}
        {team && (
          <Descriptions.Item label="League">
            <Text>{getLeagueInfo()}</Text>
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Record">
          <Text strong style={{ color: '#52c41a' }}>
            {player.schedule.wins}
          </Text>
          {' - '}
          <Text strong style={{ color: '#f5222d' }}>
            {player.schedule.losses}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );
};
