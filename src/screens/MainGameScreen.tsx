// src/screens/MainGameScreen.tsx
import {
  Modal as AntdModal,
  Button,
  Col,
  Grid,
  Row,
  Space,
  Tabs,
  Typography,
  message as antdMessageApi,
} from 'antd';
import React from 'react';
import { useGameStore } from '../store/gameStore';

import { ActionButtons } from '../components/ActionButtons';
import { AttributeChart } from '../components/AttributeChart';
import { CareerLogFeed } from '../components/CareerLogFeed';
import { EventDisplay } from '../components/EventDisplay';
import { PlayerIdentityCard } from '../components/PlayerIdentityCard';
import { PlayerStatsAndTraits } from '../components/PlayerStatsAndTraits';
import { ScheduleCalendar } from '../components/ScheduleCalendar';

const { Title } = Typography;
const { useBreakpoint } = Grid;

/**
 * Main container for the primary game interface.
 * It uses Ant Design's Grid system to switch between a multi-column desktop
 * layout and a tabbed mobile layout.
 */
export const MainGameScreen: React.FC = () => {
  const {
    player,
    currentEvent,
    isLoading,
    simDay,
    simToNextEvent,
    handleChoice,
    handleRetire,
  } = useGameStore();
  const { md } = useBreakpoint();
  const [modal, contextHolderModal] = AntdModal.useModal();

  // This function shows a confirmation dialog before retiring a player.
  const confirmRetire = () => {
    modal.confirm({
      title: 'Retire Career?',
      content: 'Are you sure you want to end your current career? This action cannot be undone.',
      okText: 'Retire',
      cancelText: 'Cancel',
      onOk: () => {
        handleRetire();
        antdMessageApi.info('You have retired. Your legacy awaits!');
      },
    });
  };

  if (!player) {
    return null; // or a loading spinner, though the AppGate should prevent this
  }

  // Define the content for each of the three main columns
  const PlayerIdentityColumn = (
    <>
      <PlayerIdentityCard player={player} />
      <AttributeChart player={player} />
      <PlayerStatsAndTraits player={player} />
    </>
  );

  const JourneyColumn = (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={4} style={{ margin: 0 }}>
          Season {player.currentSeasonInMode} - Day {player.currentDayInSeason}
        </Title>
        <Button size='small' danger onClick={confirmRetire}>
          Retire Career
        </Button>
      </div>
      <ScheduleCalendar player={player} orientation={md ? 'horizontal' : 'vertical'} />
      {currentEvent ? (
        <EventDisplay event={currentEvent} player={player} onChoice={handleChoice} isLoading={isLoading} />
      ) : (
        <ActionButtons
          onSimDay={simDay}
          onSimToNext={simToNextEvent}
          isLoading={isLoading}
        />
      )}
    </>
  );

  const CareerLogColumn = (
    <CareerLogFeed logEntries={player.careerLog} />
  );

  const DesktopLayout = (
    <Row gutter={[24, 24]}>
      {/* Left Column */}
      <Col md={6}>{PlayerIdentityColumn}</Col>
      {/* Center Column */}
      <Col md={12}>{JourneyColumn}</Col>
      {/* Right Column */}
      <Col md={6}>{CareerLogColumn}</Col>
    </Row>
  );

  const MobileLayout = (
    <Tabs defaultActiveKey="1" centered>
      <Tabs.TabPane tab="The Journey" key="1">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {JourneyColumn}
          {CareerLogColumn}
        </Space>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Player" key="2">
        {PlayerIdentityColumn}
      </Tabs.TabPane>
    </Tabs>
  );

  return (
    <>
      {contextHolderModal}
      {md ? DesktopLayout : MobileLayout}
    </>
  );
};
