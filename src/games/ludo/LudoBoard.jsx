import { useRef, useEffect, useCallback } from 'react';
import { LudoGameEngine, TRACK_PATH, HOME_PATH, BASE_POSITIONS, CELL_SIZE } from './gameEngine';

const LudoBoard = ({ engineRef, onTokenClick, highlightedTokens, currentTurn }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  const engine = engineRef.current;

  const getTokenScreenPos = (player, tokenIndex, token) => {
    const baseX = 20;
    const baseY = 20;
    
    if (token.isFinished) return null;
    
    if (token.position === -1) {
      const basePos = BASE_POSITIONS[player][tokenIndex];
      return {
        x: baseX + basePos.col * CELL_SIZE,
        y: baseY + basePos.row * CELL_SIZE
      };
    }
    
    if (token.position >= 52) {
      const homeIndex = token.position - 52;
      const homePos = HOME_PATH[player][homeIndex];
      if (!homePos) return null;
      return {
        x: baseX + homePos.col * CELL_SIZE,
        y: baseY + homePos.row * CELL_SIZE
      };
    }
    
    const trackPos = TRACK_PATH[token.position];
    if (!trackPos) return null;
    return {
      x: baseX + trackPos.col * CELL_SIZE,
      y: baseY + trackPos.row * CELL_SIZE
    };
  };

  const drawBoard = useCallback((ctx) => {
    const width = CELL_SIZE * 15;
    const height = CELL_SIZE * 15;
    
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, width, height);
    
    ctx.fillStyle = '#BBDEFB';
    ctx.fillRect(0, 0, CELL_SIZE * 6, CELL_SIZE * 6);
    
    ctx.fillStyle = '#FFCDD2';
    ctx.fillRect(CELL_SIZE * 9, 0, CELL_SIZE * 6, CELL_SIZE * 6);
    
    ctx.fillStyle = '#BBDEFB';
    ctx.fillRect(0, CELL_SIZE * 9, CELL_SIZE * 6, CELL_SIZE * 6);
    
    ctx.fillStyle = '#FFCDD2';
    ctx.fillRect(CELL_SIZE * 9, CELL_SIZE * 9, CELL_SIZE * 6, CELL_SIZE * 6);
    
    ctx.fillStyle = '#2196F3';
    ctx.beginPath();
    ctx.arc(CELL_SIZE * 3, CELL_SIZE * 3, CELL_SIZE * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(CELL_SIZE * 3, CELL_SIZE * 3, CELL_SIZE * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(CELL_SIZE * 12, CELL_SIZE * 12, CELL_SIZE * 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(CELL_SIZE * 12, CELL_SIZE * 12, CELL_SIZE * 0.8, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#4CAF50';
    [0, 8, 13, 21, 26, 34, 39, 47].forEach(idx => {
      const pos = TRACK_PATH[idx];
      ctx.beginPath();
      ctx.arc(
        20 + pos.col * CELL_SIZE,
        20 + pos.row * CELL_SIZE,
        CELL_SIZE * 0.4,
        0, Math.PI * 2
      );
      ctx.fill();
    });
    
    ctx.fillStyle = '#E3F2FD';
    TRACK_PATH.forEach(pos => {
      ctx.fillRect(
        20 + pos.col * CELL_SIZE - CELL_SIZE * 0.4,
        20 + pos.row * CELL_SIZE - CELL_SIZE * 0.4,
        CELL_SIZE * 0.8,
        CELL_SIZE * 0.8
      );
    });
    
    ctx.fillStyle = '#2196F3';
    HOME_PATH.USER.forEach(pos => {
      ctx.fillRect(
        20 + pos.col * CELL_SIZE - CELL_SIZE * 0.4,
        20 + pos.row * CELL_SIZE - CELL_SIZE * 0.4,
        CELL_SIZE * 0.8,
        CELL_SIZE * 0.8
      );
    });
    
    ctx.fillStyle = '#F44336';
    HOME_PATH.AI.forEach(pos => {
      ctx.fillRect(
        20 + pos.col * CELL_SIZE - CELL_SIZE * 0.4,
        20 + pos.row * CELL_SIZE - CELL_SIZE * 0.4,
        CELL_SIZE * 0.8,
        CELL_SIZE * 0.8
      );
    });
    
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(20 + 7 * CELL_SIZE, 20 + 7 * CELL_SIZE, CELL_SIZE * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#F44336';
    ctx.beginPath();
    ctx.arc(20 + 7 * CELL_SIZE, 20 + 7 * CELL_SIZE, CELL_SIZE * 0.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFC107';
    ctx.beginPath();
    ctx.arc(20 + 7 * CELL_SIZE, 20 + 7 * CELL_SIZE, CELL_SIZE * 0.4, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawTokens = useCallback((ctx) => {
    const tokenRadius = CELL_SIZE * 0.35;
    
    ['USER', 'AI'].forEach(player => {
      const tokens = engine?.tokens[player] || [];
      const color = player === 'USER' ? '#2196F3' : '#F44336';
      const colorDark = player === 'USER' ? '#1565C0' : '#C62828';
      
      tokens.forEach((token, idx) => {
        const pos = getTokenScreenPos(player, idx, token);
        if (!pos) return;
        
        const isHighlighted = player === 'USER' && highlightedTokens?.includes(idx);
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, tokenRadius + (isHighlighted ? 4 : 0), 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? '#FFC107' : colorDark;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, tokenRadius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, tokenRadius * 0.4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        
        if (isHighlighted) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, tokenRadius + 6, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    });
  }, [engine, highlightedTokens]);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBoard(ctx);
    drawTokens(ctx);
  }, [drawBoard, drawTokens]);

  useEffect(() => {
    render();
  }, [render]);

  const handleClick = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || currentTurn !== 'USER') return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const tokenRadius = CELL_SIZE * 0.35;
    const tokens = engine?.tokens?.USER || [];
    
    for (let i = 0; i < tokens.length; i++) {
      const pos = getTokenScreenPos('USER', i, tokens[i]);
      if (!pos) continue;
      
      const dist = Math.sqrt(Math.pow(x - pos.x, 2) + Math.pow(y - pos.y, 2));
      if (dist <= tokenRadius + 10) {
        if (highlightedTokens?.includes(i)) {
          onTokenClick?.(i);
          return;
        }
      }
    }
  };

  return (
    <canvas
      ref={canvasRef}
      width={CELL_SIZE * 15}
      height={CELL_SIZE * 15}
      onClick={handleClick}
      style={{
        width: '100%',
        maxWidth: CELL_SIZE * 15,
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        cursor: currentTurn === 'USER' && highlightedTokens?.length > 0 ? 'pointer' : 'default'
      }}
    />
  );
};

export default LudoBoard;
