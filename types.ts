export type Prediction = 'UP' | 'DOWN';
export type GameResult = 'WIN' | 'LOSS' | 'DRAW';

export interface User {
  name: string;
  handle: string;
  avatar: string;
}

export interface GameRecord {
  id: string;
  timestamp: number;
  prediction: Prediction;
  startPrice: number;
  endPrice: number;
  result: GameResult;
}

export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  maxStreak: number;
  upCount: number;
  upWins: number;
  upLosses: number;
  downCount: number;
  downWins: number;
  downLosses: number;
}

export interface LeaderboardEntry {
  rank: number;
  name: string; 
  handle?: string; // Added handle for real user identification
  accuracy: number;
  totalGames: number;
  wins: number;
  losses: number;
  streak: number; 
  lastActive: string;
  upCount: number;
  downCount: number;
  isCurrentUser?: boolean; // To highlight the player
}

export type TimeFrame = '24H' | '7D' | 'ALL';
