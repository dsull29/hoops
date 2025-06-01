// --- FILE: src/components/GameOverScreen.tsx ---
import {
  Button, Descriptions, Divider, Result, Typography
} from "antd";
import type { Player, PlayerStats } from "../types";
import { CareerLogDisplay } from "./CareerLogDisplay";

const {
  Title,
  Paragraph,
  Text,
} = Typography;

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
      title={<Title level={2}>Career Over</Title>}
      subTitle={
        <Paragraph strong>
          {player.careerLog
            .find((log) => log.startsWith("--- CAREER OVER:"))
            ?.replace("--- CAREER OVER: ", "")}
        </Paragraph>
      }
      extra={[
        <Button
          type="primary"
          key="new_career"
          onClick={onStartGame}
          size="large"
        >
          Start New Career (Total Legacy: {player.stats.skillPoints} pts)
        </Button>,
      ]}
    >
      <div
        className="desc"
        style={{ textAlign: "left", maxWidth: 600, margin: "0 auto" }}
      >
        <Title level={4} style={{ textAlign: "center" }}>
          Final Summary for {player.name}
        </Title>
        <Descriptions bordered column={1} size="small">
          {(Object.keys(player.stats) as Array<keyof PlayerStats>).map(
            (key) => (
              <Descriptions.Item
                key={key}
                label={
                  <Text strong className="capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </Text>
                }
              >
                {player.stats[key]}
              </Descriptions.Item>
            )
          )}
          <Descriptions.Item
            label={<Text strong>Total Days Played</Text>}
          >
            {player.totalDaysPlayed}
          </Descriptions.Item>
          <Descriptions.Item
            label={<Text strong>Legacy Points Earned (This Run)</Text>}
          >
            {pointsEarnedThisRun}
          </Descriptions.Item>
        </Descriptions>
        <Divider>Career Log</Divider>
        <CareerLogDisplay logEntries={player.careerLog} />
      </div>
    </Result>
  );
};
