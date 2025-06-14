// src/screens/LeagueStandingsScreen.tsx
import { Collapse, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useMemo } from 'react';
import { simulateTeamSeason } from '../gameLogic/standingsLogic';
import { useGameStore } from '../store/gameStore';
import type { HighSchoolLeague, Team } from '../types/teams';

const { Title } = Typography;

// Define the shape of our table data
interface StandingsData extends Team {
  wins: number;
  losses: number;
  rank: number;
}

// Define the columns for our standings table
const columns: ColumnsType<StandingsData> = [
  { title: 'Rank', dataIndex: 'rank', key: 'rank', width: 70, align: 'center' },
  { title: 'Team', dataIndex: 'name', key: 'name' },
  { title: 'W', dataIndex: 'wins', key: 'wins', width: 60, align: 'center' },
  { title: 'L', dataIndex: 'losses', key: 'losses', width: 60, align: 'center' },
];

/**
 * A screen component that calculates and displays league and division standings.
 */
export const LeagueStandingsScreen: React.FC = () => {
  const { teams, player } = useGameStore();

  const highSchoolTeams = teams.filter((t) => t.gameMode === 'High School');

  // Memoize the standings calculation to avoid re-running the simulation on every render
  const standings = useMemo(() => {
    // First, get the record for every team
    const calculatedRecords = highSchoolTeams.map((team) => {
      // Use the player's actual record from the game state
      if (team.id === player?.teamId && player) {
        return { ...team, wins: player.schedule.wins, losses: player.schedule.losses };
      }
      // For all other AI teams, simulate a season to get a record
      const record = simulateTeamSeason(team, highSchoolTeams);
      return { ...team, ...record };
    });

    // Group the teams by division, then by district
    const groupedByDivision = calculatedRecords.reduce((acc, team) => {
      const league = team.league as HighSchoolLeague;
      const divisionKey = `Class ${league.division}`;
      const districtKey = league.district;

      if (!acc[divisionKey]) acc[divisionKey] = {};
      if (!acc[divisionKey][districtKey]) acc[divisionKey][districtKey] = [];

      acc[divisionKey][districtKey].push(team);
      return acc;
    }, {} as Record<string, Record<string, (Team & { wins: number; losses: number })[]>>);

    // Finally, sort teams within each district by wins and add a rank
    for (const division of Object.values(groupedByDivision)) {
      for (const district of Object.values(division)) {
        district.sort((a, b) => b.wins - a.wins);
        district.forEach((team, index) => {
          (team as StandingsData).rank = index + 1;
        });
      }
    }

    return groupedByDivision;
  }, [highSchoolTeams, player]);

  if (!player) {
    return <Title>Loading...</Title>;
  }

  const playerTeam = teams.find((t) => t.id === player.teamId);
  const playerLeague = playerTeam?.league as HighSchoolLeague;
  const defaultActiveDivisionKey = playerLeague ? `Class ${playerLeague.division}` : undefined;
  const defaultActiveDistrictKey = playerLeague ? playerLeague.district : undefined;

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        High School Standings
      </Title>
      <Collapse accordion defaultActiveKey={defaultActiveDivisionKey}>
        {Object.entries(standings).map(([divisionName, districts]) => (
          <Collapse.Panel header={divisionName} key={divisionName}>
            <Collapse defaultActiveKey={defaultActiveDistrictKey} bordered={false}>
              {Object.entries(districts).map(([districtName, districtTeams]) => (
                <Collapse.Panel header={districtName} key={districtName}>
                  <Table
                    columns={columns}
                    dataSource={districtTeams as StandingsData[]}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    rowClassName={(record) => (record.id === player.teamId ? 'ant-table-row-selected' : '')}
                  />
                </Collapse.Panel>
              ))}
            </Collapse>
          </Collapse.Panel>
        ))}
      </Collapse>
    </div>
  );
};
