// --- FILE: src/components/PlayerStatsDisplay.tsx ---
import {
  Card,
  Statistic,
  Progress,
  Row,
  Col,
  Descriptions,
  Tag,
  Divider,
  Typography,
} from "antd";
import { MAX_ENERGY, MAX_STAT_VALUE } from "../constants";
import { Player, PlayerStats } from "../types";

const { Title: PlayerTitle, Text: PlayerText } = Typography;

interface PlayerStatsDisplayProps {
  player: Player;
}
export const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({
  player,
}) => (
  <Card
    title={
      <PlayerTitle level={3}>
        {player.name} - {player.position} ({player.age} y.o.)
      </PlayerTitle>
    }
    style={{ marginBottom: 24 }}
  >
    <Descriptions
      bordered
      size="small"
      column={{ xxl: 3, xl: 2, lg: 2, md: 2, sm: 1, xs: 1 }}
    >
      <Descriptions.Item label="Season">
        {player.currentSeason}
      </Descriptions.Item>
      <Descriptions.Item label="Day">
        {player.currentDayInSeason}
      </Descriptions.Item>
      <Descriptions.Item label="Total Days Played">
        {player.totalDaysPlayed}
      </Descriptions.Item>
      <Descriptions.Item label="Traits" span={player.traits.length > 0 ? 3 : 1}>
        {player.traits.length > 0
          ? player.traits.map((trait) => (
              <Tag key={trait} color="blue">
                {trait}
              </Tag>
            ))
          : "None"}
      </Descriptions.Item>
    </Descriptions>
    <Divider>Stats</Divider>
    <Row gutter={[16, 16]}>
      {(Object.keys(player.stats) as Array<keyof PlayerStats>)
        .filter((key) => key !== "skillPoints")
        .map((key) => (
          <Col key={key} xs={24} sm={12} md={8} lg={6}>
            <Card
              size="small"
              title={
                <PlayerText strong className="capitalize">
                  {key.replace(/([A-Z])/g, " $1")}
                </PlayerText>
              }
            >
              <Statistic
                value={player.stats[key]}
                suffix={
                  key === "energy" || key === "morale"
                    ? `/ ${MAX_ENERGY}`
                    : `/ ${MAX_STAT_VALUE}`
                }
              />
              {(key === "energy" || key === "morale") && (
                <Progress
                  percent={Math.round(
                    (player.stats[key] /
                      (key === "energy" || key === "morale"
                        ? MAX_ENERGY
                        : MAX_STAT_VALUE)) *
                      100
                  )}
                  size="small"
                  status={
                    player.stats[key] < 30
                      ? "exception"
                      : player.stats[key] < 60
                      ? "normal"
                      : "success"
                  }
                />
              )}
            </Card>
          </Col>
        ))}
    </Row>
  </Card>
);
