import {
  App as AntdApp,
  Modal as AntdModal,
  Button,
  ConfigProvider,
  Spin,
  message as antdMessageApi,
  theme as antdTheme,
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

const AppContent: React.FC = () => {
  useHydration();

  const { gamePhase, player, currentEvent, isLoading, handleChoice, handleRetire } = useGameStore();
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
            <Spin size='large' tip='Processing...' />
          </div>
        </div>
      )}
      <GameLayout isDarkMode={isDarkMode} onThemeChange={setDarkMode}>
        {gamePhase === 'menu' && <MenuScreen />}
        {gamePhase === 'playing' && player && currentEvent && (
          <>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size='small' danger onClick={confirmRetire}>
                Retire Career
              </Button>
            </div>
            <PlayerStatsDisplay player={player} />
            <FiveDaySchedule player={player} />
            <EventDisplay
              event={currentEvent}
              player={player}
              onChoice={handleChoice}
              isLoading={isLoading}
            />
            <CareerLogDisplay logEntries={player.careerLog} />
          </>
        )}
        {gamePhase === 'gameOver' && player && <GameOverScreen player={player} />}
      </GameLayout>
    </>
  );
};

const App: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);
  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#66ccff' : '#1677ff',
    },
  };

  const handleReset = () => {
    // This function will be called when the user clicks the "Try Again" button.
    // We can clear the potentially corrupted saved game state.
    useGameStore.getState().clearSavedGame();
    // And then reload the page to start fresh.
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
