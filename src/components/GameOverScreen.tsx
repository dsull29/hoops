// src/components/GameOverScreen.tsx
import { Button, Descriptions, Divider, Result, Tag, Typography } from 'antd';
import { useGameStore } from '../store/gameStore';
import type { Player, PlayerStats } from '../types';
import { CareerLogDisplay } from './CareerLogDisplay';

const { Title: OverTitle, Paragraph: OverParagraph, Text: OverText } = Typography;

interface GameOverScreenProps {
  player: Player;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({ player }) => {
  const { startGame, metaSkillPointsAtRunStart } = useGameStore();
  const pointsEarnedThisRun = player.stats.skillPoints - metaSkillPointsAtRunStart;

  return (
    <Result
      status='info'
      title={<OverTitle level={2}>Career Over</OverTitle>}
      subTitle={
        <OverParagraph strong>
          {player.careerLog
            .find((log) => log.startsWith('--- CAREER OVER:'))
            ?.replace('--- CAREER OVER: ', '')}
        </OverParagraph>
      }
      extra={[
        <Button type='primary' key='new_career' onClick={startGame} size='large'>
          Start New Career (Total Legacy: {player.stats.skillPoints} pts)
        </Button>,
      ]}
    >
      <div className='desc' style={{ textAlign: 'left', maxWidth: 600, margin: '0 auto' }}>
        <OverTitle level={4} style={{ textAlign: 'center' }}>
          Final Summary for {player.name}
        </OverTitle>
        <Descriptions bordered column={1} size='small'>
          <Descriptions.Item label='Final Game Mode'>
            <Tag color='purple'>{player.gameMode}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label='Final Role'>
            <Tag color='blue'>{player.currentRole}</Tag>
          </Descriptions.Item>
          {(Object.keys(player.stats) as Array<keyof PlayerStats>).map((key) => (
            <Descriptions.Item
              key={key}
              label={
                <OverText strong style={{ textTransform: 'capitalize' }}>
                  {key.replace(/([A-Z])/g, ' $1')}
                </OverText>
              }
            >
              {player.stats[key]}
            </Descriptions.Item>
          ))}
          {/* FIX: Changed totalDaysPlayed to totalWeeksPlayed and updated the label */}
          <Descriptions.Item label={<OverText strong>Total Weeks Played</OverText>}>
            {player.totalWeeksPlayed}
          </Descriptions.Item>
          <Descriptions.Item label={<OverText strong>Legacy Points Earned (This Run)</OverText>}>
            {pointsEarnedThisRun}
          </Descriptions.Item>
        </Descriptions>
        <Divider>Career Log</Divider>
        <CareerLogDisplay logEntries={player.careerLog} />
      </div>
    </Result>
  );
};
