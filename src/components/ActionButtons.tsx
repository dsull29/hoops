// src/components/ActionButtons.tsx
import { Button, Card, Space } from 'antd';
import React from 'react';

interface ActionButtonsProps {
  onSimDay: () => void;
  onSimToNext: () => void;
  isLoading: boolean;
}

/**
 * Renders the primary and secondary action buttons for game simulation.
 * This component is part of the central "The Journey" column.
 */
export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onSimDay,
  onSimToNext,
  isLoading,
}) => {
  return (
    <Card>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          onClick={onSimToNext}
          disabled={isLoading}
          block
        >
          Sim to Next Event
        </Button>
        <Button
          type="default"
          size="large"
          onClick={onSimDay}
          disabled={isLoading}
          block
        >
          Sim Next Day
        </Button>
      </Space>
    </Card>
  );
};
