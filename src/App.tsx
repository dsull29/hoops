import {
  App as AntdApp, // Ant Design's App component
  Modal as AntdModal,
  Button,
  ConfigProvider,
  Space,
  Spin, // Modal for useModal hook
  message as antdMessageApi, // message for useMessage hook
  theme as antdTheme
} from 'antd';
import type { ThemeConfig } from 'antd/es/config-provider';
import React, { useCallback, useEffect, useState } from 'react';

// Assuming these are correctly imported from your project structure
import { LOCAL_STORAGE_KEY_GAME_STATE, LOCAL_STORAGE_KEY_THEME } from './constants'; // Adjust path
import { createDailyChoiceEvent } from './gameLogic/eventDefinitions'; // Adjust path
import { processTurn } from './gameLogic/gameLoop'; // Adjust path
import { createInitialPlayer, processPlayerRetirement } from './gameLogic/playerLogic'; // Adjust path
import { useGamePersistence } from './hooks/useGamePersistence'; // Adjust path
import type { Choice, GameState } from './types'; // Adjust path if needed

import { CareerLogDisplay } from './components/CareerLogDisplay';
import { EventDisplay } from './components/EventDisplay';
import { GameLayout } from './components/GameLayout';
import { GameOverScreen } from './components/GameOverScreen';
import { MenuScreen } from './components/MenuScreen';
import { PlayerStatsDisplay } from './components/PlayerStatsDisplay';

const AppContent: React.FC = () => {
  // Use Ant Design's hooks for context-aware modals and messages
  const [modal, contextHolderModal] = AntdModal.useModal();
  const [messageApi, contextHolderMessage] = antdMessageApi.useMessage();

  const {
    gameState, setGameState,
    metaSkillPoints, setMetaSkillPoints,
    metaSkillPointsAtRunStart, setMetaSkillPointsAtRunStart,
    isDarkMode, setIsDarkMode,
    hasLoadedInitialState,
    saveGameToStorage,
    loadGameFromStorage,
    clearSavedGameFromStorage
  } = useGamePersistence();


  const startGame = useCallback(() => {
    setMetaSkillPointsAtRunStart(metaSkillPoints);
    const newPlayer = createInitialPlayer(metaSkillPoints);
    const initialGameState: GameState = {
      player: newPlayer,
      currentEvent: createDailyChoiceEvent(newPlayer),
      isLoading: false,
      gamePhase: 'playing',
    };
    setGameState(initialGameState);
    saveGameToStorage(initialGameState, metaSkillPoints, true); // Silent autosave
  }, [metaSkillPoints, setGameState, setMetaSkillPointsAtRunStart, saveGameToStorage]);

  const handleLoadGame = useCallback(() => {
    const loadedState = loadGameFromStorage();
    if (loadedState) {
      setGameState(loadedState);
    }
  }, [loadGameFromStorage, setGameState]);

  const handleClearSavedGame = useCallback(() => {
    clearSavedGameFromStorage();
    if (gameState.gamePhase !== 'menu') {
      setGameState({ player: null, currentEvent: null, isLoading: false, gamePhase: 'menu' });
    }
  }, [clearSavedGameFromStorage, gameState.gamePhase, setGameState]);


  const handleRetire = useCallback(() => {
    if (!gameState.player) return;

    modal.confirm({ // Use the modal instance from the hook
      title: 'Retire Career?',
      content: 'Are you sure you want to end your current career? This action cannot be undone.',
      okText: 'Retire',
      cancelText: 'Cancel',
      onOk: () => {
        if (!gameState.player) return; // Re-check player state

        const { finalPlayerState, newTotalMetaSkillPoints } = processPlayerRetirement(
          gameState.player,
          metaSkillPointsAtRunStart
        );

        setMetaSkillPoints(newTotalMetaSkillPoints);
        setGameState({
          player: finalPlayerState,
          currentEvent: null,
          isLoading: false,
          gamePhase: 'gameOver'
        });

        localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
        messageApi.info("You have retired. Your legacy awaits!"); // Use messageApi instance
      }
    });
  }, [gameState.player, metaSkillPointsAtRunStart, setGameState, setMetaSkillPoints, modal, messageApi]); // Added modal and messageApi to dependencies


  const handleChoice = useCallback((choice: Choice) => {
    if (!gameState.player || gameState.isLoading || !choice || typeof choice.action !== 'function') {
      console.error("Invalid choice or action function:", choice);
      messageApi.error("An error occurred with the selected choice. Please try again or reload.");
      setGameState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (choice.cost && gameState.player.stats[choice.cost.stat] < choice.cost.amount) {
      messageApi.error(`Not enough ${choice.cost?.stat}!`);
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true }));

    setTimeout(() => {
      let nextGameState: GameState | null = null;
      try {
        const choiceResult = choice.action(gameState.player!);
        const { updatedPlayer, outcomeMessage, immediateEvent, gamePerformance } = choiceResult;

        let processedOutcomeMessage = outcomeMessage;
        if (gamePerformance) {
          const { statLine, teamWon } = gamePerformance;
          const resultString = teamWon ? 'Your team WON!' : 'Your team LOST.';
          const statString = `In ${statLine.minutes} minutes, you finished with ${statLine.points} PTS, ${statLine.rebounds} REB, ${statLine.assists} AST.`;
          if (outcomeMessage && !outcomeMessage.includes(statString)) {
            processedOutcomeMessage = `${outcomeMessage} ${statString} ${resultString}`;
          } else {
            processedOutcomeMessage = `${statString} ${resultString}`;
          }
        }

        const newLogEntry = processedOutcomeMessage;
        const newLog = [...updatedPlayer.careerLog, newLogEntry];

        messageApi.success(newLogEntry, 3.5);


        const playerAfterChoiceAction = { ...updatedPlayer, careerLog: newLog };
        const turnResult = processTurn(playerAfterChoiceAction, immediateEvent ?? null);

        if (turnResult.eventTriggerMessage) {
          const messages = turnResult.eventTriggerMessage.split('---').map(s => s.trim()).filter(s => s.length > 0);
          messages.forEach((msg, index) => {
            setTimeout(() => messageApi.info(msg, 3.5), index * 700);
          });
        }

        if (turnResult.isGameOver) {
          const finalPlayerStateForPoints = turnResult.nextPlayerState;
          const pointsEarned = Math.floor(finalPlayerStateForPoints.totalDaysPlayed / 10) +
            finalPlayerStateForPoints.stats.shooting +
            finalPlayerStateForPoints.stats.athleticism;

          const newTotalMetaSkillPoints = metaSkillPointsAtRunStart + pointsEarned;

          setMetaSkillPoints(newTotalMetaSkillPoints);
          const finalPlayerState = {
            ...finalPlayerStateForPoints,
            stats: {
              ...finalPlayerStateForPoints.stats,
              skillPoints: newTotalMetaSkillPoints
            }
          };
          nextGameState = { player: finalPlayerState, currentEvent: null, isLoading: false, gamePhase: 'gameOver' };
          localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
        } else {
          nextGameState = { player: turnResult.nextPlayerState, currentEvent: turnResult.nextEvent, isLoading: false, gamePhase: 'playing' };
        }
        setGameState(nextGameState);

        if (nextGameState && nextGameState.gamePhase === 'playing' && nextGameState.player) {
          saveGameToStorage(nextGameState, metaSkillPointsAtRunStart, true); // Silent autosave
        }

      } catch (error) {
        console.error("Error during choice action processing:", error);
        messageApi.error("A critical error occurred. Please reload the game.");
        setGameState(prev => ({ ...prev, isLoading: false, gamePhase: 'menu', player: null, currentEvent: null }));
      }
    }, 300);
  }, [gameState.player, gameState.isLoading, metaSkillPointsAtRunStart, setGameState, setMetaSkillPoints, saveGameToStorage, messageApi]); // Added messageApi

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  if (!hasLoadedInitialState) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spin size="large" tip="Loading Game..." />
      </div>
    );
  }

  return (
    <>
      {contextHolderModal}   {/* Crucial: Render context holder for Modal */}
      {contextHolderMessage} {/* Crucial: Render context holder for Message */}
      {gameState.isLoading && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Spin size="large" tip="Processing..." />
        </div>
      )}
      <GameLayout isDarkMode={isDarkMode} onThemeChange={handleThemeChange}>
        {gameState.gamePhase === 'menu' && (
          <MenuScreen
            onStartGame={startGame}
            metaSkillPoints={metaSkillPoints}
            hasSavedGame={!!localStorage.getItem(LOCAL_STORAGE_KEY_GAME_STATE)}
            onLoadGame={handleLoadGame}
            onClearSavedGame={handleClearSavedGame}
          />
        )}

        {gameState.gamePhase === 'playing' && gameState.player && gameState.currentEvent && (
          <>
            <Space style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              {/* Manual Save Button is now removed */}
              <Button size="small" danger onClick={handleRetire}>Retire Career</Button>
            </Space>
            <PlayerStatsDisplay player={gameState.player} />
            <EventDisplay event={gameState.currentEvent} player={gameState.player} onChoice={handleChoice} isLoading={gameState.isLoading} />
            <CareerLogDisplay logEntries={gameState.player.careerLog} />
          </>
        )}

        {gameState.gamePhase === 'gameOver' && gameState.player && (
          <GameOverScreen player={gameState.player} onStartGame={startGame} metaSkillPointsBeforeThisRun={metaSkillPointsAtRunStart} />
        )}
      </GameLayout>
    </>
  );
};

// Main App component that includes the AntdApp wrapper for context
const App: React.FC = () => {
  // isDarkMode state needs to be managed here if ConfigProvider is here
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_KEY_THEME);
    return storedTheme === 'dark';
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_THEME, isDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);


  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#66ccff' : '#1677ff',
    },
  };

  return (
    <ConfigProvider theme={antdThemeConfig}>
      <AntdApp> {/* Ant Design's App wrapper */}
        <AppContent /> {/* Your actual game content */}
      </AntdApp>
    </ConfigProvider>
  );
};

export default App;