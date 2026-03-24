import { motion } from 'framer-motion';
import { Play, Users, Flame } from 'lucide-react';

export default function GameCard({ game, onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={onClick}
      className="relative h-[380px] rounded-3xl overflow-hidden cursor-pointer group"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={game.image} 
          alt={game.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-transparent to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* Border Glow Effect */}
      <div className="absolute inset-0 rounded-3xl border-2 border-white/10 group-hover:border-[var(--casino-green)] transition-colors duration-300" />

      {/* Badges */}
      <div className="absolute top-4 left-4 flex gap-2 z-20">
        {game.isHot && (
          <span className="badge badge-hot flex items-center gap-1">
            <Flame size={12} /> HOT
          </span>
        )}
        {game.isFeatured && (
          <span className="badge badge-popular">PREMIUM</span>
        )}
      </div>

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-20">
        <span className="px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-xl text-white/90 text-[10px] font-bold uppercase tracking-widest border border-white/20">
          {game.category}
        </span>
      </div>

      {/* Play Button (Center) */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-2xl border-2 border-white/30 flex items-center justify-center shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-green-dark)] flex items-center justify-center shadow-lg shadow-green-500/50">
            <Play size={32} className="text-black ml-1" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[var(--casino-purple)]/80 to-[var(--casino-blue)]/80 text-[9px] font-extrabold text-white uppercase tracking-widest backdrop-blur-sm border border-purple-500/30">
              Premium
            </span>
          </div>
          <h3 className="text-2xl font-black text-white drop-shadow-2xl tracking-tight">{game.name}</h3>
          <p className="text-sm text-white/60 mt-1 line-clamp-2">{game.description}</p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--casino-green)] animate-pulse" />
            <span className="text-white/80 text-sm font-semibold">
              {new Intl.NumberFormat('en-IN').format(game.players)} Playing
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--casino-green)]/20 backdrop-blur-sm border border-[var(--casino-green)]/30">
            <Users size={16} className="text-[var(--casino-green)]" />
            <span className="text-[var(--casino-green)] text-sm font-bold">PLAY</span>
          </div>
        </div>
      </div>

      {/* Bottom Glow Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--casino-green)] via-[var(--casino-purple)] to-[var(--casino-orange)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}
