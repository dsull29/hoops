  export interface PlayerStats {
    shooting: number;
    athleticism: number;
    basketballIQ: number;
    charisma: number;
    professionalism: number;
    energy: number;
    morale: number;
    skillPoints: number;
  }

  export interface Player {
    name: string;
    position: string;
    stats: PlayerStats;
    traits: string[];
    currentSeason: number;
    currentDayInSeason: number;
    totalDaysPlayed: number;
    careerOver: boolean;
    careerLog: string[];
    age: number;
  }

  export interface Choice {
    id: string;
    text: string;
    description?: string;
    action: (player: Player)
    => { updatedPlayer: Player; outcomeMessage: string; immediateEvent?: GameEvent | null };
    cost?: { stat: keyof PlayerStats; amount: number };
    disabled?: (player: Player) => boolean;
  }

  export interface GameEvent {
    id: string;
    title: string;
    description: string;
    choices: Choice[];
    isMandatory?: boolean;
  }

  export interface GameState {
    player: Player | null;
    currentEvent: GameEvent | null;
    isLoading: boolean;
    gamePhase: 'menu' | 'playing' | 'gameOver';
  }
