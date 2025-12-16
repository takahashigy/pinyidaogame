import React, { useState, useEffect, useRef } from 'react';
import { useBinancePrice } from './services/priceService';
import { PlayerStats, GameRecord, Prediction, User } from './types';
import { StatsPanel } from './components/StatsPanel';
import { Leaderboard } from './components/Leaderboard';
import { GameResultModal } from './components/GameResultModal';
import { ShareCardModal } from './components/ShareCardModal';
import { AlertTriangle, Info, Timer, TrendingUp, TrendingDown, Twitter, LogOut, Share2, User as UserIcon, X as XIcon } from 'lucide-react';

export default function App() {
  const { price: currentPrice, trend } = useBinancePrice();
  
  // User Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [handleInput, setHandleInput] = useState('');

  // Game State
  const [gameState, setGameState] = useState<'IDLE' | 'PLAYING'>('IDLE');
  const [startPrice, setStartPrice] = useState<number | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [countdown, setCountdown] = useState<number>(3.0);
  const [modalResult, setModalResult] = useState<GameRecord | null>(null);

  // Stats State (Persisted in LocalStorage)
  const [history, setHistory] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<PlayerStats>({
    totalGames: 0, wins: 0, losses: 0, draws: 0,
    currentStreak: 0, maxStreak: 0,
    upCount: 0, upWins: 0, upLosses: 0,
    downCount: 0, downWins: 0, downLosses: 0,
  });

  const priceRef = useRef(currentPrice);
  
  // Load data from LocalStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('bnb_game_user');
    const savedStats = localStorage.getItem('bnb_game_stats');
    const savedHistory = localStorage.getItem('bnb_game_history');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (user) localStorage.setItem('bnb_game_user', JSON.stringify(user));
    localStorage.setItem('bnb_game_stats', JSON.stringify(stats));
    localStorage.setItem('bnb_game_history', JSON.stringify(history));
  }, [user, stats, history]);

  // Ensure priceRef is always up to date
  useEffect(() => {
    priceRef.current = currentPrice;
  }, [currentPrice]);

  // Real "Simulated" X Login (Uses Unavatar)
  const handleXLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handleInput) return;

    // Remove @ if present
    const cleanHandle = handleInput.replace('@', '').trim();
    
    // Create Real User Profile using public avatar service
    const newUser: User = {
      name: cleanHandle,
      handle: `@${cleanHandle}`,
      // Unavatar.io fetches the real Twitter profile picture
      avatar: `https://unavatar.io/twitter/${cleanHandle}` 
    };

    setUser(newUser);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    if (window.confirm("Disconnect account? Local stats will remain.")) {
      setUser(null);
      localStorage.removeItem('bnb_game_user');
    }
  };

  // Handle Game Start
  const startGame = (pred: Prediction) => {
    if (gameState === 'PLAYING') return;
    if (currentPrice === 0) return;
    
    setPrediction(pred);
    setStartPrice(currentPrice);
    setGameState('PLAYING');
    setCountdown(3.0);
  };

  // Game Loop
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const startTime = Date.now();
      const duration = 3000;

      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, (duration - elapsed) / 1000);
        setCountdown(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [gameState]);

  // Settle Game
  useEffect(() => {
      if (gameState === 'PLAYING' && countdown <= 0) {
          const finalPrice = priceRef.current;
          const validFinalPrice = finalPrice > 0 ? finalPrice : (startPrice || 0);
          
          const sPrice = startPrice!;
          const pred = prediction!;

          let result: 'WIN' | 'LOSS' | 'DRAW' = 'DRAW';
          
          // Strict comparison
          if (validFinalPrice > sPrice) result = pred === 'UP' ? 'WIN' : 'LOSS';
          else if (validFinalPrice < sPrice) result = pred === 'DOWN' ? 'WIN' : 'LOSS';
          else result = 'DRAW'; // Exactly equal

          const record: GameRecord = {
              id: Date.now().toString(),
              timestamp: Date.now(),
              prediction: pred,
              startPrice: sPrice,
              endPrice: validFinalPrice,
              result: result
          };

          // Update Stats
          setStats(prev => {
              const isWin = result === 'WIN';
              const isLoss = result === 'LOSS';
              const newStreak = isWin ? prev.currentStreak + 1 : (result === 'DRAW' ? prev.currentStreak : 0);
              
              return {
                  totalGames: prev.totalGames + 1,
                  wins: prev.wins + (isWin ? 1 : 0),
                  losses: prev.losses + (isLoss ? 1 : 0),
                  draws: prev.draws + (result === 'DRAW' ? 1 : 0),
                  currentStreak: newStreak,
                  maxStreak: Math.max(prev.maxStreak, newStreak),
                  upCount: prev.upCount + (pred === 'UP' ? 1 : 0),
                  upWins: prev.upWins + (pred === 'UP' && isWin ? 1 : 0),
                  upLosses: prev.upLosses + (pred === 'UP' && isLoss ? 1 : 0),
                  downCount: prev.downCount + (pred === 'DOWN' ? 1 : 0),
                  downWins: prev.downWins + (pred === 'DOWN' && isWin ? 1 : 0),
                  downLosses: prev.downLosses + (pred === 'DOWN' && isLoss ? 1 : 0),
              };
          });

          setHistory(prev => [...prev, record]);
          setModalResult(record);
          setGameState('IDLE');
      }
  }, [countdown, gameState, startPrice, prediction]);


  return (
    <div className="min-h-screen pb-20 relative">
      
      {/* Header */}
      <header className="bg-[#1e2329] p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-10 shadow-md">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#FCD535] rounded-full flex items-center justify-center font-bold text-black text-xs">BNB</div>
            <h1 className="font-bold text-lg text-gray-100 hidden sm:block">三秒猜涨跌</h1>
            <h1 className="font-bold text-lg text-gray-100 sm:hidden">BNB 3s</h1>
         </div>
         <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
            {user ? (
               <div className="flex items-center gap-3 bg-[#2b3139] pl-2 pr-4 py-1.5 rounded-full border border-gray-700">
                  <img 
                    src={user.avatar} 
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://abs.twimg.com/sticky/default_profile_images/default_profile_normal.png'; }}
                    alt="Avatar" 
                    className="w-6 h-6 rounded-full bg-gray-700 object-cover" 
                  />
                  <div className="flex flex-col items-start">
                     <span className="text-white font-bold leading-tight">{user.handle}</span>
                  </div>
                  <button onClick={handleLogout} className="ml-2 text-gray-500 hover:text-red-400">
                     <LogOut size={14} />
                  </button>
               </div>
            ) : (
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="bg-black hover:bg-gray-900 text-white px-4 py-2 rounded-full flex items-center gap-2 transition-all font-bold border border-gray-800"
                >
                   <Twitter size={16} fill="white" className="text-white" />
                   Connect X
                </button>
            )}
         </div>
      </header>

      <main className="container mx-auto px-4 pt-8 max-w-lg md:max-w-4xl">
        
        {/* Game Area */}
        <section className="text-center mb-12">
            
            <div className="mb-2 text-gray-500 text-sm font-medium tracking-wide">
                BNB / USDT <span className="text-xs bg-gray-800 px-1 rounded ml-1 text-green-400">LIVE</span>
            </div>

            {/* Price Display */}
            <div className="relative inline-block min-h-[100px]">
                {currentPrice > 0 ? (
                    <>
                        <div className={`text-6xl font-black font-mono tracking-tighter transition-colors duration-200 ${trend === 'UP' ? 'text-green-500' : trend === 'DOWN' ? 'text-red-500' : 'text-white'}`}>
                            ${currentPrice.toFixed(2)}
                        </div>
                         <div className="text-xs text-gray-500 mt-2 flex justify-center items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Binance Real-time Feed
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full pt-4">
                        <div className="w-8 h-8 border-4 border-[#FCD535] border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-gray-500 text-xs">Connecting to Market...</span>
                    </div>
                )}
            </div>

            {/* Game Interface */}
            <div className="mt-10 bg-[#1e2329] p-6 rounded-2xl border border-gray-800 shadow-xl relative overflow-hidden">
                
                {gameState === 'PLAYING' && (
                    <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-[2px] flex flex-col items-center justify-center">
                        <div className="text-sm uppercase tracking-widest text-gray-400 mb-2">Result in</div>
                        <div className="text-7xl font-black text-white font-mono tabular-nums">
                            {countdown.toFixed(1)}<span className="text-2xl text-gray-500">s</span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-sm text-gray-300">
                            Locked Start Price: <span className="font-mono text-[#FCD535]">${startPrice?.toFixed(2)}</span>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <button 
                        disabled={gameState === 'PLAYING' || currentPrice === 0}
                        onClick={() => startGame('UP')}
                        className="group relative flex flex-col items-center justify-center py-8 rounded-xl bg-[#2ebd85] hover:bg-[#2ebd85]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(46,189,133,0.2)]"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                        <TrendingUp className="w-10 h-10 text-white mb-2 group-hover:-translate-y-1 transition-transform" />
                        <span className="text-2xl font-black text-white uppercase italic">猜涨 (UP)</span>
                        <span className="text-xs text-white/80 mt-1">Bullish</span>
                    </button>

                    <button 
                         disabled={gameState === 'PLAYING' || currentPrice === 0}
                         onClick={() => startGame('DOWN')}
                         className="group relative flex flex-col items-center justify-center py-8 rounded-xl bg-[#f6465d] hover:bg-[#f6465d]/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden shadow-[0_0_20px_rgba(246,70,93,0.2)]"
                    >
                         <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                         <TrendingDown className="w-10 h-10 text-white mb-2 group-hover:translate-y-1 transition-transform" />
                        <span className="text-2xl font-black text-white uppercase italic">猜跌 (DOWN)</span>
                        <span className="text-xs text-white/80 mt-1">Bearish</span>
                    </button>
                </div>

                <div className="mt-4 text-center text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Timer size={12} />
                    <span>本局结算依据：3 秒后价格与选择时价格的对比 (Settle in 3s)</span>
                </div>
            </div>
        </section>

        {/* User Stats */}
        <StatsPanel stats={stats} history={history} />

        {/* Leaderboard */}
        <Leaderboard userStats={stats} user={user} />

        {/* Footer */}
        <footer className="mt-16 text-center pb-8">
            <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-4 max-w-2xl mx-auto mb-8">
                <h4 className="flex items-center justify-center gap-2 text-yellow-500 font-bold mb-2">
                    <AlertTriangle size={16} /> 风险提示 (Risk Warning)
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                    本游戏仅供娱乐与数据展示，不涉及真实资金交易。
                    不提供任何收益承诺，不构成投资建议。
                    <br/>
                    This game is for entertainment only. No real money involved. Not financial advice.
                </p>
            </div>
            
            <button 
                onClick={() => setShowShareModal(true)}
                className="bg-[#FCD535] text-black font-bold py-3 px-8 rounded-full hover:bg-[#eebb18] transition-colors shadow-lg shadow-yellow-500/20 active:scale-95 flex items-center gap-2 mx-auto"
            >
                <Share2 size={18} />
                立即分享战绩 (Share Stats)
            </button>
        </footer>

      </main>

      {/* Login Modal */}
      {showLoginModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-[#1e2329] w-full max-w-md rounded-2xl p-6 border border-gray-700 shadow-2xl relative">
                  <button 
                    onClick={() => setShowLoginModal(false)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white"
                  >
                      <XIcon size={24} />
                  </button>
                  
                  <div className="flex flex-col items-center mb-6">
                      <Twitter size={48} className="text-white mb-4" fill="white" />
                      <h2 className="text-2xl font-bold text-white">Connect to Play</h2>
                      <p className="text-gray-400 text-center mt-2 text-sm">
                          Enter your X (Twitter) handle to generate your profile and save your stats locally.
                      </p>
                  </div>

                  <form onSubmit={handleXLoginSubmit} className="space-y-4">
                      <div>
                          <label className="block text-xs uppercase text-gray-500 mb-1 font-bold">X Handle</label>
                          <div className="relative">
                              <span className="absolute left-4 top-3 text-gray-400">@</span>
                              <input 
                                type="text" 
                                placeholder="elonmusk" 
                                className="w-full bg-[#0b0e11] border border-gray-700 rounded-lg py-3 pl-8 pr-4 text-white focus:outline-none focus:border-[#FCD535] transition-colors"
                                value={handleInput}
                                onChange={(e) => setHandleInput(e.target.value)}
                                autoFocus
                              />
                          </div>
                      </div>
                      <button 
                        type="submit"
                        disabled={!handleInput}
                        className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          Connect Account
                      </button>
                  </form>
                  <p className="text-xs text-gray-600 text-center mt-4">
                      * Uses unavatar.io public API. No password required.
                  </p>
              </div>
          </div>
      )}
      
      {/* Share Card Modal */}
      {showShareModal && (
          <ShareCardModal 
             stats={stats} 
             user={user} 
             onClose={() => setShowShareModal(false)} 
          />
      )}

      {/* Result Modal */}
      {modalResult && (
        <GameResultModal 
            result={modalResult} 
            onClose={() => setModalResult(null)} 
            streak={stats.currentStreak}
            onShare={() => {
                setModalResult(null); // Close small modal
                setShowShareModal(true); // Open big share card
            }}
        />
      )}
    </div>
  );
}