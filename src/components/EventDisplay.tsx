import { Button, Card, Space, Typography } from 'antd';
import React from 'react';
import type { Choice, GameEvent, Player } from '../types';

const { Text: EventText, Paragraph: EventParagraph } = Typography;

interface EventDisplayProps {
  event: GameEvent;
  player: Player;
  onChoice: (choice: Choice) => void;
  isLoading: boolean;
}
export const EventDisplay: React.FC<EventDisplayProps> = ({
  event,
  player,
  onChoice,
  isLoading,
}) => (
  <Card
    style={{ marginBottom: 24 }}
    // FIX: Replaced deprecated bodyStyle with the new styles prop
    styles={{ body: { paddingTop: 16 } }}
  >
    <EventParagraph
      style={{ marginBottom: 16, fontSize: '1.05em', fontWeight: 500, textAlign: 'center' }}
    >
      {event.title}
    </EventParagraph>
    <EventParagraph style={{ marginBottom: 16, textAlign: 'center' }}>
      {event.description}
    </EventParagraph>
    <Space direction='vertical' style={{ width: '100%' }} size='small'>
      {event.choices.map((choice) => {
        const isDisabled = choice.disabled
          ? choice.disabled(player)
          : choice.cost && player.stats[choice.cost.stat] < choice.cost.amount;
        return (
          <Button
            key={choice.id}
            type='primary'
            onClick={() => onChoice(choice)}
            disabled={isDisabled || isLoading}
            block
            size='middle'
            danger={
              choice.text.toLowerCase().includes('risk') ||
              choice.text.toLowerCase().includes('hard') ||
              choice.text.toLowerCase().includes('injury')
            }
            ghost={
              !isDisabled &&
              !choice.text.toLowerCase().includes('risk') &&
              !choice.text.toLowerCase().includes('hard') &&
              !choice.text.toLowerCase().includes('injury')
            }
            style={{
              height: 'auto',
              padding: '8px 12px',
              whiteSpace: 'normal',
              lineHeight: '1.3',
              textAlign: 'left',
            }}
          >
            <EventText strong style={{ fontSize: '0.95em', display: 'block' }}>
              {choice.text}
            </EventText>
            {choice.description && (
              <EventText
                type='secondary'
                style={{ fontSize: '0.8em', display: 'block', marginTop: 1 }}
              >
                {choice.description}
              </EventText>
            )}
            {choice.cost && (
              <EventText
                style={{
                  fontSize: '0.75em',
                  color: isDisabled ? 'inherit' : '#ff7875',
                  display: 'block',
                  marginTop: 3,
                }}
              >
                Cost: {choice.cost.amount} {choice.cost.stat}
              </EventText>
            )}
          </Button>
        );
      })}
    </Space>
  </Card>
);
