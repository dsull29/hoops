// src/components/AttributeChart.tsx
import { Card, Typography } from 'antd';
import React from 'react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from 'recharts';
import { MAX_STAT_VALUE } from '../constants';
import type { Player, PlayerStats } from '../types';

const { Title } = Typography;

interface AttributeChartProps {
  player: Player;
}

// Helper to format stat keys into readable labels
const formatStatName = (key: string): string => {
  if (key === 'basketballIQ') return 'BBIQ';
  return key.charAt(0).toUpperCase() + key.slice(1);
};

/**
 * Renders a radar chart for the player's four core attributes.
 * The data for this chart is generated dynamically from the player.stats object.
 */
export const AttributeChart: React.FC<AttributeChartProps> = ({ player }) => {
  // Dynamically generate chart data from the player's stats, adhering to the single source of truth rule.
  const chartData = (Object.keys(player.stats) as Array<keyof PlayerStats>)
    // We only want to display the core physical and skill attributes on the chart.
    .filter((key) => ['shooting', 'athleticism', 'basketballIQ', 'durability'].includes(key))
    .map((key) => ({
      subject: formatStatName(key),
      value: player.stats[key],
      fullMark: MAX_STAT_VALUE,
    }));

  return (
    <Card style={{ marginBottom: 16 }} bodyStyle={{ padding: '8px 8px 0 8px' }}>
      <Title level={5} style={{ textAlign: 'center', marginBottom: 8 }}>
        Attributes
      </Title>
      <ResponsiveContainer width="100%" height={250}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name={player.name}
            dataKey="value"
            stroke="#8884d8"
            fill="#8884d8"
            fillOpacity={0.6}
          />
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </Card>
  );
};
