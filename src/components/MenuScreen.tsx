// --- FILE: src/components/MenuScreen.tsx ---
import { Button, Statistic, Typography } from "antd";
const { Title: MenuTitle, Paragraph: MenuParagraph } = Typography;

interface MenuScreenProps {
  onStartGame: () => void;
  metaSkillPoints: number;
}
export const MenuScreen: React.FC<MenuScreenProps> = ({ onStartGame, metaSkillPoints }) => (
  <div style={{ textAlign: 'center', padding: '50px 20px' }}>
    <MenuTitle level={1} style={{ marginBottom: 16 }}>Hoops</MenuTitle>
    <MenuParagraph style={{ fontSize: '1.2em', maxWidth: 600, margin: '0 auto 24px auto' }}>
      Forge your legacy through High School, College, and the Pros. Each choice shapes your path.
    </MenuParagraph>
    <Statistic title="Current Legacy Points" value={metaSkillPoints} valueStyle={{ color: '#1890ff' }} />
    <MenuParagraph type="secondary" style={{ display: 'block', margin: '8px auto 24px auto' }}>(Legacy points give your next player a small starting boost!)</MenuParagraph>
    <Button type="primary" size="large" onClick={onStartGame} style={{ paddingLeft: 40, paddingRight: 40, height: 50, fontSize: '1.2em' }}>
      Start New Career
    </Button>
  </div>
);