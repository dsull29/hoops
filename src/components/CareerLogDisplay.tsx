// --- FILE: src/components/CareerLogDisplay.tsx ---
import { Card, Divider, List, Typography } from "antd";

const { Title: LogTitle, Text: LogText } = Typography;

interface CareerLogDisplayProps {
  logEntries: string[];
}
export const CareerLogDisplay: React.FC<CareerLogDisplayProps> = ({ logEntries }) => (
  <>
    <Divider />
    <Card title={<LogTitle level={5}>Career Log</LogTitle>} style={{ maxHeight: 300, overflowY: 'auto' }}>
      <List
        size="small"
        dataSource={logEntries.slice().reverse()}
        renderItem={(item) => (
          <List.Item style={item.startsWith('---') ? { fontWeight: 'bold', color: '#faad14' } : {}}>
            <LogText>{item}</LogText>
          </List.Item>
        )}
      />
    </Card>
  </>
);
