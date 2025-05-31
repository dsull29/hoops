// --- FILE: src/components/CareerLogDisplay.tsx ---
import {
  Card as LogCard,
  List as LogList,
  Typography as LogTypography,
  Divider as LogDivider,
} from "antd";
const { Title: LogTitle, Text: LogText } = LogTypography;

interface CareerLogDisplayProps {
  logEntries: string[];
}
export const CareerLogDisplay: React.FC<CareerLogDisplayProps> = ({
  logEntries,
}) => (
  <>
    <LogDivider />
    <LogCard
      title={<LogTitle level={5}>Career Log</LogTitle>}
      style={{ maxHeight: 300, overflowY: "auto" }}
    >
      <LogList
        size="small"
        dataSource={logEntries.slice().reverse()}
        renderItem={(item) => (
          <LogList.Item
            style={
              item.startsWith("---")
                ? { fontWeight: "bold", color: "#faad14" }
                : {}
            }
          >
            <LogText>{item}</LogText>
          </LogList.Item>
        )}
      />
    </LogCard>
  </>
);
