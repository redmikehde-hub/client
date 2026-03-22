import { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Sparkles, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { leaderboardService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Leaderboard = () => {
  const { user } = useAuth();
  const [monthlyLeaders, setMonthlyLeaders] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('monthly');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [monthlyRes, rankRes] = await Promise.all([
        leaderboardService.getMonthly(),
        leaderboardService.getMyRank().catch(() => ({ data: null })),
      ]);
      setMonthlyLeaders(monthlyRes.data.leaders || []);
      setMyRank(rankRes.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-5 sm:mb-6">
          <div>
            <div className="h-8 w-40 rounded-lg skeleton mb-2" />
            <div className="h-4 w-28 rounded skeleton" />
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-10 w-24 rounded-xl skeleton" />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-3xl skeleton skeleton-card p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full skeleton skeleton-avatar" />
              <div className="h-5 w-24 mx-auto rounded skeleton mb-2" />
              <div className="h-6 w-20 mx-auto rounded skeleton mb-3" />
              <div className="h-4 w-16 mx-auto rounded skeleton" />
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl skeleton skeleton-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="w-10 h-10 rounded-xl skeleton skeleton-avatar" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded skeleton mb-1" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>
              <div className="h-5 w-20 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const topThree = monthlyLeaders.slice(0, 3);
  const restOfLeaderboard = monthlyLeaders.slice(3);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-text-muted">Top players this month</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-warning/10 border border-warning/20">
          <Trophy size={14} className="text-warning" />
          <span className="text-xs font-bold text-warning">{monthlyLeaders.length} Players</span>
        </div>
      </div>

      {myRank && (
        <motion.div 
          className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-5 lg:p-6 mb-5 sm:mb-6 bg-gradient-to-br from-primary/20 via-neon-purple/15 to-primary/10 border border-primary/20"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="absolute -top-16 -right-16 w-40 h-40 sm:w-60 sm:h-60 bg-primary/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-5">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl shadow-primary/40 shrink-0"
            >
              #{myRank.rank || '-'}
            </motion.div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-[10px] sm:text-xs text-text-muted mb-0.5">Your Rank</p>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent">
                {myRank.rank ? `#${myRank.rank}` : 'Unranked'}
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary">{myRank.totalUsers || 0} total players</p>
            </div>
            <div className="text-center sm:text-right shrink-0">
              <p className="text-[10px] sm:text-xs text-text-muted mb-1">Winnings</p>
              <div className="flex items-center gap-1.5 text-base sm:text-xl font-black text-success">
                <Sparkles size={16} className="text-gold" />
                {formatCurrency(myRank.winnings || 0)}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {topThree.length > 0 && (
        <motion.div 
          className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl sm:rounded-3xl p-4 sm:p-6 mb-5 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="font-bold text-sm sm:text-base mb-4 sm:mb-6 flex items-center justify-center gap-2">
            <Crown size={18} className="text-gold" />
            <span className="hidden sm:inline">Top 3</span> Champions
          </h3>
          
          <div className="flex justify-center items-end gap-2 sm:gap-4 lg:gap-6">
            {[1, 0, 2].map((idx) => {
              const player = topThree[idx];
              if (!player) return null;
              
              const medals = [
                { icon: Crown, bg: 'from-gold to-amber-600', size: 'text-gold' },
                { icon: Medal, bg: 'from-gray-300 to-gray-500', size: 'text-black' },
                { icon: Medal, bg: 'from-amber-700 to-amber-900', size: 'text-white' }
              ];
              const medal = medals[idx];
              const isFirst = idx === 1;
              
              return (
                <motion.div
                  key={player.id}
                  className={`text-center flex-1 max-w-[100px] sm:max-w-[140px] ${isFirst ? 'order-2' : idx === 0 ? 'order-1' : 'order-3'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="relative inline-block mb-2 sm:mb-3">
                    <motion.div
                      className={`rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center font-black shadow-lg ${isFirst ? 'w-14 h-14 sm:w-18 sm:h-18 lg:w-20 lg:h-20 text-2xl sm:text-3xl' : 'w-10 h-10 sm:w-14 sm:h-14 text-lg sm:text-2xl'}`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {player.name?.charAt(0).toUpperCase()}
                    </motion.div>
                    <div className={`absolute -top-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center ${isFirst ? '' : ''}`}>
                      <medal.icon size={10} className={`sm:text-xs ${medal.size}`} />
                    </div>
                  </div>
                  <div className="font-bold text-xs sm:text-sm truncate px-1">{player.name}</div>
                  <div className="flex items-center justify-center gap-0.5 text-[10px] sm:text-xs text-text-muted mt-0.5 sm:mt-1">
                    <Sparkles size={8} className="text-gold" />
                    {formatCurrency(player.totalWinnings || player.balance || 0)}
                  </div>
                  <div className={`mt-2 sm:mt-3 py-1.5 sm:py-2.5 rounded-t-xl text-[10px] sm:text-xs font-semibold ${isFirst ? 'from-gold/30 to-gold/10 border border-gold/30' : 'from-primary/20 to-primary/10 border border-primary/20'}`}>
                    {player.gamesWon || 0} wins
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-sm sm:text-base font-bold flex items-center gap-2 mb-3 sm:mb-4">
          <TrendingUp size={18} className="text-primary" />
          <span className="hidden sm:inline">All</span> Rankings
        </h2>

        {monthlyLeaders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-14 h-14 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl bg-bg-card border border-white/5 flex items-center justify-center">
              <Trophy size={28} className="sm:text-4xl text-text-muted" />
            </div>
            <h3 className="text-base sm:text-lg font-bold mb-1">No Leaders Yet</h3>
            <p className="text-xs sm:text-sm text-text-muted">Be the first to top the leaderboard!</p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {monthlyLeaders.map((player, index) => (
              <motion.div
                key={player.id || index}
                className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 lg:p-4 rounded-xl transition-all ${player.id === user?.id ? 'bg-primary/10 border border-primary/30' : 'bg-bg-card-hover border border-transparent hover:border-primary/20'}`}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover={{ x: 2 }}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                  index === 0 ? 'bg-gradient-to-br from-gold to-amber-600 text-black shadow-lg shadow-gold/30' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                  index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                  'bg-primary/10 text-text-muted'
                }`}>
                  {index < 3 ? <Trophy size={12} className="sm:text-sm" /> : index + 1}
                </div>
                
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 ${
                  index === 0 ? 'bg-gradient-to-br from-gold to-amber-600 shadow-lg' : 'bg-gradient-to-br from-primary to-neon-purple'
                }`}>
                  {player.name?.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-xs sm:text-sm truncate">{player.name}</span>
                    {player.id === user?.id && (
                      <span className="px-1.5 py-0.5 rounded-full bg-primary/20 text-primary text-[8px] sm:text-[10px] font-bold shrink-0">You</span>
                    )}
                  </div>
                  <div className="text-[10px] sm:text-xs text-text-muted flex items-center gap-1">
                    <span>{player.gamesWon || 0} wins</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="hidden sm:inline">{(player.winRate || 0).toFixed(0)}% win rate</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 font-bold text-xs sm:text-sm shrink-0">
                  <Sparkles size={12} className="text-gold hidden sm:inline" />
                  <span className="text-success">{formatCurrency(player.totalWinnings || player.balance || 0)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div 
        className="mt-6 sm:mt-8 p-4 sm:p-6 text-center bg-gradient-to-br from-warning/15 to-gold/10 border border-warning/20 rounded-2xl sm:rounded-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Trophy size={28} className="sm:text-4xl text-warning mx-auto mb-3 sm:mb-4" />
        <h3 className="font-bold text-sm sm:text-base mb-1 sm:mb-2">Monthly Rewards</h3>
        <p className="text-xs sm:text-sm text-text-muted mb-4 sm:mb-5">
          Top 10 players receive bonus rewards!
        </p>
        <div className="flex justify-center gap-2 sm:gap-3 flex-wrap">
          {['1st: ₹10K', '2nd: ₹5K', '3rd: ₹2.5K'].map((reward, i) => (
            <div key={i} className="px-3 sm:px-4 py-2 bg-black/30 rounded-lg font-semibold text-xs sm:text-sm">
              {reward}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Leaderboard;
