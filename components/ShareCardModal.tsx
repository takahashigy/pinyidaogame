import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { PlayerStats, User } from '../types';
import { X, Download, Share2, Zap, Trophy, Target, QrCode } from 'lucide-react';

interface ShareCardModalProps {
  stats: PlayerStats;
  user: User | null;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ stats, user, onClose }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const winRate = stats.totalGames > 0 
    ? ((stats.wins / stats.totalGames) * 100).toFixed(1) 
    : "0.0";

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Small delay to ensure fonts render
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0b0e11',
        scale: 2, // High resolution
        useCORS: true, // Allow fetching avatar images if CORS permits
        logging: false,
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `bnb-3s-stats-${Date.now()}.png`;
      link.click();
    } catch (error) {
      console.error("Image generation failed", error);
      alert("Could not generate image. Please screenshot instead!");
    } finally {
      setIsGenerating(false);
    }
  };

  const currentDate = new Date().toLocaleDateString();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in">
      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* Actions Bar */}
        <div className="w-full flex justify-between items-center mb-4 px-2">
            <h3 className="text-white font-bold flex items-center gap-2">
                <Share2 size={18} className="text-[#FCD535]"/> Share Stats
            </h3>
            <button onClick={onClose} className="p-2 bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={20} />
            </button>
        </div>

        {/* The Card (This gets captured) */}
        <div 
            ref={cardRef} 
            className="w-full bg-gradient-to-br from-[#1e2329] to-[#0b0e11] border border-[#FCD535] rounded-xl overflow-hidden shadow-2xl relative"
            style={{ aspectRatio: '3/4' }}
        >
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#FCD535] opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

            {/* Header */}
            <div className="p-6 flex items-center gap-3 border-b border-gray-800/50">
                <div className="w-10 h-10 bg-[#FCD535] rounded-full flex items-center justify-center font-bold text-black shadow-[0_0_15px_rgba(252,213,53,0.3)]">
                    BNB
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white tracking-wide">BNB 3-Second</h1>
                    <p className="text-xs text-[#FCD535] uppercase tracking-wider">Prediction Battle</p>
                </div>
                <div className="ml-auto text-xs text-gray-500 font-mono">{currentDate}</div>
            </div>

            {/* User Info */}
            <div className="px-6 py-6 flex flex-col items-center">
                 <img 
                    src={user?.avatar || 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'} 
                    className="w-20 h-20 rounded-full border-4 border-[#1e2329] shadow-lg mb-3"
                    alt="User"
                    crossOrigin="anonymous" 
                 />
                 <h2 className="text-2xl font-bold text-white">{user?.handle || '@Anonymous'}</h2>
                 <p className="text-sm text-gray-400 mt-1">Has joined the battle!</p>
            </div>

            {/* Stats Grid */}
            <div className="px-6 py-2">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#2b3139]/50 p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
                        <div className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-1">
                            <Zap size={12} className="text-blue-400"/> Max Streak
                        </div>
                        <div className="text-3xl font-black text-white italic">{stats.maxStreak}</div>
                    </div>
                    <div className="bg-[#2b3139]/50 p-4 rounded-lg border border-gray-700/50 flex flex-col items-center">
                        <div className="text-gray-400 text-xs uppercase mb-1 flex items-center gap-1">
                            <Target size={12} className="text-green-400"/> Win Rate
                        </div>
                        <div className="text-3xl font-black text-[#FCD535] italic">{winRate}%</div>
                    </div>
                </div>
                <div className="mt-4 bg-[#2b3139]/30 p-3 rounded-lg flex justify-between items-center px-6">
                    <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">Total</div>
                        <div className="text-lg font-bold text-white">{stats.totalGames}</div>
                    </div>
                     <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">Wins</div>
                        <div className="text-lg font-bold text-green-500">{stats.wins}</div>
                    </div>
                     <div className="text-center">
                        <div className="text-xs text-gray-500 uppercase">Losses</div>
                        <div className="text-lg font-bold text-red-500">{stats.losses}</div>
                    </div>
                </div>
            </div>

            {/* Footer / CTA */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-2xl font-black text-white italic leading-none mb-1">
                            快来拼一刀！
                        </p>
                        <p className="text-sm text-gray-300">
                            Can you beat my streak?
                        </p>
                        <p className="text-xs text-[#FCD535] mt-2">
                            bnb-3s.game
                        </p>
                    </div>
                    <div className="bg-white p-2 rounded-lg">
                        {/* Visual Mock QR */}
                        <QrCode size={48} className="text-black"/>
                    </div>
                </div>
            </div>
        </div>

        {/* Generate Button */}
        <button 
            onClick={handleDownload}
            disabled={isGenerating}
            className="mt-6 w-full bg-[#FCD535] text-black font-bold py-3.5 rounded-full hover:bg-[#eebb18] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(252,213,53,0.4)] active:scale-95 disabled:opacity-50"
        >
            {isGenerating ? (
                <span className="animate-spin rounded-full h-5 w-5 border-2 border-black border-t-transparent"></span>
            ) : (
                <Download size={20} />
            )}
            {isGenerating ? 'Generating...' : 'Save Image to Share'}
        </button>
        <p className="text-xs text-gray-500 mt-3">
            *Downloads a high-quality image to your device
        </p>

      </div>
    </div>
  );
};
