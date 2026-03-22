import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, Sparkles,
  ChevronRight, CreditCard, Banknote, TrendingUp, Gift, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/api';

const WalletPage = () => {
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await walletService.getTransactions(1, 50);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (activeTab === 'all') return true;
    if (activeTab === 'deposit') return tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN';
    if (activeTab === 'withdraw') return tx.type === 'WITHDRAWAL';
    return true;
  });

  const getTransactionIcon = (type) => {
    if (type === 'DEPOSIT' || type === 'GAME_WIN') {
      return { icon: ArrowDownLeft, bg: 'bg-emerald-500/20', color: 'text-emerald-400' };
    }
    if (type === 'WITHDRAWAL') {
      return { icon: ArrowUpRight, bg: 'bg-red-500/20', color: 'text-red-400' };
    }
    if (type === 'BONUS' || type === 'REFERRAL_BONUS') {
      return { icon: Gift, bg: 'bg-amber-500/20', color: 'text-amber-400' };
    }
    return { icon: CreditCard, bg: 'bg-blue-500/20', color: 'text-blue-400' };
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-950/80 to-slate-900" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
        
        <div className="relative p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-xl shadow-pink-500/30">
            <Wallet size={32} className="text-white" />
          </div>
          
          <p className="text-sm text-gray-400 mb-2">Available Balance</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            {formatCurrency(user?.balance)}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => navigate('/dashboard/deposit')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownLeft size={20} />
              Add Money
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard/withdraw')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-lg"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowUpRight size={20} />
              Withdraw
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Buy Coins', icon: Banknote, path: '/dashboard/deposit', color: '#10b981' },
          { label: 'Bonus', icon: Gift, path: '/dashboard/bonus', color: '#f59e0b' },
          { label: 'Refer & Earn', icon: TrendingUp, path: '/dashboard/referral', color: '#ec4899' },
        ].map((action) => (
          <motion.button
            key={action.label}
            onClick={() => navigate(action.path)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${action.color}15` }}
            >
              <action.icon size={20} style={{ color: action.color }} />
            </div>
            <span className="text-xs font-medium text-gray-300">{action.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Transactions */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-3">
            <span className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl">
              <Clock size={20} className="text-blue-400" />
            </span>
            Transactions
          </h2>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'deposit', label: 'Deposits & Wins' },
            { key: 'withdraw', label: 'Withdrawals' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-pink-500/20 text-pink-400 border border-pink-500/40'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="rounded-2xl skeleton h-20" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <AlertCircle size={32} className="text-blue-400/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Transactions Yet</h3>
            <p className="text-sm text-gray-400 mb-4">Your transaction history will appear here</p>
            <button
              onClick={() => navigate('/dashboard/deposit')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold text-sm"
            >
              Add Money
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map((tx, index) => {
              const { icon: Icon, bg, color } = getTransactionIcon(tx.type);
              return (
                <motion.div
                  key={tx.id || index}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ x: 4 }}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg}`}>
                    <Icon size={24} className={color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white capitalize">
                      {tx.type?.replace(/_/g, ' ')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className={`font-bold text-base ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default WalletPage;
