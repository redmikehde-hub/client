import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, ArrowUpRight, ArrowDownLeft, Clock, Sparkles,
  ChevronRight, CreditCard, Banknote, TrendingUp, Gift, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { walletService } from '../services/api';
import { TransactionSkeleton } from '../components/premium';

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
      return { icon: ArrowDownLeft, bg: 'bg-[var(--casino-green)]/20', color: 'text-[var(--casino-green)]' };
    }
    if (type === 'WITHDRAWAL') {
      return { icon: ArrowUpRight, bg: 'bg-[var(--casino-red)]/20', color: 'text-[var(--casino-red)]' };
    }
    if (type === 'BONUS' || type === 'REFERRAL_BONUS') {
      return { icon: Gift, bg: 'bg-[var(--casino-orange)]/20', color: 'text-[var(--casino-orange)]' };
    }
    return { icon: CreditCard, bg: 'bg-[var(--casino-blue)]/20', color: 'text-[var(--casino-blue)]' };
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 pb-20 lg:pb-6">
      {/* Balance Card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-dark-3)] via-[var(--casino-dark)] to-[var(--casino-dark-3)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--casino-dark)]/90 via-[var(--casino-dark)]/50 to-transparent" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--casino-green)]/50 to-transparent" />
        
        <div className="relative p-6 sm:p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[var(--casino-green)] to-emerald-600 flex items-center justify-center shadow-xl shadow-green-500/30">
            <Wallet size={32} className="text-black" />
          </div>
          
          <p className="text-sm text-gray-400 mb-2">Available Balance</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
            {formatCurrency(user?.balance)}
          </h2>
          
          <div className="grid grid-cols-2 gap-3">
            <motion.button
              onClick={() => navigate('/dashboard/deposit')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black font-bold shadow-lg shadow-green-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <ArrowDownLeft size={20} />
              Add Money
            </motion.button>
            <motion.button
              onClick={() => navigate('/dashboard/withdraw')}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-[var(--casino-purple)] to-[var(--casino-blue)] text-white font-bold shadow-lg shadow-purple-500/30"
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
          { label: 'Buy Coins', icon: Banknote, path: '/dashboard/deposit', color: 'var(--casino-green)' },
          { label: 'Bonus', icon: Gift, path: '/dashboard/bonus', color: 'var(--casino-orange)' },
          { label: 'Refer & Earn', icon: TrendingUp, path: '/dashboard/referral', color: 'var(--casino-purple)' },
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
              style={{ backgroundColor: `${action.color}20` }}
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
            <span className="p-2 bg-gradient-to-br from-[var(--casino-green)]/20 to-[var(--casino-purple)]/20 rounded-xl">
              <Clock size={20} className="text-[var(--casino-green)]" />
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
                  ? 'bg-[var(--casino-green)]/20 text-[var(--casino-green)] border border-[var(--casino-green)]/40'
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
              <TransactionSkeleton key={i} />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center py-12 rounded-2xl bg-white/5 border border-white/10">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--casino-green)]/10 flex items-center justify-center">
              <AlertCircle size={32} className="text-[var(--casino-green)]/50" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Transactions Yet</h3>
            <p className="text-sm text-gray-400 mb-4">Your transaction history will appear here</p>
            <button
              onClick={() => navigate('/dashboard/deposit')}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black font-semibold text-sm"
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
                  <div className={`font-bold text-base ${tx.amount > 0 ? 'text-[var(--casino-green)]' : 'text-[var(--casino-red)]'}`}>
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
