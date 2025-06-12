import { Badge, Card, Tag, Typography } from 'antd';
import type { DailyScheduleItem, Player } from '../types';

const { Title, Text } = Typography;

interface FiveDayScheduleProps {
  player: Player;
}

const getTagColor = (type: DailyScheduleItem['type']) => {
  if (type === 'Game') return 'volcano';
  if (type === 'Playoffs') return 'red';
  if (type === 'Championship') return 'gold';
  return 'default';
};

const DayCard: React.FC<{ item: DailyScheduleItem; isToday: boolean }> = ({ item, isToday }) => {
  const renderGameResult = () => {
    if (!item.gameResult) return null;
    return (
      <Tag color={item.gameResult.teamWon ? 'success' : 'error'} style={{ marginTop: 4, fontWeight: 'bold' }}>
        {item.gameResult.teamWon ? 'W' : 'L'}
      </Tag>
    );
  };

  return (
    <Badge.Ribbon text={isToday ? 'Today' : ''} color={isToday ? 'blue' : 'transparent'}>
      <Card
        size='small'
        style={{
          border: isToday ? '1px solid #1677ff' : '',
          boxShadow: isToday ? '0 0 5px rgba(22, 119, 255, 0.5)' : 'none',
          backgroundColor: item.isCompleted ? '#f0f0f0' : 'inherit',
        }}
      >
        <Text strong>Day {item.day}</Text>
        <div style={{ marginTop: 8 }}>
          <Tag color={getTagColor(item.type)}>{item.type}</Tag>
          {renderGameResult()}
        </div>
      </Card>
    </Badge.Ribbon>
  );
};

export const FiveDaySchedule: React.FC<FiveDayScheduleProps> = ({ player }) => {
  const { schedule, currentDayInSeason } = player;

  const todayIndex = schedule.schedule.findIndex((item) => item.day === currentDayInSeason);

  // FIX: If today isn't found (e.g., at the very end of a season), default to the start.
  // This makes the component more robust against edge cases.
  const startIndex = todayIndex === -1 ? 0 : todayIndex;
  const upcomingDays = schedule.schedule.slice(startIndex, startIndex + 5);

  return (
    <div style={{ marginBottom: 24 }}>
      <Title level={5} style={{ textAlign: 'center' }}>
        Upcoming Schedule
      </Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${upcomingDays.length > 0 ? upcomingDays.length : 1}, 1fr)`,
          gap: '16px',
        }}
      >
        {upcomingDays.map((item, index) => (
          <DayCard key={item.day} item={item} isToday={index === 0 && startIndex === todayIndex} />
        ))}
      </div>
    </div>
  );
};