import { Card, Descriptions, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import type { Player } from '../types';

const { Title: PlayerTitle, Text } = Typography;

interface PlayerStatsDisplayProps {
  player: Player;
}

interface StatDataItem {
  key: string;
  Shooting?: number | string;
  Athleticism?: number | string;
  'Basketball IQ'?: number | string;
  // FIX: Changed Energy to Durability
  Durability?: number | string;
  Morale?: number | string;
}

interface SeasonTotalDataItem {
  key: string;
  MIN: number;
  PTS: number;
  REB: number;
  AST: number;
}

export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ player }) => {
  if (!player) {
    return <Card>Loading player data...</Card>;
  }

  const stats = player.stats || {};
  const schedule = player.schedule || { wins: 0, losses: 0, schedule: [] };

  const seasonTotals = schedule.schedule.reduce(
    (acc, day) => {
      if (day.gameResult) {
        acc.MIN += day.gameResult.playerStats.minutes;
        acc.PTS += day.gameResult.playerStats.points;
        acc.REB += day.gameResult.playerStats.rebounds;
        acc.AST += day.gameResult.playerStats.assists;
      }
      return acc;
    },
    { MIN: 0, PTS: 0, REB: 0, AST: 0 }
  );

  const statColumns: ColumnsType<StatDataItem> = [
    { title: 'Shooting', dataIndex: 'Shooting', key: 'Shooting', align: 'center' },
    { title: 'Athleticism', dataIndex: 'Athleticism', key: 'Athleticism', align: 'center' },
    { title: 'Basketball IQ', dataIndex: 'Basketball IQ', key: 'Basketball IQ', align: 'center' },
    // FIX: Changed Energy to Durability
    { title: 'Durability', dataIndex: 'Durability', key: 'Durability', align: 'center' },
    { title: 'Morale', dataIndex: 'Morale', key: 'Morale', align: 'center' },
  ];

  const statData: StatDataItem[] = [
    {
      key: 'values',
      Shooting: stats.shooting ?? 'N/A',
      Athleticism: stats.athleticism ?? 'N/A',
      'Basketball IQ': stats.basketballIQ ?? 'N/A',
      // FIX: Changed Energy to Durability
      Durability: stats.durability ?? 'N/A',
      Morale: `${stats.morale ?? 'N/A'}%`,
    },
  ];

  const seasonTotalColumns: ColumnsType<SeasonTotalDataItem> = [
    { title: 'MIN', dataIndex: 'MIN', key: 'MIN', align: 'center' },
    { title: 'PTS', dataIndex: 'PTS', key: 'PTS', align: 'center' },
    { title: 'REB', dataIndex: 'REB', key: 'REB', align: 'center' },
    { title: 'AST', dataIndex: 'AST', key: 'AST', align: 'center' },
  ];

  const seasonTotalData: SeasonTotalDataItem[] = [{ key: 'totals', ...seasonTotals }];

  return (
    <Card
      size='small'
      title={
        <PlayerTitle level={5} style={{ margin: 0 }}>
          {player.name || 'Unnamed Player'} - {player.position || 'No Position'} ({player.age || 0}{' '}
          y.o.)
        </PlayerTitle>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions size='small' column={3} style={{ marginBottom: 12 }}>
        <Descriptions.Item label='Mode'>
          <Tag color='purple' style={{ marginRight: 0 }}>
            {player.gameMode || 'N/A'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Role'>
          <Tag color='blue' style={{ marginRight: 0 }}>
            {player.currentRole || 'N/A'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Record'>
          <Text strong style={{ color: '#52c41a' }}>
            {schedule.wins}
          </Text>{' '}
          -
          <Text strong style={{ color: '#f5222d' }}>
            {schedule.losses}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label='Season'>{player.currentSeasonInMode || 1}</Descriptions.Item>
        <Descriptions.Item label='Day' span={2}>
          {player.currentDayInSeason || 1}
        </Descriptions.Item>
        {player.traits?.length > 0 && (
          <Descriptions.Item label='Traits' span={3}>
            {player.traits.map((trait) => (
              <Tag key={trait} color='geekblue' style={{ marginRight: 3, marginBottom: 3 }}>
                {trait}
              </Tag>
            ))}
          </Descriptions.Item>
        )}
      </Descriptions>

      <PlayerTitle level={5} style={{ textAlign: 'center', fontSize: '1em', marginBottom: 8 }}>
        Player Attributes
      </PlayerTitle>
      <Table
        columns={statColumns}
        dataSource={statData}
        pagination={false}
        size='small'
        bordered
        style={{ marginBottom: 12 }}
      />

      <PlayerTitle level={5} style={{ textAlign: 'center', fontSize: '1em', marginBottom: 8 }}>
        Season Totals
      </PlayerTitle>
      <Table
        columns={seasonTotalColumns}
        dataSource={seasonTotalData}
        pagination={false}
        size='small'
        bordered
        style={{ marginBottom: 8 }}
      />
    </Card>
  );
};
