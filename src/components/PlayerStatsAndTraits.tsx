// src/components/PlayerStatsAndTraits.tsx
import { Card, Table, Tabs, Tag, Tooltip, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';
import { TRAIT_DEFINITIONS } from '../gameLogic/traits';
import type { Player, PlayerTrait } from '../types';

const { Text } = Typography;

interface PlayerStatsAndTraitsProps {
  player: Player;
}

interface SeasonAverages {
  gamesPlayed: number;
  ppg: string; // Points Per Game
  rpg: string; // Rebounds Per Game
  apg: string; // Assists Per Game
}

interface TraitDisplayItem {
  name: PlayerTrait;
  level: number;
  description: string;
}

/**
 * A component with two tabs: one for displaying calculated season average stats (PPG, RPG, APG)
 * and another for listing the player's current traits with tooltips for descriptions.
 */
export const PlayerStatsAndTraits: React.FC<PlayerStatsAndTraitsProps> = ({ player }) => {
  const { schedule, traits } = player;

  // Calculate season averages based on completed games in the schedule
  const seasonAverages = React.useMemo<SeasonAverages>(() => {
    const completedGames = schedule.schedule.filter((day) => day.isCompleted && day.gameResult);
    const gamesPlayed = completedGames.length;

    if (gamesPlayed === 0) {
      return { gamesPlayed: 0, ppg: '0.0', rpg: '0.0', apg: '0.0' };
    }

    const totals = completedGames.reduce(
      (acc, day) => {
        if (day.gameResult) {
          acc.points += day.gameResult.playerStats.points;
          acc.rebounds += day.gameResult.playerStats.rebounds;
          acc.assists += day.gameResult.playerStats.assists;
        }
        return acc;
      },
      { points: 0, rebounds: 0, assists: 0 }
    );

    return {
      gamesPlayed,
      ppg: (totals.points / gamesPlayed).toFixed(1),
      rpg: (totals.rebounds / gamesPlayed).toFixed(1),
      apg: (totals.assists / gamesPlayed).toFixed(1),
    };
  }, [schedule]);

  // Convert traits Map to an array for rendering
  const traitsList: TraitDisplayItem[] = React.useMemo(() => {
    return Array.from(traits.entries()).map(([traitName, level]) => {
      const traitDef = TRAIT_DEFINITIONS.get(traitName);
      const levelDef = traitDef?.levels.find((l) => l.level === level);
      // Fallback to the first level's description if the current level isn't found
      const description = levelDef?.description ?? traitDef?.levels[0]?.description ?? 'No description available.';
      return { name: traitName, level, description };
    });
  }, [traits]);

  const seasonStatsColumns: ColumnsType<SeasonAverages> = [
    { title: 'GP', dataIndex: 'gamesPlayed', key: 'gp', align: 'center' },
    { title: 'PPG', dataIndex: 'ppg', key: 'ppg', align: 'center' },
    { title: 'RPG', dataIndex: 'rpg', key: 'rpg', align: 'center' },
    { title: 'APG', dataIndex: 'apg', key: 'apg', align: 'center' },
  ];

  const items = [
    {
      key: '1',
      label: 'Season Stats',
      children: (
        <Table
          columns={seasonStatsColumns}
          dataSource={[seasonAverages]}
          pagination={false}
          size="small"
          bordered
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4} align="center">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Averages over {seasonAverages.gamesPlayed} game(s)
                </Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )}
        />
      ),
    },
    {
      key: '2',
      label: 'Traits',
      children: (
        <div style={{ maxHeight: '150px', overflowY: 'auto', padding: '8px' }}>
          {traitsList.length > 0 ? (
            traitsList.map((trait) => (
              <Tooltip key={trait.name} title={trait.description}>
                <Tag color="geekblue" style={{ marginRight: 3, marginBottom: 3, cursor: 'help' }}>
                  {trait.name} (Lv. {trait.level})
                </Tag>
              </Tooltip>
            ))
          ) : (
            <Text type="secondary">No special traits acquired yet.</Text>
          )}
        </div>
      ),
    },
  ];

  return <Card size="small" style={{ marginBottom: 16 }} bodyStyle={{ padding: 0 }}><Tabs defaultActiveKey="1" items={items} centered /></Card>;
};
