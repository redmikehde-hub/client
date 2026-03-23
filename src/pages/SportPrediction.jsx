import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CalendarClock, Coins, Flame, ShieldCheck, Sparkles, Trophy } from 'lucide-react';
import { gameService, sportService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const BET_OPTIONS = [10, 50, 100, 500, 1000];

const predictionLabels = {
  TEAM_A: 'Team A Win',
  TEAM_B: 'Team B Win',
  DRAW: 'Draw',
};

function formatTime(dateString) {
  return new Date(dateString).toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export default function SportPrediction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
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

  const selectedMatch = useMemo(() => matches.find((match) => match.id === selectedMatchId) || null, [matches, selectedMatchId]);

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
    return <div className="text-white p-6">Loading Sport prediction...</div>;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_28%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.14),transparent_28%),linear-gradient(180deg,#07111f,#0b1222,#071018)] p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/dashboard/games')} className="p-3 rounded-xl bg-white/5 border border-white/10 text-white">
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.35em] text-emerald-300/70">Sports Prediction</div>
            <h1 className="text-3xl font-black text-white">{game?.name || 'Sport'}</h1>
          </div>
          <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-amber-300 font-bold flex items-center gap-2">
            <Coins size={14} /> {Number(user?.balance || 0).toLocaleString()}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-5">
            {matches.map((match) => (
              <motion.div key={match.id} whileHover={{ y: -3 }} className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/5 backdrop-blur-xl">
                <div className="absolute inset-0">
                  <img src={match.banner} alt={match.league} className="h-full w-full object-cover opacity-20" />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/92 to-slate-950/70" />
                </div>
                <div className="relative z-10 p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {match.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 rounded-full text-[11px] font-black tracking-[0.2em] uppercase bg-emerald-400/15 text-emerald-300 border border-emerald-400/20">{tag}</span>
                    ))}
                    <span className={`px-3 py-1 rounded-full text-[11px] font-black tracking-[0.2em] uppercase border ${match.status === 'SCHEDULED' ? 'bg-blue-400/15 text-blue-300 border-blue-400/20' : match.status === 'LIVE' ? 'bg-red-400/15 text-red-300 border-red-400/20' : 'bg-white/10 text-slate-200 border-white/10'}`}>{match.status === 'SCHEDULED' ? 'Bet Open' : match.status === 'LIVE' ? 'Match Live' : 'Result Ready'}</span>
                  </div>

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <div className="text-sm text-slate-400 mb-1">{match.league} • {match.sport}</div>
                      <div className="text-3xl font-black text-white">{match.teamA} <span className="text-slate-500">vs</span> {match.teamB}</div>
                      <div className="mt-3 flex items-center gap-3 text-sm text-slate-300">
                        <span className="flex items-center gap-1"><CalendarClock size={14} /> {formatTime(match.startTime)}</span>
                        <span className="flex items-center gap-1"><Flame size={14} /> {match.playersCount}+ players</span>
                      </div>
                    </div>
                    <button
                      onClick={() => { setSelectedMatchId(match.id); setSelectedPrediction(null); }}
                      className={`px-5 py-3 rounded-2xl font-black ${selectedMatchId === match.id ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/10 text-white border border-white/10'}`}
                    >
                      {selectedMatchId === match.id ? 'Selected Match' : 'Choose Match'}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[
                      { key: 'TEAM_A', label: match.teamA, odds: match.predictionOdds.TEAM_A },
                      { key: 'DRAW', label: 'Draw', odds: match.predictionOdds.DRAW },
                      { key: 'TEAM_B', label: match.teamB, odds: match.predictionOdds.TEAM_B },
                    ].map((option) => (
                      <button
                        key={option.key}
                        disabled={match.status !== 'SCHEDULED' || selectedMatchId !== match.id}
                        onClick={() => { setSelectedMatchId(match.id); setSelectedPrediction(option.key); }}
                        className={`rounded-2xl border p-4 text-left transition ${selectedPrediction === option.key && selectedMatchId === match.id ? 'border-emerald-400 bg-emerald-400/15' : 'border-white/10 bg-white/5'} ${match.status !== 'SCHEDULED' || selectedMatchId !== match.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Prediction</div>
                        <div className="mt-2 text-lg font-bold text-white truncate">{option.label}</div>
                        <div className="mt-1 text-emerald-300 font-black">{Number(option.odds).toFixed(2)}x</div>
                      </button>
                    ))}
                  </div>

                  {match.myBet && (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Your bet</div>
                        <div className="text-white font-bold">{predictionLabels[match.myBet.prediction] || match.myBet.prediction}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Status</div>
                        <div className={`font-black ${match.myBet.status === 'WIN' ? 'text-emerald-300' : match.myBet.status === 'LOSS' ? 'text-rose-300' : 'text-cyan-300'}`}>{match.myBet.status}</div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-5">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white font-black mb-4"><ShieldCheck size={18} /> Prediction Slip</div>
              <div className="space-y-3 mb-4">
                <div className="rounded-2xl bg-black/20 p-4 border border-white/10">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-2">Match</div>
                  <div className="text-white font-bold">{selectedMatch ? `${selectedMatch.teamA} vs ${selectedMatch.teamB}` : 'Select a match'}</div>
                </div>
                <div className="rounded-2xl bg-black/20 p-4 border border-white/10">
                  <div className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-2">Prediction</div>
                  <div className="text-white font-bold">{selectedPrediction ? predictionLabels[selectedPrediction] : 'Choose outcome'}</div>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {BET_OPTIONS.map((amount) => (
                  <button key={amount} onClick={() => setBetAmount(amount)} className={`rounded-xl px-3 py-3 font-bold ${betAmount === amount ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white' : 'bg-white/5 text-slate-300 border border-white/10'}`}>{amount}</button>
                ))}
              </div>
              <button onClick={handleBet} disabled={placing || !selectedMatch || !selectedPrediction} className="w-full rounded-2xl py-4 font-black text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 disabled:opacity-50">
                {placing ? 'Locking Prediction...' : `Confirm Bet ${betAmount}`}
              </button>
              {message && <div className="mt-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-emerald-300 text-sm">{message}</div>}
              {error && <div className="mt-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-rose-300 text-sm">{error}</div>}
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
              <div className="flex items-center gap-2 text-white font-black mb-4"><Trophy size={18} /> Recent Predictions</div>
              <div className="space-y-3">
                {bets.map((bet) => (
                  <div key={bet.id} className="rounded-2xl bg-black/20 p-4 border border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-bold text-white">{bet.teams}</div>
                      <div className="text-xs text-slate-400">{predictionLabels[bet.prediction] || bet.prediction}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black ${bet.status === 'WIN' ? 'text-emerald-300' : bet.status === 'LOSS' ? 'text-rose-300' : 'text-cyan-300'}`}>{bet.status}</div>
                      <div className="text-xs text-slate-400">{bet.reward > 0 ? `+${bet.reward}` : bet.betAmount}</div>
                    </div>
                  </div>
                ))}
                {bets.length === 0 && <div className="text-slate-400 text-sm">No predictions placed yet.</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showTicket && ticket && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={() => setShowTicket(false)} />
            <motion.div initial={{ scale: 0.92, y: 18 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 18 }} className="relative w-full max-w-lg rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#07111f,#0b1222)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)]">
              <div className="text-[11px] uppercase tracking-[0.35em] text-emerald-300/70 mb-2">Prediction Locked</div>
              <h3 className="text-3xl font-black text-white mb-3">{ticket.teams}</h3>
              <div className="space-y-3 mb-5">
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-white"><strong>{predictionLabels[ticket.prediction]}</strong> at {Number(ticket.odds).toFixed(2)}x</div>
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 text-slate-300">Bet {ticket.betAmount} coins • Match starts {formatTime(ticket.startTime)}</div>
              </div>
              <button onClick={() => setShowTicket(false)} className="w-full rounded-2xl py-4 font-black text-white bg-gradient-to-r from-emerald-500 to-cyan-500">Done</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
