import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Flame, Star, Play, Users, Search, TrendingUp, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { gameService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GameCard, GameCardSkeleton } from '../components/premium';
import toast from 'react-hot-toast';
import { getGameRoute } from '../utils/gameRoutes';

const Games = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categories] = useState(['All', 'Arcade', 'Card', 'Slots', 'Popular', 'Board']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    let result = [...games];
    if (selectedCategory !== 'All') {
      result = result.filter(g => g.category?.toLowerCase() === selectedCategory.toLowerCase());
    }
    if (filter === 'hot') {
      result = result.filter(g => g.isHot);
    } else if (filter === 'featured') {
      result = result.filter(g => g.isFeatured);
    }
    if (searchQuery) {
      result = result.filter(g => g.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setFilteredGames(result);
  }, [games, selectedCategory, filter, searchQuery]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await gameService.getAll({});
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Failed to fetch games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = (game) => {
    if (!user) {
      toast.error('Please login to play games!');
      navigate('/login');
      return;
    }
    
    navigate(getGameRoute(game));
  };

  return (
    <div className="p-4 lg:p-6 pb-24 lg:pb-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--casino-purple)] to-[var(--casino-blue)] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white">Games Arena</h1>
            <p className="text-sm text-white/60">{filteredGames.length} games available</p>
          </div>
        </div>
        <button
          className="lg:hidden w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search size={20} />
        </button>
      </div>

      {/* Search */}
      <div className="hidden lg:block">
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search games..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-3.5 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[var(--casino-green)]/50 transition-colors"
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
            >
              <X size={18} className="text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All Games', icon: Gamepad2 },
          { key: 'hot', label: 'Hot', icon: Flame },
          { key: 'featured', label: 'Featured', icon: Star },
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
              filter === tab.key
                ? 'bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black shadow-lg shadow-green-500/30'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <tab.icon size={16} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`py-2 px-5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[var(--casino-purple)]/20 text-[var(--casino-purple)] border border-[var(--casino-purple)]/40 shadow-lg shadow-purple-500/10'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <GameCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-[var(--casino-purple)]/20 to-[var(--casino-blue)]/20 flex items-center justify-center">
            <Gamepad2 size={40} className="text-[var(--casino-purple)]/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onClick={() => handlePlay(game)}
            />
          ))}
        </div>
      )}

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6 border border-white/10"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--casino-purple)]/20 via-[var(--casino-blue)]/20 to-[var(--casino-green)]/20" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--casino-purple)]/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--casino-green)]/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--casino-purple)] to-[var(--casino-blue)] flex items-center justify-center shadow-xl shadow-purple-500/30 shrink-0">
            <Zap size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">New Games Coming Soon!</h3>
            <p className="text-sm text-white/60">Exciting new games every week</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 text-white text-sm font-semibold hover:bg-white/20 transition-colors">
            Notify Me
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Games;
