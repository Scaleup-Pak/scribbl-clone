export interface Player {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  joinedAt: number;
}

export interface Guess {
  playerId: string;
  playerName: string;
  guess: string;
  timestamp: number;
  isCorrect: boolean;
}

export interface DrawData {
  type: 'start' | 'draw' | 'end';
  x: number;
  y: number;
  color?: string;
  size?: number;
  timestamp: number;
}

export interface GameSettings {
  drawingTime: number;
  maxPlayers: number;
}

export interface Game {
  id: string;
  status: 'waiting' | 'playing' | 'finished';
  host: string;
  players: Record<string, Player>;
  currentRound: number;
  maxRounds: number;
  currentDrawer: string | null;
  currentWord: string | null;
  drawingData: DrawData[];
  guesses: Guess[];
  roundStartTime: number | null;
  settings: GameSettings;
  createdAt: number;
  updatedAt: number;
}

export interface GameState {
  game: Game | null;
  playerId: string | null;
  playerName: string | null;
  isConnected: boolean;
  error: string | null;
} 