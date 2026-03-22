import { useState, useEffect } from 'react';
import { Users, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, XCircle, RefreshCw, DollarSign, Gamepad2, Trophy, BarChart3, Eye, Ban, CheckCheck, TrendingDown, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminService, withdrawService, userService } from '../services/api';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentWithdrawals, setRecentWithdrawals] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, withdrawRes, usersRes] = await Promise.all([
        adminService.getStats(),
        withdrawService.getAllRequests({ page: 1, limit: 5, status: 'PENDING' }),
        userService.getAllUsers({ page: 1, limit: 5 })
      ]);
      setStats(statsRes.data);
      setRecentWithdrawals(withdrawRes.data.requests || []);
      setRecentUsers(usersRes.data.users || []);
    } catch (error) {
      console.error('Failed to fetch admin data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawAction = async (id, action) => {
    setProcessing(id);
    try {
      await withdrawService.updateRequest(id, { status: action.toUpperCase() });
      toast.success(`Request ${action}ed successfully`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#6366f1', bg: 'from-blue-500/20 to-indigo-500/20', textColor: 'text-blue-400' },
    { label: 'Pending Withdrawals', value: stats?.pendingWithdrawals || 0, icon: Clock, color: '#f59e0b', bg: 'from-amber-500/20 to-orange-500/20', textColor: 'text-amber-400' },
    { label: 'Approved Today', value: stats?.totalWithdrawals || 0, icon: CheckCircle, color: '#10b981', bg: 'from-emerald-500/20 to-green-500/20', textColor: 'text-emerald-400' },
    { label: 'Total Withdrawn', value: formatCurrency(stats?.totalWithdrawalAmount || 0), icon: DollarSign, color: '#ef4444', bg: 'from-red-500/20 to-pink-500/20', textColor: 'text-red-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
        </div>
        <motion.button
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 p-4 sm:p-5 group hover:border-amber-500/30 transition-all"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
            <div className="relative z-10">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${stat.bg} flex items-center justify-center mb-3 sm:mb-4`}>
                <stat.icon size={20} className={stat.textColor} />
              </div>
              <div className={`text-xl sm:text-2xl font-bold ${stat.textColor} mb-1`}>{stat.value}</div>
              <div className="text-xs sm:text-sm text-gray-400">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Pending Withdrawals */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Clock size={18} className="text-amber-400" />
              </div>
              <h2 className="font-semibold text-white">Pending Withdrawals</h2>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-xs font-bold">
              {recentWithdrawals.length} pending
            </span>
          </div>

          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {recentWithdrawals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle size={32} className="text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No pending withdrawals</p>
              </div>
            ) : (
              recentWithdrawals.map((withdrawal) => (
                <motion.div
                  key={withdrawal.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-sm">
                        {withdrawal.user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-white">{withdrawal.user?.name || 'User'}</div>
                        <div className="text-xs text-gray-500">{withdrawal.user?.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-400">{formatCurrency(withdrawal.amount)}</div>
                      <div className="text-[10px] text-gray-500">{formatDate(withdrawal.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                      whileTap={{ scale: 0.98 }}
                      disabled={processing === withdrawal.id}
                      onClick={() => handleWithdrawAction(withdrawal.id, 'approved')}
                    >
                      {processing === withdrawal.id ? <RefreshCw size={12} className="animate-spin" /> : <CheckCheck size={12} />}
                      Approve
                    </motion.button>
                    <motion.button
                      className="flex-1 py-2 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-red-500/30 transition-all"
                      whileTap={{ scale: 0.98 }}
                      disabled={processing === withdrawal.id}
                      onClick={() => handleWithdrawAction(withdrawal.id, 'rejected')}
                    >
                      <XCircle size={12} />
                      Reject
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Users size={18} className="text-blue-400" />
              </div>
              <h2 className="font-semibold text-white">Recent Users</h2>
            </div>
          </div>

          <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
            {recentUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users size={32} className="text-gray-600 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No users found</p>
              </div>
            ) : (
              recentUsers.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl bg-black/20 border border-white/5 hover:border-white/10 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-white">{u.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                          u.role === 'SUPER_ADMIN' ? 'bg-amber-500/20 text-amber-400' :
                          u.role === 'SUB_ADMIN' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {u.role?.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-emerald-400 text-sm">{formatCurrency(u.balance)}</div>
                    <div className="text-[10px] text-gray-500">{u.gamesPlayed || 0} games</div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 p-4 sm:p-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-3">
          <BarChart3 size={18} className="text-amber-400" />
          Platform Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Gamepad2, label: 'Games Played', value: user?.gamesPlayed || 0, color: 'text-purple-400' },
            { icon: Trophy, label: 'Games Won', value: user?.gamesWon || 0, color: 'text-yellow-400' },
            { icon: DollarSign, label: 'Total Winnings', value: formatCurrency(user?.totalWinnings || 0), color: 'text-emerald-400' },
            { icon: TrendingUp, label: 'Win Rate', value: `${user?.winRate || 0}%`, color: 'text-blue-400' }
          ].map((stat) => (
            <div key={stat.label} className="text-center p-3 rounded-xl bg-black/20">
              <stat.icon size={20} className={`mx-auto mb-2 ${stat.color}`} />
              <div className={`font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
