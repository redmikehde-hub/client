import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { ludoService } from '../../services/api';
import { LudoGameEngine } from './gameEngine';
import LudoBoard from './LudoBoard';
import './Ludo.css';

const LudoGame = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const engineRef = useRef(new LudoGameEngine());
  
  const [gameState, setGameState] = useState('setup');
  const [betAmount, setBetAmount] = useState(50);
  const [gameId, setGameId] = useState(null);
  const [diceValue, setDiceValue] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [showConfetti, setShowConfetti] = useState(false);
  const [winner, setWinner] = useState(null);
  const [reward, setReward] = useState(0);
  const [isUserTurn, setIsUserTurn] = useState(true);
  const [validMoves, setValidMoves] = useState([]);
  const [boardKey, setBoardKey] = useState(0);

  const betOptions = [10, 25, 50, 100, 200, 500];

  const rerender = useCallback(() => {
    setBoardKey(k => k + 1);
  }, []);

  const startGame = async () => {
    if (!user || user.balance < betAmount) {
      setError('Insufficient balance!');
      return;
    }
    
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      const response = await ludoService.startGame({ betAmount, difficulty: 'EASY' });
      if (response.data.success) {
        setGameId(response.data.game.id);
        engineRef.current.reset();
        setGameState('playing');
        setIsUserTurn(true);
        setDiceValue(null);
        setValidMoves([]);
        setMessage('Roll the dice!');
        setMessageType('info');
        rerender();
        fetchUser();
      }
    } catch (err) {
      console.error('Start game error:', err);
      setError(err.response?.data?.error || 'Failed to start game');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const endTurn = useCallback((nextPlayer) => {
    if (nextPlayer === 'AI') {
      setIsUserTurn(false);
      setDiceValue(null);
      setValidMoves([]);
    } else {
      setIsUserTurn(true);
      setDiceValue(null);
      setValidMoves([]);
      setMessage('Your turn! Roll the dice!');
      setMessageType('info');
    }
  }, []);

  const rollDice = useCallback(() => {
    if (isRolling || diceValue || !isUserTurn || gameState !== 'playing') return;
    
    setIsRolling(true);
    
    const result = engineRef.current.rollDice();
    if (!result) {
      setIsRolling(false);
      return;
    }
    
    setDiceValue(result);
    const moves = engineRef.current.getValidMoves();
    setValidMoves(moves.map(m => m.tokenIndex));
    rerender();
    
    if (moves.length === 0) {
      setIsRolling(false);
      if (result === 6) {
        setMessage('Rolled 6 but no valid moves! Roll again.');
        setMessageType('info');
      } else {
        setMessage("No valid moves. Switching to AI...");
        setMessageType('warning');
        setTimeout(() => endTurn('AI'), 1000);
      }
    } else {
      setMessage(`Rolled ${result}! Select a token.`);
      setMessageType('info');
      setIsRolling(false);
    }
  }, [isRolling, diceValue, isUserTurn, gameState, rerender, endTurn]);

  const handleTokenClick = useCallback((tokenIndex) => {
    if (!isUserTurn || !validMoves.includes(tokenIndex)) return;
    
    setLoading(true);
    setMessage('Moving...');
    
    const moveResult = engineRef.current.makeMove(tokenIndex);
    rerender();
    
    if (moveResult.gameOver) {
      setLoading(false);
      handleGameEnd(moveResult.winner);
    } else if (moveResult.killed) {
      setMessage('You captured AI token!');
      setMessageType('success');
      
      setTimeout(() => {
        setLoading(false);
        if (moveResult.nextTurn === 'AI') {
          endTurn('AI');
        } else {
          setMessage('Roll again!');
          setMessageType('info');
        }
      }, 800);
    } else {
      setLoading(false);
      endTurn(moveResult.nextTurn);
    }
  }, [isUserTurn, validMoves, rerender, endTurn]);

  const handleGameEnd = useCallback((winnerName) => {
    setGameState('result');
    setWinner(winnerName);
    
    const rewardAmount = winnerName === 'USER' ? betAmount * 2 : 0;
    setReward(rewardAmount);
    
    if (winnerName === 'USER') {
      setShowConfetti(true);
      fetchUser();
    }
  }, [betAmount, fetchUser]);

  const handleForfeit = async () => {
    if (!window.confirm('Forfeit? You will lose your bet.')) return;
    
    try {
      await ludoService.forfeit(gameId);
      handleGameEnd('AI');
    } catch {
      setError('Failed to forfeit');
    }
  };

  const handlePlayAgain = () => {
    setGameState('setup');
    setGameId(null);
    setDiceValue(null);
    setValidMoves([]);
    setWinner(null);
    setReward(0);
    setShowConfetti(false);
    setError('');
    setMessage('');
    setIsUserTurn(true);
  };

  // AI Turn Effect
  useEffect(() => {
    if (gameState !== 'playing' || isUserTurn) return;
    
    const runAITurn = async () => {
      // Roll dice
      const diceResult = engineRef.current.rollDice();
      if (!diceResult) {
        endTurn('USER');
        return;
      }
      
      setDiceValue(diceResult);
      setMessage("AI rolled...");
      rerender();
      
      await new Promise(r => setTimeout(r, 800));
      
      const moves = engineRef.current.getValidMoves();
      
      if (moves.length === 0) {
        setMessage("AI has no valid moves.");
        setMessageType('warning');
        await new Promise(r => setTimeout(r, 800));
        endTurn('USER');
        return;
      }
      
      // Pick random move
      const chosenMove = moves[Math.floor(Math.random() * moves.length)];
      setMessage("AI is moving...");
      rerender();
      
      await new Promise(r => setTimeout(r, 600));
      
      const moveResult = engineRef.current.makeMove(chosenMove.tokenIndex);
      rerender();
      
      if (moveResult.gameOver) {
        handleGameEnd(moveResult.winner);
        return;
      }
      
      if (moveResult.killed) {
        setMessage("AI captured your token!");
        setMessageType('error');
        await new Promise(r => setTimeout(r, 800));
      }
      
      if (moveResult.nextTurn === 'AI') {
        // AI gets another turn (rolled 6)
        await new Promise(r => setTimeout(r, 500));
        runAITurn();
      } else {
        endTurn('USER');
      }
    };
    
    const timeoutId = setTimeout(runAITurn, 500);
    return () => clearTimeout(timeoutId);
  }, [gameState, isUserTurn, rerender, endTurn, handleGameEnd]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4">
      {showConfetti && (
        <div className="confetti-container">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="confetti-piece"
              style={{
                left: `${Math.random() * 100}%`,
                backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 6)],
                animationDelay: `${Math.random() * 2}s`,
                borderRadius: Math.random() > 0.5 ? '50%' : '0',
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/dashboard/games')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span>←</span>
            <span className="hidden sm:inline">Back</span>
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-2xl">🎲</span>
            Ludo Master
          </h1>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-amber-400">💰</span>
            <span className="text-emerald-400 font-bold">{(user?.balance || 0).toLocaleString()}</span>
          </div>
        </div>

        {gameState === 'setup' && (
          <div className="space-y-4">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-white/10">
              <div className="text-center mb-5">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-red-600 flex items-center justify-center shadow-xl text-3xl">
                  👑
                </div>
                <h2 className="text-xl font-bold text-white">Ludo Battle</h2>
                <p className="text-gray-400 text-sm">You (Blue) vs AI (Red)</p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Bet</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {betOptions.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={`py-2.5 rounded-xl font-bold text-sm transition-all ${
                        betAmount === amount
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <input
                  type="range"
                  min="10"
                  max="1000"
                  step="10"
                  value={betAmount}
                  onChange={e => setBetAmount(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10</span>
                  <span className="text-white font-bold">{betAmount}</span>
                  <span>1000</span>
                </div>
              </div>

              <div className="p-3 bg-white/5 rounded-xl space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Your Bet</span>
                  <span className="text-white font-bold">{betAmount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Win Reward</span>
                  <span className="text-emerald-400 font-bold">{betAmount * 2}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Balance</span>
                  <span className={`font-bold ${user?.balance >= betAmount ? 'text-emerald-400' : 'text-red-400'}`}>
                    {(user?.balance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={startGame}
                disabled={loading || !user || user.balance < betAmount}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-red-500 text-white font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <span>🎮</span>
                    Play - {betAmount}
                  </>
                )}
              </button>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10">
              <h3 className="text-sm font-bold text-gray-300 mb-3">How to Play</h3>
              <ul className="space-y-2 text-xs text-gray-400">
                <li>🎲 Roll the dice</li>
                <li>6️⃣ Get 6 to bring token out</li>
                <li>👆 Click highlighted token to move</li>
                <li>🏆 First to finish all 4 tokens wins!</li>
              </ul>
            </div>
          </div>
        )}

        {gameState === 'playing' && (
          <div className="space-y-4">
            {/* Turn Indicator */}
            <div className="flex items-center justify-between">
              <div className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ${
                isUserTurn 
                  ? 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-400 border border-blue-500/30' 
                  : 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-400 border border-red-500/30'
              }`}>
                {isUserTurn ? (
                  <>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    Your Turn
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                    AI Turn
                  </>
                )}
              </div>
              <button onClick={handleForfeit} className="text-xs px-3 py-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20 transition-all">
                Forfeit
              </button>
            </div>

            {/* Game Board */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl rounded-3xl p-4 border border-white/10 shadow-2xl">
              <LudoBoard
                key={boardKey}
                engineRef={engineRef}
                onTokenClick={handleTokenClick}
                highlightedTokens={validMoves}
                currentTurn={isUserTurn ? 'USER' : 'AI'}
              />
            </div>

            {/* Dice Section */}
            <div className="flex items-center justify-center gap-8">
              {/* User Score */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{engineRef.current.tokens.USER.filter(t => t.isFinished).length}</span>
                </div>
                <span className="text-xs text-gray-400">Your Tokens</span>
              </div>

              {/* Dice */}
              <div className="flex flex-col items-center gap-2">
                <motion.div 
                  animate={isRolling ? { rotate: 360 } : {}}
                  transition={isRolling ? { duration: 0.5, repeat: Infinity, ease: "linear" } : {}}
                  className={`w-20 h-20 rounded-2xl bg-gradient-to-br from-white to-gray-100 shadow-xl flex items-center justify-center text-4xl font-bold ${
                    diceValue ? 'text-gray-800' : 'text-gray-400'
                  } border-4 ${isUserTurn && !diceValue ? 'border-green-400' : 'border-gray-200'}`}
                >
                  {diceValue || '?'}
                </motion.div>
                <button
                  onClick={rollDice}
                  disabled={isRolling || diceValue || !isUserTurn || loading}
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    isUserTurn && !diceValue
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:scale-105 active:scale-95'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isRolling ? 'Rolling...' : 'Roll Dice'}
                </button>
              </div>

              {/* AI Score */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{engineRef.current.tokens.AI.filter(t => t.isFinished).length}</span>
                </div>
                <span className="text-xs text-gray-400">AI Tokens</span>
              </div>
            </div>

            {/* Message */}
            <div className={`p-4 rounded-xl text-center font-medium ${
              messageType === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : messageType === 'warning' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : messageType === 'error' ? 'bg-red-500/20 text-red-400 border border-red-500/30'
              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {message}
            </div>

            {/* Progress Bar */}
            <div className="flex justify-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        engineRef.current.tokens.USER[i]?.isFinished
                          ? 'bg-blue-500 text-white'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-gray-400">You</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {[0,1,2,3].map(i => (
                    <div 
                      key={i}
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        engineRef.current.tokens.AI[i]?.isFinished
                          ? 'bg-red-500 text-white'
                          : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-gray-400">AI</span>
              </div>
            </div>
          </div>
        )}

        {gameState === 'result' && (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 text-center">
            <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl ${
              winner === 'USER' ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-red-500 to-red-700'
            }`}>
              {winner === 'USER' ? '🏆' : '😢'}
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              {winner === 'USER' ? 'Victory!' : 'Game Over!'}
            </h2>

            {winner === 'USER' ? (
              <div className="p-4 bg-emerald-500/20 rounded-xl mb-4">
                <p className="text-emerald-400 text-2xl font-bold">+{reward}</p>
                <p className="text-gray-400 text-sm">You won!</p>
              </div>
            ) : (
              <p className="text-gray-400 mb-4">You lost {betAmount}</p>
            )}

            <div className="flex gap-3">
              <button
                onClick={handlePlayAgain}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold"
              >
                🔄 Play Again
              </button>
              <button
                onClick={() => navigate('/dashboard/games')}
                className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LudoGame;
