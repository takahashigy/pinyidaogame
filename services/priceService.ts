import { useState, useEffect, useRef } from 'react';
import { LeaderboardEntry, PlayerStats, User } from '../types';

// Connects to Binance public WebSocket for real-time BNB/USDT trades
export const useBinancePrice = () => {
  const [price, setPrice] = useState<number>(0); 
  const [trend, setTrend] = useState<'UP' | 'DOWN' | 'EQUAL'>('EQUAL');
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket('wss://stream.binance.com:9443/ws/bnbusdt@trade');
    wsRef.current = ws;

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newPrice = parseFloat(data.p);

      setPrice((prevPrice) => {
        if (prevPrice === 0) return newPrice;
        if (newPrice > prevPrice) setTrend('UP');
        else if (newPrice < prevPrice) setTrend('DOWN');
        else setTrend('EQUAL');
        return newPrice;
      });
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { price, trend };
};

// Generate bots but allow merging real user stats
export const getLeaderboardData = (
  timeFrame: '24H' | '7D' | 'ALL', 
  userStats?: PlayerStats, 
  user?: User | null
): LeaderboardEntry[] => {
  
  // 1. Generate Static Bots (deterministic based on timeframe so they don't jitter)
  const botCount = 15;
  const entries: LeaderboardEntry[] = [];
  const userPrefixes = ['@crypto_king', '@bnb_whale', '@satoshi_v', '@trader_alpha', '@moon_boy', '@cz_fan', '@defi_degen', '@nft_collector'];
  
  // Seed random generator (simple hash)
  const seed = timeFrame === '24H' ? 123 : timeFrame === '7D' ? 456 : 789;
  const random = (idx: number) => {
    const x = Math.sin(seed + idx) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 0; i < botCount; i++) {
    const r = random(i);
    const totalGames = Math.floor(r * 500) + 50;
    const winRate = 0.35 + (r * 0.4); // 35% to 75% winrate
    const wins = Math.floor(totalGames * winRate);
    const losses = totalGames - wins;
    const accuracy = (wins / totalGames) * 100;
    
    entries.push({
      rank: 0, // calculated later
      name: `${userPrefixes[i % userPrefixes.length]}_${Math.floor(r * 100)}`,
      accuracy: parseFloat(accuracy.toFixed(2)),
      totalGames,
      wins,
      losses,
      streak: Math.floor(r * 12),
      lastActive: `${Math.floor(r * 50) + 1}m ago`,
      upCount: Math.floor(totalGames / 2),
      downCount: Math.floor(totalGames / 2),
      isCurrentUser: false
    });
  }

  // 2. Insert Real User if they have played enough games
  if (userStats && userStats.totalGames > 0 && user) {
    const userAccuracy = (userStats.wins / userStats.totalGames) * 100;
    entries.push({
      rank: 0,
      name: user.handle, // Use Real Handle
      handle: user.handle,
      accuracy: parseFloat(userAccuracy.toFixed(2)),
      totalGames: userStats.totalGames,
      wins: userStats.wins,
      losses: userStats.losses,
      streak: userStats.maxStreak,
      lastActive: 'Just now',
      upCount: userStats.upCount,
      downCount: userStats.downCount,
      isCurrentUser: true
    });
  }

  // 3. Sort by Accuracy (Primary) then Total Wins (Secondary)
  entries.sort((a, b) => {
    if (Math.abs(b.accuracy - a.accuracy) > 0.01) return b.accuracy - a.accuracy;
    return b.wins - a.wins;
  });

  // 4. Assign Ranks
  return entries.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
};
