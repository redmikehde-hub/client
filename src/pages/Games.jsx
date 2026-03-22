import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, Flame, Star, Play, Users, Search, TrendingUp, X, Sparkles, Zap, Trophy, Lock, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { gameService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Games = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [categories] = useState(['All', 'Arcade', 'Card', 'Slots', 'Popular']);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

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
      setSelectedGame(game);
      setShowLoginPrompt(true);
      toast.error('Please login to play games!');
      return;
    }
    
    if (game.name?.toLowerCase() === 'ludo') {
      navigate('/dashboard/ludo');
    } else {
      navigate(`/dashboard/games/${game.id}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Login Prompt Modal */}
      <AnimatePresence>
        {showLoginPrompt && selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowLoginPrompt(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 to-black border border-pink-500/30 p-6 max-w-sm w-full text-center"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
              <div className="relative z-10">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-pink-500/30">
                  <Lock size={40} className="text-white" />
                </div>
                <h3 className="text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">Login Required</h3>
                <p className="text-gray-400 mb-6">
                  Please login to play <span className="text-white font-semibold">{selectedGame?.name}</span> and win exciting rewards!
                </p>
                <div className="flex flex-col gap-3">
                  <motion.button
                    onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}
                    className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-base shadow-lg shadow-pink-500/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Login Now
                  </motion.button>
                  <button
                    onClick={() => setShowLoginPrompt(false)}
                    className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium hover:text-white transition-colors border border-white/10"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <Gamepad2 size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">Games Arena</h1>
            <p className="text-sm text-gray-400">{filteredGames.length} games available</p>
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
            className="w-full py-3.5 pl-12 pr-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:border-pink-500/50 transition-colors"
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
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
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
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40 shadow-lg shadow-pink-500/10'
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-3xl skeleton h-[380px]" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-pink-500/20 to-purple-500/20 flex items-center justify-center">
            <Gamepad2 size={40} className="text-pink-400/50" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Games Found</h3>
          <p className="text-gray-400">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              className="relative overflow-hidden rounded-3xl cursor-pointer group h-[380px]"
              onClick={() => handlePlay(game)}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -8 }}
            >
              <div className="absolute inset-0">
                <img 
                  src={game.image || `https://picsum.photos/seed/${game.id}/400/500`}
                  alt={game.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/30 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="absolute inset-0 border border-white/10 rounded-3xl group-hover:border-pink-500/50 transition-colors" />
              
              {game.isHot && (
                <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 text-white text-[11px] font-extrabold flex items-center gap-2 shadow-2xl shadow-red-500/50 animate-pulse z-20">
                  <Flame size={14} />
                  HOT
                </div>
              )}
              
              <div className="absolute top-4 right-4">
                <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white/90 text-[10px] font-bold uppercase tracking-widest border border-white/20">
                  {game.category}
                </span>
              </div>

              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border-2 border-white/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition-all duration-500 shadow-2xl">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-purple-600 flex items-center justify-center">
                    <Play size={32} className="text-white ml-1" />
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-pink-600/80 to-purple-600/80 text-[9px] font-extrabold text-white uppercase tracking-widest backdrop-blur-sm border border-pink-500/30">
                      Premium
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white drop-shadow-2xl tracking-tight">{game.name}</h3>
                  <p className="text-sm text-white/60 mt-1 line-clamp-2">{game.description}</p>
                </div>
                
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-white/80 text-sm font-semibold">
                      {new Intl.NumberFormat('en-IN').format(game.players)} Playing
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-green-400 text-sm font-bold">PLAY</span>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>
      )}

      {/* CTA Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-6"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-pink-900/50 via-purple-900/50 to-indigo-900/50" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/30 shrink-0">
            <Zap size={32} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white text-lg mb-1">New Games Coming Soon!</h3>
            <p className="text-sm text-gray-400">Exciting new games every week</p>
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
