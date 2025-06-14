// src/components/PlayerIdentityCard.tsx
import { Card, Descriptions, Tag, Typography } from 'antd';
import React from 'react';
import type { Player } from '../types';

const { Text } = Typography;

interface PlayerIdentityCardProps {
  player: Player;
}

/**
 * Displays the player's core identity information, including name, age, role, and record.
 * This component is part of the "Player Identity" column in the main game screen.
 */
export const PlayerIdentityCard: React.FC<PlayerIdentityCardProps> = ({ player }) => {
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
