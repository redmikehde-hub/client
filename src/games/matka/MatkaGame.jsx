import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { matkaService } from '../../services/api';
import {
  ArrowLeft,
  Coins,
  Clock,
  Trophy,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import './Matka.css';

const BET_OPTIONS = [10, 50, 100, 500];
const ROUND_DURATION = 30;
const BETTING_DURATION = 25;

const MatkaGame = () => {
  const navigate = useNavigate();
  const { user, fetchUser } = useAuth();

  const [roundNumber, setRoundNumber] = useState(1);
  const [result, setResult] = useState(null);
  const [isBettingOpen, setIsBettingOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [betAmount, setBetAmount] = useState(50);
  const [betType, setBetType] = useState('DIGIT');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [myBets, setMyBets] = useState([]);
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [winAmount, setWinAmount] = useState(0);
  const [roundStartTime, setRoundStartTime] = useState(Date.now());
  const [showPlayPopup, setShowPlayPopup] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);

  const pollRef = useRef(null);

  const fetchRound = useCallback(async () => {
    try {
      const response = await matkaService.getCurrentRound();
      if (response.data.success) {
        const round = response.data.round;
        setRoundNumber(round.number);
        setResult(round.result || null);
        setIsBettingOpen(round.bettingOpen);
        
        const elapsed = Math.floor((Date.now() - roundStartTime) / 1000);
        const remaining = Math.max(0, ROUND_DURATION - elapsed);
        setTimeLeft(remaining);
        
        if (round.status === 'COMPLETED' && round.result) {
          setLastResult(round.result);
          setTimeout(() => setLastResult(null), 5000);
        }
        
        if (round.status === 'COMPLETED') {
          setRoundStartTime(Date.now());
          setIsBettingOpen(true);
          setTimeLeft(ROUND_DURATION);
        }
      }
    } catch (err) {
      console.error('Fetch round error:', err);
      setIsBettingOpen(true);
    }
  }, [roundStartTime]);

  const fetchMyBets = useCallback(async () => {
    try {
      const response = await matkaService.getMyBets();
      if (response.data.success) {
        setMyBets(response.data.bets.slice(0, 10));
      }
    } catch (err) {
      console.error('Fetch bets error:', err);
    }
  }, []);

  const fetchResults = useCallback(async () => {
    try {
      const response = await matkaService.getResults({ limit: 10 });
      if (response.data.success) {
        setResults(response.data.results);
      }
    } catch (err) {
      console.error('Fetch results error:', err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    fetchRound();
    fetchMyBets();
    fetchResults();

    pollRef.current = setInterval(() => {
      fetchUser();
      fetchRound();
      fetchMyBets();
      fetchResults();
    }, 3000);

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
      }
    };
  }, [fetchRound, fetchMyBets, fetchResults, fetchUser]);

  useEffect(() => {
    if (timeLeft > 0 && isBettingOpen) {
      const timer = setTimeout(() => setTimeLeft(t => t - 1), 1000);
      return () => clearTimeout(timer);
    }
    
    if (timeLeft === 0 && isBettingOpen) {
      setIsBettingOpen(false);
    }
  }, [timeLeft, isBettingOpen]);

  useEffect(() => {
    if (!activeTicket || myBets.length === 0 || activeTicket.settled) return;
    const matched = myBets.find((bet) => (
      bet.selectedNumber === activeTicket.selectedNumber
      && bet.betAmount === activeTicket.betAmount
      && bet.betType === activeTicket.betType
      && bet.result
    ));

    if (matched) {
      setActiveTicket((prev) => prev ? {
        ...prev,
        settled: true,
        result: matched.result,
        isWin: matched.isWin,
        reward: matched.reward,
      } : prev);

      if (matched.isWin && matched.reward > 0) {
        setWinAmount(matched.reward);
        setShowWinAnimation(true);
      }
    }
  }, [myBets, activeTicket]);

  const handlePlaceBet = async () => {
    console.log('handlePlaceBet called');
    console.log('selectedNumber:', selectedNumber);
    console.log('isBettingOpen:', isBettingOpen);
    console.log('user:', user);
    console.log('user?.balance:', user?.balance);
    console.log('betAmount:', betAmount);
    
    if (!selectedNumber) {
      setError('Please select a number');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!user) {
      setError('Please login first');
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (user.balance < betAmount) {
      setError(`Insufficient balance! You have ${user.balance} coins`);
      setTimeout(() => setError(''), 3000);
      return;
    }

    if (!isBettingOpen) {
      setError('Betting is closed for this round');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('Placing your bet...');

    try {
      console.log('Sending bet to API:', { selectedNumber, betAmount, betType });
      const response = await matkaService.placeBet({
        selectedNumber,
        betAmount,
        betType,
      });
      console.log('Bet response:', response);

      if (response.data.success) {
        setActiveTicket({
          selectedNumber,
          betAmount,
          betType,
          roundNumber,
          settled: false,
          result: null,
          isWin: false,
          reward: 0,
        });
        setShowPlayPopup(true);
        setMessage(`Bet placed: ${selectedNumber} - ${betAmount} coins`);
        setMessageType('success');
        setSelectedNumber(null);
        setError('');
        fetchUser();
        fetchMyBets();
        
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Bet error:', err);
      const errorMsg = err.response?.data?.error || 'Failed to place bet';
      setError(errorMsg);
      setMessage('');
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectNumber = (num, type) => {
    setSelectedNumber(num);
    setBetType(type);
    setError('');
    setMessage('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getWinMultiplier = () => {
    return betType === 'DIGIT' ? 2 : 5;
  };

  const canPlaceBet = selectedNumber && isBettingOpen && !loading && user && (user.balance >= betAmount);

  const getButtonText = () => {
    if (loading) return 'Placing bet...';
    if (!user) return 'Login to Play';
    if (!selectedNumber) return 'Select a Number First';
    if (user.balance < betAmount) return `Need ${betAmount - user.balance} More Coins`;
    if (!isBettingOpen) return 'Betting Closed';
    return `Place Bet - ${betAmount}`;
  };

  const getButtonClass = () => {
    let cls = 'place-bet-btn';
    if (!canPlaceBet) cls += ' disabled';
    return cls;
  };

  const canClosePlayPopup = !!activeTicket?.settled;

  return (
    <div className="matka-container">
      {showWinAnimation && (
        <motion.div
          className="win-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="win-content"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Trophy size={80} className="win-trophy" />
            <h2>YOU WON!</h2>
            <p className="win-amount">+{winAmount}</p>
            <button onClick={() => setShowWinAnimation(false)}>Continue</button>
          </motion.div>
        </motion.div>
      )}

      <AnimatePresence>
        {lastResult && (
          <motion.div
            className="result-banner"
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
          >
            <div className="result-number">{lastResult}</div>
            <span>Result</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPlayPopup && activeTicket && (
          <motion.div
            className="win-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={canClosePlayPopup ? () => setShowPlayPopup(false) : undefined}
          >
            <motion.div
              className="win-content"
              style={{ maxWidth: 540, width: '100%', background: 'linear-gradient(180deg, rgba(15,23,42,0.96), rgba(2,6,23,0.96))', borderRadius: 28, border: '1px solid rgba(255,255,255,0.1)' }}
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="result-number" style={{ marginBottom: 12 }}>{activeTicket.selectedNumber}</div>
              <h2>{activeTicket.settled ? (activeTicket.isWin ? 'Matka Win' : 'Round Finished') : 'Matka Ticket Live'}</h2>
              <p style={{ color: 'rgba(255,255,255,0.72)', marginBottom: 18 }}>
                {activeTicket.settled
                  ? (activeTicket.isWin ? `You won ${activeTicket.reward} coins on round #${activeTicket.roundNumber}` : `Your ticket did not match round #${activeTicket.roundNumber}`)
                  : `Your bet is locked. Result will reveal after this round closes in ${formatTime(timeLeft)}.`}
              </p>
              <div className="p-4 bg-white/5 rounded-2xl mb-4">
                <div className="bet-item" style={{ marginBottom: 10 }}>
                  <div className="bet-info"><span className="round">Round</span><span className="number">#{activeTicket.roundNumber}</span></div>
                  <div className="bet-result win">{activeTicket.betAmount}</div>
                </div>
                <div className="bet-item" style={{ marginBottom: 10 }}>
                  <div className="bet-info"><span className="round">Type</span><span className="number">{activeTicket.betType === 'DIGIT' ? 'Single Digit' : 'Full Number'}</span></div>
                  <div className="bet-result win">{activeTicket.betType === 'DIGIT' ? '2x' : '5x'}</div>
                </div>
                {activeTicket.settled && (
                  <div className="bet-item">
                    <div className="bet-info"><span className="round">Status</span><span className="number">{activeTicket.result}</span></div>
                    <div className={`bet-result ${activeTicket.isWin ? 'win' : 'loss'}`}>{activeTicket.isWin ? `+${activeTicket.reward}` : 'Lost'}</div>
                  </div>
                )}
              </div>
              {activeTicket.settled ? (
                <button onClick={() => { setShowPlayPopup(false); setActiveTicket(null); }}>Close Ticket</button>
              ) : (
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Popup stays open until result is declared</div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="matka-header">
        <button className="back-btn" onClick={() => navigate('/dashboard/games')}>
          <ArrowLeft size={20} />
        </button>
        <div className="header-title">
          <Target className="text-orange-500" />
          <h1>Matka</h1>
        </div>
        <div className="balance-display">
          <Coins className="text-amber-400" size={16} />
          <span>{(user?.balance || 0).toLocaleString()}</span>
        </div>
      </div>

      <div className="round-info">
        <div className={`timer ${timeLeft <= 10 ? 'danger' : ''} ${!isBettingOpen ? 'closed' : ''}`}>
          <Clock size={18} />
          <span className="timer-text">
            {isBettingOpen ? `Bet: ${formatTime(timeLeft)}` : 'Betting Closed'}
          </span>
        </div>
        <div className="round-number">
          Round #{roundNumber}
        </div>
      </div>

      <div className="game-area">
        <div className="bet-type-selector">
          <button
            className={`type-btn ${betType === 'DIGIT' ? 'active' : ''}`}
            onClick={() => { setBetType('DIGIT'); setSelectedNumber(null); }}
          >
            <Zap size={16} />
            Single Digit (0-9)
            <span className="multiplier">2x</span>
          </button>
          <button
            className={`type-btn ${betType === 'NUMBER' ? 'active' : ''}`}
            onClick={() => { setBetType('NUMBER'); setSelectedNumber(null); }}
          >
            <Target size={16} />
            Full Number (00-99)
            <span className="multiplier">5x</span>
          </button>
        </div>

        <div className="number-grid">
          <AnimatePresence mode="wait">
            {betType === 'DIGIT' ? (
              <motion.div 
                key="digit" 
                className="digit-grid" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <motion.button
                    key={num}
                    className={`number-btn digit ${selectedNumber === String(num) ? 'selected' : ''}`}
                    onClick={() => selectNumber(String(num), 'DIGIT')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {num}
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="number" 
                className="number-grid-2d" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
              >
                {[...Array(100)].map((_, i) => (
                  <motion.button
                    key={i}
                    className={`number-btn full ${selectedNumber === String(i).padStart(2, '0') ? 'selected' : ''}`}
                    onClick={() => selectNumber(String(i).padStart(2, '0'), 'NUMBER')}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {String(i).padStart(2, '0')}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="bet-section">
          <div className="selected-display">
            {selectedNumber ? (
              <div className="selected-info">
                <span className="label">Selected:</span>
                <span className="number">{selectedNumber}</span>
                <span className="type">({betType === 'DIGIT' ? 'Single Digit' : 'Full Number'})</span>
              </div>
            ) : (
              <span className="placeholder">Select a number to bet</span>
            )}
          </div>

          <div className="bet-amount-selector">
            <span className="label">Bet Amount:</span>
            <div className="bet-options">
              {BET_OPTIONS.map((amount) => (
                <button
                  key={amount}
                  className={`bet-btn ${betAmount === amount ? 'active' : ''}`}
                  onClick={() => setBetAmount(amount)}
                >
                  {amount}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message">
              <XCircle size={16} />
              {error}
            </div>
          )}

          {message && (
            <div className={`message ${messageType}`}>
              <CheckCircle size={16} />
              {message}
            </div>
          )}

          <button
            className={getButtonClass()}
            onClick={handlePlaceBet}
            disabled={!canPlaceBet}
          >
            {loading ? (
              <span className="loading">Placing bet...</span>
            ) : (
              <>
                <Coins size={18} />
                {getButtonText()}
              </>
            )}
          </button>

          {selectedNumber && isBettingOpen && (
            <div className="potential-win">
              Potential Win: <span>{betAmount * getWinMultiplier()}</span>
            </div>
          )}
        </div>
      </div>

      <div className="recent-section">
        <button className="toggle-btn" onClick={() => setShowResults(!showResults)}>
          <RotateCcw size={16} />
          Recent Results
        </button>

        <AnimatePresence>
          {showResults && (
            <motion.div
              className="results-panel"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              {results.length === 0 ? (
                <p className="no-results">No results yet</p>
              ) : (
                results.map((r, i) => (
                  <div key={i} className="result-row">
                    <span className="round-num">#{r.roundNumber}</span>
                    <span className="result-num">{r.result}</span>
                    <span className={`my-win ${r.myTotalWin > 0 ? 'win' : ''}`}>
                      {r.myTotalWin > 0 ? `+${r.myTotalWin}` : '-'}
                    </span>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {myBets.length > 0 && (
        <div className="my-bets-section">
          <h3>My Recent Bets</h3>
          <div className="bets-list">
            {myBets.map((bet) => (
              <div key={bet.id} className="bet-item">
                <div className="bet-info">
                  <span className="round">#{bet.roundNumber}</span>
                  <span className="number">{bet.selectedNumber}</span>
                  <span className="amount">{bet.betAmount}</span>
                </div>
                <div className={`bet-result ${bet.isWin ? 'win' : 'loss'}`}>
                  {bet.isWin ? (
                    <><CheckCircle size={14} /> +{bet.reward}</>
                  ) : (
                    <><XCircle size={14} /> Lost</>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MatkaGame;
