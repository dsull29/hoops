import {
  App as AntdApp,
  Modal as AntdModal,
  ConfigProvider,
  Spin,
  message as antdMessageApi,
  theme as antdTheme,
} from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider';
import React, { useEffect } from 'react';

// Component Imports
import { CareerLogDisplay } from './components/CareerLogDisplay';
import { EventDisplay } from './components/EventDisplay';
import { GameLayout } from './components/GameLayout';
import { GameOverScreen } from './components/GameOverScreen';
import { MenuScreen } from './components/MenuScreen';
import { PlayerStatsDisplay } from './components/PlayerStatsDisplay';

// Store Imports
import { Button } from 'antd';
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore'; // Import the new UI store

const AppContent: React.FC = () => {
  // State from Game Store
  const { gamePhase, player, currentEvent, isLoading, handleChoice, handleRetire } = useGameStore();
  // State from UI Store
  const { isDarkMode, hasLoadedInitialState, setDarkMode, setHasLoaded } = useUIStore();

  const [modal, contextHolderModal] = AntdModal.useModal();

  // This effect runs once on mount to initialize everything from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem('HoopsTheme_v1');
    setDarkMode(storedTheme === 'dark');
    // The game state is rehydrated automatically by the persist middleware.
    // We just need to signal that the initial setup is complete.
    setHasLoaded(true);
  }, [setDarkMode, setHasLoaded]);

  const confirmRetire = () => {
    modal.confirm({
      title: 'Retire Career?',
      content: 'Are you sure you want to end your current career? This action cannot be undone.',
      okText: 'Retire',
      cancelText: 'Cancel',
      onOk: () => {
        const { retired, message } = handleRetire();
        if (retired) {
          antdMessageApi.info(message);
        }
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
        <Spin size='large' tip='Loading Game...' />
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
          <Spin size='large' tip='Processing...' />
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

// The main App component now gets its theme state from the UI store
const App: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#66ccff' : '#1677ff',
    },
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp>
        <AppContent />
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
