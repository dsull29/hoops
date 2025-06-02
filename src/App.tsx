import type { ThemeConfig } from 'antd/es/config-provider'; // For theme algorithm type

import { theme as antdTheme, Button, ConfigProvider, message, Modal, Space, Spin } from "antd";
import React, { useCallback } from "react";
import { CareerLogDisplay } from "./components/CareerLogDisplay";
import { EventDisplay } from "./components/EventDisplay";
import { GameLayout } from "./components/GameLayout";
import { GameOverScreen } from "./components/GameOverScreen";
import { MenuScreen } from "./components/MenuScreen";
import { PlayerStatsDisplay } from "./components/PlayerStatsDisplay";
import { LOCAL_STORAGE_KEY_GAME_STATE } from './constants';
import { createDailyChoiceEvent } from "./gameLogic/eventDefinitions";
import { processTurn } from "./gameLogic/gameLoop";
import { createInitialPlayer } from "./gameLogic/playerLogic";
import { useGamePersistence } from "./hooks/useGamePersistence";
import type { Choice, GameState } from "./types";

const App: React.FC = () => {
  const {
    gameState, setGameState,
    metaSkillPoints, setMetaSkillPoints,
    metaSkillPointsAtRunStart, setMetaSkillPointsAtRunStart,
    isDarkMode, setIsDarkMode,
    hasLoadedInitialState,
    saveGameToStorage, // Will be used for autosave
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
    // Autosave the very first state of the new game
    saveGameToStorage(initialGameState, metaSkillPoints, true); // true for silent save
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

    Modal.confirm({
      title: 'Retire Career?',
      content: 'Are you sure you want to end your current career? This action cannot be undone.',
      okText: 'Retire',
      cancelText: 'Cancel',
      onOk: () => {
        const player = gameState.player!;
        const retirementMessage = '--- CAREER OVER: You decided to retire voluntarily. ---';
        const updatedPlayer = {
          ...player,
          careerOver: true,
          careerLog: [...player.careerLog, retirementMessage],
        };

        const pointsEarned = Math.floor(updatedPlayer.totalDaysPlayed / 10) +
          updatedPlayer.stats.shooting +
          updatedPlayer.stats.athleticism;
        const newTotalMetaSkillPoints = metaSkillPointsAtRunStart + pointsEarned;

        setMetaSkillPoints(newTotalMetaSkillPoints);
        const finalPlayerState = {
          ...updatedPlayer,
          stats: {
            ...updatedPlayer.stats,
            skillPoints: newTotalMetaSkillPoints
          }
        };
        setGameState({ player: finalPlayerState, currentEvent: null, isLoading: false, gamePhase: 'gameOver' });
        localStorage.removeItem(LOCAL_STORAGE_KEY_GAME_STATE);
        message.info("You have retired. Your legacy awaits!");
      }
    });
  }, [gameState.player, metaSkillPointsAtRunStart, setGameState, setMetaSkillPoints]);


  const handleChoice = useCallback((choice: Choice) => {
    if (!gameState.player || gameState.isLoading || !choice || typeof choice.action !== 'function') {
      console.error("Invalid choice or action function:", choice);
      message.error("An error occurred with the selected choice. Please try again or reload.");
      setGameState(prev => ({ ...prev, isLoading: false }));
      return;
    }

    if (choice.cost && gameState.player.stats[choice.cost.stat] < choice.cost.amount) {
      message.error(`Not enough ${choice.cost?.stat}!`);
      return;
    }

    setGameState(prev => ({ ...prev, isLoading: true }));

    setTimeout(() => {
      let nextGameState: GameState | null = null;
      try {
        const { updatedPlayer, outcomeMessage, immediateEvent } = choice.action(gameState.player!);
        const newLogEntry = outcomeMessage;
        const newLog = [...updatedPlayer.careerLog, newLogEntry];

        message.success(newLogEntry, 2.5);

        const playerAfterChoiceAction = { ...updatedPlayer, careerLog: newLog };
        const turnResult = processTurn(playerAfterChoiceAction, immediateEvent ?? null);

        if (turnResult.eventTriggerMessage) {
          const messages = turnResult.eventTriggerMessage.split('---').map(s => s.trim()).filter(s => s.length > 0);
          messages.forEach((msg, index) => {
            setTimeout(() => message.info(msg, 3.5), index * 600);
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
        setGameState(nextGameState); // Update the state

        // AUTOSAVE: Save after the state has been successfully updated
        if (nextGameState && nextGameState.gamePhase === 'playing' && nextGameState.player) {
          saveGameToStorage(nextGameState, metaSkillPointsAtRunStart, true);
        }

      } catch (error) {
        console.error("Error during choice action processing:", error);
        message.error("A critical error occurred. Please reload the game.");
        setGameState(prev => ({ ...prev, isLoading: false, gamePhase: 'menu', player: null, currentEvent: null }));
      }
    }, 300);
  }, [gameState.player, gameState.isLoading, metaSkillPointsAtRunStart, setGameState, setMetaSkillPoints, saveGameToStorage]);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
  };

  const antdThemeConfig: ThemeConfig = {
    algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: isDarkMode ? '#66ccff' : '#1677ff',
    },
  };

  if (!hasLoadedInitialState) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>
        <Spin size="large" tip="Loading Game..." />
      </div>
    );
  }

  return (
    <ConfigProvider theme={antdThemeConfig}>
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
    </ConfigProvider>
  );
};

export default App;