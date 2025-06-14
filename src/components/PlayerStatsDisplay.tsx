import { Card, Descriptions, Progress, Space, Table, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { TRAIT_DEFINITIONS } from '../gameLogic/traits';
import type { Player } from '../types';

const { Title, Text } = Typography;

interface PlayerStatsDisplayProps {
  player: Player;
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

  const { stats, traits, schedule } = player;

  const getStatColor = (value: number) => {
    if (value < 40) return '#f5222d';
    if (value < 70) return '#faad14';
    return '#52c41a';
  };

  const renderTraits = () => {
    if (!traits || traits.size === 0) {
      return <Text type="secondary">None</Text>;
    }
    return Array.from(traits.entries()).map(([traitName, level]) => {
      const traitDef = TRAIT_DEFINITIONS.get(traitName);
      const levelDef = traitDef?.levels.find(l => l.level === level);
      const description = levelDef ? levelDef.description : traitDef?.levels[0].description;

      return (
        <Tooltip key={traitName} title={description}>
          <Tag color="geekblue" style={{ marginRight: 3, marginBottom: 3 }}>
            {traitName} (Lv. {level})
          </Tag>
        </Tooltip>
      );
    });
  };

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

  const seasonTotalColumns: ColumnsType<SeasonTotalDataItem> = [
    { title: 'MIN', dataIndex: 'MIN', key: 'MIN', align: 'center' },
    { title: 'PTS', dataIndex: 'PTS', key: 'PTS', align: 'center' },
    { title: 'REB', dataIndex: 'REB', key: 'REB', align: 'center' },
    { title: 'AST', dataIndex: 'AST', key: 'AST', align: 'center' },
  ];

  const seasonTotalData: SeasonTotalDataItem[] = [{ key: 'totals', ...seasonTotals }];

  return (
    <Card
      title={`${player.name} - ${player.position}`}
      extra={<Text>Age: {player.age}</Text>}
      style={{ marginBottom: 16 }}
    >
      <Descriptions size="small" column={1} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Status">
          <Tag color="purple">{player.gameMode}</Tag>
          <Tag color="blue">{player.currentRole}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Record">
          <Text strong style={{ color: '#52c41a' }}>
            {player.schedule.wins}
          </Text>{' '}
          -
          <Text strong style={{ color: '#f5222d' }}>
            {player.schedule.losses}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Morale">
          <Progress
            percent={stats.morale}
            size="small"
            status="active"
            strokeColor={getStatColor(stats.morale)}
          />
        </Descriptions.Item>
        <Descriptions.Item label="Traits" span={1}>
          {renderTraits()}
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
          <Progress
            percent={stats.athleticism}
            size="small"
            strokeColor={getStatColor(stats.athleticism)}
          />
        </div>
        <div>
          <Text strong>Basketball IQ</Text>
          <Progress
            percent={stats.basketballIQ}
            size="small"
            strokeColor={getStatColor(stats.basketballIQ)}
          />
        </div>
        <div>
          <Text strong>Durability</Text>
          <Progress
            percent={stats.durability}
            size="small"
            strokeColor={getStatColor(stats.durability)}
          />
        </div>
      </Space>

      <Title level={5} style={{ textAlign: 'center', marginTop: 24, marginBottom: 16 }}>
        Season Averages
      </Title>
      <Table
        columns={seasonTotalColumns}
        dataSource={seasonTotalData}
        pagination={false}
        size='small'
        bordered
      />

    </Card>
  );
};
