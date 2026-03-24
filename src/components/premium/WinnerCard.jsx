import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export default function WinnerCard({ winner, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] hover:border-[var(--casino-green)]/40 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer shadow-xl hover:shadow-[var(--casino-green)]/10"
    >
      {/* Avatar with Ring */}
      <div className="relative flex-shrink-0">
        <img
          src={winner.img}
          alt={winner.name}
          className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--casino-green)]/40 shadow-lg"
        />
        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
          <Trophy size={10} className="text-white" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-col min-w-0 flex-1">
        <p className="text-white font-semibold text-sm truncate">{winner.name}</p>
        <p className="text-white/40 text-xs">{winner.game}</p>
      </div>

      {/* Amount */}
      <div className="flex items-center gap-1.5 pl-3 border-l border-white/10">
        <span className="text-[var(--casino-green)] font-black text-base tracking-tight">
          ₹{winner.amount.toLocaleString()}
        </span>
      </div>
    </motion.div>
  );
}

export function WinnersTicker({ winners }) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/20 via-black/90 to-purple-950/20 border-b border-white/[0.05] py-3">
      {/* Section Title */}
      <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--casino-green)]/20 flex items-center justify-center">
            <Trophy size={18} className="text-[var(--casino-green)]" />
          </div>
          <div>
            <span className="text-white/90 font-bold text-sm tracking-wide block">Recent Winners</span>
            <span className="text-[10px] text-[var(--casino-green)] uppercase tracking-widest">Real Time</span>
          </div>
        </div>
        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      </div>

      {/* Gradient Edges */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-56 bg-gradient-to-r from-black/95 to-transparent z-10" />
      <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/95 to-transparent z-10" />

      {/* Ticker */}
      <div className="relative group">
        <div className="flex py-1 pl-4 md:pl-60 overflow-hidden">
          <div className="flex gap-3 animate-ticker-smooth hover:pause-animation">
            {[...Array(3)].map((_, outerIdx) => (
              <div key={outerIdx} className="flex shrink-0 gap-3">
                {winners.map((winner, idx) => (
                  <WinnerCard key={`${outerIdx}-${winner.id}`} winner={winner} index={idx} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
