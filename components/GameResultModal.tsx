import React from 'react';
import { GameRecord } from '../types';
import { X, Share2, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface GameResultModalProps {
  result: GameRecord;
  onClose: () => void;
  streak: number;
  onShare?: () => void; // New prop to trigger external share modal
}

export const GameResultModal: React.FC<GameResultModalProps> = ({ result, onClose, streak, onShare }) => {
  const isWin = result.result === 'WIN';
  const isDraw = result.result === 'DRAW';
  
  const textColor = isWin ? 'text-green-500' : isDraw ? 'text-gray-400' : 'text-red-500';
  
  const handleShareClick = () => {
      if (onShare) {
          onShare();
      } else {
          // Fallback old copy method
          const text = isWin 
            ? `✅ I just WON a BNB prediction! Streak: ${streak} 🔥\nPlay now! #BNB #Crypto`
            : `❌ I missed a BNB prediction. Trying again! #BNB`;
            navigator.clipboard.writeText(`${text} ${window.location.href}`);
            alert("Result copied to clipboard!");
      }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1e2329] w-[90%] max-w-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className={`p-6 text-center ${isWin ? 'bg-green-500/10' : isDraw ? 'bg-gray-700/10' : 'bg-red-500/10'}`}>
          <div className="flex justify-end absolute top-4 right-4">
             <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
             </button>
          </div>

          <div className="mb-2 flex justify-center">
             {result.prediction === 'UP' 
                ? <ArrowUpCircle size={48} className={textColor} />
                : <ArrowDownCircle size={48} className={textColor} />
             }
          </div>

          <h2 className={`text-3xl font-black uppercase italic ${textColor} mb-1`}>
            {isWin ? 'Success!' : isDraw ? 'Draw' : 'Failed'}
          </h2>
          <p className="text-sm text-gray-400">
            {isWin ? 'Prediction Correct' : isDraw ? 'Price Unchanged' : 'Prediction Incorrect'}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center text-sm border-b border-gray-800 pb-3">
             <span className="text-gray-500">Prediction</span>
             <span className={`font-bold ${result.prediction === 'UP' ? 'text-green-500' : 'text-red-500'}`}>
                {result.prediction === 'UP' ? '涨 (UP)' : '跌 (DOWN)'}
             </span>
          </div>

          <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">Start Price</span>
             <span className="font-mono text-gray-300">${result.startPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
             <span className="text-gray-500">End Price</span>
             <span className="font-mono text-white font-bold">${result.endPrice.toFixed(2)}</span>
          </div>
          
           <div className="bg-[#0b0e11] rounded-lg p-3 flex justify-between items-center mt-4">
               <span className="text-xs text-gray-400 uppercase tracking-wide">Current Streak</span>
               <span className="text-xl font-bold text-blue-400">{streak} 🔥</span>
           </div>

           <button 
             onClick={onClose}
             className={`w-full py-3 rounded-lg font-bold text-black mt-2 transition-transform active:scale-95 ${isWin ? 'bg-[#FCD535] hover:bg-[#eebb18]' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}
           >
             {isWin ? 'Continue Winning' : 'Try Again'}
           </button>
           
           <div className="flex justify-center mt-4">
              <button 
                onClick={handleShareClick}
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-[#FCD535] transition-colors"
              >
                 <Share2 size={14} /> Share Result
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};