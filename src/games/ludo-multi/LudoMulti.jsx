import './LudoMulti.css';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { ludoService } from '../../services/api';
import {
  PLAYER_COLORS,
  PLAYER_NAMES,
  moves,
  starIndexes,
  colorMap,
  getInitialCoinState,
  getInitialBlockState,
} from './constants';
import { Crown, Users, Clock, Coins, ArrowLeft, RefreshCw, Loader2, Shield, Sparkles, Dice6, Swords } from 'lucide-react';

const MATCHMAKING_TIMEOUT = 120000;

const LudoMulti = () => {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const { user, fetchUser } = useAuth();
  
  const [gameState, setGameState] = useState('menu');
  const [matchmaking, setMatchmaking] = useState(false);
  const [matchmakingTime, setMatchmakingTime] = useState(0);
  const [betAmount, setBetAmount] = useState(50);
  const [betOptions] = useState([10, 25, 50, 100, 200, 500]);
  
  const [gameData, setGameData] = useState(null);
  const [players, setPlayers] = useState([]);
  const [currentPlayer, setCurrentPlayer] = useState(null);
  const [diceValue, setDiceValue] = useState(0);
  const [diceRolling, setDiceRolling] = useState(false);
  const [coinState, setCoinState] = useState(getInitialCoinState());
  const [blockState, setBlockState] = useState(getInitialBlockState());
  const [myColor, setMyColor] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [showConfetti, setShowConfetti] = useState(false);
  const [winner, setWinner] = useState(null);
  const [reward, setReward] = useState(0);
  
  const matchmakingTimer = useRef(null);
  const socketRef = useRef(socket);
  
  useEffect(() => {
    socketRef.current = socket;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('match_found', (data) => {
      console.log('Match found:', data);
      setMatchmaking(false);
      setGameState('playing');
      setGameData(data.game);
      setPlayers(data.players);
      setCoinState(getInitialCoinState());
      setBlockState(getInitialBlockState());
      
      const myPlayerData = data.players.find(p => p.userId === user?.id);
      if (myPlayerData) {
        setMyColor(myPlayerData.color);
        setCurrentPlayer(data.game.currentTurn);
      }
    });
    
    socket.on('player_joined', (data) => {
      console.log('Player joined:', data);
      setPlayers(prev => [...prev, data.player]);
    });
    
    socket.on('player_left', (data) => {
      console.log('Player left:', data);
      setPlayers(prev => prev.filter(p => p.userId !== data.userId));
      if (data.gameOver) {
        handleGameEnd(data.winner, true);
      }
    });
    
    socket.on('dice_rolled', (data) => {
      console.log('Dice rolled:', data);
      setDiceValue(data.value);
      setCurrentPlayer(data.currentPlayer);
      setMessage(`${PLAYER_NAMES[data.currentPlayer]} rolled ${data.value}!`);
      setMessageType('info');
    });
    
    socket.on('coin_moved', (data) => {
      console.log('Coin moved:', data);
      setCoinState(data.coinState);
      setBlockState(data.blockState);
      setDiceValue(0);
      if (data.message) {
        setMessage(data.message);
        setMessageType(data.type || 'info');
      }
    });
    
    socket.on('turn_changed', (data) => {
      console.log('Turn changed:', data);
      setCurrentPlayer(data.currentPlayer);
      setDiceValue(0);
      setMessage(`${PLAYER_NAMES[data.currentPlayer]}'s turn!`);
    });
    
    socket.on('game_over', (data) => {
      console.log('Game over:', data);
      handleGameEnd(data.winner, false, data.reward);
    });
    
    socket.on('matchmaking_cancelled', () => {
      console.log('Matchmaking cancelled');
      setMatchmaking(false);
      setGameState('menu');
    });
    
    socket.on('error', (data) => {
      console.error('Socket error:', data);
      setError(data.message || 'An error occurred');
    });
    
    return () => {
      socket.off('match_found');
      socket.off('player_joined');
      socket.off('player_left');
      socket.off('dice_rolled');
      socket.off('coin_moved');
      socket.off('turn_changed');
      socket.off('game_over');
      socket.off('matchmaking_cancelled');
      socket.off('error');
    };
  }, [socket, user?.id]);

  useEffect(() => {
    if (matchmaking) {
      matchmakingTimer.current = setInterval(() => {
        setMatchmakingTime(prev => {
          if (prev >= MATCHMAKING_TIMEOUT / 1000) {
            cancelMatchmaking();
            setError('Matchmaking timed out. Please try again.');
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (matchmakingTimer.current) {
        clearInterval(matchmakingTimer.current);
      }
    };
  }, [matchmaking]);

  const startMatchmaking = async () => {
    if (!user || user.balance < betAmount) {
      setError('Insufficient balance!');
      return;
    }
    
    if (!socket || !isConnected) {
      setError('Not connected to server. Please refresh.');
      return;
    }
    
    try {
      const response = await ludoService.startMultiplayer({ betAmount });
      if (response.data.success) {
        setMatchmaking(true);
        setMatchmakingTime(0);
        setError('');
        socket.emit('join_matchmaking', {
          gameId: response.data.gameId,
          betAmount,
        });
      }
    } catch (err) {
      console.error('Start matchmaking error:', err);
      setError(err.response?.data?.error || 'Failed to start matchmaking');
    }
  };

  const cancelMatchmaking = () => {
    if (socket) {
      socket.emit('leave_matchmaking');
    }
    setMatchmaking(false);
    setMatchmakingTime(0);
  };

  const rollDice = useCallback(() => {
    if (!socket || diceRolling || diceValue || currentPlayer !== myColor) return;
    
    setDiceRolling(true);
    socket.emit('roll_dice', { gameId: gameData?.id });
    
    setTimeout(() => {
      setDiceRolling(false);
    }, 1000);
  }, [socket, diceRolling, diceValue, currentPlayer, myColor, gameData?.id]);

  const getValidMoves = useCallback((parent, index) => {
    if (currentPlayer !== myColor || !diceValue) return false;
    
    const colorMoves = moves[myColor];
    const coin = coinState[myColor][index];
    const position = coin.position;
    
    if (coin.isTurnAvailable && 
        ((position === 'home' && diceValue === 6) ||
         (position !== 'home' && !position.includes('won') &&
          colorMoves.indexOf(position) + diceValue < colorMoves.length))) {
      return true;
    }
    return false;
  }, [currentPlayer, myColor, diceValue, coinState]);

  const moveCoin = useCallback((parent, index) => {
    if (!socket || !getValidMoves(parent, index)) return;
    
    socket.emit('move_coin', {
      gameId: gameData?.id,
      color: parent,
      coinIndex: index,
    });
  }, [socket, getValidMoves, gameData?.id]);

  const handleGameEnd = (winnerName, abandoned = false, rewardAmount = 0) => {
    setGameState('result');
    setWinner(winnerName);
    setReward(rewardAmount);
    
    if (winnerName === myColor) {
      setShowConfetti(true);
      fetchUser();
    }
  };

  const leaveGame = () => {
    if (socket && gameData?.id) {
      socket.emit('leave_game', { gameId: gameData.id });
    }
    setGameState('menu');
    setGameData(null);
    setPlayers([]);
    setCoinState(getInitialCoinState());
    setBlockState(getInitialBlockState());
    setCurrentPlayer(null);
    setDiceValue(0);
    setWinner(null);
    setReward(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const opponent = players.find((player) => player.userId !== user?.id);
  const canRoll = currentPlayer === myColor && !diceValue && !diceRolling;
  const statusText = message || (currentPlayer === myColor ? 'Your move - roll and attack.' : `${opponent?.name || 'Opponent'} is thinking...`);

  const renderCoin = (parent, index, extraStyle = {}) => {
    const coin = coinState[parent][index];
    const isMoveable = getValidMoves(parent, index);
    
    return (
      <div
        key={`${parent}-${index}`}
        onClick={() => moveCoin(parent, index)}
        className={`coin ${isMoveable ? 'moveable' : ''}`}
        style={{
          backgroundColor: PLAYER_COLORS[parent],
          ...extraStyle,
        }}
      >
        <div className="coin-inner" />
      </div>
    );
  };

  const renderHomeBox = (parent) => {
    const colorKey = parent[0];
    const isMyTurn = currentPlayer === myColor;
    
    return (
      <div className="home-box" style={{ borderColor: PLAYER_COLORS[parent] }}>
        <div className="home-box-overlay" style={{ borderColor: PLAYER_COLORS[parent] }} />
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="home-box-inner">
            {coinState[parent][`${colorKey}${i}`].position === 'home' && renderCoin(parent, `${colorKey}${i}`)}
          </div>
        ))}
      </div>
    );
  };

  const renderStep = (parent, index, extraStyle = {}) => {
    const parentKey = `${parent[0]}${index}`;
    const isStar = starIndexes.includes(parentKey);
    const isSafe = ['11', '12', '21', '31', '41', '51', '01'].some(x => parentKey.endsWith(x));
    
    const coinsHere = blockState[parentKey] || [];
    
    return (
      <div
        key={`step-${parent}-${index}`}
        className={`step-box ${isStar ? 'star' : ''}`}
        style={{
          backgroundColor: isSafe ? PLAYER_COLORS[parent] : 'transparent',
          ...extraStyle,
        }}
      >
        <span className="step-index">{parentKey}</span>
        {coinsHere.map((coinKey, i) => (
          <div key={coinKey} style={{ position: 'absolute', left: `${5 + i * 8}px`, top: '5px' }}>
            {renderCoin(colorMap[coinKey[0]], coinKey)}
          </div>
        ))}
      </div>
    );
  };

  const renderStepsGrid = (parent, adjacentDirection, style = {}) => {
    const grid = [];
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 3; j++) {
        grid.push(renderStep(parent, `${i}${j}`, { transform: adjacentDirection === 'leftOrTop' ? 'rotate(0deg)' : 'rotate(180deg)' }));
      }
    }
    return <div className="steps-grid" style={style}>{grid}</div>;
  };

  const renderCenter = () => (
    <div className="home-center">
      <div className="center-row">
        {renderWonArea('yellow')}
      </div>
      <div className="center-row center-main">
        <div className="center-vertical">{renderWonArea('palegreen')}</div>
        <div className="dice-container" onClick={rollDice}>
          <div className={`dice ${diceRolling ? 'rolling' : ''}`}>
            {diceValue > 0 ? (
              <span style={{ color: currentPlayer ? PLAYER_COLORS[currentPlayer] : '#fff' }}>
                {diceValue}
              </span>
            ) : (
              <span>🎲</span>
            )}
          </div>
        </div>
        <div className="center-vertical">{renderWonArea('royalblue')}</div>
      </div>
      <div className="center-row">
        {renderWonArea('tomato')}
      </div>
    </div>
  );

  const renderWonArea = (parent) => {
    const wonKey = `${parent[0]}-won`;
    const coinsHere = blockState[wonKey] || [];
    
    return (
      <div className="won-area">
        {coinsHere.map((coinKey, i) => (
          <div key={coinKey} style={{ position: 'absolute', left: `${5 + i * 8}px`, top: '5px' }}>
            {renderCoin(colorMap[coinKey[0]], coinKey, { transform: 'scale(0.7)' })}
          </div>
        ))}
      </div>
    );
  };

  if (gameState === 'menu') {
    return (
      <div className="ludo-shell">
        <div className="ludo-lobby max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/dashboard/games')}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Crown className="text-amber-400" />
              Ludo multiplayer
            </h1>
            <div className="flex items-center gap-1 text-xs">
              <Coins className="text-amber-400" size={14} />
              <span className="text-emerald-400 font-bold">{(user?.balance || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="ludo-lobby-grid">
            <div className="ludo-panel p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto mb-4 rounded-[28px] bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 flex items-center justify-center shadow-[0_20px_60px_rgba(251,146,60,0.35)]">
                  <Crown size={44} className="text-white" />
                </div>
                <h2 className="text-2xl font-black text-white">Premium Ludo Arena</h2>
                <p className="text-gray-400 text-sm mt-2">Match with a real player, lock your coins, and race to finish all tokens first.</p>
              </div>

              <div className="mb-5">
                <label className="block text-sm font-medium text-gray-300 mb-3">Choose battle stake</label>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {betOptions.map(amount => (
                    <button
                      key={amount}
                      onClick={() => setBetAmount(amount)}
                      className={`ludo-chip ${betAmount === amount ? 'active' : ''}`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ludo-stats-card mb-5">
                <div><span>Your Bet</span><strong>{betAmount}</strong></div>
                <div><span>Prize Pool</span><strong className="text-emerald-400">{betAmount * 2}</strong></div>
                <div><span>Balance</span><strong className={user?.balance >= betAmount ? 'text-emerald-400' : 'text-red-400'}>{(user?.balance || 0).toLocaleString()}</strong></div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm text-center mb-4">
                  {error}
                </div>
              )}

              <button
                onClick={startMatchmaking}
                disabled={!user || user.balance < betAmount || !isConnected}
                className="ludo-primary-btn"
              >
                <Users size={20} />
                Enter Matchmaking - {betAmount}
              </button>

              <p className="text-center text-gray-500 text-xs mt-3">
                {!isConnected ? 'Connecting to live server...' : 'Real-time 1v1 wallet battle'}
              </p>
            </div>

            <div className="ludo-panel p-6">
              <div className="ludo-feature-list">
                <div className="ludo-feature"><Shield size={18} /><div><strong>Wallet-secured rounds</strong><span>Bet is locked before queueing and settled after the result.</span></div></div>
                <div className="ludo-feature"><Sparkles size={18} /><div><strong>Premium animated board</strong><span>Turn glow, highlighted tokens, live dice states, and result celebration.</span></div></div>
                <div className="ludo-feature"><Swords size={18} /><div><strong>Competitive duel</strong><span>Two-player showdown with timed matchmaking and winner reward.</span></div></div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 mt-5">
                <h3 className="text-sm font-bold text-gray-300 mb-3">How to Play</h3>
                <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">1</span>
                Select bet amount and find a match
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                Get paired with another player
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
                Roll 6 to bring token out
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">4</span>
                First to finish all 4 tokens wins!
              </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (matchmaking) {
    return (
      <div className="ludo-shell p-4 flex items-center justify-center">
        <div className="ludo-panel p-8 text-center max-w-md w-full">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center animate-pulse shadow-[0_0_60px_rgba(245,158,11,0.35)]">
            <Users size={48} className="text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">Finding Opponent...</h2>
          <p className="text-gray-400 mb-4">Please wait while we match you with another player</p>
          
          <div className="flex items-center justify-center gap-2 text-amber-400 mb-6">
            <Clock size={20} />
            <span className="font-mono text-lg">{formatTime(matchmakingTime)}</span>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-500 mb-6">
            <Coins className="text-amber-400" size={16} />
            <span>Bet: {betAmount}</span>
          </div>

          <div className="ludo-stats-card mb-6">
            <div><span>Queue Time</span><strong>{formatTime(matchmakingTime)}</strong></div>
            <div><span>Stake</span><strong>{betAmount}</strong></div>
            <div><span>Status</span><strong className="text-cyan-300">Searching</strong></div>
          </div>

          <button onClick={cancelMatchmaking} className="px-6 py-3 bg-white/10 text-gray-300 rounded-xl hover:bg-white/20 transition-all">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (gameState === 'result') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-950/30 to-slate-900 p-4 flex items-center justify-center">
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
                }}
              />
            ))}
          </div>
        )}
        
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 text-center max-w-md w-full">
          <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center text-5xl ${
            winner === myColor ? 'bg-gradient-to-br from-yellow-400 to-amber-500' : 'bg-gradient-to-br from-red-500 to-red-700'
          }`}>
            {winner === myColor ? '🏆' : '😢'}
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {winner === myColor ? 'Victory!' : 'Game Over!'}
          </h2>
          
          <p className="text-gray-400 mb-4">
            {winner === myColor ? `You defeated ${players.find(p => p.color !== myColor)?.name || 'opponent'}!` : 'Better luck next time!'}
          </p>

          {winner === myColor ? (
            <div className="p-4 bg-emerald-500/20 rounded-xl mb-4">
              <p className="text-emerald-400 text-3xl font-bold">+{reward}</p>
              <p className="text-gray-400 text-sm">You won!</p>
            </div>
          ) : (
            <p className="text-gray-400 mb-4">You lost {betAmount}</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setGameState('menu');
                setWinner(null);
                setReward(0);
                setShowConfetti(false);
              }}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Play Again
            </button>
            <button
              onClick={leaveGame}
              className="flex-1 py-3 rounded-xl bg-white/10 text-white font-bold"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ludo-shell p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={leaveGame}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <Crown className="text-amber-400" size={20} />
            Ludo Battle
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-amber-400">💰</span>
            <span className="text-emerald-400 font-bold text-sm">{(user?.balance || 0).toLocaleString()}</span>
          </div>
        </div>

        <div className="ludo-battle-layout">
          <div className="ludo-side-column">
            {players.map(player => (
              <div
                key={player.userId}
                className={`ludo-player-card ${currentPlayer === player.color ? 'active' : ''} ${player.userId === user?.id ? 'self' : ''}`}
                style={{ '--player-accent': PLAYER_COLORS[player.color] }}
              >
                <div className="ludo-player-top">
                  <div className="ludo-player-badge" style={{ backgroundColor: PLAYER_COLORS[player.color] }} />
                  <div>
                    <strong>{player.name} {player.userId === user?.id ? '(You)' : ''}</strong>
                    <span>{PLAYER_NAMES[player.color]} side</span>
                  </div>
                </div>
                <div className="ludo-player-meta">
                  <span>{currentPlayer === player.color ? 'Current Turn' : 'Waiting'}</span>
                  <strong>{player.userId === user?.id ? 'Live' : 'Opponent'}</strong>
                </div>
              </div>
            ))}

            <div className={`p-4 rounded-xl text-center font-medium ${
          messageType === 'success' ? 'bg-emerald-500/20 text-emerald-400'
          : messageType === 'error' ? 'bg-red-500/20 text-red-400'
          : messageType === 'warning' ? 'bg-yellow-500/20 text-yellow-400'
          : 'bg-blue-500/20 text-blue-400'
        }`}>
              {statusText}
            </div>

            <div className="ludo-panel p-5">
              <div className="card-title text-white mb-3 flex items-center gap-2"><Dice6 size={16} /> Match Controls</div>
              <button
                onClick={rollDice}
                disabled={!canRoll}
                className={`ludo-roll-btn ${canRoll ? 'active' : ''}`}
              >
                {diceRolling ? (
                  <span className="flex items-center gap-2"><Loader2 className="animate-spin" size={20} /> Rolling...</span>
                ) : (
                  <span className="flex items-center gap-2"><Dice6 size={20} /> {diceValue ? `Dice ${diceValue}` : 'Roll Dice'}</span>
                )}
              </button>
              <div className="ludo-stats-card mt-4">
                <div><span>Turn</span><strong>{currentPlayer ? PLAYER_NAMES[currentPlayer] : '--'}</strong></div>
                <div><span>Stake</span><strong>{betAmount}</strong></div>
                <div><span>Win</span><strong className="text-emerald-400">{betAmount * 2}</strong></div>
              </div>
            </div>
          </div>

          <div className="ludo-main-column">
            <div className="ludo-board-card">
              <div className="ludo-board-top">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.35em] text-cyan-300/70">Live Board</div>
                  <h2 className="text-white text-xl font-black">Royal Ludo Duel</h2>
                </div>
                <div className="ludo-dice-badge">{diceValue ? `${diceValue}` : '🎲'}</div>
              </div>

              <div className="board-wrapper">
            <div className="board-row">
              {renderHomeBox('palegreen')}
              <div className="steps-vertical">
                {renderStepsGrid('palegreen', 'rightOrBottom', { transform: 'rotate(90deg)' })}
              </div>
              {renderHomeBox('yellow')}
            </div>
            <div className="board-row">
              <div className="steps-vertical">
                {renderStepsGrid('yellow', 'leftOrTop')}
              </div>
              {renderCenter()}
              <div className="steps-vertical">
                {renderStepsGrid('royalblue', 'rightOrBottom')}
              </div>
            </div>
            <div className="board-row">
              {renderHomeBox('tomato')}
              <div className="steps-vertical">
                {renderStepsGrid('royalblue', 'leftOrBottom', { transform: 'rotate(-90deg)' })}
              </div>
              {renderHomeBox('royalblue')}
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LudoMulti;
