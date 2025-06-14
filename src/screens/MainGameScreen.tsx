// src/screens/MainGameScreen.tsx
import {
  Modal as AntdModal,
  Button,
  Col,
  Grid,
  Modal,
  Row,
  Space,
  Tabs,
  Typography,
  message as antdMessageApi,
} from 'antd';
import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

// --- Component Imports ---
import { ActionButtons } from '../components/ActionButtons';
import { AttributeChart } from '../components/AttributeChart';
import { CareerLogFeed } from '../components/CareerLogFeed';
import { EventDisplay } from '../components/EventDisplay';
import { PlayerIdentityCard } from '../components/PlayerIdentityCard';
import { PlayerStatsAndTraits } from '../components/PlayerStatsAndTraits';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { LeagueStandingsScreen } from './LeagueStandingsScreen'; // Import the new screen

const { Title } = Typography;
const { useBreakpoint } = Grid;

export const MainGameScreen: React.FC = () => {
  const { player, teams, currentEvent, isLoading, simDay, simToNextEvent, handleChoice, handleRetire } =
    useGameStore();
  const { md } = useBreakpoint();
  const [modal, contextHolderModal] = AntdModal.useModal();
  const [standingsModalVisible, setStandingsModalVisible] = useState(false);

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
    return null;
  }

  const playerTeam = teams.find((t) => t.id === player.teamId);

  const PlayerIdentityColumn = (
    <>
      <PlayerIdentityCard player={player} team={playerTeam} />
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
        <Space>
          <Button onClick={() => setStandingsModalVisible(true)}>View Standings</Button>
          <Button size="small" danger onClick={confirmRetire}>
            Retire
          </Button>
        </Space>
      </div>
      <ScheduleCalendar player={player} orientation={md ? 'horizontal' : 'vertical'} />
      {currentEvent ? (
        <EventDisplay event={currentEvent} player={player} onChoice={handleChoice} isLoading={isLoading} />
      ) : (
        <ActionButtons onSimDay={simDay} onSimToNext={simToNextEvent} isLoading={isLoading} />
      )}
    </>
  );

  const CareerLogColumn = <CareerLogFeed logEntries={player.careerLog} />;

  const DesktopLayout = (
    <Row gutter={[24, 24]}>
      <Col md={6}>{PlayerIdentityColumn}</Col>
      <Col md={12}>{JourneyColumn}</Col>
      <Col md={6}>{CareerLogColumn}</Col>
    </Row>
  );

  const MobileLayout = (
    <Tabs defaultActiveKey="1" centered>
      <Tabs.TabPane tab="Journey" key="1">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {JourneyColumn}
          {CareerLogColumn}
        </Space>
      </Tabs.TabPane>
      <Tabs.TabPane tab="Player" key="2">
        {PlayerIdentityColumn}
      </Tabs.TabPane>
      <Tabs.TabPane tab="League" key="3">
        <LeagueStandingsScreen />
      </Tabs.TabPane>
    </Tabs>
  );

  return (
    <>
      {contextHolderModal}
      <Modal
        title="League Standings"
        open={standingsModalVisible}
        onCancel={() => setStandingsModalVisible(false)}
        footer={null}
        width="80%"
        style={{ top: 20 }}
      >
        <LeagueStandingsScreen />
      </Modal>
      {md ? DesktopLayout : MobileLayout}
    </>
  );
};
