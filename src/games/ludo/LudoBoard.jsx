import { useState, useEffect, useCallback } from 'react';
import { LudoGameEngine, TRACK_PATH, HOME_PATH, BASE_POSITIONS } from './gameEngine';

const CELL_SIZE = 40;

const LudoBoard = ({ engineRef, onTokenClick, highlightedTokens, currentTurn }) => {
  const engine = engineRef?.current;
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => forceUpdate(n => n + 1), 100);
    return () => clearInterval(interval);
  }, []);

  const getTokenPosition = (player, tokenIndex, token) => {
    if (token.isFinished) return null;
    
    const baseX = 20;
    const baseY = 20;
    
    if (token.position === -1) {
      const basePos = BASE_POSITIONS[player][tokenIndex];
      return {
        x: baseX + basePos.col * CELL_SIZE + CELL_SIZE / 2,
        y: baseY + basePos.row * CELL_SIZE + CELL_SIZE / 2
      };
    }
    
    if (token.position >= 52) {
      const homeIndex = token.position - 52;
      const homePos = HOME_PATH[player][homeIndex];
      if (!homePos) return null;
      return {
        x: baseX + homePos.col * CELL_SIZE + CELL_SIZE / 2,
        y: baseY + homePos.row * CELL_SIZE + CELL_SIZE / 2
      };
    }
    
    const trackPos = TRACK_PATH[token.position];
    if (!trackPos) return null;
    return {
      x: baseX + trackPos.col * CELL_SIZE + CELL_SIZE / 2,
      y: baseY + trackPos.row * CELL_SIZE + CELL_SIZE / 2
    };
  };

  const isTokenClickable = (player, tokenIndex) => {
    if (player !== 'USER' || !highlightedTokens?.includes(tokenIndex)) return false;
    return true;
  };

  const handleTokenClick = (player, tokenIndex, token) => {
    if (token.isFinished) return;
    if (player !== 'USER' || !highlightedTokens?.includes(tokenIndex)) return;
    onTokenClick?.(tokenIndex);
  };

  const renderCell = (row, col) => {
    const isStartCell = (row === 6 && col === 1) || (row === 8 && col === 13);
    const isSafeZone = [0, 8, 13, 21, 26, 34, 39, 47].some(idx => {
      const pos = TRACK_PATH[idx];
      return pos && pos.row === row && pos.col === col;
    });
    const isHomePath = HOME_PATH.USER.some(p => p.row === row && p.col === col) ||
                        HOME_PATH.AI.some(p => p.row === row && p.col === col);
    const isCenter = row === 7 && col === 7;
    
    let cellClass = 'absolute w-10 h-10 flex items-center justify-center';
    
    if (row === 0 && col >= 0 && col <= 5) return <div key={`${row}-${col}`} className={`${cellClass} bg-blue-200`} />;
    if (row === 0 && col >= 9 && col <= 14) return <div key={`${row}-${col}`} className={`${cellClass} bg-red-200`} />;
    if (row === 14 && col >= 0 && col <= 5) return <div key={`${row}-${col}`} className={`${cellClass} bg-blue-200`} />;
    if (row === 14 && col >= 9 && col <= 14) return <div key={`${row}-${col}`} className={`${cellClass} bg-red-200`} />;
    
    if (row >= 0 && row <= 5 && col >= 0 && col <= 5) return <div key={`${row}-${col}`} className={`${cellClass} bg-blue-100 border border-blue-200`} />;
    if (row >= 0 && row <= 5 && col >= 9 && col <= 14) return <div key={`${row}-${col}`} className={`${cellClass} bg-red-100 border border-red-200`} />;
    if (row >= 9 && row <= 14 && col >= 0 && col <= 5) return <div key={`${row}-${col}`} className={`${cellClass} bg-blue-100 border border-blue-200`} />;
    if (row >= 9 && row <= 14 && col >= 9 && col <= 14) return <div key={`${row}-${col}`} className={`${cellClass} bg-red-100 border border-red-200`} />;
    
    if (isCenter) {
      return (
        <div key={`${row}-${col}`} className={`${cellClass}`}>
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <div className="w-4 h-4 rounded-full bg-yellow-400" />
            </div>
          </div>
        </div>
      );
    }
    
    if (row === 6 && col === 1) {
      return (
        <div key={`${row}-${col}`} className={`${cellClass}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
      );
    }
    
    if (row === 8 && col === 13) {
      return (
        <div key={`${row}-${col}`} className={`${cellClass}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-lg flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-white" />
          </div>
        </div>
      );
    }
    
    if (isSafeZone) {
      return (
        <div key={`${row}-${col}`} className={`${cellClass} bg-green-100 border border-green-300`}>
          <div className="w-4 h-4 rounded-full bg-green-500" />
        </div>
      );
    }
    
    if (isHomePath) {
      const isUserHome = HOME_PATH.USER.some(p => p.row === row && p.col === col);
      return (
        <div key={`${row}-${col}`} className={`${cellClass} ${isUserHome ? 'bg-blue-200' : 'bg-red-200'} border ${isUserHome ? 'border-blue-400' : 'border-red-400'}`} />
      );
    }
    
    return (
      <div key={`${row}-${col}`} className={`${cellClass} bg-gray-50 border border-gray-200`} />
    );
  };

  const renderBoard = () => {
    const cells = [];
    for (let row = 0; row < 15; row++) {
      for (let col = 0; col < 15; col++) {
        cells.push(renderCell(row, col));
      }
    }
    return cells;
  };

  const renderTokens = () => {
    if (!engine?.tokens) return null;
    
    const tokenElements = [];
    
    ['USER', 'AI'].forEach(player => {
      engine.tokens[player].forEach((token, idx) => {
        const pos = getTokenPosition(player, idx, token);
        if (!pos) return;
        
        const isHighlighted = player === 'USER' && highlightedTokens?.includes(idx);
        const isClickable = isTokenClickable(player, idx);
        
        tokenElements.push(
          <div
            key={`token-${player}-${idx}`}
            onClick={() => handleTokenClick(player, idx, token)}
            className={`
              absolute w-8 h-8 -ml-4 -mt-4 rounded-full cursor-pointer
              transition-all duration-200 z-20
              ${player === 'USER' 
                ? 'bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50' 
                : 'bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/50'
              }
              ${isHighlighted 
                ? 'ring-4 ring-yellow-400 animate-pulse shadow-yellow-400/70' 
                : ''
              }
              ${isClickable ? 'hover:scale-110 cursor-pointer' : ''}
              flex items-center justify-center
            `}
            style={{ left: pos.x, top: pos.y }}
          >
            <div className={`w-4 h-4 rounded-full ${player === 'USER' ? 'bg-blue-200' : 'bg-red-200'}`} />
          </div>
        );
      });
    });
    
    return tokenElements;
  };

  return (
    <div className="relative w-full max-w-[600px] mx-auto">
      <div 
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-slate-700"
        style={{ 
          width: CELL_SIZE * 15 + 40,
          height: CELL_SIZE * 15 + 40,
        }}
      >
        {/* Board Background */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200"
          style={{
            margin: 20,
            borderRadius: 16,
          }}
        />
        
        {/* Grid Cells */}
        <div 
          className="absolute grid gap-0"
          style={{
            gridTemplateColumns: `repeat(15, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(15, ${CELL_SIZE}px)`,
            top: 20,
            left: 20,
          }}
        >
          {renderBoard()}
        </div>
        
        {/* Tokens */}
        <div 
          className="absolute"
          style={{
            width: CELL_SIZE * 15,
            height: CELL_SIZE * 15,
            top: 20,
            left: 20,
          }}
        >
          {renderTokens()}
        </div>
        
        {/* Player Labels */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded">
          YOU (Blue)
        </div>
        <div className="absolute bottom-2 right-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
          AI (Red)
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500" />
          <span className="text-gray-400">Safe Zone</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-blue-600" />
          <span className="text-gray-400">Your Tokens</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600" />
          <span className="text-gray-400">AI Tokens</span>
        </div>
      </div>
    </div>
  );
};

export default LudoBoard;
