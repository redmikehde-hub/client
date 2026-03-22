import { useState, useEffect } from 'react';
import { Users, Search, Eye, RefreshCw, ChevronLeft, ChevronRight, Filter, DollarSign, Gamepad2, Trophy, Calendar, Mail, Phone, X, Loader2, Ban, Trash2, Edit2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [page, filter]);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (search) searchUsers();
      else fetchUsers();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (filter !== 'all') params.role = filter;
      const response = await userService.getAllUsers(params);
      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (search.length < 2) {
      fetchUsers();
      return;
    }
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ search: search, page: 1, limit: 50 });
      setUsers(response.data.users || []);
      setTotalPages(1);
      setTotalUsers(response.data.total || 0);
    } catch (error) {
      console.error('Failed to search users:', error);
      toast.error('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const getRoleBadge = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">Super Admin</span>;
      case 'SUB_ADMIN':
        return <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400">Sub Admin</span>;
      default:
        return <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400">User</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Users Management</h1>
          <p className="text-sm text-gray-400">{totalUsers} total users</p>
        </div>
        <motion.button
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all self-start disabled:opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            className="w-full py-3 pl-11 pr-4 bg-gray-800/50 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
          {['all', 'USER', 'SUB_ADMIN', 'SUPER_ADMIN'].map((f) => (
            <motion.button
              key={f}
              className={`px-4 py-2 rounded-xl font-medium text-xs whitespace-nowrap transition-all ${
                filter === f 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/20' 
                  : 'bg-gray-800/50 text-gray-400 border border-white/10 hover:bg-gray-700/50'
              }`}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setFilter(f); setPage(1); }}
            >
              {f === 'all' ? 'All' : f.replace('_', ' ')}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card skeleton-glow p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl skeleton skeleton-avatar" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded skeleton mb-2" />
                  <div className="h-3 w-32 rounded skeleton" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-12 rounded-lg skeleton" />
                <div className="h-12 rounded-lg skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-20 rounded-2xl bg-gray-800/30 border border-white/5">
          <Users size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Users Found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search or filter</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u, index) => (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 p-4 hover:border-amber-500/30 transition-all cursor-pointer group"
                onClick={() => setSelectedUser(u)}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-lg text-white shrink-0">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{u.name}</h3>
                    </div>
                    {getRoleBadge(u.role)}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-3 truncate">{u.email}</div>

                <div className="grid grid-cols-2 gap-2 mb-3">
                  <div className="p-2 bg-black/20 rounded-lg text-center">
                    <div className="text-sm font-bold text-emerald-400">{formatCurrency(u.balance)}</div>
                    <div className="text-[10px] text-gray-500">Balance</div>
                  </div>
                  <div className="p-2 bg-black/20 rounded-lg text-center">
                    <div className="text-sm font-bold text-white">{u.gamesPlayed || 0}</div>
                    <div className="text-[10px] text-gray-500">Games</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-500">Joined {formatDate(u.createdAt)}</span>
                  <Eye size={14} className="text-gray-500 group-hover:text-amber-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <motion.button
                className="p-2 rounded-xl bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={18} />
              </motion.button>
              <span className="px-4 py-2 text-sm text-gray-400">
                Page {page} of {totalPages}
              </span>
              <motion.button
                className="p-2 rounded-xl bg-gray-800/50 border border-white/10 text-gray-400 hover:text-white disabled:opacity-50"
                whileTap={{ scale: 0.95 }}
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={18} />
              </motion.button>
            </div>
          )}
        </>
      )}

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white">User Details</h2>
                <button onClick={() => setSelectedUser(null)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <div className="text-center mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-3xl mx-auto mb-3">
                  {selectedUser.name?.charAt(0).toUpperCase()}
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{selectedUser.name}</h3>
                {getRoleBadge(selectedUser.role)}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-black/20 rounded-xl text-center">
                  <DollarSign size={18} className="text-emerald-400 mx-auto mb-1" />
                  <div className="font-bold text-emerald-400">{formatCurrency(selectedUser.balance)}</div>
                  <div className="text-[10px] text-gray-500">Balance</div>
                </div>
                <div className="p-3 bg-black/20 rounded-xl text-center">
                  <Trophy size={18} className="text-yellow-400 mx-auto mb-1" />
                  <div className="font-bold text-yellow-400">{formatCurrency(selectedUser.totalWinnings || 0)}</div>
                  <div className="text-[10px] text-gray-500">Winnings</div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                  <Mail size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-300">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                    <Phone size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{selectedUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-3 p-3 bg-black/20 rounded-xl">
                  <Calendar size={16} className="text-gray-500" />
                  <span className="text-sm text-gray-300">Joined {formatDate(selectedUser.createdAt)}</span>
                </div>
              </div>

              <motion.button
                className="w-full py-3 rounded-xl bg-white/5 text-gray-400 font-medium text-sm hover:bg-white/10 transition-all"
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedUser(null)}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminUsers;
