const BOARD_SIZE = 15;
const CELL_SIZE = 40;
const HOME_CENTER = 7;
const TRACK_LENGTH = 52;

const PLAYERS = {
  USER: {
    id: 'USER',
    color: '#2196F3',
    colorDark: '#1565C0',
    homeStart: { row: 6, col: 1 },
    homeQuadrant: { startRow: 0, startCol: 0, endRow: 5, endCol: 5 }
  },
  AI: {
    id: 'AI',
    color: '#F44336',
    colorDark: '#C62828',
    homeStart: { row: 8, col: 13 },
    homeQuadrant: { startRow: 9, startCol: 9, endRow: 14, endCol: 14 }
  }
};

const TRACK_PATH = [
  { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 },
  { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
  { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 },
  { row: 5, col: 8 }, { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
  { row: 7, col: 13 }, { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
  { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 14, col: 8 },
  { row: 14, col: 7 }, { row: 14, col: 6 }, { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 },
  { row: 9, col: 6 }, { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 },
  { row: 7, col: 1 }, { row: 6, col: 0 }
];

const HOME_PATH = {
  USER: [
    { row: 6, col: 7 }, { row: 6, col: 8 }, { row: 7, col: 8 }, { row: 8, col: 8 }
  ],
  AI: [
    { row: 8, col: 7 }, { row: 8, col: 6 }, { row: 7, col: 6 }, { row: 6, col: 6 }
  ]
};

const BASE_POSITIONS = {
  USER: [
    { row: 1.5, col: 1.5 }, { row: 1.5, col: 4.5 }, { row: 4.5, col: 1.5 }, { row: 4.5, col: 4.5 }
  ],
  AI: [
    { row: 10.5, col: 10.5 }, { row: 10.5, col: 13.5 }, { row: 13.5, col: 10.5 }, { row: 13.5, col: 13.5 }
  ]
};

const START_POSITION = {
  USER: 0,
  AI: 26
};

const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

const HOME_ENTRY = {
  USER: 51,
  AI: 25
};

export class LudoGameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.tokens = {
      USER: [
        { id: 'USER_0', position: -1, isHome: true, isFinished: false },
        { id: 'USER_1', position: -1, isHome: true, isFinished: false },
        { id: 'USER_2', position: -1, isHome: true, isFinished: false },
        { id: 'USER_3', position: -1, isHome: true, isFinished: false }
      ],
      AI: [
        { id: 'AI_0', position: -1, isHome: true, isFinished: false },
        { id: 'AI_1', position: -1, isHome: true, isFinished: false },
        { id: 'AI_2', position: -1, isHome: true, isFinished: false },
        { id: 'AI_3', position: -1, isHome: true, isFinished: false }
      ]
    };
    this.currentTurn = 'USER';
    this.diceValue = 0;
    this.hasRolled = false;
    this.gameOver = false;
    this.winner = null;
    this.lastKill = null;
  }

  rollDice() {
    if (this.hasRolled || this.gameOver) return null;
    this.diceValue = Math.floor(Math.random() * 6) + 1;
    this.hasRolled = true;
    return this.diceValue;
  }

  getValidMoves() {
    if (!this.hasRolled || this.diceValue === 0) return [];
    
    const validMoves = [];
    const tokens = this.tokens[this.currentTurn];
    
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];
      if (token.isFinished) continue;
      
      if (token.position === -1) {
        if (this.diceValue === 6) {
          validMoves.push({ tokenIndex: i, moveType: 'enter', steps: 0 });
        }
      } else {
        const newPosition = token.position + this.diceValue;
        if (newPosition <= 56) {
          validMoves.push({ tokenIndex: i, moveType: 'move', steps: this.diceValue });
        }
      }
    }
    
    return validMoves;
  }

  makeMove(tokenIndex) {
    if (this.gameOver) return { success: false, error: 'Game over' };
    
    const validMoves = this.getValidMoves();
    const move = validMoves.find(m => m.tokenIndex === tokenIndex);
    
    if (!move) {
      return { success: false, error: 'Invalid move' };
    }
    
    const token = this.tokens[this.currentTurn][tokenIndex];
    this.lastKill = null;
    
    if (move.moveType === 'enter') {
      token.position = START_POSITION[this.currentTurn];
      token.isHome = false;
    } else {
      const oldPos = token.position;
      const newPos = oldPos + this.diceValue;
      
      if (newPos > 51) {
        const homePathIndex = newPos - 52;
        if (homePathIndex < HOME_PATH[this.currentTurn].length) {
          token.position = 52 + homePathIndex;
          if (homePathIndex === HOME_PATH[this.currentTurn].length - 1) {
            token.isFinished = true;
            token.isHome = true;
          }
        }
      } else {
        token.position = newPos;
        
        const kill = this.checkAndHandleKill(token);
        if (kill) {
          this.lastKill = kill;
        }
      }
    }
    
    if (this.checkWin()) {
      this.gameOver = true;
      this.winner = this.currentTurn;
      return { success: true, gameOver: true, winner: this.winner };
    }
    
    const nextTurn = this.diceValue === 6 ? this.currentTurn : (this.currentTurn === 'USER' ? 'AI' : 'USER');
    
    if (nextTurn !== this.currentTurn) {
      this.currentTurn = nextTurn;
      this.hasRolled = false;
      this.diceValue = 0;
    } else {
      this.hasRolled = false;
    }
    
    return { success: true, gameOver: false, nextTurn, killed: this.lastKill };
  }

  checkAndHandleKill(token) {
    if (token.position > 51) return null;
    
    const opponent = this.currentTurn === 'USER' ? 'AI' : 'USER';
    const opponentTokens = this.tokens[opponent];
    
    if (SAFE_POSITIONS.includes(token.position)) return null;
    
    for (let i = 0; i < opponentTokens.length; i++) {
      const oppToken = opponentTokens[i];
      if (!oppToken.isFinished && !oppToken.isHome && oppToken.position === token.position) {
        oppToken.position = -1;
        oppToken.isHome = true;
        return { killedPlayer: opponent, tokenIndex: i };
      }
    }
    
    return null;
  }

  checkWin() {
    return this.tokens[this.currentTurn].every(t => t.isFinished);
  }

  aiMakeMove() {
    if (this.currentTurn !== 'AI' || this.gameOver) return null;
    
    const diceResult = this.rollDice();
    if (!diceResult) return null;
    
    const validMoves = this.getValidMoves();
    
    if (validMoves.length === 0) {
      const nextTurn = 'USER';
      this.currentTurn = nextTurn;
      this.hasRolled = false;
      this.diceValue = 0;
      return { diceValue: diceResult, moved: false, noMoves: true, nextTurn };
    }
    
    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    const result = this.makeMove(move.tokenIndex);
    
    return { diceValue: diceResult, move, result };
  }
}

export { TRACK_PATH, HOME_PATH, BASE_POSITIONS, CELL_SIZE, PLAYERS };
