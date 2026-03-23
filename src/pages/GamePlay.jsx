import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Coins, Trophy, Target, Flame, Play, RotateCcw, ChevronUp, ChevronDown, X, Check, History, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { gameService, coinGameService } from '../services/api';
import toast from 'react-hot-toast';

const COLORS = ['red', 'green', 'blue'];
const MATKA_NUMBERS = ['Single', 'Jodi', 'Patti', 'Line'];
const SPIN_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const GamePlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateUser, fetchUser } = useAuth();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState(50);
  const [selectedOption, setSelectedOption] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [history, setHistory] = useState([]);
  const [balance, setBalance] = useState(0);
  const [gameHistory, setGameHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showGamePopup, setShowGamePopup] = useState(false);
  const [popupPhase, setPopupPhase] = useState('idle');
  const [popupValue, setPopupValue] = useState('');

  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  useEffect(() => {
    fetchGame();
    fetchGameHistory();
  }, [id]);

  const fetchGame = async () => {
    try {
      const response = await gameService.getOne(id);
      setGame(response.data.game);
    } catch (error) {
      console.error('Failed to fetch game:', error);
      toast.error('Failed to load game');
      navigate('/dashboard/games');
    } finally {
      setLoading(false);
    }
  };

  const fetchGameHistory = async () => {
    try {
      const response = await coinGameService.getHistory({ limit: 20 });
      setGameHistory(response.data.history || []);
    } catch (error) {
      console.error('Failed to fetch game history:', error);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const needsSelection = ['Colour', 'Matka', 'Ludo'].includes(game?.name);

  const placeBet = async () => {
    if (needsSelection && !selectedOption) {
      toast.error('Please select an option');
      return;
    }
    if (betAmount < game?.minBet) {
      toast.error(`Minimum bet is ${formatCurrency(game?.minBet)}`);
      return;
    }
    if (betAmount > game?.maxBet) {
      toast.error(`Maximum bet is ${formatCurrency(game?.maxBet)}`);
      return;
    }
    if (betAmount > balance) {
      toast.error('Insufficient balance');
      return;
    }

    setIsPlaying(true);
    setGameResult(null);
    setShowGamePopup(true);
    setPopupPhase('arming');
    setPopupValue(selectedOption || game?.name || 'Ready');

    const previews = {
      Colour: COLORS,
      Sport: ['Cricket', 'Football', 'Tennis', 'Kabaddi'],
      Aviator: ['1.18x', '1.42x', '2.08x', '3.21x'],
    };

    setTimeout(() => {
      setPopupPhase('running');
      const values = previews[game?.name] || ['Ready', 'Live', 'Play'];
      let index = 0;
      const interval = setInterval(() => {
        setPopupValue(values[index % values.length]);
        index += 1;
      }, 160);

      setTimeout(() => {
        clearInterval(interval);
        playGame();
      }, 1800);
    }, 650);
  };

  const playGame = async () => {
    try {
      const response = await coinGameService.play({
        gameName: game.name,
        gameId: game.id,
        betAmount,
        selection: selectedOption,
        multiplier: getMultiplier()
      });

      const result = response.data;
      setBalance(result.newBalance);
      
      setGameResult({
        type: 'number',
        value: result.result === 'WIN' ? 'WIN' : 'LOSS',
        isWin: result.result === 'WIN',
        winAmount: result.winAmount,
        betAmount
      });
      setPopupPhase('result');
      setPopupValue(result.result === 'WIN' ? `+${formatCurrency(result.winAmount)}` : 'CRASHED');

      updateUser({ balance: result.newBalance });
      fetchUser();
      fetchGameHistory();

      if (result.result === 'WIN') {
        toast.success(`You won ${formatCurrency(result.winAmount)}!`);
      }

      setHistory(prev => [{
        result: result.result,
        winAmount: result.winAmount,
        betAmount,
        timestamp: new Date()
      }, ...prev.slice(0, 9)]);
    } catch (error) {
      setPopupPhase('error');
      toast.error(error.response?.data?.error || 'Failed to play game');
    } finally {
      setIsPlaying(false);
      setSelectedOption(null);
    }
  };

  const getMultiplier = () => {
    switch (game?.name) {
      case 'Colour': return 3;
      case 'Matka': return 9;
      case 'Ludo': return 5;
      case 'Aviator': return 10;
      default: return 2;
    }
  };

  const resetGame = () => {
    setGameResult(null);
    setSelectedOption(null);
    setShowGamePopup(false);
    setPopupPhase('idle');
    setPopupValue('');
  };

  const canCloseGamePopup = !isPlaying && !!gameResult;

  const closeGamePopup = () => {
    if (!canCloseGamePopup) return;
    setShowGamePopup(false);
    setPopupPhase('idle');
    setPopupValue('');
  };

  const quickAmounts = [10, 25, 50, 100, 250, 500, 1000];

  if (loading) {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl skeleton" />
          <div>
            <div className="h-6 w-32 rounded skeleton mb-2" />
            <div className="h-4 w-48 rounded skeleton" />
          </div>
        </div>

        <div className="rounded-3xl skeleton skeleton-card p-8 mb-6">
          <div className="w-24 h-24 mx-auto rounded-full skeleton skeleton-avatar mb-6" />
          <div className="h-14 w-48 mx-auto rounded-lg skeleton mb-4" />
          <div className="h-4 w-32 mx-auto rounded skeleton mb-6" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 rounded-xl skeleton" />
            ))}
          </div>
          <div className="h-14 rounded-xl skeleton" />
        </div>

        <div className="space-y-3">
          <div className="h-4 w-24 rounded skeleton mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl skeleton skeleton-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded skeleton mb-1" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <motion.button
          className="p-3 rounded-xl bg-white/5 text-text-secondary border border-white/10 transition-all duration-300 hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard/games')}
        >
          <ArrowLeft size={20} />
        </motion.button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black">{game?.name}</h1>
          <p className="text-sm text-text-muted">{game?.description}</p>
        </div>
      </div>

      <motion.div 
        className="relative overflow-hidden rounded-3xl p-6 mb-6"
        style={{ background: `linear-gradient(135deg, ${game?.color}20, ${game?.color}05)`, border: `1px solid ${game?.color}30` }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full" style={{ backgroundColor: `${game?.color}20`, filter: 'blur(40px)' }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-text-muted">Your Balance</span>
            <span className="text-2xl font-black">{formatCurrency(balance)}</span>
          </div>
          <div className="flex gap-4 text-sm">
            <div>
              <span className="text-text-muted">Min: </span>
              <span className="font-bold">{formatCurrency(game?.minBet)}</span>
            </div>
            <div>
              <span className="text-text-muted">Max: </span>
              <span className="font-bold">{formatCurrency(game?.maxBet)}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        key="betting"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="premium-card rounded-3xl p-6 mb-6">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Target size={20} className="text-primary" />
                Select Your Bet
              </h3>

              {game?.name === 'Colour' && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {COLORS.map((color) => (
                    <motion.button
                      key={color}
                      className={`py-8 rounded-2xl font-bold text-lg capitalize transition-all duration-300 ${
                        selectedOption === color
                          ? `${color === 'red' ? 'bg-red-500' : color === 'green' ? 'bg-green-500' : 'bg-blue-500'} text-white shadow-lg scale-105`
                          : `${color === 'red' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : color === 'green' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption(color)}
                    >
                      {color}
                    </motion.button>
                  ))}
                </div>
              )}

              {game?.name === 'Matka' && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {['single', 'double', ...SPIN_VALUES.map(String)].map((opt) => (
                    <motion.button
                      key={opt}
                      className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        selectedOption === opt
                          ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30 scale-105'
                          : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption(opt)}
                    >
                      {opt === 'single' ? 'Odd' : opt === 'double' ? 'Even' : opt}
                    </motion.button>
                  ))}
                </div>
              )}

              {game?.name === 'Ludo' && (
                <div className="mb-6">
                  <div className="grid grid-cols-5 gap-2 mb-4">
                    {Array.from({ length: 10 }, (_, i) => i + 2).map((num) => (
                      <motion.button
                        key={num}
                        className={`py-3 rounded-xl font-bold transition-all duration-300 ${
                          selectedOption === num
                            ? 'bg-gradient-to-r from-warning to-amber-600 text-black shadow-lg shadow-warning/30 scale-105'
                            : 'bg-white/5 text-text-secondary border border-white/10 hover:bg-white/10'
                        }`}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedOption(num)}
                      >
                        {num}
                      </motion.button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        selectedOption === 'odd'
                          ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg'
                          : 'bg-white/5 text-text-secondary border border-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption('odd')}
                    >
                      Odd
                    </motion.button>
                    <motion.button
                      className={`py-4 rounded-xl font-bold text-lg transition-all duration-300 ${
                        selectedOption === 'even'
                          ? 'bg-gradient-to-r from-success to-emerald-600 text-white shadow-lg'
                          : 'bg-white/5 text-text-secondary border border-white/10'
                      }`}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedOption('even')}
                    >
                      Even
                    </motion.button>
                  </div>
                </div>
              )}

              {game?.name === 'Aviator' && (
                <div className="mb-6 p-6 bg-black/20 rounded-2xl text-center">
                  <div className="text-sm text-text-muted mb-2">Aviator flies away with your bet!</div>
                  <div className="text-5xl font-black text-warning mb-2">🚀</div>
                  <div className="text-sm text-text-muted">Select bet amount and try your luck</div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-text-secondary mb-3">Bet Amount</label>
                <input
                  type="number"
                  className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-2xl font-bold text-center focus:outline-none focus:border-primary transition-all"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(game?.minBet || 10, Math.min(game?.maxBet || 10000, parseInt(e.target.value) || 0)))}
                />
                <div className="grid grid-cols-4 gap-2 mt-3">
                  {quickAmounts.map((amt) => (
                    <motion.button
                      key={amt}
                      className={`py-2 rounded-lg font-semibold text-sm transition-all duration-300 ${
                        betAmount === amt
                          ? 'bg-primary text-white'
                          : 'bg-white/5 text-text-muted hover:bg-white/10'
                      }`}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setBetAmount(amt)}
                    >
                      {formatCurrency(amt)}
                    </motion.button>
                  ))}
                </div>
              </div>

          <motion.button
            className={`w-full py-5 rounded-2xl font-bold text-lg cursor-pointer shadow-lg transition-all duration-300 flex items-center justify-center gap-3 ${
              isPlaying || (needsSelection && !selectedOption) || betAmount < (game?.minBet || 10)
                ? 'bg-gray-500/50 cursor-not-allowed'
                : 'bg-gradient-to-r from-success to-emerald-600 text-white shadow-success/30 hover:shadow-success/50'
            }`}
            disabled={isPlaying || (needsSelection && !selectedOption) || betAmount < (game?.minBet || 10)}
            whileHover={!isPlaying && (!needsSelection || selectedOption) ? { scale: 1.02 } : {}}
            whileTap={!isPlaying && (!needsSelection || selectedOption) ? { scale: 0.98 } : {}}
            onClick={placeBet}
          >
            {isPlaying ? (
              <>
                <RotateCcw size={24} className="animate-spin" /> Launching Game...
              </>
            ) : (
              <>
                <Play size={24} /> Bet {formatCurrency(betAmount)}
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {showGamePopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4"
            onClick={canCloseGamePopup ? closeGamePopup : undefined}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_30%),linear-gradient(180deg,#0f172a,#020617)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.6)]"
            >
              <div className="absolute inset-0 opacity-60">
                <div className="absolute -left-8 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
                <div className="absolute -right-10 bottom-6 h-44 w-44 rounded-full bg-fuchsia-500/10 blur-3xl" />
              </div>

              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">Live Game</div>
                    <h3 className="text-2xl font-black text-white">{game?.name} Arena</h3>
                  </div>
                  <button
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                    onClick={closeGamePopup}
                    disabled={!canCloseGamePopup}
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
                    <div className="mb-4 flex items-center justify-between text-sm text-slate-300">
                      <span>{popupPhase === 'arming' ? 'Preparing round' : popupPhase === 'running' ? 'Game live' : popupPhase === 'result' ? 'Result ready' : 'Game state'}</span>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-cyan-200">Bet {formatCurrency(betAmount)}</span>
                    </div>

                    <div className={`mb-5 flex min-h-[220px] flex-col items-center justify-center rounded-[24px] border text-center ${popupPhase === 'result' && gameResult?.isWin ? 'border-emerald-400/30 bg-emerald-400/10' : popupPhase === 'result' ? 'border-rose-400/30 bg-rose-400/10' : 'border-white/10 bg-slate-950/40'}`}>
                      <motion.div
                        key={`${popupPhase}-${popupValue}`}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="px-6"
                      >
                        <div className="mb-4 text-6xl">{popupPhase === 'result' ? (gameResult?.isWin ? '🏆' : '💥') : game?.name === 'Aviator' ? '🚀' : game?.name === 'Colour' ? '🎯' : game?.name === 'Sport' ? '🏟️' : '🎮'}</div>
                        <div className={`text-[12px] uppercase tracking-[0.4em] ${popupPhase === 'result' && gameResult?.isWin ? 'text-emerald-300' : popupPhase === 'result' ? 'text-rose-300' : 'text-cyan-300/70'}`}>
                          {popupPhase === 'arming' ? 'Loading' : popupPhase === 'running' ? 'Playing' : popupPhase === 'result' ? 'Finished' : 'Ready'}
                        </div>
                        <div className="mt-4 text-5xl font-black text-white md:text-6xl">{popupValue || game?.name}</div>
                        {popupPhase === 'result' && gameResult && (
                          <div className="mt-4 text-lg font-semibold text-slate-200">
                            {gameResult.isWin ? `You won ${formatCurrency(gameResult.winAmount)}` : `You lost ${formatCurrency(gameResult.betAmount)}`}
                          </div>
                        )}
                      </motion.div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        { label: 'Selection', value: selectedOption || 'Auto' },
                        { label: 'Bet', value: formatCurrency(betAmount) },
                        { label: 'Multiplier', value: `${getMultiplier()}x` },
                      ].map((item) => (
                        <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{item.label}</div>
                          <div className="mt-2 text-lg font-bold text-white">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5">
                    <div className="text-sm font-bold text-white">Round Feed</div>
                    <div className="space-y-3 text-sm text-slate-300">
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Bet accepted and moved to live game popup.</div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Gameplay animates here before showing final win/loss.</div>
                      <div className="rounded-2xl border border-white/10 bg-black/20 p-4">Wallet and result stay connected to the backend.</div>
                    </div>

                    {popupPhase === 'result' && (
                      <div className="mt-auto flex gap-3">
                        <button
                          className="flex-1 rounded-2xl bg-gradient-to-r from-cyan-500 to-fuchsia-500 px-4 py-3 font-bold text-white"
                          onClick={resetGame}
                        >
                          Play Again
                        </button>
                        <button
                          className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 font-bold text-white"
                          onClick={closeGamePopup}
                        >
                          Close
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        className="w-full py-3 rounded-2xl font-bold text-sm cursor-pointer bg-white/5 text-text-secondary border border-white/10 transition-all duration-300 flex items-center justify-center gap-2 mb-6"
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowHistory(true)}
      >
        <History size={18} /> View Game History
      </motion.button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowHistory(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md max-h-[80vh] overflow-y-auto bg-gradient-to-b from-bg-card-hover to-bg-dark border border-white/10 rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <TrendingUp className="text-primary" /> Game History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {gameHistory.length === 0 ? (
                <p className="text-center text-text-muted py-8">No games played yet</p>
              ) : (
                <div className="space-y-3">
                  {gameHistory.map((h) => (
                    <div
                      key={h.id}
                      className={`p-4 rounded-xl border ${
                        h.result === 'WIN' 
                          ? 'bg-success/10 border-success/20' 
                          : 'bg-danger/10 border-danger/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold">{h.gameName}</p>
                          <p className="text-sm text-text-muted">
                            {new Date(h.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${h.result === 'WIN' ? 'text-success' : 'text-danger'}`}>
                            {h.result === 'WIN' ? '+' : '-'}{formatCurrency(h.betAmount)}
                          </p>
                          {h.result === 'WIN' && (
                            <p className="text-sm text-success">Won {formatCurrency(h.winAmount)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GamePlay;
