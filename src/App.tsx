import React, { useState, useCallback } from "react";
import { Spin, message } from "antd";
import { MenuScreen } from "./components/MenuScreen";
import { GameLayout } from "./components/GameLayout";
import { PlayerStatsDisplay } from "./components/PlayerStatsDisplay";
import { EventDisplay } from "./components/EventDisplay";
import { CareerLogDisplay } from "./components/CareerLogDisplay";
import { GameOverScreen } from "./components/GameOverScreen";
import { createInitialPlayer } from "./gameLogic/playerLogic";
import { createDailyChoiceEvent } from "./gameLogic/eventDefinitions";
import { processTurn } from "./gameLogic/gameLoop";
import type { GameState, Choice } from "./types";

// --- FILE: src/App.tsx ---
const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>({
    player: null,
    currentEvent: null,
    isLoading: false,
    gamePhase: "menu",
  });
  const [metaSkillPoints, setMetaSkillPoints] = useState<number>(0);
  // To track points earned in the current run for the game over screen
  const [metaSkillPointsAtRunStart, setMetaSkillPointsAtRunStart] =
    useState<number>(0);

  const startGame = useCallback(() => {
    setMetaSkillPointsAtRunStart(metaSkillPoints); // Store current meta points before new player modifies it
    const newPlayer = createInitialPlayer(metaSkillPoints);
    setGameState({
      player: newPlayer,
      currentEvent: createDailyChoiceEvent(newPlayer),
      isLoading: false,
      gamePhase: "playing",
    });
  }, [metaSkillPoints]);

  const handleChoice = useCallback(
    (choice: Choice) => {
      if (!gameState.player || gameState.isLoading) return;

      if (
        choice.cost &&
        gameState.player.stats[choice.cost.stat] < choice.cost.amount
      ) {
        message.error(`Not enough ${choice.cost?.stat}!`);
        return;
      }

      setGameState((prev) => ({ ...prev, isLoading: true }));

      setTimeout(() => {
        const { updatedPlayer, outcomeMessage, immediateEvent } = choice.action(
          gameState.player!
        );
        const newLog = [...updatedPlayer.careerLog, outcomeMessage];
        message.success(outcomeMessage, 2);

        const playerAfterChoiceAction = { ...updatedPlayer, careerLog: newLog };

        const turnResult = processTurn(
          playerAfterChoiceAction,
          immediateEvent ?? null
        );

        if (turnResult.eventTriggerMessage) {
          message.info(turnResult.eventTriggerMessage, 3);
        }

        if (turnResult.isGameOver) {
          const pointsEarned =
            Math.floor(turnResult.nextPlayerState.totalDaysPlayed / 10) +
            turnResult.nextPlayerState.stats.shooting +
            turnResult.nextPlayerState.stats.athleticism; // Simplified
          const newTotalMetaSkillPoints =
            metaSkillPointsAtRunStart + pointsEarned; // Calculate based on start of run

          setMetaSkillPoints(newTotalMetaSkillPoints);
          // Update player's skillPoints to reflect total for display on game over screen
          const finalPlayerState = {
            ...turnResult.nextPlayerState,
            stats: {
              ...turnResult.nextPlayerState.stats,
              skillPoints: newTotalMetaSkillPoints,
            },
          };

          setGameState({
            player: finalPlayerState,
            currentEvent: null,
            isLoading: false,
            gamePhase: "gameOver",
          });
        } else {
          setGameState({
            player: turnResult.nextPlayerState,
            currentEvent: turnResult.nextEvent,
            isLoading: false,
            gamePhase: "playing",
          });
        }
      }, 500); // Simulate processing time
    },
    [gameState.player, gameState.isLoading, metaSkillPointsAtRunStart]
  );

  return (
    <GameLayout>
      {gameState.isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(255,255,255,0.5)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Spin size="large" tip="Processing..." />
        </div>
      )}

      {gameState.gamePhase === "menu" && (
        <MenuScreen onStartGame={startGame} metaSkillPoints={metaSkillPoints} />
      )}

      {gameState.gamePhase === "playing" &&
        gameState.player &&
        gameState.currentEvent && (
          <>
            <PlayerStatsDisplay player={gameState.player} />
            <EventDisplay
              event={gameState.currentEvent}
              player={gameState.player}
              onChoice={handleChoice}
              isLoading={gameState.isLoading}
            />
            <CareerLogDisplay logEntries={gameState.player.careerLog} />
          </>
        )}

      {gameState.gamePhase === "gameOver" && gameState.player && (
        <GameOverScreen
          player={gameState.player}
          onStartGame={startGame}
          metaSkillPointsBeforeThisRun={metaSkillPointsAtRunStart}
        />
      )}
    </GameLayout>
  );
};

export default App;
