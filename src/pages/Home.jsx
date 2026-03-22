import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gamepad2, Wallet, Users, Gift, ChevronRight, Star, Flame, Zap, Shield, Sparkles, Play, ArrowRight, TrendingUp, Crown, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { gameService, leaderboardService } from '../services/api';
import WelcomePopup from '../components/WelcomePopup';
import toast from 'react-hot-toast';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleWelcomeClose = () => {
    setShowWelcome(false);
    localStorage.setItem('hasSeenWelcome', 'true');
  };

  const handleExplore = () => {
    handleWelcomeClose();
    navigate('/dashboard/games');
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  const fetchPublicData = async () => {
    try {
      const [gamesRes, leaderboardRes] = await Promise.all([
        gameService.getAll({}).catch(() => ({ data: { games: [] } })),
        leaderboardService.getTop(5).catch(() => ({ data: { leaders: [] } })),
      ]);
      setGames(gamesRes.data.games || []);
      setLeaderboard(leaderboardRes.data.leaders || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllGames = () => {
    navigate('/dashboard/games');
  };

  const handleGameClick = (game) => {
    if (!user) {
      toast.error('Please login to play games!', { duration: 2000 });
      setTimeout(() => navigate('/login'), 500);
      return;
    }
    if (game.name?.toLowerCase() === 'ludo') {
      navigate('/dashboard/ludo');
    } else {
      navigate(`/dashboard/games/${game.id}`);
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

  return (
    <>
      <AnimatePresence>
        {showWelcome && (
          <WelcomePopup 
            onClose={handleWelcomeClose} 
            onExplore={handleExplore}
          />
        )}
      </AnimatePresence>

      <div className="w-full max-w-[1400px] mx-auto space-y-6">
        
      {/* Premium Casino Hero Section */}
      <section className="relative overflow-hidden rounded-3xl">
        {/* Background Layers */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1400&h=600&fit=crop" 
            alt="Gaming Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-pink-900/40 via-purple-900/30 to-indigo-900/40" />
        </div>

        {/* Glow Orbs */}
        <div className="absolute top-1/3 left-1/4 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-purple-500/15 rounded-full blur-3xl" />

        <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 text-center">
          {/* Rating Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-4"
          >
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 backdrop-blur-md rounded-full border border-white/10">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-white/70 text-xs">4.9/5 Rating</span>
            </div>
          </motion.div>

          {/* Main Trophy Icon */}
          <motion.div 
            className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-pink-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-purple-500/40"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Trophy size={32} className="sm:w-10 sm:h-10 text-white" />
          </motion.div>
          
          {/* Title */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl font-black mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              IndiaPlay
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p 
            className="text-sm sm:text-base md:text-lg text-white/70 mb-5"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            India's Most Trusted Gaming Platform
          </motion.p>

          {/* Feature Pills */}
          <motion.div 
            className="flex flex-wrap justify-center gap-2 mb-5"
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            {[
              { icon: Shield, text: 'Secure' },
              { icon: Zap, text: 'Instant Payouts' },
              { icon: Gift, text: '₹500 Bonus' },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <feature.icon size={12} className="text-emerald-400" />
                <span className="text-white/70 text-xs">{feature.text}</span>
              </div>
            ))}
          </motion.div>
          
          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 justify-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button 
              className="px-8 py-3 rounded-xl font-bold text-sm cursor-pointer bg-white/10 backdrop-blur-xl text-white border border-white/20 transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
            >
              Sign In
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button 
              className="px-8 py-3 rounded-xl font-bold text-sm cursor-pointer bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/40 flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
            >
              <Sparkles size={16} />
              Sign Up Free
            </motion.button>
          </motion.div>
        </div>
        
        {/* Border Glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </section>

      {/* Stats Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: Gamepad2, label: 'Total Games', value: '10+', color: '#ec4899', delay: 0 },
          { icon: Users, label: 'Active Players', value: '50K+', color: '#10b981', delay: 0.1 },
          { icon: Trophy, label: 'Winners', value: '10K+', color: '#f59e0b', delay: 0.2 },
          { icon: Gift, label: 'Won', value: '₹5Cr+', color: '#ef4444', delay: 0.3 },
        ].map((stat, index) => (
          <motion.div
            key={index}
            className="relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm hover:border-pink-500/30 transition-all duration-300 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay }}
            whileHover={{ y: -4, scale: 1.02 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 text-center">
              <div 
                className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15`, boxShadow: `0 0 20px ${stat.color}20` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* Featured Game - Ludo */}
      {games.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
                <Star size={22} className="text-pink-400" />
              </span>
              Featured Game
            </h2>
            <button 
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/5 text-gray-400 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-pink-500/30 flex items-center gap-1"
              onClick={handleViewAllGames}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {games.slice(0, 1).map((game, index) => (
              <motion.div
                key={game.id}
                className="relative overflow-hidden rounded-3xl cursor-pointer group h-[400px] sm:h-[450px]"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => handleGameClick(game)}
              >
                <div className="absolute inset-0">
                  <img 
                    src={game.image || `https://picsum.photos/seed/${game.id}/800/600`}
                    alt={game.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 via-purple-600/20 to-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="absolute inset-0 border border-white/10 rounded-3xl group-hover:border-pink-500/50 transition-colors duration-300" />
                
                {game.isHot && (
                  <div className="absolute top-4 left-4 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-2xl shadow-red-500/50 animate-pulse z-20">
                    <Flame size={16} className="drop-shadow-lg" />
                    <span className="tracking-wider">HOT GAME</span>
                  </div>
                )}
                
                <div className="absolute top-4 right-4">
                  <span className="px-4 py-2 rounded-full bg-black/60 backdrop-blur-xl text-white/90 text-[11px] font-bold uppercase tracking-widest border border-white/20">
                    {game.category || 'Arcade'}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-2xl border-2 border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-500 shadow-2xl shadow-white/20">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                      <Play size={40} className="text-white ml-1 drop-shadow-lg" />
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-10">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-[10px] font-extrabold text-white uppercase tracking-widest backdrop-blur-sm border border-pink-500/30">
                        Premium
                      </span>
                      <span className="px-3 py-1.5 rounded-lg bg-amber-500/80 text-[10px] font-extrabold text-black uppercase tracking-widest backdrop-blur-sm">
                        Featured
                      </span>
                    </div>
                    <h3 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-2xl tracking-tight mb-2">
                      {game.name}
                    </h3>
                    <p className="text-sm sm:text-base text-white/70 line-clamp-2">
                      {game.description || `Win big with ${game.name}!`}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/90 text-sm font-semibold">
                          {game.players ? new Intl.NumberFormat('en-IN').format(game.players) : '500K'} Playing
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="px-4 py-2.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                        <span className="text-green-400 text-sm font-bold flex items-center gap-2">
                          <TrendingUp size={16} />
                          PLAY NOW
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            ))}

            {/* Mini Game Card */}
            <div className="hidden md:flex flex-col gap-4">
              {games.slice(1, 3).map((game, index) => (
                <motion.div
                  key={game.id}
                  className="relative overflow-hidden rounded-2xl cursor-pointer group h-[200px]"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  whileHover={{ y: -4 }}
                  onClick={() => handleGameClick(game)}
                >
                  <div className="absolute inset-0">
                    <img 
                      src={game.image || `https://picsum.photos/seed/${game.id}/400/200`}
                      alt={game.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{game.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      {game.players ? new Intl.NumberFormat('en-IN').format(game.players) : '100K'} Playing
                    </div>
                  </div>
                  
                  <div className="absolute inset-0 border border-white/10 rounded-2xl group-hover:border-pink-500/30 transition-colors" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Winners */}
      <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-sm">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3">
              <span className="p-2 bg-gradient-to-br from-amber-500/20 to-orange-500/20 rounded-xl">
                <Trophy size={22} className="text-amber-400" />
              </span>
              Top Winners
            </h2>
            <button 
              className="px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer bg-white/5 text-gray-400 border border-white/10 transition-all duration-300 hover:bg-white/10 hover:text-white"
              onClick={() => navigate('/dashboard/leaderboard')}
            >
              View All
            </button>
          </div>
        </div>
        
        <div className="p-4">
          {leaderboard.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {leaderboard.slice(0, 6).map((player, index) => (
                <motion.div
                  key={player.id || index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-amber-500/30 transition-all duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-lg ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/30' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black' :
                    index === 2 ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-white' :
                    'bg-white/10 text-gray-400'
                  }`}>
                    {index < 3 ? <Trophy size={20} /> : `#${index + 1}`}
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center font-bold text-lg text-white shadow-lg">
                    {player.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white truncate">{player.name}</div>
                    <div className="text-xs text-gray-400">{player.gamesWon || 0} wins</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Sparkles size={16} />
                    {formatCurrency(player.totalWinnings || player.balance || 0)}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                <Trophy size={32} className="text-amber-400/50" />
              </div>
              <p className="text-gray-400">No winners yet - be the first!</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="rounded-3xl overflow-hidden bg-gradient-to-br from-pink-500/5 via-purple-500/5 to-indigo-500/5 border border-white/10 p-6 sm:p-8">
        <h2 className="text-lg sm:text-xl font-bold flex items-center gap-3 mb-6">
          <span className="p-2 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-xl">
            <Crown size={22} className="text-pink-400" />
          </span>
          Why Choose Us?
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security for your data', color: '#6366f1' },
            { icon: Zap, title: 'Instant Payouts', desc: 'Get your winnings instantly', color: '#10b981' },
            { icon: Trophy, title: 'Daily Rewards', desc: 'Earn bonuses every day', color: '#f59e0b' },
            { icon: Users, title: '24/7 Support', desc: 'Always here to help you', color: '#ef4444' },
          ].map((feature, index) => (
            <motion.div
              key={index}
              className="text-center p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div 
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: `${feature.color}15`, boxShadow: `0 0 30px ${feature.color}20` }}
              >
                <feature.icon size={28} style={{ color: feature.color }} />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">{feature.title}</h3>
              <p className="text-xs text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-900/40 via-purple-900/40 to-indigo-900/40" />
        <div className="absolute inset-0">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-pink-500/20 rounded-full blur-[100px]" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px]" />
        </div>
        
        <div className="relative z-10">
          <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-pink-500/30">
            <Gift size={40} className="text-white" />
          </div>
          <h3 className="text-3xl sm:text-4xl font-black mb-4">
            <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              ₹500 Welcome Bonus
            </span>
          </h3>
          <p className="text-lg text-white/70 mb-8 max-w-md mx-auto">
            Sign up today and get ₹500 bonus on your first deposit!
          </p>
          <motion.button
            className="px-10 py-4 rounded-2xl font-bold text-base cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 text-black shadow-xl shadow-amber-500/30 transition-all duration-300 flex items-center justify-center gap-2 mx-auto"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/signup')}
          >
            <Sparkles size={20} />
            Claim Bonus
          </motion.button>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/5">
        <div className="flex justify-center gap-6 sm:gap-8 mb-4">
          <span className="text-xs sm:text-sm text-gray-500 cursor-pointer hover:text-pink-400 transition-colors">Terms</span>
          <span className="text-xs sm:text-sm text-gray-500 cursor-pointer hover:text-pink-400 transition-colors">Privacy</span>
          <span className="text-xs sm:text-sm text-gray-500 cursor-pointer hover:text-pink-400 transition-colors">Support</span>
        </div>
        <p className="text-[11px] sm:text-xs text-gray-600">IndiaPlay v1.0.0 • Made with ❤️ in India</p>
      </footer>
      </div>
    </>
  );
};

export default Home;
