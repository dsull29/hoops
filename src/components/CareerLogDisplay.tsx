import { Card, List, Typography } from 'antd';

const { Text: LogText } = Typography;

interface CareerLogDisplayProps {
  logEntries: string[];
}
export const CareerLogDisplay: React.FC<CareerLogDisplayProps> = ({ logEntries }) => (
  <Card title="Career Log" style={{ height: '400px' }}>
    <div style={{ height: '320px', overflowY: 'auto' }}>
      <List
        size='small'
        dataSource={logEntries.slice().reverse()}
        renderItem={(item) => (
          <List.Item
            style={{
              padding: '4px 0',
              borderBottom: '1px solid #f0f0f0',
              fontWeight: item.startsWith('---') ? 'bold' : 'normal',
              color: item.startsWith('---') ? '#faad14' : 'inherit'
            }}
          >
            <LogText style={{ fontSize: '12px' }}>{item}</LogText>
          </List.Item>
        )}
      />
    </div>
  </Card>
);
