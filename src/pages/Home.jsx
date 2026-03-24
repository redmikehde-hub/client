import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Trophy, Wallet, Zap, Crown, ChevronRight, Sparkles, Shield, Clock, Gift } from 'lucide-react';
import { gameService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HeroSection, GameCard, GameCardSkeleton, StatsSkeleton } from '../components/premium';

const STATS = [
  { icon: Users, label: 'Online Players', value: '50,000+', color: 'green' },
  { icon: Trophy, label: 'Today Winners', value: '2,500+', color: 'orange' },
  { icon: Wallet, label: 'Total Paid', value: '₹5Cr+', color: 'purple' },
  { icon: Zap, label: 'Jackpot', value: '₹50,000', color: 'blue' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await gameService.getAll({});
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  };

  const handleGetCoins = () => {
    if (user) {
      navigate('/dashboard/deposit');
    } else {
      navigate('/signup');
    }
  };

  const handlePlayNow = () => {
    if (user) {
      navigate('/dashboard/games');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--casino-dark)]">
      {/* Hero Section */}
      <div className="p-4 lg:p-6">
        {loading ? (
          <div className="rounded-2xl overflow-hidden relative bg-[var(--casino-dark)] border border-white/10 p-6">
            <div className="space-y-4 animate-pulse">
              <div className="flex justify-center">
                <div className="h-6 w-48 rounded-full skeleton" />
              </div>
              <div className="text-center space-y-2">
                <div className="h-10 w-full max-w-md mx-auto skeleton rounded-lg" />
                <div className="h-6 w-full max-w-sm mx-auto skeleton rounded" />
              </div>
              <div className="flex justify-center gap-3">
                <div className="h-11 w-36 skeleton rounded-xl" />
                <div className="h-11 w-28 skeleton rounded-xl" />
              </div>
            </div>
          </div>
        ) : (
          <HeroSection onGetCoins={handleGetCoins} onPlayNow={handlePlayNow} />
        )}
      </div>

      {/* Stats Section */}
      <div className="p-4 lg:p-6">
        {loading ? (
          <StatsSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STATS.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${
                  stat.color === 'green' ? 'from-[var(--casino-green)]/10 to-transparent border-[var(--casino-green)]/20' :
                  stat.color === 'orange' ? 'from-[var(--casino-orange)]/10 to-transparent border-[var(--casino-orange)]/20' :
                  stat.color === 'purple' ? 'from-[var(--casino-purple)]/10 to-transparent border-[var(--casino-purple)]/20' :
                  'from-[var(--casino-blue)]/10 to-transparent border-[var(--casino-blue)]/20'
                } border backdrop-blur-xl p-5`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 rounded-t-2xl ${stat.color === 'green' ? 'bg-[var(--casino-green)]' : stat.color === 'orange' ? 'bg-[var(--casino-orange)]' : stat.color === 'purple' ? 'bg-[var(--casino-purple)]' : 'bg-[var(--casino-blue)]'}`} />
                <div className={`w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 ${
                  stat.color === 'green' ? 'text-[var(--casino-green)]' :
                  stat.color === 'orange' ? 'text-[var(--casino-orange)]' :
                  stat.color === 'purple' ? 'text-[var(--casino-purple)]' :
                  'text-[var(--casino-blue)]'
                }`}>
                  <stat.icon size={24} />
                </div>
                <h3 className="text-2xl lg:text-3xl font-black text-white">{stat.value}</h3>
                <p className="text-sm text-white/60">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Featured Games */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--casino-purple)] to-[var(--casino-blue)] flex items-center justify-center">
              <Crown size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white">Featured Games</h2>
              <p className="text-sm text-white/60">Top picks for you</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('/dashboard/games')}
            className="flex items-center gap-1 text-[var(--casino-green)] font-semibold text-sm hover:gap-2 transition-all"
          >
            View All <ChevronRight size={16} />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <GameCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.filter(g => g.isFeatured).slice(0, 3).map((game, index) => (
              <GameCard 
                key={game.id} 
                game={game} 
                index={index}
                onClick={() => navigate(`/dashboard/games/${game.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* All Games */}
      <div className="p-4 lg:p-6 pb-24 lg:pb-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--casino-orange)] to-[var(--casino-yellow)] flex items-center justify-center">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-white">All Games</h2>
              <p className="text-sm text-white/60">{games.length} games available</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {games.map((game, index) => (
            <GameCard 
              key={game.id} 
              game={game} 
              index={index}
              onClick={() => navigate(`/dashboard/games/${game.id}`)}
            />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="p-4 lg:p-6 border-t border-white/5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--casino-green)]/10 flex items-center justify-center shrink-0">
              <Shield size={28} className="text-[var(--casino-green)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">100% Secure</h3>
              <p className="text-sm text-white/50">Your data and money are always safe with bank-level security</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--casino-purple)]/10 flex items-center justify-center shrink-0">
              <Clock size={28} className="text-[var(--casino-purple)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">24/7 Support</h3>
              <p className="text-sm text-white/50">Round the clock customer support via chat and call</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-start gap-4 p-6 rounded-2xl bg-white/[0.03] border border-white/5"
          >
            <div className="w-14 h-14 rounded-2xl bg-[var(--casino-orange)]/10 flex items-center justify-center shrink-0">
              <Gift size={28} className="text-[var(--casino-orange)]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-1">Instant Payouts</h3>
              <p className="text-sm text-white/50">Withdraw your winnings instantly to your bank account</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[var(--casino-green)]/20 via-[var(--casino-purple)]/20 to-[var(--casino-orange)]/20 border border-white/10 p-8 lg:p-12 text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-green)]/5 to-transparent" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <Sparkles size={16} className="text-[var(--casino-green)]" />
              <span className="text-sm text-white/80">New users get bonus coins!</span>
            </div>
            <h2 className="text-2xl lg:text-4xl font-black text-white mb-4">
              Ready to Win Big?
            </h2>
            <p className="text-white/60 mb-8 max-w-lg mx-auto">
              Join thousands of players and start playing your favorite games today
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                onClick={handleGetCoins}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-8 py-3.5 rounded-2xl font-bold text-base overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%)',
                  boxShadow: '0 4px 20px rgba(0, 255, 157, 0.4), 0 0 40px rgba(0, 255, 157, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                  color: '#0a0a14',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Gift size={18} />
                  Get Free Coins
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
              <motion.button
                onClick={handlePlayNow}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative group px-8 py-3.5 rounded-2xl font-bold text-base overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(135deg, #ff9500 0%, #ff6b00 100%)',
                  boxShadow: '0 4px 20px rgba(255, 149, 0, 0.4), 0 0 40px rgba(255, 149, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                  color: '#fff',
                }}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <Zap size={18} />
                  Play Now
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
