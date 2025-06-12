import {
  App as AntdApp,
  Modal as AntdModal,
  Button,
  ConfigProvider,
  Space,
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
// Store Imports
import { useGameStore } from './store/gameStore';
import { useUIStore } from './store/uiStore';

const SimulationControls: React.FC<{
  onSimDay: () => void;
  onSimToNext: () => void;
  isLoading: boolean;
}> = ({ onSimDay, onSimToNext, isLoading }) => (
  <div
    style={{
      padding: '20px',
      background: '#fafafa',
      borderRadius: '8px',
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
  </div>
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
              />
            )}

            <CareerLogDisplay logEntries={player.careerLog} />
          </>
        )}
        {gamePhase === 'gameOver' && player && <GameOverScreen player={player} />}
      </GameLayout>
    </>
  );
};

/**
 * NEW: This component acts as a gatekeeper. It ensures that the main app
 * content only renders *after* the persisted state has been fully loaded (hydrated).
 * This prevents the "flash and disappear" bug.
 */
const AppGate: React.FC = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // onHasHydrated will be true on the first run if the state is already hydrated.
    const onHasHydrated = useGameStore.persist.hasHydrated();
    if (onHasHydrated) {
      console.log('[AppGate] State was already hydrated.');
      setIsHydrated(true);
    }

    // onFinishHydration is the definitive listener for when async storage is loaded.
    const unsubFinishHydration = useGameStore.persist.onFinishHydration(() => {
      console.log('[AppGate] onFinishHydration triggered. State is now hydrated.');
      const state = useGameStore.getState();

      // Sanity check for corrupted state
      if (state.gamePhase === 'playing' && !state.player) {
        console.warn('[AppGate] Detected corrupted state (playing phase with no player). Resetting.');
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
          {/* Render the new AppGate which controls the loading state */}
          <AppGate />
        </ErrorBoundary>
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;
