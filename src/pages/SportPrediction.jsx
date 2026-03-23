import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarClock, Coins, Flame, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { gameService, sportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const BET_OPTIONS = [10, 50, 100, 500, 1000];

const predictionLabels = {
  TEAM_A: 'Team A Win',
  TEAM_B: 'Team B Win',
  DRAW: 'Draw',
};

const sportLabels = {
  Cricket: 'Cricket Prediction',
};

function formatTime(dateString) {
  return new Date(dateString).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function SportPrediction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const [game, setGame] = useState(null);
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [selectedMatchId, setSelectedMatchId] = useState(null);
  const [selectedPrediction, setSelectedPrediction] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showTicket, setShowTicket] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [activeCategory, setActiveCategory] = useState('ALL');

  const fetchData = async () => {
    try {
      const [gameRes, matchesRes, betsRes] = await Promise.all([
        gameService.getOne(id),
        sportService.getMatches(),
        sportService.getMyBets({ limit: 12 }),
      ]);
      setGame(gameRes.data.game);
      setMatches(matchesRes.data.matches || []);
      setBets(betsRes.data.bets || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load sports prediction');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, 15000);
    return () => clearInterval(timer);
  }, [id]);

  useEffect(() => {
    if (!socket) return undefined;

    socket.emit('sport:join');
    const handleMatches = (payload) => {
      if (payload?.matches) {
        setMatches(payload.matches);
      }
    };

    socket.on('sport:matches', handleMatches);

    return () => {
      socket.emit('sport:leave');
      socket.off('sport:matches', handleMatches);
    };
  }, [socket]);

  const selectedMatch = useMemo(() => matches.find((match) => match.id === selectedMatchId) || null, [matches, selectedMatchId]);

  const categories = useMemo(() => {
    const leagueOptions = Array.from(new Set(matches.map((match) => match.league).filter(Boolean))).slice(0, 8);
    const sportOptions = Array.from(new Set(matches.map((match) => match.sport).filter(Boolean))).slice(0, 4);
    return ['ALL', ...sportOptions, ...leagueOptions];
  }, [matches]);

  const filteredMatches = useMemo(() => {
    if (activeCategory === 'ALL') return matches;
    return matches.filter((match) => match.sport === activeCategory || match.league === activeCategory);
  }, [matches, activeCategory]);

  const handleBet = async () => {
    if (!selectedMatch || !selectedPrediction) {
      setError('Choose a match and prediction first');
      return;
    }
    try {
      setPlacing(true);
      setError('');
      setMessage('');
      const { data } = await sportService.placeBet({
        matchId: selectedMatch.id,
        prediction: selectedPrediction,
        betAmount,
      });
      setTicket({
        teams: `${selectedMatch.teamA} vs ${selectedMatch.teamB}`,
        prediction: selectedPrediction,
        odds: data.odds,
        betAmount,
        startTime: selectedMatch.startTime,
      });
      setShowTicket(true);
      setMessage('Prediction locked successfully');
      setSelectedPrediction(null);
      fetchUser();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to place bet');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="text-white p-4 text-center">Loading Sport prediction...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#07111f,#0b1222,#071018)] p-2 sm:p-4 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
          <button onClick={() => navigate('/dashboard/games')} className="p-2 sm:p-3 rounded-xl bg-white/5 border border-white/10 text-white shrink-0">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center min-w-0">
            <div className="text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-emerald-300/70">Live Cricket Markets</div>
            <h1 className="text-xl sm:text-3xl font-black text-white truncate">{game?.name || 'Sport'}</h1>
          </div>
          <div className="px-2 sm:px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-300 font-bold flex items-center gap-1 sm:gap-2 shrink-0 text-xs sm:text-base">
            <Coins size={12} className="sm:size-4" /> {Number(user?.balance || 0).toLocaleString()}
          </div>
        </div>

        <div className="mb-3 sm:mb-5 flex items-center justify-between rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm text-slate-300 backdrop-blur-xl">
          <div className="flex items-center gap-1 sm:gap-2">
            <Sparkles size={14} className="sm:size-4 text-emerald-300" />
            <span className="hidden xs:inline">Live sports feed</span> {isConnected ? 'connected' : 'reconnecting'}
          </div>
          <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-500">API + Socket</div>
        </div>

        <div className="mb-4 sm:mb-6 -mx-2 px-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 w-max sm:w-auto sm:flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-3 sm:px-4 py-2 rounded-full border text-xs sm:text-sm font-bold transition whitespace-nowrap ${activeCategory === category ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border-transparent' : 'bg-white/5 text-slate-300 border-white/10'}`}
              >
                {category === 'ALL' ? 'All Matches' : category}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-[minmax(0,1fr)_360px] gap-4 lg:gap-6">
          <div className="rounded-2xl lg:rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl p-3 sm:p-4 order-1">
            <div className="flex items-center justify-between px-2 pb-3">
              <div>
                <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-emerald-300/70">Live Matchboard</div>
                <div className="text-white text-lg sm:text-xl font-black">{activeCategory === 'ALL' ? 'All Cricket Matches' : activeCategory}</div>
              </div>
              <div className="text-xs text-slate-400">{filteredMatches.length} matches</div>
            </div>

            <div className="max-h-[55vh] lg:max-h-[72vh] overflow-y-auto pr-1 space-y-3 lg:space-y-4 sport-scroll">
            {filteredMatches.map((match) => (
              <motion.div key={match.id} whileHover={{ y: -2 }} className="relative overflow-hidden rounded-2xl lg:rounded-[24px] border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="absolute inset-0">
                  <img src={match.banner} alt={match.league} className="h-full w-full object-cover opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/92 to-slate-950/70" />
                </div>
                <div className="relative z-10 p-3 sm:p-4 lg:p-5">
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
                    {match.tags.map((tag) => (
                      <span key={tag} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">{tag}</span>
                    ))}
                    <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black tracking-[0.15em] sm:tracking-[0.2em] uppercase border ${match.status === 'SCHEDULED' ? 'bg-blue-400/15 text-blue-300 border-blue-400/20' : match.status === 'LIVE' ? 'bg-red-400/15 text-red-300 border-red-400/20' : 'bg-white/10 text-slate-200 border-white/10'}`}>{match.status === 'SCHEDULED' ? 'Bet Open' : match.status === 'LIVE' ? 'Match Live' : 'Result Ready'}</span>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-400 mb-2 sm:mb-3">{match.league} • {match.sport}</div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {match.teamABadge ? <img src={match.teamABadge} alt={match.teamA} className="h-7 w-7 sm:h-10 sm:w-10 object-contain" /> : <span className="text-lg sm:text-xl font-black text-white">{match.teamA?.charAt(0)}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-base sm:text-lg lg:text-xl font-black text-white truncate">{match.teamA}</div>
                        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-emerald-300">Team A</div>
                      </div>
                    </div>
                    <div className="text-center shrink-0 px-2">
                      <div className="text-slate-500 text-[10px] sm:text-xs uppercase tracking-[0.25em] sm:tracking-[0.35em]">VS</div>
                      {(match.homeScore !== null && match.homeScore !== undefined) || (match.awayScore !== null && match.awayScore !== undefined) ? (
                        <div className="mt-1 sm:mt-2 text-base sm:text-xl font-black text-white">{match.homeScore ?? 0} - {match.awayScore ?? 0}</div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-end">
                      <div className="min-w-0 flex-1 text-right">
                        <div className="text-base sm:text-lg lg:text-xl font-black text-white truncate">{match.teamB}</div>
                        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-cyan-300">Team B</div>
                      </div>
                      <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-white/10 border border-white/10 overflow-hidden flex items-center justify-center shrink-0">
                        {match.teamBBadge ? <img src={match.teamBBadge} alt={match.teamB} className="h-7 w-7 sm:h-10 sm:w-10 object-contain" /> : <span className="text-lg sm:text-xl font-black text-white">{match.teamB?.charAt(0)}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-2 sm:gap-3 gap-y-1 text-[11px] sm:text-sm text-slate-300 mb-3 sm:mb-4">
                    <span className="flex items-center gap-1"><CalendarClock size={12} className="sm:size-4" /> {formatTime(match.startTime)}</span>
                    <span className="flex items-center gap-1"><Flame size={12} className="sm:size-4" /> {match.playersCount}+ players</span>
                    {match.venue ? <span className="text-slate-500 truncate max-w-[120px] sm:max-w-full">{match.venue}</span> : null}
                  </div>

                  <button
                    onClick={() => { setSelectedMatchId(match.id); setSelectedPrediction(null); }}
                    className={`w-full px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl font-black text-sm ${selectedMatchId === match.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/10 text-white border border-white/10'}`}
                  >
                    {selectedMatchId === match.id ? '✓ Selected' : 'Choose Match'}
                  </button>

                  <div className="mt-3 sm:mt-4 grid gap-2 grid-cols-3">
                    {[
                      { key: 'TEAM_A', label: match.teamA, odds: match.predictionOdds.TEAM_A },
                      { key: 'DRAW', label: 'Draw', odds: match.predictionOdds.DRAW },
                      { key: 'TEAM_B', label: match.teamB, odds: match.predictionOdds.TEAM_B },
                    ].map((option) => (
                      <button
                        key={option.key}
                        disabled={match.status !== 'SCHEDULED' || selectedMatchId !== match.id}
                        onClick={() => { setSelectedMatchId(match.id); setSelectedPrediction(option.key); }}
                        className={`rounded-xl sm:rounded-2xl border p-2 sm:p-3 text-center transition ${selectedPrediction === option.key && selectedMatchId === match.id ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-white/5'} ${match.status !== 'SCHEDULED' || selectedMatchId !== match.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400">Prediction</div>
                        <div className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-white truncate">{option.label}</div>
                        <div className="mt-0.5 sm:mt-1 text-emerald-300 font-black text-sm sm:text-base">{Number(option.odds).toFixed(2)}x</div>
                      </button>
                    ))}
                  </div>

                  {match.myBet && (
                    <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2 sm:gap-3">
                      <div>
                        <div className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-slate-400">Your bet</div>
                        <div className="text-white font-bold text-sm sm:text-base">{predictionLabels[match.myBet.prediction] || match.myBet.prediction}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] sm:text-xs text-slate-400">Status</div>
                        <div className={`font-black text-sm sm:text-base ${match.myBet.status === 'WIN' ? 'text-emerald-300' : match.myBet.status === 'LOSS' ? 'text-rose-300' : 'text-cyan-300'}`}>{match.myBet.status}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
            {filteredMatches.length === 0 && (
              <div className="rounded-2xl lg:rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-10 text-center text-slate-400 backdrop-blur-xl">
                No matches available in this category right now.
              </div>
            )}
            </div>
          </div>

          <div className="space-y-3 lg:space-y-5 lg:sticky lg:top-4 self-start order-2">
            <div className="rounded-2xl lg:rounded-[28px] border border-white/10 bg-white/5 p-3 sm:p-5 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
              <div className="flex items-center gap-2 text-white font-black mb-2 sm:mb-4"><ShieldCheck size={14} className="sm:size-[18px]" /> Prediction Slip</div>
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="rounded-xl sm:rounded-2xl bg-black/20 p-2 sm:p-4 border border-white/10">
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400 mb-1 sm:mb-2">Match</div>
                  <div className="text-white font-bold text-xs sm:text-base truncate">{selectedMatch ? `${selectedMatch.teamA} vs ${selectedMatch.teamB}` : 'Select a match'}</div>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-black/20 p-2 sm:p-4 border border-white/10">
                  <div className="text-[10px] sm:text-xs uppercase tracking-[0.15em] sm:tracking-[0.25em] text-slate-400 mb-1 sm:mb-2">Prediction</div>
                  <div className="text-white font-bold text-xs sm:text-base">{selectedPrediction ? predictionLabels[selectedPrediction] : 'Choose outcome'}</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-3 sm:mb-4">
                {BET_OPTIONS.map((amount) => (
                  <button key={amount} onClick={() => setBetAmount(amount)} className={`rounded-lg sm:rounded-xl px-0.5 sm:px-3 py-1.5 sm:py-3 font-bold text-[10px] sm:text-sm ${betAmount === amount ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}>{amount}</button>
                ))}
              </div>
              <button onClick={handleBet} disabled={placing || !selectedMatch || !selectedPrediction} className="w-full rounded-xl sm:rounded-2xl py-2.5 sm:py-4 font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 disabled:opacity-50 text-xs sm:text-base">
                {placing ? 'Locking...' : `Confirm Bet ${betAmount}`}
              </button>
              {message && <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2 sm:p-3 text-emerald-300 text-[10px] sm:text-sm">{message}</div>}
              {error && <div className="mt-2 sm:mt-3 rounded-lg sm:rounded-xl bg-rose-500/10 border border-rose-500/20 p-2 sm:p-3 text-rose-300 text-[10px] sm:text-sm">{error}</div>}
            </div>

            <div className="rounded-2xl lg:rounded-[28px] border border-white/10 bg-white/5 p-3 sm:p-5 backdrop-blur-xl max-h-[35vh] lg:max-h-[38vh] overflow-y-auto sport-scroll">
              <div className="flex items-center gap-2 text-white font-black mb-2 sm:mb-4"><Trophy size={14} className="sm:size-[18px]" /> Recent Predictions</div>
              <div className="space-y-2 sm:space-y-3">
                {bets.map((bet) => (
                  <div key={bet.id} className="rounded-xl sm:rounded-2xl bg-black/20 p-2 sm:p-4 border border-white/10 flex items-center justify-between gap-2 sm:gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-white text-[10px] sm:text-base truncate">{bet.teams}</div>
                      <div className="text-[9px] sm:text-xs text-slate-400">{predictionLabels[bet.prediction] || bet.prediction}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-black text-[10px] sm:text-base ${bet.status === 'WIN' ? 'text-emerald-300' : bet.status === 'LOSS' ? 'text-rose-300' : 'text-cyan-300'}`}>{bet.status}</div>
                      <div className="text-[9px] sm:text-xs text-slate-400">{bet.reward > 0 ? `+${bet.reward}` : bet.betAmount}</div>
                    </div>
                  </div>
                ))}
                {bets.length === 0 && <div className="text-slate-400 text-[10px] sm:text-sm">No predictions placed yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTicket && ticket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowTicket(false)} />
            <motion.div initial={{ scale: 0.92, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 18 }} className="relative w-full max-w-lg rounded-2xl sm:rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#07111f,#0b1222)] p-4 sm:p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.35em] text-emerald-300/70 mb-2">Prediction Locked</div>
              <h3 className="text-xl sm:text-3xl font-black text-white mb-3">{ticket.teams}</h3>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                <div className="rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 border border-white/10 text-white text-sm sm:text-base"><strong>{predictionLabels[ticket.prediction]}</strong> at {Number(ticket.odds).toFixed(2)}x</div>
                <div className="rounded-xl sm:rounded-2xl bg-white/5 p-3 sm:p-4 border border-white/10 text-slate-300 text-xs sm:text-sm">Bet {ticket.betAmount} coins • Match starts {formatTime(ticket.startTime)}</div>
              </div>
              <button onClick={() => setShowTicket(false)} className="w-full rounded-xl sm:rounded-2xl py-3 sm:py-4 font-black text-white bg-gradient-to-r from-emerald-500 to-cyan-500 text-sm sm:text-base">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .sport-scroll::-webkit-scrollbar { width: 8px; }
        .sport-scroll::-webkit-scrollbar-track { background: rgba(255,255,255,0.04); border-radius: 999px; }
        .sport-scroll::-webkit-scrollbar-thumb { background: linear-gradient(180deg, rgba(16,185,129,0.8), rgba(6,182,212,0.8)); border-radius: 999px; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
