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
  Energy?: number | string;
  Morale?: number | string;
}

export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ player }) => {
  // Defensive check in case the player prop is not yet loaded.
  if (!player) {
    return <Card>Loading player data...</Card>;
  }

  // Use default fallbacks to prevent crashes if data is missing.
  const stats = player.stats || {};
  const schedule = player.schedule || { wins: 0, losses: 0 };

  const columns: ColumnsType<StatDataItem> = [
    { title: 'Shooting', dataIndex: 'Shooting', key: 'Shooting', align: 'center' },
    { title: 'Athleticism', dataIndex: 'Athleticism', key: 'Athleticism', align: 'center' },
    { title: 'Basketball IQ', dataIndex: 'Basketball IQ', key: 'Basketball IQ', align: 'center' },
    { title: 'Energy', dataIndex: 'Energy', key: 'Energy', align: 'center' },
    { title: 'Morale', dataIndex: 'Morale', key: 'Morale', align: 'center' },
  ];

  const data: StatDataItem[] = [
    {
      key: 'values',
      Shooting: stats.shooting ?? 'N/A',
      Athleticism: stats.athleticism ?? 'N/A',
      'Basketball IQ': stats.basketballIQ ?? 'N/A',
      Energy: stats.energy ?? 'N/A',
      Morale: stats.morale ?? 'N/A',
    },
  ];

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
        {/* FIX: Removed the extra career text */}
        <Descriptions.Item label='Season'>{player.currentSeasonInMode || 1}</Descriptions.Item>
        {/* FIX: Removed the extra total days text */}
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

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        size='small'
        bordered
        style={{ marginBottom: 8 }}
      />
    </Card>
  );
};
