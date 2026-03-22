import { motion } from 'framer-motion';
import { Lock, LogIn, Shield, Sparkles, Crown } from 'lucide-react';
import { useAuthModal } from '../context/AuthModalContext';

const LoginRequired = ({ title = 'Login Required', message = 'Please login to access this page' }) => {
  const { openLogin, openSignup } = useAuthModal();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        {/* Glow Effect */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-3xl rounded-full" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="relative w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/30"
          >
            <Lock size={40} className="text-white" />
          </motion.div>
        </div>

        {/* Icon Decoration */}
        <div className="flex justify-center gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <Crown size={24} className="text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30"
          >
            <Shield size={24} className="text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30"
          >
            <Sparkles size={24} className="text-white" />
          </motion.div>
        </div>

        {/* Content */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-white mb-3"
        >
          {title}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-sm sm:text-base text-gray-400 mb-8"
        >
          {message}
        </motion.p>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 mb-8"
        >
          {[
            { icon: Crown, label: 'Premium Games', color: 'from-amber-500 to-orange-600' },
            { icon: Shield, label: 'Secure Wallet', color: 'from-emerald-500 to-teal-600' },
            { icon: Sparkles, label: 'Daily Bonuses', color: 'from-pink-500 to-rose-600' },
          ].map((benefit, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10">
              <div className={`w-8 h-8 mx-auto mb-2 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center`}>
                <benefit.icon size={16} className="text-white" />
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400">{benefit.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <motion.button
            onClick={openLogin}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white font-bold text-sm sm:text-base shadow-xl shadow-purple-500/30 flex items-center justify-center gap-2 transition-all hover:shadow-2xl hover:shadow-purple-500/40"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogIn size={18} />
            Sign In
          </motion.button>
          <motion.button
            onClick={openSignup}
            className="px-8 py-4 rounded-2xl bg-white/10 border border-white/20 text-white font-bold text-sm sm:text-base hover:bg-white/20 transition-all flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={18} />
            Create Account
          </motion.button>
        </motion.div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ delay: 0.5 + i * 0.1, duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginRequired;
