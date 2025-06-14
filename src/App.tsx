import {
  App as AntdApp,
  ConfigProvider,
  Layout,
  Spin,
  Switch,
  Typography,
  theme as antdTheme,
} from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// --- Component Imports ---
import { ErrorBoundaryFallback } from './components/ErrorBoundaryFallback.tsx';
import { GameOverScreen } from './components/GameOverScreen.tsx';
import { MenuScreen } from './components/MenuScreen.tsx';
import { MainGameScreen } from './screens/MainGameScreen.tsx';

// --- Store Imports ---
import { useGameStore } from './store/gameStore.ts';
import { useUIStore } from './store/uiStore.ts';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

/**
 * The main content rendering component. It decides which major screen to show
 * based on the current gamePhase from the Zustand store.
 */
const AppContent: React.FC = () => {
  const { gamePhase, player, isLoading } = useGameStore();
  const { isDarkMode, setDarkMode } = useUIStore();

  const renderGameContent = () => {
    switch (gamePhase) {
      case 'menu':
        return <MenuScreen />;
      case 'playing':
        // The new MainGameScreen now handles the entire layout for the active game state.
        return <MainGameScreen />;
      case 'gameOver':
        if (player) {
          return <GameOverScreen player={player} />;
        }
        return <MenuScreen />; // Fallback to menu if game is over but there's no player
      default:
        return null;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          width: '100%',
        }}
      >
        <Title level={3} style={{ color: 'white', margin: 0, lineHeight: '64px' }}>
          Hoops
        </Title>
        <Switch
          checked={isDarkMode}
          onChange={setDarkMode}
          checkedChildren="Dark"
          unCheckedChildren="Light"
        />
      </Header>
      <Content style={{ padding: '24px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
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
            <Spin size="large" tip="Simulating..." />
          </div>
        )}
        {renderGameContent()}
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        Hoops v1.0.0 - A dsull Games Production ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

/**
 * An initialization gate that waits for Zustand state to be rehydrated
 * from async storage before rendering the main application content.
 * This prevents UI flicker on page load.
 */
const AppGate: React.FC = () => {
  const [isHydrated, setIsHydrated] = React.useState(false);

  React.useEffect(() => {
    // Check if hydration is already complete
    if (useGameStore.persist.hasHydrated()) {
      setIsHydrated(true);
    } else {
      // Listen for the hydration to finish
      const unsubFinishHydration = useGameStore.persist.onFinishHydration(() => {
        // Sanity check: if we're in 'playing' phase but have no player, reset to menu.
        const state = useGameStore.getState();
        if (state.gamePhase === 'playing' && !state.player) {
          state.clearSavedGame();
        }
        setIsHydrated(true);
      });
      return () => {
        unsubFinishHydration();
      };
    }
  }, []);

  if (!isHydrated) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading Game..." />
      </div>
    );
  }

  return <AppContent />;
};

/**
 * The root application component. It sets up the Ant Design theme provider,
 * error boundaries, and the hydration gate.
 */
const App: React.FC = () => {
  const isDarkMode = useUIStore((state) => state.isDarkMode);

  // Define the theme configuration for Ant Design
  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      colorInfo: '#1890ff'
    },
    components: {
      Card: {
        headerBg: isDarkMode ? '#1f1f1f' : '#fafafa',
      },
    },
  };

  // Function to handle critical errors by resetting the game state
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
