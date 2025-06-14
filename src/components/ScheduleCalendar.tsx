// src/components/ScheduleCalendar.tsx
import {
  CalendarOutlined,
  CarryOutOutlined,
  ExperimentOutlined,
  RestOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Badge, Card, Col, Row, Space, Tag, Typography } from 'antd';
import React from 'react';
import type { DailyScheduleItem, Player } from '../types';

const { Text } = Typography;

interface ScheduleCalendarProps {
  player: Player;
  orientation: 'horizontal' | 'vertical';
}

// Helper to get an appropriate icon for each schedule item type
const getIconForType = (type: DailyScheduleItem['type']) => {
  switch (type) {
    case 'Game':
      return <CarryOutOutlined />;
    case 'Practice':
      return <ExperimentOutlined />;
    case 'Rest':
      return <RestOutlined />;
    case 'Playoffs':
      return <TrophyOutlined style={{ color: '#ff4d4f' }} />;
    case 'Championship':
      return <TrophyOutlined style={{ color: '#faad14' }} />;
    default:
      return <CalendarOutlined />;
  }
};

// Helper to get a color for the event type tag
const getTagColor = (type: DailyScheduleItem['type']) => {
  if (type === 'Game') return 'volcano';
  if (type === 'Playoffs') return 'red';
  if (type === 'Championship') return 'gold';
  return 'default';
};

/**
 * A sub-component to render a single day in the schedule calendar.
 */
const DayCard: React.FC<{ item: DailyScheduleItem; isToday: boolean }> = ({ item, isToday }) => {
  const renderGameResult = () => {
    if (!item.gameResult) return null;
    return (
      <Tag
        color={item.gameResult.teamWon ? 'success' : 'error'}
        style={{ marginTop: 4, fontWeight: 'bold' }}
      >
        {item.gameResult.teamWon ? 'W' : 'L'}
      </Tag>
    );
  };

  return (
    <Badge.Ribbon text={isToday ? 'Today' : ''} color={isToday ? 'blue' : 'transparent'}>
      <Card
        size="small"
        style={{
          boxShadow: isToday ? '0 0 5px rgba(22, 119, 255, 0.5)' : 'none',
          backgroundColor: item.isCompleted ? 'rgba(0, 0, 0, 0.04)' : 'inherit',
          opacity: item.isCompleted ? 0.7 : 1,
        }}
      >
        <Space direction="vertical" align="center" style={{ width: '100%' }}>
          <Text strong>Day {item.day}</Text>
          <div style={{ fontSize: '1.5em', color: '#8c8c8c' }}>{getIconForType(item.type)}</div>
          <Tag color={getTagColor(item.type)}>{item.type}</Tag>
          {renderGameResult()}
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

/**
 * Displays the upcoming 5-day schedule in a card-based layout.
 * Supports both horizontal (desktop) and vertical (mobile) orientations.
 */
export const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ player, orientation }) => {
  const { schedule, currentDayInSeason } = player;

  // Find the index of the current day to start the slice from.
  // Robustly handles cases where the current day might not be found.
  const todayIndex = Math.max(0, schedule.schedule.findIndex((item) => item.day === currentDayInSeason));

  const upcomingDays = schedule.schedule.slice(todayIndex, todayIndex + 5);

  return (
    <div style={{ marginBottom: 24 }}>
      <Row gutter={[16, 16]}>
        {upcomingDays.map((item, index) => (
          <Col
            key={item.day}
            xs={orientation === 'vertical' ? 24 : undefined}
            sm={orientation === 'horizontal' ? (24 / (upcomingDays.length || 1)) : 24}
          >
            <DayCard item={item} isToday={index === 0} />
          </Col>
        ))}
      </Row>
    </div>
  );
};
