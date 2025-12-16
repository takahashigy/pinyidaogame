import React, { useState } from 'react';
import { PlayerStats, GameRecord } from '../types';
import { TrendingUp, TrendingDown, Activity, History, Trophy, Award, Zap } from 'lucide-react';

interface StatsPanelProps {
  stats: PlayerStats;
  history: GameRecord[];
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats, history }) => {
  const [showHistory, setShowHistory] = useState(false);

  const accuracy = stats.totalGames > 0 
    ? ((stats.wins / stats.totalGames) * 100).toFixed(2) 
    : "0.00";

  return (
    <div className="bg-[#1e2329] rounded-xl p-6 border border-gray-800 shadow-lg w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          <Activity className="w-5 h-5 text-[#FCD535]" />
          你的战绩 (Your Stats)
        </h2>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="text-sm text-[#FCD535] hover:text-[#eebb18] flex items-center gap-1 transition-colors"
        >
          <History className="w-4 h-4" />
          {showHistory ? '收起明细 (Hide)' : '查看明细 (History)'}
        </button>
      </div>

      {/* Core Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[#2b3139] p-4 rounded-lg flex flex-col items-center justify-center">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Win Rate</span>
            <span className="text-2xl font-bold text-[#FCD535]">{accuracy}%</span>
        </div>
        <div className="bg-[#2b3139] p-4 rounded-lg flex flex-col items-center justify-center">
            <span className="text-gray-400 text-xs uppercase tracking-wide">Total / W / L</span>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-bold text-white">{stats.totalGames}</span>
                <span className="text-xs text-green-500">/{stats.wins}</span>
                <span className="text-xs text-red-500">/{stats.losses}</span>
            </div>
        </div>
        <div className="bg-[#2b3139] p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-10">
                <Zap className="w-12 h-12 text-blue-500" />
            </div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Current Streak</span>
            <span className="text-2xl font-bold text-blue-400">{stats.currentStreak} 🔥</span>
        </div>
        <div className="bg-[#2b3139] p-4 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
             <div className="absolute top-0 right-0 p-1 opacity-10">
                <Trophy className="w-12 h-12 text-purple-500" />
            </div>
            <span className="text-gray-400 text-xs uppercase tracking-wide">Best Streak</span>
            <span className="text-2xl font-bold text-purple-400">{stats.maxStreak} 🏆</span>
        </div>
      </div>

      {/* Detailed Bias Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#2b3139] rounded-lg p-4 border-l-4 border-green-500 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-green-500/20 p-2 rounded-full">
                <TrendingUp className="w-5 h-5 text-green-500" />
             </div>
             <div>
               <div className="text-sm text-gray-400">选择“涨” (Picked Up)</div>
               <div className="font-bold text-lg">{stats.upCount} <span className="text-xs font-normal text-gray-500">times</span></div>
             </div>
          </div>
          <div className="text-right">
             <div className="text-xs text-gray-400">W / L</div>
             <div className="font-mono text-sm">
                <span className="text-green-500">{stats.upWins}</span> / <span className="text-red-500">{stats.upLosses}</span>
             </div>
          </div>
        </div>

        <div className="bg-[#2b3139] rounded-lg p-4 border-l-4 border-red-500 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-red-500/20 p-2 rounded-full">
                <TrendingDown className="w-5 h-5 text-red-500" />
             </div>
             <div>
               <div className="text-sm text-gray-400">选择“跌” (Picked Down)</div>
               <div className="font-bold text-lg">{stats.downCount} <span className="text-xs font-normal text-gray-500">times</span></div>
             </div>
          </div>
           <div className="text-right">
             <div className="text-xs text-gray-400">W / L</div>
             <div className="font-mono text-sm">
                <span className="text-green-500">{stats.downWins}</span> / <span className="text-red-500">{stats.downLosses}</span>
             </div>
          </div>
        </div>
      </div>

      {/* Historical Data Table */}
      {showHistory && (
        <div className="mt-6 animate-fade-in">
          <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase">近期明细 (Recent History)</h3>
          <div className="overflow-x-auto bg-[#0b0e11] rounded-lg border border-gray-800 max-h-60 overflow-y-auto">
            <table className="w-full text-left text-sm text-gray-400">
              <thead className="text-xs text-gray-500 uppercase bg-[#1e2329] sticky top-0">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Pick</th>
                  <th className="px-4 py-3">Start</th>
                  <th className="px-4 py-3">End</th>
                  <th className="px-4 py-3 text-right">Result</th>
                </tr>
              </thead>
              <tbody>
                {history.slice().reverse().map((game) => (
                  <tr key={game.id} className="border-b border-gray-800 hover:bg-[#1e2329] transition-colors">
                    <td className="px-4 py-2 font-mono text-xs">
                        {new Date(game.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                    </td>
                    <td className="px-4 py-2">
                        {game.prediction === 'UP' 
                            ? <span className="text-green-500 font-bold flex items-center gap-1"><TrendingUp size={12}/> 涨</span> 
                            : <span className="text-red-500 font-bold flex items-center gap-1"><TrendingDown size={12}/> 跌</span>
                        }
                    </td>
                    <td className="px-4 py-2 font-mono">{game.startPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 font-mono">{game.endPrice.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right">
                        {game.result === 'WIN' && <span className="text-green-400 font-bold">WIN</span>}
                        {game.result === 'LOSS' && <span className="text-red-500 font-bold">LOSS</span>}
                        {game.result === 'DRAW' && <span className="text-gray-500 font-bold">DRAW</span>}
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                    <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-600">暂无数据 (No Data)</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};