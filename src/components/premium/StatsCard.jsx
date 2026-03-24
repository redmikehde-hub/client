import { motion } from 'framer-motion';

export default function StatsCard({ icon: Icon, label, value, color = 'green', trend, index = 0 }) {
  const colors = {
    green: 'from-[var(--casino-green)]/20 to-[var(--casino-green-dark)]/10 border-[var(--casino-green)]/30',
    orange: 'from-[var(--casino-orange)]/20 to-[var(--casino-orange)]/10 border-[var(--casino-orange)]/30',
    purple: 'from-[var(--casino-purple)]/20 to-[var(--casino-purple)]/10 border-[var(--casino-purple)]/30',
    blue: 'from-[var(--casino-blue)]/20 to-[var(--casino-blue)]/10 border-[var(--casino-blue)]/30',
    red: 'from-[var(--casino-red)]/20 to-[var(--casino-red)]/10 border-[var(--casino-red)]/30',
  };

  const iconColors = {
    green: 'text-[var(--casino-green)]',
    orange: 'text-[var(--casino-orange)]',
    purple: 'text-[var(--casino-purple)]',
    blue: 'text-[var(--casino-blue)]',
    red: 'text-[var(--casino-red)]',
  };

  const borderColors = {
    green: '#00ff9d',
    orange: '#ff9500',
    purple: '#a855f7',
    blue: '#3b82f6',
    red: '#ef4444',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border backdrop-blur-xl p-5 group`}
      style={{
        borderColor: `${borderColors[color]}30`,
      }}
    >
      {/* Top Gradient Line */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, ${borderColors[color]}, transparent)` }}
      />

      {/* Glow Effect */}
      <div 
        className="absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl"
        style={{ backgroundColor: borderColors[color] }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={`w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
          {trend && (
            <span className={`text-xs font-bold ${trend > 0 ? 'text-[var(--casino-green)]' : 'text-[var(--casino-red)]'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-3xl font-black text-white tracking-tight">
            {value}
          </h3>
          <p className="text-sm text-white/60 font-medium">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}
