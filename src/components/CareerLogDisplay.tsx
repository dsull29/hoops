// --- FILE: src/components/CareerLogDisplay.tsx ---
import { Card, Divider, List, Typography } from "antd";
const { Title, Text } = Typography;

interface CareerLogDisplayProps {
  logEntries: string[];
}
export const CareerLogDisplay: React.FC<CareerLogDisplayProps> = ({
  logEntries,
}) => (
  <>
    <Divider />
    <Card
      title={<Title level={5}>Career Log</Title>}
      style={{ maxHeight: 300, overflowY: "auto" }}
    >
      <List
        size="small"
        dataSource={logEntries.slice().reverse()}
        renderItem={(item) => (
          <List.Item
            style={
              item.startsWith("---")
                ? { fontWeight: "bold", color: "#faad14" }
                : {}
            }
          >
            <Text>{item}</Text>
          </List.Item>
        )}
      />
    </Card>
  </>
);
