import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Gamepad2, Wallet, Trophy, 
  X, Sparkles, ArrowRight, Zap, 
  Star, ChevronRight, Shield, Clock
} from 'lucide-react';

const WelcomePopup = ({ onClose, onExplore }) => {
  const benefits = [
    { 
      icon: Gift, 
      title: 'Welcome Bonus', 
      desc: 'Get ₹50 free on signup!',
      color: 'from-pink-500 to-rose-500'
    },
    { 
      icon: Gamepad2, 
      title: 'Exciting Games', 
      desc: 'Play Ludo, Teen Patti & more!',
      color: 'from-purple-500 to-indigo-500'
    },
    { 
      icon: Wallet, 
      title: 'Instant Withdrawals', 
      desc: 'Withdraw winnings instantly',
      color: 'from-emerald-500 to-green-500'
    },
    { 
      icon: Trophy, 
      title: 'Daily Rewards', 
      desc: 'Login daily for bonuses!',
      color: 'from-amber-500 to-orange-500'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-purple-500/20"
      >
        {/* Glow Effects */}
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-gradient-to-br from-pink-500/30 to-purple-500/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all z-10"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="relative pt-8 pb-6 px-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center shadow-xl shadow-purple-500/40"
          >
            <Sparkles className="text-white w-10 h-10" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl sm:text-3xl font-bold text-white mb-2"
          >
            Welcome to{' '}
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
              IndiaPlay
            </span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-gray-400"
          >
            Join millions of players winning real cash daily!
          </motion.p>
        </div>

        {/* Benefits Grid */}
        <div className="px-6 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl border border-white/5 group-hover:border-white/10 transition-all" />
                <div className="relative p-4 rounded-2xl">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <benefit.icon className="text-white w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-1">{benefit.title}</h3>
                  <p className="text-xs text-gray-400">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Premium Badge */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center gap-2 py-2 px-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-500/20">
            <Star className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Premium Gaming Experience</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2"
            >
              Stay Home
            </button>
            <motion.button
              onClick={onExplore}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2"
            >
              Explore Games
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-center gap-4 text-gray-500">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-[10px]">Secure</span>
            </div>
            <div className="w-px h-3 bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              <span className="text-[10px]">Fast Payouts</span>
            </div>
            <div className="w-px h-3 bg-gray-600" />
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px]">24/7 Support</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WelcomePopup;
