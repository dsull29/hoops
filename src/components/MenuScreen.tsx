// --- FILE: src/components/MenuScreen.tsx ---
import {
  Button as AntButton,
  Statistic as AntStatistic,
  Typography as AntTypographyComp,
} from "antd";
const { Title: MenuTitle, Paragraph: MenuParagraph } = AntTypographyComp;

interface MenuScreenProps {
  onStartGame: () => void;
  metaSkillPoints: number;
}
export const MenuScreen: React.FC<MenuScreenProps> = ({
  onStartGame,
  metaSkillPoints,
}) => (
  <div style={{ textAlign: "center", padding: "50px 20px" }}>
    <MenuTitle level={1} style={{ marginBottom: 16 }}>
      Roguelike Basketball Sim
    </MenuTitle>
    <MenuParagraph
      style={{ fontSize: "1.2em", maxWidth: 600, margin: "0 auto 24px auto" }}
    >
      Forge your legacy on the court. Every career is a new story. Each choice
      shapes your path from a rookie to a legend... or a bust.
    </MenuParagraph>
    <AntStatistic
      title="Current Legacy Points"
      value={metaSkillPoints}
      valueStyle={{ color: "#1890ff" }}
    />
    <MenuParagraph
      type="secondary"
      style={{ display: "block", margin: "8px auto 24px auto" }}
    >
      (Legacy points give your next player a small starting boost!)
    </MenuParagraph>
    <AntButton
      type="primary"
      size="large"
      onClick={onStartGame}
      style={{
        paddingLeft: 40,
        paddingRight: 40,
        height: 50,
        fontSize: "1.2em",
      }}
    >
      Start New Career
    </AntButton>
  </div>
);
