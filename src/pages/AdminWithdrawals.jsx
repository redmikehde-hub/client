import { useState, useEffect } from 'react';
import { Wallet, Clock, CheckCircle, XCircle, RefreshCw, Search, Filter, DollarSign, User, Calendar, ChevronLeft, ChevronRight, CheckCheck, X, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { withdrawService } from '../services/api';
import toast from 'react-hot-toast';

const AdminWithdrawals = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [remark, setRemark] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [page, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filter !== 'all') params.status = filter;
      const response = await withdrawService.getAllRequests(params);
      setRequests(response.data.requests || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Failed to fetch withdrawals:', error);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, reqRemark = '') => {
    setProcessing(id);
    try {
      await withdrawService.updateRequest(id, { 
        status: action.toUpperCase(),
        remark: reqRemark || undefined
      });
      toast.success(`Request ${action}ed successfully`);
      setSelectedRequest(null);
      setRemark('');
      fetchRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || `Failed to ${action} request`);
    } finally {
      setProcessing(null);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);
  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-amber-500/20 text-amber-400 flex items-center gap-1.5"><Clock size={12} /> Pending</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-emerald-500/20 text-emerald-400 flex items-center gap-1.5"><CheckCircle size={12} /> Approved</span>;
      case 'REJECTED':
        return <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-red-500/20 text-red-400 flex items-center gap-1.5"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase bg-gray-500/20 text-gray-400">{status}</span>;
    }
  };

  const stats = {
    pending: requests.filter(r => r.status === 'PENDING').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Withdraw Requests</h1>
          <p className="text-sm text-gray-400">{requests.length} requests</p>
        </div>
        <motion.button
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchRequests}
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pending', value: stats.pending, color: 'amber', icon: Clock, bg: 'from-amber-500/20 to-orange-500/20' },
          { label: 'Approved', value: stats.approved, color: 'emerald', icon: CheckCircle, bg: 'from-emerald-500/20 to-green-500/20' },
          { label: 'Rejected', value: stats.rejected, color: 'red', icon: XCircle, bg: 'from-red-500/20 to-pink-500/20' },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.bg} border border-white/10 p-3 text-center`}>
            <stat.icon size={18} className={`mx-auto mb-1 text-${stat.color}-400`} />
            <div className={`text-xl font-bold text-${stat.color}-400`}>{stat.value}</div>
            <div className="text-xs text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['all', 'PENDING', 'APPROVED', 'REJECTED'].map((f) => (
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
            {f === 'all' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
          </motion.button>
        ))}
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl skeleton skeleton-card skeleton-glow p-4">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 rounded skeleton" />
                <div className="h-4 w-20 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-gray-800/30 border border-white/5">
          <Wallet size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Withdrawal Requests</h3>
          <p className="text-sm text-gray-400">No {filter === 'all' ? '' : filter.toLowerCase()} requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request, index) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 p-4 hover:border-amber-500/30 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-lg text-white shrink-0">
                    {request.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{request.user?.name || 'User'}</div>
                    <div className="text-xs text-gray-500">{request.user?.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xl font-bold text-red-400">{formatCurrency(request.amount)}</div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1 justify-end">
                      <Calendar size={10} />
                      {formatDate(request.createdAt)}
                    </div>
                  </div>

                  {getStatusBadge(request.status)}

                  {request.status === 'PENDING' && (
                    <div className="flex gap-2">
                      <motion.button
                        className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                        whileTap={{ scale: 0.95 }}
                        disabled={processing === request.id}
                        onClick={() => { setSelectedRequest(request); }}
                      >
                        {processing === request.id ? <RefreshCw size={16} className="animate-spin" /> : <CheckCheck size={16} />}
                      </motion.button>
                      <motion.button
                        className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                        whileTap={{ scale: 0.95 }}
                        disabled={processing === request.id}
                        onClick={() => handleAction(request.id, 'rejected')}
                      >
                        <X size={16} />
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>

              {request.remark && (
                <div className="mt-3 p-2 bg-black/20 rounded-lg border-l-2 border-amber-500">
                  <div className="text-[10px] text-gray-500">Remark:</div>
                  <div className="text-xs text-gray-300">{request.remark}</div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

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

      {/* Approve Modal */}
      <AnimatePresence>
        {selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRequest(null)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCheck size={32} className="text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Approve Withdrawal</h2>
                <p className="text-sm text-gray-400">Review the request details</p>
              </div>

              <div className="p-4 bg-black/20 rounded-xl mb-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold">
                    {selectedRequest.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{selectedRequest.user?.name}</div>
                    <div className="text-xs text-gray-500">{selectedRequest.user?.email}</div>
                  </div>
                </div>
                <div className="text-center py-3 border-t border-white/10">
                  <div className="text-xs text-gray-500 mb-1">Withdrawal Amount</div>
                  <div className="text-3xl font-black text-red-400">{formatCurrency(selectedRequest.amount)}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-400 mb-2">Remark (Optional)</label>
                <textarea
                  className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500/50 resize-none text-sm"
                  rows={2}
                  placeholder="Add a remark..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                  disabled={processing === selectedRequest.id}
                  onClick={() => handleAction(selectedRequest.id, 'approved', remark)}
                >
                  {processing === selectedRequest.id ? <RefreshCw size={16} className="animate-spin" /> : <><Check size={16} /> Approve</>}
                </motion.button>
                <motion.button
                  className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 text-gray-400 border border-white/10 transition-all"
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedRequest(null)}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminWithdrawals;
