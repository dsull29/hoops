// --- FILE: src/components/GameOverScreen.tsx ---
import {
  Button as OverButton,
  Result,
  Typography as OverTypography,
  Descriptions as OverDescriptions,
  Divider as OverDivider,
} from "antd";
import { Player, PlayerStats } from "../types";
import { CareerLogDisplay } from "./CareerLogDisplay";

const {
  Title: OverTitle,
  Paragraph: OverParagraph,
  Text: OverText,
} = OverTypography;

interface GameOverScreenProps {
  player: Player;
  onStartGame: () => void;
  metaSkillPointsBeforeThisRun: number; // To calculate points earned this run
}
export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  player,
  onStartGame,
  metaSkillPointsBeforeThisRun,
}) => {
  const pointsEarnedThisRun =
    player.stats.skillPoints - metaSkillPointsBeforeThisRun;
  return (
    <Result
      status="info"
      title={<OverTitle level={2}>Career Over</OverTitle>}
      subTitle={
        <OverParagraph strong>
          {player.careerLog
            .find((log) => log.startsWith("--- CAREER OVER:"))
            ?.replace("--- CAREER OVER: ", "")}
        </OverParagraph>
      }
      extra={[
        <OverButton
          type="primary"
          key="new_career"
          onClick={onStartGame}
          size="large"
        >
          Start New Career (Total Legacy: {player.stats.skillPoints} pts)
        </OverButton>,
      ]}
    >
      <div
        className="desc"
        style={{ textAlign: "left", maxWidth: 600, margin: "0 auto" }}
      >
        <OverTitle level={4} style={{ textAlign: "center" }}>
          Final Summary for {player.name}
        </OverTitle>
        <OverDescriptions bordered column={1} size="small">
          {(Object.keys(player.stats) as Array<keyof PlayerStats>).map(
            (key) => (
              <OverDescriptions.Item
                key={key}
                label={
                  <OverText strong className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </OverText>
                }
              >
                {player.stats[key]}
              </OverDescriptions.Item>
            )
          )}
          <OverDescriptions.Item
            label={<OverText strong>Total Days Played</OverText>}
          >
            {player.totalDaysPlayed}
          </OverDescriptions.Item>
          <OverDescriptions.Item
            label={<OverText strong>Legacy Points Earned (This Run)</OverText>}
          >
            {pointsEarnedThisRun}
          </OverDescriptions.Item>
        </OverDescriptions>
        <OverDivider>Career Log</OverDivider>
        <CareerLogDisplay logEntries={player.careerLog} />
      </div>
    </Result>
  );
};
