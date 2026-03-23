import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Coins, Rocket, TimerReset, Users, History, Gauge, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { aviatorService } from '../../services/api';
import './AviatorGame.css';

const BET_OPTIONS = [10, 50, 100, 500];
const AUTO_OPTIONS = [null, 1.5, 2, 3, 5, 10];

const AviatorGame = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();
  const { socket, isConnected } = useSocket();
  const [state, setState] = useState(null);
  const [history, setHistory] = useState([]);
  const [betAmount, setBetAmount] = useState(50);
  const [autoCashoutAt, setAutoCashoutAt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showCockpit, setShowCockpit] = useState(false);

  const fetchState = useCallback(async () => {
    try {
      const [{ data: stateData }, { data: historyData }] = await Promise.all([
        aviatorService.getState(),
        aviatorService.getHistory({ limit: 12 }),
      ]);
      setState(stateData.state);
      setHistory(historyData.history || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load Aviator');
    }
  }, []);

  useEffect(() => {
    fetchState();
  }, [fetchState]);

  useEffect(() => {
    if (!socket) return undefined;
    socket.emit('aviator:join');

    const onState = (next) => setState(next);
    const onCrash = ({ crashMultiplier }) => {
      setMessage(`Crashed at ${Number(crashMultiplier).toFixed(2)}x`);
      fetchState();
    };
    const onCashout = ({ reward, cashoutMultiplier }) => {
      setMessage(`Cashed out at ${Number(cashoutMultiplier).toFixed(2)}x and won ${Number(reward).toFixed(2)} coins`);
      fetchUser();
      fetchState();
    };

    socket.on('aviator:state', onState);
    socket.on('aviator:crash', onCrash);
    socket.on('aviator:cashed_out', onCashout);

    return () => {
      socket.emit('aviator:leave');
      socket.off('aviator:state', onState);
      socket.off('aviator:crash', onCrash);
      socket.off('aviator:cashed_out', onCashout);
    };
  }, [socket, fetchState, fetchUser]);

  const countdown = useMemo(() => Math.ceil((state?.countdownMs || 0) / 1000), [state?.countdownMs]);
  const myBet = state?.myBet;
  const canBet = state?.phase === 'waiting' && !myBet && user?.balance >= betAmount;
  const canCashout = state?.phase === 'running' && myBet?.status === 'ACTIVE';
  const canCloseCockpit = !!myBet && (myBet.status === 'CASHED_OUT' || state?.phase === 'crashed');

  const graphPath = useMemo(() => {
    const points = [];
    const current = Math.max(1, state?.multiplier || 1);
    for (let i = 0; i <= 40; i += 1) {
      const progress = i / 40;
      const x = 10 + progress * 280;
      const y = 130 - Math.min(115, Math.pow(progress, 1.35) * 55 - (current - 1) * 7);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  }, [state?.multiplier]);

  const handleBet = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const latest = await aviatorService.getState();
      if (latest.data?.state?.phase !== 'waiting') {
        setState(latest.data.state);
        throw new Error('Round already started. Wait for the next one.');
      }
      if (latest.data?.state?.myBet) {
        setState(latest.data.state);
        throw new Error('You already have a live bet in this round.');
      }
      const { data } = await aviatorService.placeBet({ betAmount, autoCashoutAt });
      setMessage(`Bet locked for ${betAmount} coins`);
      setState((prev) => prev ? { ...prev, myBet: { ...data.bet, status: 'ACTIVE' } } : prev);
      setShowCockpit(true);
      fetchUser();
      fetchState();
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await aviatorService.cashout();
      setMessage(`You won ${Number(data.reward).toFixed(2)} coins at ${Number(data.cashoutMultiplier).toFixed(2)}x`);
      setShowCockpit(true);
      fetchUser();
      fetchState();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to cash out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aviator-shell">
      <div className="aviator-topbar">
        <button className="aviator-back" onClick={() => navigate('/dashboard/games')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className="aviator-kicker">Live Multiplier</div>
          <h1>Aviator</h1>
        </div>
        <div className="aviator-balance">
          <Coins size={14} />
          <span>{Number(user?.balance || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="aviator-layout">
        <div className={`aviator-stage phase-${state?.phase || 'waiting'}`}>
          <div className="aviator-stage-glow" />
          <div className="aviator-stage-head">
            <div className="aviator-chip"><Users size={14} /> {state?.playersCount || 0} live bets</div>
            <div className="aviator-chip"><ShieldCheck size={14} /> server controlled</div>
          </div>

          <div className="aviator-graph-wrap">
            <svg viewBox="0 0 300 150" className="aviator-graph">
              <defs>
                <linearGradient id="aviator-line" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2dd4bf" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="url(#aviator-line)" strokeWidth="4" strokeLinecap="round" points={graphPath} />
            </svg>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${state?.phase}-${state?.multiplier}-${state?.crashedAt}`}
                className="aviator-center"
                initial={{ opacity: 0.5, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0.5, scale: 0.95 }}
              >
                {state?.phase === 'waiting' && (
                  <>
                    <div className="aviator-label">Next round in</div>
                    <div className="aviator-countdown">{countdown}s</div>
                  </>
                )}
                {state?.phase === 'running' && (
                  <>
                    <div className="aviator-label running">Flying</div>
                    <div className="aviator-multiplier">{Number(state?.multiplier || 1).toFixed(2)}x</div>
                  </>
                )}
                {state?.phase === 'crashed' && (
                  <>
                    <div className="aviator-label crashed">Crashed</div>
                    <div className="aviator-multiplier crash">{Number(state?.crashMultiplier || 1).toFixed(2)}x</div>
                  </>
                )}
                <div className="aviator-rocket">{state?.phase === 'crashed' ? '💥' : '🚀'}</div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="aviator-stage-foot">
            <div className="aviator-status"><TimerReset size={14} /> {state?.phase === 'waiting' ? 'Waiting for bets' : state?.phase === 'running' ? 'Cash out before crash' : `Round ended at ${Number(state?.crashMultiplier || 1).toFixed(2)}x`}</div>
            <div className="aviator-history-strip">
              {(state?.history || []).slice(0, 8).map((value, index) => (
                <span key={`${value}-${index}`} className={`history-pill ${value >= 10 ? 'hot' : value >= 2 ? 'warm' : 'cold'}`}>{Number(value).toFixed(2)}x</span>
              ))}
            </div>
          </div>
        </div>

        <div className="aviator-side">
          <div className="aviator-card control-card">
            <div className="card-title"><Gauge size={16} /> Bet Control</div>
            <div className="bet-grid">
              {BET_OPTIONS.map((amount) => (
                <button key={amount} className={`bet-option ${betAmount === amount ? 'active' : ''}`} onClick={() => setBetAmount(amount)}>
                  {amount}
                </button>
              ))}
            </div>
            <label className="auto-label">Auto cashout</label>
            <div className="auto-grid">
              {AUTO_OPTIONS.map((value, index) => (
                <button key={index} className={`auto-option ${autoCashoutAt === value ? 'active' : ''}`} onClick={() => setAutoCashoutAt(value)}>
                  {value ? `${value.toFixed(2)}x` : 'Manual'}
                </button>
              ))}
            </div>

            <div className="bet-summary">
              <div><span>Phase</span><strong>{state?.phase || 'loading'}</strong></div>
              <div><span>Bet</span><strong>{betAmount}</strong></div>
              <div><span>Auto</span><strong>{autoCashoutAt ? `${autoCashoutAt.toFixed(2)}x` : 'Off'}</strong></div>
            </div>

            <button className={`aviator-action place ${!canBet ? 'disabled' : ''}`} disabled={!canBet || loading} onClick={handleBet}>
              {loading && !canCashout ? 'Placing...' : canBet ? `Place Bet ${betAmount}` : myBet ? 'Bet Locked' : state?.phase === 'waiting' ? 'Insufficient Balance' : 'Round Running'}
            </button>
            <button className={`aviator-action cashout ${!canCashout ? 'disabled' : ''}`} disabled={!canCashout || loading} onClick={handleCashout}>
              {loading && canCashout ? 'Cashing Out...' : canCashout ? `Cash Out ${Number((myBet?.betAmount || 0) * (state?.multiplier || 1)).toFixed(2)}` : myBet?.status === 'CASHED_OUT' ? 'Cashed Out' : 'Cash Out'}
            </button>

            {myBet && (
              <div className="my-bet-box">
                <div className="card-title">Your Bet</div>
                <div className="my-bet-row"><span>Amount</span><strong>{myBet.betAmount}</strong></div>
                <div className="my-bet-row"><span>Status</span><strong>{myBet.status}</strong></div>
                <div className="my-bet-row"><span>Potential</span><strong>{Number((myBet.betAmount || 0) * (state?.multiplier || 1)).toFixed(2)}</strong></div>
              </div>
            )}

            {message && <div className="aviator-note success">{message}</div>}
            {error && <div className="aviator-note error">{error}</div>}
            {!isConnected && <div className="aviator-note error">Socket disconnected. Reconnecting...</div>}
          </div>

          <div className="aviator-card live-card">
            <div className="card-title"><Users size={16} /> Live Bets</div>
            <div className="live-list">
              {(state?.liveBets || []).slice(0, 10).map((bet, index) => (
                <div className="live-item" key={`${bet.userId}-${index}`}>
                  <div>
                    <strong>{bet.name}</strong>
                    <span>{bet.betAmount} coins</span>
                  </div>
                  <div className={`live-status ${bet.status?.toLowerCase()}`}>{bet.status === 'CASHED_OUT' ? `${Number(bet.cashoutMultiplier || 0).toFixed(2)}x` : bet.status}</div>
                </div>
              ))}
              {!state?.liveBets?.length && <div className="empty-line">No live bets yet</div>}
            </div>
          </div>

          <div className="aviator-card history-card">
            <div className="card-title"><History size={16} /> Your History</div>
            <div className="history-list">
              {history.map((item) => {
                const meta = item.selection ? JSON.parse(item.selection) : {};
                return (
                  <div className="history-item" key={item.id}>
                    <div>
                      <strong>{item.result}</strong>
                      <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <strong>{item.result === 'WIN' ? `+${Number(item.winAmount).toFixed(2)}` : `-${Number(item.betAmount).toFixed(2)}`}</strong>
                      <span>{meta.cashoutMultiplier ? `${Number(meta.cashoutMultiplier).toFixed(2)}x / ${Number(meta.crashMultiplier).toFixed(2)}x` : `${Number(meta.crashMultiplier || item.multiplier || 1).toFixed(2)}x`}</span>
                    </div>
                  </div>
                );
              })}
              {!history.length && <div className="empty-line">No Aviator rounds played yet</div>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCockpit && myBet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
            onClick={canCloseCockpit ? () => setShowCockpit(false) : undefined}
          >
            <div className="absolute inset-0 bg-black/85 backdrop-blur-xl" />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.15),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),linear-gradient(180deg,#06111f,#020617)] p-6 shadow-[0_30px_120px_rgba(0,0,0,0.65)]"
            >
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="aviator-kicker">Live Cockpit</div>
                  <h2 className="text-3xl font-black text-white">Aviator Round</h2>
                </div>
                <button className="aviator-back" onClick={() => setShowCockpit(false)} disabled={!canCloseCockpit}>
                  <ArrowLeft size={18} />
                </button>
              </div>

              <div className={`rounded-[28px] border border-white/10 p-6 text-center ${state?.phase === 'crashed' ? 'bg-red-500/10' : 'bg-white/5'}`}>
                <div className="aviator-label">{state?.phase === 'waiting' ? 'Waiting for launch' : state?.phase === 'running' ? 'Rocket live' : 'Round crashed'}</div>
                <div className={`aviator-multiplier ${state?.phase === 'crashed' ? 'crash' : ''}`}>{Number(state?.phase === 'crashed' ? state?.crashMultiplier || 1 : state?.multiplier || 1).toFixed(2)}x</div>
                <div className="aviator-rocket">{state?.phase === 'crashed' ? '💥' : '🚀'}</div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="my-bet-row"><span>Bet</span><strong>{myBet.betAmount}</strong></div>
                  <div className="my-bet-row"><span>Status</span><strong>{myBet.status}</strong></div>
                  <div className="my-bet-row"><span>Potential</span><strong>{Number((myBet.betAmount || 0) * (state?.multiplier || 1)).toFixed(2)}</strong></div>
                </div>
              </div>

              <div className="mt-5 flex gap-3">
                <button className={`aviator-action cashout ${!canCashout ? 'disabled' : ''}`} disabled={!canCashout || loading} onClick={handleCashout}>
                  {canCashout ? `Cash Out ${Number((myBet?.betAmount || 0) * (state?.multiplier || 1)).toFixed(2)}` : state?.phase === 'crashed' ? `Crashed at ${Number(state?.crashMultiplier || 1).toFixed(2)}x` : 'Waiting...'}
                </button>
                <button className="aviator-action place" onClick={() => setShowCockpit(false)} disabled={!canCloseCockpit}>Close</button>
              </div>
              {!canCloseCockpit && (
                <div className="aviator-note success">Popup stays open until cashout or crash result.</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AviatorGame;
