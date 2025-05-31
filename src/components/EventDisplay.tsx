// --- FILE: src/components/EventDisplay.tsx ---
import {
  Button as EventButton,
  Card as EventCard,
  Space as EventSpace,
  Typography as EventTypography,
} from "antd";
const {
  Title: EventTitle,
  Text: EventText,
  Paragraph: EventParagraph,
} = EventTypography;

interface EventDisplayProps {
  event: GameEvent;
  player: Player;
  onChoice: (choice: Choice) => void;
  isLoading: boolean;
}
export const EventDisplay: React.FC<EventDisplayProps> = ({
  event,
  player,
  onChoice,
  isLoading,
}) => (
  <EventCard
    title={<EventTitle level={4}>{event.title}</EventTitle>}
    style={{ marginBottom: 24 }}
  >
    <EventParagraph>{event.description}</EventParagraph>
    <EventSpace direction="vertical" style={{ width: "100%" }}>
      {event.choices.map((choice) => {
        const isDisabled = choice.disabled
          ? choice.disabled(player)
          : choice.cost && player.stats[choice.cost.stat] < choice.cost.amount;
        return (
          <EventButton
            key={choice.id}
            type="primary"
            onClick={() => onChoice(choice)}
            disabled={isDisabled || isLoading}
            block
            danger={
              choice.text.toLowerCase().includes("risk") ||
              choice.text.toLowerCase().includes("hard")
            }
          >
            <EventSpace
              direction="vertical"
              align="start"
              style={{ width: "100%" }}
            >
              <EventText
                strong
                style={{ color: isDisabled ? "rgba(0,0,0,0.25)" : "white" }}
              >
                {choice.text}
              </EventText>
              {choice.description && (
                <EventText
                  type="secondary"
                  style={{
                    fontSize: "0.9em",
                    color: isDisabled
                      ? "rgba(0,0,0,0.25)"
                      : "rgba(255,255,255,0.8)",
                  }}
                >
                  {choice.description}
                </EventText>
              )}
              {choice.cost && (
                <EventText
                  style={{
                    fontSize: "0.8em",
                    color: isDisabled
                      ? "rgba(0,0,0,0.25)"
                      : "rgba(255,100,100,0.9)",
                  }}
                >
                  Cost: {choice.cost.amount} {choice.cost.stat}
                </EventText>
              )}
            </EventSpace>
          </EventButton>
        );
      })}
    </EventSpace>
  </EventCard>
);
