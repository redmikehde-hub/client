import { motion } from 'framer-motion';
import { Sparkles, Zap, Gift } from 'lucide-react';

export default function HeroSection({ onGetCoins, onPlayNow }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Background with Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1511882150382-421056c89033?w=1200&q=80')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/90 via-black/80 to-black/90" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--casino-green)]/10 via-transparent to-[var(--casino-orange)]/10" />
      </div>

      {/* Glow Border */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, var(--casino-green), var(--casino-purple), var(--casino-orange))',
          padding: '1px',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-4 py-5 sm:px-6 sm:py-6">
        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl mb-3"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--casino-green)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--casino-green)]"></span>
            </span>
            <span className="text-[11px] text-white/90 font-medium">Live Now • 50,000+ Players Online</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 tracking-tight leading-tight"
          >
            Khelo.
            <span className="block gradient-text">Jeeto.</span>
            <span className="block">Badhai Ho!</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xs sm:text-sm text-white/70 mb-4 max-w-xl mx-auto"
          >
            India's Most Trusted Gaming Platform. Play, Win & Celebrate!
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.button
              onClick={onGetCoins}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-6 py-2.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #00ff9d 0%, #00cc7d 100%)',
                boxShadow: '0 4px 20px rgba(0, 255, 157, 0.4), 0 0 40px rgba(0, 255, 157, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                color: '#0a0a14',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Gift size={16} />
                Get Free Coins
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
            <motion.button
              onClick={onPlayNow}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group px-6 py-2.5 rounded-xl font-bold text-sm overflow-hidden transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #ff9500 0%, #ff6b00 100%)',
                boxShadow: '0 4px 20px rgba(255, 149, 0, 0.4), 0 0 40px rgba(255, 149, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
                color: '#fff',
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Zap size={16} />
                Play Now
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            </motion.button>
          </motion.div>

          {/* Trust Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center justify-center gap-4 mt-4 text-[10px] text-white/50"
          >
            <div className="flex items-center gap-1">
              <Sparkles size={10} className="text-[var(--casino-green)]" />
              <span>100% Secure</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1">
              <Sparkles size={10} className="text-[var(--casino-purple)]" />
              <span>24/7 Support</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-1">
              <Sparkles size={10} className="text-[var(--casino-orange)]" />
              <span>Instant Payouts</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
