import { Badge, Card, Tag, Typography } from 'antd';
import { addDays, format, startOfYear } from 'date-fns';
import type { Player, ScheduleItem } from '../types';

const { Title, Text } = Typography;

interface CalendarDisplayProps {
  player: Player;
}

// Helper to determine the color of a schedule item tag
const getTagColor = (type: ScheduleItem['type']) => {
  if (type.includes('Game')) return 'volcano';
  if (type.includes('Playoff')) return 'red';
  if (type.includes('Championship')) return 'gold';
  return 'default';
};

/**
 * A component to display the player's seasonal schedule in a calendar-like format.
 */
export const CalendarDisplay: React.FC<CalendarDisplayProps> = ({ player }) => {
  const { schedule, currentWeek } = player;

  // Create a pseudo-date for display purposes. The year doesn't matter, only the week.
  const seasonStartDate = startOfYear(new Date(2024, 0, 1));

  return (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4} style={{ textAlign: 'center', marginTop: 0 }}>
        Season {player.currentSeasonInMode} Schedule
      </Title>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '12px',
        }}
      >
        {schedule.schedule.map((item, index) => {
          const weekNumber = index + 1;
          const isCurrentWeek = weekNumber === currentWeek;

          // Calculate a display date for this week
          const weekStartDate = addDays(seasonStartDate, weekNumber * 7);

          return (
            <Badge.Ribbon
              key={weekNumber}
              text={isCurrentWeek ? 'This Week' : ''}
              color={isCurrentWeek ? 'blue' : 'transparent'}
            >
              <Card
                size='small'
                title={`Week ${weekNumber}`}
                style={{
                  border: isCurrentWeek ? '1px solid #1677ff' : '',
                  boxShadow: isCurrentWeek ? '0 0 5px rgba(22, 119, 255, 0.5)' : 'none',
                }}
              >
                <Text type='secondary' style={{ display: 'block', marginBottom: '8px' }}>
                  {format(weekStartDate, 'MMM do')}
                </Text>
                <Tag color={getTagColor(item.type)}>{item.type}</Tag>
              </Card>
            </Badge.Ribbon>
          );
        })}
      </div>
    </Card>
  );
};
