import React, { useState } from 'react';
import { TimeFrame, PlayerStats, User } from '../types';
import { getLeaderboardData } from '../services/priceService';
import { Trophy, Target, Hash, User as UserIcon } from 'lucide-react';

interface LeaderboardProps {
  userStats: PlayerStats;
  user: User | null;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userStats, user }) => {
  const [activeTab, setActiveTab] = useState<TimeFrame>('24H');

  // Generate data on the fly merging bots + real user
  const leaderboardData = getLeaderboardData(activeTab, userStats, user);
  const minGames = activeTab === '24H' ? 20 : activeTab === '7D' ? 100 : 500;

  // Check if user qualifies for this list
  const userQualified = userStats.totalGames >= 0; // Show them regardless for motivation, or enforce limit
  
  return (
    <div className="bg-[#1e2329] rounded-xl border border-gray-800 shadow-lg w-full max-w-4xl mx-auto mt-8 overflow-hidden">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-[#FCD535]" />
          排行榜 (Leaderboard)
        </h2>
        
        <div className="flex gap-2 bg-[#0b0e11] p-1 rounded-lg w-fit">
          {(['24H', '7D', 'ALL'] as TimeFrame[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-[#2b3139] text-[#FCD535] shadow-sm'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {tab === '24H' ? '日榜 Daily' : tab === '7D' ? '周榜 Weekly' : '总榜 All-time'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#2b3139] text-xs text-gray-400 uppercase">
            <tr>
              <th className="px-4 md:px-6 py-3 font-semibold w-16 text-center">#</th>
              <th className="px-4 md:px-6 py-3 font-semibold">User</th>
              <th className="px-4 md:px-6 py-3 font-semibold">
                <div className="flex items-center gap-1">
                    <Target size={14} /> <span className="hidden md:inline">Accuracy</span><span className="md:hidden">Acc</span>
                </div>
              </th>
              <th className="px-4 md:px-6 py-3 font-semibold text-center">
                 W / L
              </th>
              <th className="px-4 md:px-6 py-3 font-semibold hidden sm:table-cell">Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 text-sm">
            {leaderboardData.map((entry, idx) => (
              <tr 
                key={idx} 
                className={`transition-colors group ${entry.isCurrentUser ? 'bg-[#FCD535]/10 hover:bg-[#FCD535]/20' : 'hover:bg-[#2b3139]/50'}`}
              >
                <td className="px-4 md:px-6 py-4 text-center font-bold text-gray-500 group-hover:text-white">
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : entry.rank}
                </td>
                <td className="px-4 md:px-6 py-4 font-mono font-medium flex items-center gap-2">
                  {entry.isCurrentUser && <UserIcon size={14} className="text-[#FCD535]" />}
                  <span className={entry.isCurrentUser ? 'text-[#FCD535]' : 'text-gray-300'}>
                    {entry.name}
                  </span>
                  {entry.isCurrentUser && <span className="text-[10px] bg-[#FCD535] text-black px-1 rounded ml-1 font-bold">YOU</span>}
                </td>
                <td className="px-4 md:px-6 py-4 font-bold text-white">
                  {entry.accuracy}%
                </td>
                <td className="px-4 md:px-6 py-4 text-center">
                    <span className="text-green-500">{entry.wins}</span> / <span className="text-red-500">{entry.losses}</span>
                </td>
                <td className="px-4 md:px-6 py-4 hidden sm:table-cell text-blue-400 font-medium">
                  {entry.streak} 🔥
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="p-4 border-t border-gray-800 bg-[#1e2329] text-center">
            {user ? (
                 <p className="text-sm text-gray-400">
                    你的战绩已同步至本地榜单。继续连胜冲击榜首！
                 </p>
            ) : (
                <p className="text-sm text-gray-500">
                    链接 X 账号以参与排行榜竞争。
                </p>
            )}
       </div>
    </div>
  );
};
