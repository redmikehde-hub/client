import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Sparkles, Flame, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Wallet, ChevronRight, Target, Zap, Gift, Crown, Users, Gamepad2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { leaderboardService, gameService } from '../services/api';
import { getGameRoute } from '../utils/gameRoutes';

const Dashboard = () => {
  const { user, loading: authLoading, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    streak: 0
  });
  const [topPlayers, setTopPlayers] = useState([]);
  const [games, setGames] = useState([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [leaderboardRes, gamesRes] = await Promise.all([
        leaderboardService.getTop(5).catch(() => ({ data: { leaders: [] } })),
        gameService.getAll({}).catch(() => ({ data: { games: [] } }))
      ]);
      
      setTopPlayers(leaderboardRes.data.leaders || []);
      setGames(gamesRes.data.games || []);
      
      if (user) {
        setStats({
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          winRate: user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0,
          streak: user.streak || 0
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  if (authLoading || loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-3xl skeleton h-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="rounded-2xl skeleton h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950/80 to-slate-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1200&q=80')] bg-cover bg-center opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-transparent to-indigo-900/30" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                  <Sparkles size={16} className="text-black" />
                </div>
                <span className="text-xs font-semibold text-amber-400/90 uppercase tracking-wider">Total Balance</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-2xl">
                {formatCurrency(user?.balance)}
              </h2>
            </div>
            <div className="relative">
              <Sparkles size={44} className="text-amber-400 drop-shadow-lg animate-pulse" />
              <div className="absolute inset-0 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <motion.div className="relative group" whileHover={{ y: -2 }}>
              <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-900/40 to-teal-900/20 rounded-2xl border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-emerald-400" />
                  <p className="text-xs text-emerald-400/80 font-medium uppercase tracking-wider">Bonus</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {formatCurrency(user?.bonusBalance)}
                </p>
              </div>
            </motion.div>
            <motion.div className="relative group" whileHover={{ y: -2 }}>
              <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-900/40 to-orange-900/20 rounded-2xl border border-amber-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-amber-400" />
                  <p className="text-xs text-amber-400/80 font-medium uppercase tracking-wider">Winnings</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {formatCurrency(user?.totalWinnings)}
                </p>
              </div>
            </motion.div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <motion.button 
              onClick={() => navigate('/dashboard/deposit')}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg shadow-emerald-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownLeft size={20} />
              Add Money
            </motion.button>
            <motion.button 
              onClick={() => navigate('/dashboard/withdraw')}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg shadow-indigo-500/20"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowUpRight size={20} />
              Withdraw
            </motion.button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Games Played', value: stats.gamesPlayed, icon: Gamepad2, color: '#ec4899' },
          { label: 'Games Won', value: stats.gamesWon, icon: Trophy, color: '#10b981' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: '#f59e0b' },
          { label: 'Streak', value: stats.streak, icon: Flame, color: '#ef4444' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl p-5 bg-white/5 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ backgroundColor: `${stat.color}15`, boxShadow: `0 0 20px ${stat.color}20` }}
            >
              <stat.icon size={20} style={{ color: stat.color }} />
            </div>
            <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Featured Game */}
      {games.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
                <Target size={20} className="text-pink-400" />
              </span>
              Featured Game
            </h2>
            <button 
              onClick={() => navigate('/dashboard/games')}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {games.slice(0, 2).map((game, index) => (
              <motion.div
                key={game.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer group h-[200px]"
                onClick={() => navigate(getGameRoute(game))}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ y: -4 }}
              >
                <div className="absolute inset-0">
                  <img 
                    src={game.image || `https://picsum.photos/seed/${game.id}/600/300`}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                
                {game.isHot && (
                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold flex items-center gap-1">
                    <Flame size={12} />
                    HOT
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-300">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {new Intl.NumberFormat('en-IN').format(game.players)} Playing
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Top Winners */}
      <section className="rounded-3xl overflow-hidden bg-white/5 border border-white/10">
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
              <Trophy size={20} className="text-amber-400" />
            </span>
            Top Winners
          </h2>
        </div>
        
        <div className="p-4">
          {topPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topPlayers.slice(0, 6).map((player, index) => (
                <motion.div
                  key={player.id || index}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {index < 3 ? <Trophy size={18} /> : `#${index + 1}`}
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-white">
                    {player.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{player.name}</div>
                    <div className="text-xs text-gray-400">{player.gamesWon || 0} wins</div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400 font-bold">
                    <Sparkles size={14} />
                    {formatCurrency(player.totalWinnings || player.balance || 0)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                <Trophy size={32} className="text-amber-400/50" />
              </div>
              <p className="text-gray-400">No winners yet - be the first!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
