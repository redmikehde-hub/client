import { useState, useEffect } from 'react';
import { Coins, Gift, Check, Zap, Crown, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { depositPlanService } from '../services/api';
import toast from 'react-hot-toast';
import { SkeletonCard } from '../components/premium';

const Deposit = () => {
  const { user, fetchUser } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await depositPlanService.getPlans();
      setPlans(response.data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const purchasePlan = async (planId) => {
    setPurchasing(planId);
    try {
      const response = await depositPlanService.purchase(planId);
      toast.success(`Purchased ${response.data.planName}! +${response.data.totalCoins} coins added`);
      fetchUser();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const getIcon = (index) => {
    const icons = [Coins, Gift, Zap, Crown, Sparkles, ArrowRight];
    return icons[index % icons.length];
  };

  const getGradient = (index) => {
    const gradients = [
      'from-amber-500 to-orange-600',
      'from-emerald-500 to-teal-600',
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-rose-500 to-red-600',
      'from-cyan-500 to-blue-600'
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-black mb-2">Buy Coins</h1>
        <p className="text-text-muted">Choose a coin package that suits you best</p>
      </motion.div>

      <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/20 to-neon-purple/20 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-text-muted">Your Balance</p>
            <p className="text-2xl font-black flex items-center gap-2">
              <Coins className="text-warning" size={24} />
              {new Intl.NumberFormat('en-IN').format(user?.balance || 0)} coins
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-muted">₹1 = 1 Coin</p>
            <p className="text-sm text-success">Best Value!</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} hasButton />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {plans.map((plan, index) => {
            const Icon = getIcon(index);
            const gradient = getGradient(index);
            const isPopular = plan.isPopular;

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative rounded-3xl p-5 border transition-all duration-300 ${
                  isPopular 
                    ? 'bg-gradient-to-b from-primary/10 to-bg-card border-primary/30' 
                    : 'bg-bg-card-hover border-white/5 hover:border-white/10'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-neon-purple rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="text-white" size={24} />
                </div>

                <h3 className="text-lg font-bold mb-1">{plan.name}</h3>

                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-black">₹{plan.rupees}</span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="text-success" size={16} />
                    <span>{new Intl.NumberFormat('en-IN').format(plan.coins)} coins</span>
                  </div>
                  {plan.bonus > 0 && (
                    <div className="flex items-center gap-2 text-sm text-success">
                      <Gift className="text-success" size={16} />
                      <span>+{new Intl.NumberFormat('en-IN').format(plan.bonus)} bonus</span>
                    </div>
                  )}
                </div>

                <div className="text-xs text-text-muted mb-4">
                  Total: {new Intl.NumberFormat('en-IN').format(plan.coins + plan.bonus)} coins
                </div>

                <motion.button
                  className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    isPopular
                      ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => purchasePlan(plan.id)}
                  disabled={purchasing === plan.id}
                >
                  {purchasing === plan.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Buy Now <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="text-warning" size={18} />
          Why Buy Coins?
        </h3>
        <div className="space-y-2 text-sm text-text-muted">
          <p>• Play exciting games and win more coins</p>
          <p>• Unlock premium features and tournaments</p>
          <p>• Climb the leaderboard and earn rewards</p>
          <p>• Instant delivery to your wallet</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Deposit;
