import { Card, Descriptions, Progress, Space, Tag, Typography } from 'antd';
import type { Player } from '../types';

const { Title, Text } = Typography;

interface PlayerStatsDisplayProps {
  player: Player;
}

export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ player }) => {
  if (!player) {
    return <Card>Loading player data...</Card>;
  }

  const { stats } = player;

  const getStatColor = (value: number) => {
    if (value < 40) return '#f5222d'; // Red
    if (value < 70) return '#faad14'; // Yellow
    return '#52c41a'; // Green
  };

  return (
    <Card
      title={`${player.name} - ${player.position}`}
      extra={<Text>Age: {player.age}</Text>}
      style={{ marginBottom: 16 }}
    >
      <Descriptions size='small' column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label='Status'>
          <Tag color='purple'>{player.gameMode}</Tag>
          <Tag color='blue'>{player.currentRole}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label='Record'>
          <Text strong style={{ color: '#52c41a' }}>
            {player.schedule.wins}
          </Text>{' '}
          -
          <Text strong style={{ color: '#f5222d' }}>
            {player.schedule.losses}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label='Morale'>
          <Progress percent={stats.morale} size="small" status="active" strokeColor={getStatColor(stats.morale)} />
        </Descriptions.Item>
      </Descriptions>

      <Title level={5} style={{ textAlign: 'center', marginBottom: 16 }}>
        Attributes
      </Title>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong>Shooting</Text>
          <Progress percent={stats.shooting} size="small" strokeColor={getStatColor(stats.shooting)} />
        </div>
        <div>
          <Text strong>Athleticism</Text>
          <Progress percent={stats.athleticism} size="small" strokeColor={getStatColor(stats.athleticism)} />
        </div>
        <div>
          <Text strong>Basketball IQ</Text>
          <Progress percent={stats.basketballIQ} size="small" strokeColor={getStatColor(stats.basketballIQ)} />
        </div>
        <div>
          <Text strong>Durability</Text>
          <Progress percent={stats.durability} size="small" strokeColor={getStatColor(stats.durability)} />
        </div>
      </Space>
    </Card>
  );
};
