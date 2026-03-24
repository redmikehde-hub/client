import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, Sparkles, Flame, TrendingUp, ArrowUpRight, ArrowDownLeft,
  Wallet, ChevronRight, Target, Zap, Gift, Crown, Users, Gamepad2, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { leaderboardService, gameService } from '../services/api';
import { getGameRoute } from '../utils/gameRoutes';
import { GameCardSkeleton, StatsSkeleton, WinnerCardSkeleton } from '../components/premium';

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
      <div className="p-4 lg:p-6 space-y-6">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-3">
              <div className="h-4 w-24 skeleton rounded-full" />
              <div className="h-10 w-40 skeleton rounded-lg" />
            </div>
            <div className="h-12 w-12 skeleton rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 skeleton rounded-2xl" />
            <div className="h-20 skeleton rounded-2xl" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="h-12 skeleton rounded-xl" />
            <div className="h-12 skeleton rounded-xl" />
          </div>
        </div>
        <StatsSkeleton />
        <div className="space-y-3">
          <div className="h-6 w-32 skeleton rounded" />
          <div className="space-y-2">
            {[1, 2, 3].map(i => <WinnerCardSkeleton key={i} />)}
          </div>
        </div>
        <div className="space-y-3">
          <div className="h-6 w-32 skeleton rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <GameCardSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-dark-3)] via-[var(--casino-dark)] to-[var(--casino-dark-3)]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--casino-green)]/10 via-[var(--casino-purple)]/10 to-[var(--casino-orange)]/10" />
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--casino-green)]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--casino-purple)]/10 rounded-full blur-3xl" />
        
        {/* Border */}
        <div className="absolute inset-0 rounded-3xl border border-white/10" />
        
        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--casino-green)] to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Sparkles size={16} className="text-black" />
                </div>
                <span className="text-xs font-semibold text-[var(--casino-green)]/90 uppercase tracking-wider">Total Balance</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white drop-shadow-2xl">
                {formatCurrency(user?.balance)}
              </h2>
            </div>
            <div className="relative">
              <Sparkles size={44} className="text-[var(--casino-green)] drop-shadow-lg animate-pulse" />
              <div className="absolute inset-0 w-44 h-44 bg-[var(--casino-green)]/20 rounded-full blur-3xl animate-pulse" />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
            <motion.div className="relative group" whileHover={{ y: -2 }}>
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[var(--casino-green)]/10 to-transparent rounded-2xl border border-[var(--casino-green)]/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Gift size={16} className="text-[var(--casino-green)]" />
                  <p className="text-xs text-[var(--casino-green)]/80 font-medium uppercase tracking-wider">Bonus</p>
                </div>
                <p className="text-xl sm:text-2xl font-black text-white">
                  {formatCurrency(user?.bonusBalance)}
                </p>
              </div>
            </motion.div>
            <motion.div className="relative group" whileHover={{ y: -2 }}>
              <div className="p-4 sm:p-5 bg-gradient-to-br from-[var(--casino-orange)]/10 to-transparent rounded-2xl border border-[var(--casino-orange)]/20 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy size={16} className="text-[var(--casino-orange)]" />
                  <p className="text-xs text-[var(--casino-orange)]/80 font-medium uppercase tracking-wider">Winnings</p>
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
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black font-bold shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-shadow"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownLeft size={20} />
              Add Money
            </motion.button>
            <motion.button 
              onClick={() => navigate('/dashboard/withdraw')}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[var(--casino-purple)] to-[var(--casino-blue)] text-white font-bold shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
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
          { label: 'Games Played', value: stats.gamesPlayed, icon: Gamepad2, color: 'var(--casino-green)' },
          { label: 'Games Won', value: stats.gamesWon, icon: Trophy, color: 'var(--casino-orange)' },
          { label: 'Win Rate', value: `${stats.winRate}%`, icon: TrendingUp, color: 'var(--casino-purple)' },
          { label: 'Streak', value: stats.streak, icon: Flame, color: 'var(--casino-red)' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            className="relative overflow-hidden rounded-2xl p-5 bg-white/5 border border-white/10 backdrop-blur-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4, borderColor: stat.color }}
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
              <span className="p-2 bg-gradient-to-br from-[var(--casino-purple)]/20 to-[var(--casino-blue)]/20 rounded-xl">
                <Target size={20} className="text-[var(--casino-purple)]" />
              </span>
              Featured Game
            </h2>
            <button 
              onClick={() => navigate('/dashboard/games')}
              className="text-sm text-[var(--casino-green)] hover:text-white flex items-center gap-1 transition-colors"
            >
              View All <ChevronRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.filter(g => g.isFeatured).slice(0, 3).map((game) => (
              <motion.div
                key={game.id}
                className="relative h-[320px] rounded-2xl overflow-hidden cursor-pointer group"
                whileHover={{ y: -5 }}
                onClick={() => navigate(getGameRoute(game))}
              >
                <img 
                  src={game.image} 
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-[var(--casino-green)]/50 transition-colors" />
                
                {game.isHot && (
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-gradient-to-r from-[var(--casino-red)] to-[var(--casino-orange)] text-white text-xs font-bold flex items-center gap-1">
                    <Flame size={12} /> HOT
                  </div>
                )}
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 rounded-lg bg-[var(--casino-purple)]/80 text-[10px] font-bold text-white uppercase">Premium</span>
                    <span className="px-2 py-1 rounded-lg bg-black/60 text-[10px] font-bold text-white/80 uppercase border border-white/20">{game.category}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">{game.name}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60">{game.players?.toLocaleString()} Playing</span>
                    <button className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black text-sm font-bold">
                      Play
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Leaderboard */}
      {topPlayers.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-[var(--casino-orange)]/20 to-[var(--casino-yellow)]/20 rounded-xl">
                <Crown size={20} className="text-[var(--casino-orange)]" />
              </span>
              Top Players
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topPlayers.slice(0, 6).map((player, index) => (
              <motion.div
                key={player.id || index}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[var(--casino-green)]/30 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${
                  index === 0 ? 'bg-gradient-to-br from-[var(--casino-orange)] to-[var(--casino-yellow)] text-black' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-black' :
                  index === 2 ? 'bg-gradient-to-br from-[var(--casino-orange)]/60 to-[var(--casino-yellow)]/60 text-white' :
                  'bg-white/10 text-white/60'
                }`}>
                  {index + 1}
                </div>
                <img 
                  src={player.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.name}`}
                  alt={player.name}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--casino-purple)] to-[var(--casino-blue)]"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{player.name}</p>
                  <p className="text-xs text-[var(--casino-green)]">{player.gamesWon} wins</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[var(--casino-green)]">{formatCurrency(player.totalWinnings)}</p>
                  <p className="text-xs text-gray-400">Winnings</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-lg font-bold flex items-center gap-3 mb-4">
          <span className="p-2 bg-gradient-to-br from-[var(--casino-blue)]/20 to-[var(--casino-green)]/20 rounded-xl">
            <Zap size={20} className="text-[var(--casino-blue)]" />
          </span>
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Gamepad2, label: 'Games', path: '/dashboard/games', color: 'var(--casino-green)' },
            { icon: Wallet, label: 'Wallet', path: '/dashboard/wallet', color: 'var(--casino-purple)' },
            { icon: Trophy, label: 'Achievements', path: '/dashboard/achievements', color: 'var(--casino-orange)' },
            { icon: Users, label: 'Referrals', path: '/dashboard/referrals', color: 'var(--casino-blue)' },
          ].map((action, index) => (
            <motion.button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-[var(--casino-green)]/30 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div 
                className="w-14 h-14 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${action.color}15` }}
              >
                <action.icon size={28} style={{ color: action.color }} />
              </div>
              <span className="font-semibold text-white">{action.label}</span>
            </motion.button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
