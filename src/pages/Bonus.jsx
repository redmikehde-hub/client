import { useState } from 'react';
import { Gift, Sparkles, Check, Loader2, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { coinBonusService } from '../services/api';
import toast from 'react-hot-toast';

const Bonus = () => {
  const { user, fetchUser } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <div className="mb-8">
          <div className="h-10 w-40 rounded-lg skeleton mb-2" />
          <div className="h-5 w-48 rounded skeleton" />
        </div>

        <div className="rounded-3xl skeleton skeleton-card p-8 mb-6">
          <div className="h-4 w-32 rounded skeleton mb-4" />
          <div className="h-14 rounded-xl skeleton mb-4" />
          <div className="h-12 rounded-xl skeleton" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card p-4">
              <div className="h-5 w-20 rounded skeleton mb-2" />
              <div className="h-8 w-full rounded skeleton mb-2" />
              <div className="h-3 w-24 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!code.trim()) {
      toast.error('Please enter a bonus code');
      return;
    }

    setLoading(true);
    try {
      const response = await coinBonusService.apply(code.trim());
      toast.success(`+${response.data.coinsAwarded} coins added!`);
      setCode('');
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Invalid or expired bonus code');
    } finally {
      setLoading(false);
    }
  };

  const sampleCodes = [
    { code: 'WELCOME50', coins: 50, desc: 'New player bonus' },
    { code: 'PLAY100', coins: 100, desc: 'Play & win bonus' },
    { code: 'LUCKY200', coins: 200, desc: 'Lucky draw bonus' },
    { code: 'VIP500', coins: 500, desc: 'VIP exclusive' },
    { code: 'FESTIVE1000', coins: 1000, desc: 'Festival special' }
  ];

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-black mb-2">Bonus Codes</h1>
        <p className="text-text-muted">Enter a code to claim free coins</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-6 mb-8 bg-gradient-to-br from-[var(--casino-green)]/10 via-[var(--casino-orange)]/10 to-[var(--casino-purple)]/10 border border-[var(--casino-green)]/20"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--casino-green)]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[var(--casino-orange)]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-orange)] flex items-center justify-center shadow-lg shadow-[var(--casino-green)]/30">
              <Gift className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Claim Your Bonus</h2>
              <p className="text-sm text-text-muted">Enter a bonus code below</p>
            </div>
          </div>

          <form onSubmit={handleApply}>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Enter bonus code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="flex-1 py-4 px-4 bg-black/30 border-2 border-white/10 rounded-xl text-white font-bold uppercase tracking-wider text-center focus:outline-none focus:border-[var(--casino-green)] transition-all"
                disabled={loading}
              />
              <motion.button
                type="submit"
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-orange)] text-white font-bold flex items-center gap-2 shadow-lg shadow-[var(--casino-green)]/30 disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
                disabled={loading || !code.trim()}
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Claim <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Sparkles className="text-warning" size={20} />
          Available Codes
        </h3>
        <div className="grid gap-3">
          {sampleCodes.map((item) => (
            <div
              key={item.code}
              className="p-4 rounded-2xl bg-bg-card-hover border border-white/5 flex items-center justify-between"
            >
              <div>
                <p className="font-bold text-[var(--casino-green)]">{item.code}</p>
                <p className="text-sm text-text-muted">{item.desc}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-success">+{item.coins}</p>
                <p className="text-xs text-text-muted">coins</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Shield className="text-emerald-400" size={18} />
          How to Use
        </h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>1. Copy a bonus code from above</p>
          <p>2. Paste it in the input field</p>
          <p>3. Click "Claim" to add coins</p>
          <p>4. Each code can only be used once</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Bonus;
