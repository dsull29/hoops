import { Button, Space, Statistic, Typography } from 'antd';

const { Title: MenuTitleComp, Paragraph: MenuParagraphComp } = Typography;
interface MenuScreenProps {
  onStartGame: () => void;
  metaSkillPoints: number;
  hasSavedGame: boolean; // Ensure this prop is defined
  onLoadGame: () => void;
  onClearSavedGame: () => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  onStartGame,
  metaSkillPoints,
  hasSavedGame,
  onLoadGame,
  onClearSavedGame,
}) => (
  <div style={{ textAlign: 'center', padding: '50px 20px' }}>
    <MenuTitleComp level={1} style={{ marginBottom: 16 }}>
      Roguelike Basketball Sim
    </MenuTitleComp>
    <MenuParagraphComp style={{ fontSize: '1.2em', maxWidth: 600, margin: '0 auto 24px auto' }}>
      Forge your legacy through High School, College, and the Pros. Each choice shapes your path.
    </MenuParagraphComp>
    <Statistic
      title='Current Legacy Points'
      value={metaSkillPoints}
      valueStyle={{ color: '#1890ff' }}
    />
    <MenuParagraphComp type='secondary' style={{ display: 'block', margin: '8px auto 24px auto' }}>
      (Legacy points give your next player a small starting boost!)
    </MenuParagraphComp>
    <Space direction='vertical' size='middle'>
      <Button
        type='primary'
        size='large'
        onClick={onStartGame}
        style={{ minWidth: 200, height: 50, fontSize: '1.2em' }}
      >
        Start New Career{' '}
      </Button>
      {hasSavedGame && (
        <Button
          type='dashed'
          size='large'
          onClick={onLoadGame}
          style={{ minWidth: 200, height: 50, fontSize: '1.2em' }}
        >
          Load Saved Game{' '}
        </Button>
      )}{' '}
      {hasSavedGame && (
        <Button danger size='small' onClick={onClearSavedGame} style={{ marginTop: 8 }}>
          Clear Saved Game{' '}
        </Button>
      )}
    </Space>
  </div>
);
