import { Card, Descriptions, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import type { Player } from '../types';

const { Title: PlayerTitle } = Typography;

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
  const { stats } = player;

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
      Shooting: stats.shooting,
      Athleticism: stats.athleticism,
      'Basketball IQ': stats.basketballIQ,
      Energy: stats.energy,
      Morale: stats.morale,
    },
  ];

  return (
    <Card
      size='small'
      title={
        <PlayerTitle level={5} style={{ margin: 0 }}>
          {player.name} - {player.position} ({player.age} y.o.)
        </PlayerTitle>
      }
      style={{ marginBottom: 16 }}
    >
      <Descriptions size='small' column={2} style={{ marginBottom: 12 }}>
        <Descriptions.Item label='Mode'>
          <Tag color='purple' style={{ marginRight: 0 }}>
            {player.gameMode}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Role'>
          <Tag color='blue' style={{ marginRight: 0 }}>
            {player.currentRole}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Season'>
          {player.currentSeasonInMode} ({player.currentSeason} career)
        </Descriptions.Item>
        <Descriptions.Item label='Week'>
          {player.currentWeek} ({player.totalWeeksPlayed} total)
        </Descriptions.Item>
        {player.traits.length > 0 && (
          <Descriptions.Item label='Traits' span={2}>
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
        rowClassName={() => 'stats-table-row'}
      />
    </Card>
  );
};
