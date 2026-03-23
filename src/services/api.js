import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem('accessToken', response.data.accessToken);
          localStorage.setItem('refreshToken', response.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  loginPhone: (data) => api.post('/auth/login/phone', data),
  googleAuth: (idToken) => api.post('/auth/google', { idToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
};

export const userService = {
  getMe: () => api.get('/user/me'),
  updateMe: (data) => api.put('/user/me', data),
  changePassword: (data) => api.put('/user/password', data),
  getAllUsers: (params) => api.get('/user/all', { params }),
};

export const walletService = {
  getBalance: () => api.get('/wallet'),
  getTransactions: (page = 1, limit = 20) => api.get(`/wallet/transactions?page=${page}&limit=${limit}`),
  deposit: (data) => api.post('/wallet/deposit', data),
  transfer: (data) => api.post('/wallet/transfer', data),
  addBalance: (data) => api.post('/wallet/add', data),
};

export const withdrawService = {
  request: (data) => api.post('/withdraw/request', data),
  getMyRequests: (params) => api.get('/withdraw/my-requests', { params }),
  getAllRequests: (params) => api.get('/withdraw/all', { params }),
  updateRequest: (id, data) => api.patch(`/withdraw/${id}`, data),
};

export const gameService = {
  getAll: (params) => api.get('/games', { params }),
  getCategories: () => api.get('/games/categories'),
  getFeatured: () => api.get('/games/featured'),
  getOne: (id) => api.get(`/games/${id}`),
};

export const leaderboardService = {
  getMonthly: () => api.get('/leaderboard/monthly'),
  getTop: (limit = 10) => api.get('/leaderboard/top', { params: { limit } }),
  getMyRank: () => api.get('/leaderboard/rank/me'),
  getUserRank: (userId) => api.get(`/leaderboard/rank/${userId}`),
};

export const achievementService = {
  getAll: () => api.get('/achievements'),
  getMy: () => api.get('/achievements/my'),
  updateProgress: (data) => api.post('/achievements/progress', data),
  claim: (achievementId) => api.post(`/achievements/${achievementId}/claim`),
};

export const bonusService = {
  getAll: () => api.get('/bonuses'),
  getMy: () => api.get('/bonuses/my'),
  validate: (code) => api.post('/bonuses/validate', { code }),
  claim: (code) => api.post('/bonuses/claim', { code }),
  getReferral: () => api.get('/bonuses/referral'),
};

export const coinGameService = {
  play: (data) => api.post('/game/play', data),
  getHistory: (params) => api.get('/game/history', { params }),
  getStats: () => api.get('/game/stats'),
};

export const depositPlanService = {
  getPlans: () => api.get('/deposit/plans'),
  purchase: (planId) => api.post('/deposit/purchase', { planId }),
};

export const coinBonusService = {
  apply: (code) => api.post('/bonus/apply', { code }),
  create: (data) => api.post('/bonus/create', data),
  update: (id, data) => api.patch(`/bonus/update/${id}`, data),
  delete: (id) => api.delete(`/bonus/delete/${id}`),
  getAll: () => api.get('/bonus/codes'),
  getActive: () => api.get('/bonus/active'),
};

export const referralSystemService = {
  getCode: () => api.get('/referral/code'),
  reward: (referredId) => api.post('/referral/reward', { referredId }),
  getHistory: () => api.get('/referral/history'),
  getList: () => api.get('/referral/list'),
};

export const notificationService = {
  getAll: (params) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications'),
};

export const broadcastService = {
  getAll: () => api.get('/broadcast'),
  getUnreadCount: () => api.get('/broadcast/unread-count'),
  markRead: (id) => api.patch(`/broadcast/${id}/read`),
  markAllRead: () => api.patch('/broadcast/read-all'),
  send: (data) => api.post('/admin/notify', data),
  getAllBroadcasts: () => api.get('/admin/broadcasts'),
};

export const ludoService = {
  startGame: (data) => api.post('/ludo/start', data),
  startMultiplayer: (data) => api.post('/ludo/start-multiplayer', data),
  getGameState: (gameId) => api.get(`/ludo/${gameId}`),
  rollDice: (gameId) => api.post(`/ludo/${gameId}/roll`),
  makeMove: (gameId, tokenIndex) => api.post(`/ludo/${gameId}/move`, { tokenIndex }),
  skipTurn: (gameId) => api.post(`/ludo/${gameId}/skip`),
  aiTurn: (gameId) => api.post(`/ludo/${gameId}/ai-turn`),
  forfeit: (gameId) => api.post(`/ludo/${gameId}/forfeit`),
  getHistory: (params) => api.get('/ludo/history', { params }),
};

export const adminService = {
  createSubadmin: (data) => api.post('/admin/create-subadmin', data),
  getStats: () => api.get('/admin/stats'),
  sendBroadcast: (data) => api.post('/admin/notify', data),
  getBroadcasts: () => api.get('/admin/broadcasts'),
};

export const matkaService = {
  getCurrentRound: () => api.get('/matka/round'),
  placeBet: (data) => api.post('/matka/bet', data),
  getResults: (params) => api.get('/matka/results', { params }),
  getMyBets: (params) => api.get('/matka/my-bets', { params }),
};

export const aviatorService = {
  getState: () => api.get('/aviator/state'),
  placeBet: (data) => api.post('/aviator/bet', data),
  cashout: () => api.post('/aviator/cashout'),
  getHistory: (params) => api.get('/aviator/history', { params }),
};

export const sportService = {
  getMatches: () => api.get('/sport/matches'),
  placeBet: (data) => api.post('/sport/bet', data),
  getMyBets: (params) => api.get('/sport/my-bets', { params }),
};

export default api;
