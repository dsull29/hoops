import {
  App as AntdApp,
  Modal as AntdModal,
  Button,
  Card,
  Col,
  ConfigProvider,
  Row,
  Space,
  Spin,
  message as antdMessageApi,
  theme as antdTheme,
} from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
// Component Imports
import { CareerLogDisplay } from './components/CareerLogDisplay.tsx';
import { ErrorBoundaryFallback } from './components/ErrorBoundaryFallback.tsx';
import { EventDisplay } from './components/EventDisplay.tsx';
import { FiveDaySchedule } from './components/FiveDaySchedule.tsx';
import { GameLayout } from './components/GameLayout.tsx';
import { GameOverScreen } from './components/GameOverScreen.tsx';
import { MenuScreen } from './components/MenuScreen.tsx';
import { PlayerStatsDisplay } from './components/PlayerStatsDisplay.tsx';
// Store Imports
import { useGameStore } from './store/gameStore.ts';
import { useUIStore } from './store/uiStore.ts';

const SimulationControls: React.FC<{
  onSimDay: () => void;
  onSimToNext: () => void;
  isLoading: boolean;
  isDarkMode: boolean;
}> = ({ onSimDay, onSimToNext, isLoading, isDarkMode }) => (
  <Card
    style={{
      backgroundColor: isDarkMode ? '#1f1f1f' : '#ffffff',
      textAlign: 'center',
      marginBottom: 24,
    }}
  >
    <Space>
      <Button type='default' size='large' onClick={onSimDay} disabled={isLoading}>
        Sim Next Day
      </Button>
      <Button type='primary' size='large' onClick={onSimToNext} disabled={isLoading}>
        Sim to Next Event
      </Button>
    </Space>
  </Card>
);

const AppContent: React.FC = () => {
  const { gamePhase, player, currentEvent, isLoading, handleChoice, handleRetire, simDay, simToNextEvent } =
    useGameStore();
  const { isDarkMode, setDarkMode } = useUIStore();
  const [modal, contextHolderModal] = AntdModal.useModal();

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

  const renderGameContent = () => {
    if (gamePhase === 'menu') {
      return <MenuScreen />;
    }

    if (gamePhase === 'gameOver' && player) {
      return <GameOverScreen player={player} />;
    }

    if (gamePhase === 'playing' && player) {
      return (
        <Row gutter={24}>
          {/* --- LEFT COLUMN --- */}
          <Col xs={24} md={8}>
            <PlayerStatsDisplay player={player} />
            <CareerLogDisplay logEntries={player.careerLog} />
          </Col>

          {/* --- RIGHT COLUMN --- */}
          <Col xs={24} md={16}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0 }}>Season {player.currentSeasonInMode} - Day {player.currentDayInSeason}</h3>
              <Button size='small' danger onClick={confirmRetire}>
                Retire Career
              </Button>
            </div>
            <FiveDaySchedule player={player} />
            {currentEvent ? (
              <EventDisplay
                event={currentEvent}
                player={player}
                onChoice={handleChoice}
                isLoading={isLoading}
              />
            ) : (
              <SimulationControls
                onSimDay={simDay}
                onSimToNext={simToNextEvent}
                isLoading={isLoading}
                isDarkMode={isDarkMode}
              />
            )}
          </Col>
        </Row>
      );
    }

    return null;
  };

  return (
    <>
      {contextHolderModal}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div>
            <Spin size='large' tip='Simulating...' />
          </div>
        </div>
      )}
      <GameLayout isDarkMode={isDarkMode} onThemeChange={setDarkMode}>
        {renderGameContent()}
      </GameLayout>
    </>
  );
};

const AppGate: React.FC = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    const onHasHydrated = useGameStore.persist.hasHydrated();
    if (onHasHydrated) {
      setIsHydrated(true);
    }

    const unsubFinishHydration = useGameStore.persist.onFinishHydration(() => {
      const state = useGameStore.getState();
      if (state.gamePhase === 'playing' && !state.player) {
        state.clearSavedGame();
      }
      setIsHydrated(true);
    });

    return () => {
      unsubFinishHydration();
    };
  }, []);

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size='large' tip='Loading Game...' />
      </div>
    );
  }

  return <AppContent />;
};

const App: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#1890ff' : '#1890ff',
    },
    components: {
      Progress: {
        defaultColor: isDarkMode ? '#1890ff' : '#1890ff'
      }
    }
  };

  const handleReset = () => {
    useGameStore.getState().clearSavedGame();
    window.location.reload();
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={handleReset}>
          <AppGate />
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
