import {
  App as AntdApp,
  message as antdMessageApi,
  Modal as AntdModal,
  theme as antdTheme,
  Button,
  ConfigProvider,
  Space,
  Spin,
} from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Component Imports
import { CareerLogDisplay } from './components/CareerLogDisplay';
import { ErrorBoundaryFallback } from './components/ErrorBoundaryFallback';
import { EventDisplay } from './components/EventDisplay';
import { FiveDaySchedule } from './components/FiveDaySchedule';
import { GameLayout } from './components/GameLayout';
import { GameOverScreen } from './components/GameOverScreen';
import { MenuScreen } from './components/MenuScreen';
import { PlayerStatsDisplay } from './components/PlayerStatsDisplay';
// Hook and Store Imports
import { useHydration } from './hooks/useHydration';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore';


/**
 * NEW: A component for the simulation control buttons.
 */
const SimulationControls: React.FC<{ onSimDay: () => void; onSimToNext: () => void; isLoading: boolean }> = ({ onSimDay, onSimToNext, isLoading }) => (
  <div style={{ padding: '20px', background: '#fafafa', borderRadius: '8px', textAlign: 'center', marginBottom: 24 }}>
    <Space>
      <Button type="default" size="large" onClick={onSimDay} disabled={isLoading}>
        Sim Next Day
      </Button>
      <Button type="primary" size="large" onClick={onSimToNext} disabled={isLoading}>
        Sim to Next Event
      </Button>
    </Space>
  </div>
);

const AppContent: React.FC = () => {
  useHydration();

  // Updated to include new sim actions
  const { gamePhase, player, currentEvent, isLoading, handleChoice, handleRetire, simDay, simToNextEvent } = useGameStore();
  const { isDarkMode, hasLoadedInitialState, setDarkMode } = useUIStore();
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

  if (!hasLoadedInitialState) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100vw',
        }}
      >
        <div>
          <Spin size='large' tip='Loading Game...' />
        </div>
      </div>
    );
  }

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
        {gamePhase === 'menu' && <MenuScreen />}
        {gamePhase === 'playing' && player && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size='small' danger onClick={confirmRetire}>
                Retire Career
              </Button>
            </div>
            <PlayerStatsDisplay player={player} />
            <FiveDaySchedule player={player} />

            {/* --- CORE UI CHANGE --- */}
            {currentEvent ? (
              <EventDisplay
                event={currentEvent}
                player={player}
                onChoice={handleChoice}
                isLoading={isLoading}
              />
            ) : (
              <SimulationControls onSimDay={simDay} onSimToNext={simToNextEvent} isLoading={isLoading} />
            )}

            <CareerLogDisplay logEntries={player.careerLog} />
          </>
        )}
        {gamePhase === 'gameOver' && player && <GameOverScreen player={player} />}
      </GameLayout>
    </>
  );
};

// The main App component remains the same
const App: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#66ccff' : '#1677ff',
    },
  };

  const handleReset = () => {
    useGameStore.getState().clearSavedGame();
    window.location.reload();
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={handleReset}>
          <AppContent />
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
};


export default App;