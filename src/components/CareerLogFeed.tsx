// src/components/CareerLogFeed.tsx
import { Card, List, Typography } from 'antd';
import React, { useEffect, useRef } from 'react';

const { Text } = Typography;

interface CareerLogFeedProps {
  logEntries: string[];
}

// Helper to determine the type and style of a log entry
const getLogEntryStyle = (item: string): React.CSSProperties => {
  if (item.includes('---')) {
    return {
      borderColor: '#faad14',
      backgroundColor: 'rgba(250, 173, 20, 0.05)',
      fontWeight: 'bold',
    };
  }
  if (item.includes('Game finished')) {
    return {
      borderColor: '#1677ff',
      backgroundColor: 'rgba(22, 119, 255, 0.05)',
    };
  }
  if (item.includes(' +')) {
    return {
      borderColor: '#52c41a',
      backgroundColor: 'rgba(82, 196, 26, 0.05)',
    };
  }
  if (item.includes(' -')) {
    return {
      borderColor: '#f5222d',
      backgroundColor: 'rgba(245, 34, 45, 0.05)',
    };
  }
  return {};
};

/**
 * Displays the career log as a feed of event cards.
 * This is an evolution of the old CareerLogDisplay component, designed to
 * enhance the narrative feel of the game.
 */
export const CareerLogFeed: React.FC<CareerLogFeedProps> = ({ logEntries }) => {
  const listEndRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to the bottom of the list when new entries are added.
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logEntries]);

  return (
    <Card title="Career Log">
      <div style={{ height: 'calc(100vh - 250px)', minHeight: '300px', overflowY: 'auto', paddingRight: '12px' }}>
        <List
          size="small"
          dataSource={[...logEntries].reverse()}
          renderItem={(item) => (
            <List.Item style={{ border: 'none', padding: '4px 0' }}>
              <Card
                size="small"
                style={{
                  width: '100%',
                  ...getLogEntryStyle(item),
                }}
              >
                <Text style={{ fontSize: '13px' }}>{item}</Text>
              </Card>
            </List.Item>
          )}
        />
        <div ref={listEndRef} />
      </div>
    </Card>
  );
};
