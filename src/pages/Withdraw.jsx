import { useState, useEffect } from 'react';
import { ArrowUpRight, Clock, Check, X, History, Wallet, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { withdrawService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Withdraw = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('request');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (activeTab === 'history') fetchRequests();
  }, [activeTab, page]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await withdrawService.getMyRequests({ page, limit: 10 });
      setRequests(response.data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) { toast.error('Please enter a valid amount'); return; }
    if (parseFloat(amount) > user?.balance) { toast.error('Insufficient balance'); return; }
    if (parseFloat(amount) < 500) { toast.error('Minimum withdrawal is ₹500'); return; }
    setLoading(true);
    try {
      await withdrawService.request({ amount: parseFloat(amount), remark: remark || undefined });
      toast.success('Withdrawal request submitted successfully!');
      setAmount('');
      setRemark('');
      setActiveTab('history');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Withdrawal failed');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const getStatusBadge = (status) => {
    const styles = { 
      PENDING: { bg: 'bg-warning/20', color: 'text-warning', text: 'Pending' }, 
      APPROVED: { bg: 'bg-success/20', color: 'text-success', text: 'Approved' }, 
      REJECTED: { bg: 'bg-danger/20', color: 'text-danger', text: 'Rejected' } 
    };
    const style = styles[status] || styles.PENDING;
    return (
      <span className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${style.bg} ${style.color}`}>
        {style.text}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    switch (status) { 
      case 'PENDING': return <Clock size={20} className="text-warning" />; 
      case 'APPROVED': return <Check size={20} className="text-success" />; 
      case 'REJECTED': return <X size={20} className="text-danger" />; 
      default: return <Clock size={20} />; 
    }
  };

  const quickAmounts = [500, 1000, 2000, 5000];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (!user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="mb-6 sm:mb-7">
          <div className="h-10 w-32 rounded-lg skeleton mb-2" />
          <div className="h-5 w-40 rounded skeleton" />
        </div>

        <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 skeleton skeleton-card mb-6">
          <div className="h-10 w-32 rounded skeleton mb-3" />
          <div className="h-14 w-48 rounded-lg skeleton mb-3" />
          <div className="flex gap-6">
            <div className="h-4 w-16 rounded skeleton" />
            <div className="h-4 w-20 rounded skeleton" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl skeleton skeleton-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl skeleton" />
              <div className="flex-1">
                <div className="h-4 w-32 rounded skeleton mb-1" />
                <div className="h-3 w-24 rounded skeleton" />
              </div>
              <div className="h-5 w-20 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between mb-6 sm:mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Withdraw</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Cash out your winnings</p>
        </div>
      </div>

      <motion.div 
        variants={itemVariants} 
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-success via-emerald-400 to-teal-300 shadow-xl shadow-success/40 mb-6"
      >
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={24} className="text-gold" />
            <p className="text-sm opacity-90 font-medium">Available Balance</p>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3">{formatCurrency(user?.balance)}</h2>
          <div className="flex gap-6 text-sm opacity-90">
            <span>Min: ₹500</span>
            <span>Max: ₹50,000</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2.5 mb-6 overflow-x-auto pb-1">
        <motion.button 
          className={`py-3 px-5 rounded-xl font-semibold text-sm whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-2 ${activeTab === 'request' ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10 hover:text-white'}`}
          onClick={() => setActiveTab('request')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowUpRight size={16} /> Request
        </motion.button>
        <motion.button 
          className={`py-3 px-5 rounded-xl font-semibold text-sm whitespace-nowrap cursor-pointer transition-all duration-300 flex items-center gap-2 ${activeTab === 'history' ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10 hover:text-white'}`}
          onClick={() => setActiveTab('history')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <History size={16} /> History
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'request' && (
          <motion.div
            key="request"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <motion.div variants={itemVariants} className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-5">
              <h3 className="font-bold mb-6 flex items-center gap-2.5">
                <Wallet size={22} className="text-primary" />
                Withdrawal Request
              </h3>
              <form onSubmit={handleWithdraw}>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Amount (₹)</label>
                  <input 
                    type="number" 
                    className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-xl font-bold transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="Enter amount" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    min="500" 
                    max="50000" 
                    required 
                  />
                </div>
                <div className="grid grid-cols-4 gap-2.5 mb-5">
                  {quickAmounts.map((amt) => (
                    <motion.button
                      key={amt}
                      type="button"
                      className="py-2.5 px-3 rounded-xl font-semibold text-sm cursor-pointer bg-transparent text-text-secondary border border-white/10 transition-all duration-300 hover:border-primary hover:text-primary"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(amt.toString())}
                    >
                      ₹{amt.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Remark (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full py-3.5 px-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="e.g., UPI withdrawal" 
                    value={remark} 
                    onChange={(e) => setRemark(e.target.value)} 
                  />
                </div>
                <div className="p-5 bg-warning/10 rounded-2xl mb-5 border-2 border-dashed border-warning">
                  <div className="flex items-start gap-3 mb-3">
                    <AlertCircle size={20} className="text-warning mt-0.5 shrink-0" />
                    <h4 className="font-semibold text-warning mb-2">Important Information</h4>
                  </div>
                  <ul className="text-sm text-text-secondary pl-4 space-y-1.5">
                    <li>Minimum withdrawal: ₹500</li>
                    <li>Maximum withdrawal: ₹50,000 per day</li>
                    <li>Processing time: 24-48 hours</li>
                    <li>Withdrawals processed on weekdays only</li>
                  </ul>
                </div>
                <motion.button 
                  type="submit" 
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-base cursor-pointer bg-gradient-to-r from-success to-emerald-400 text-white shadow-lg shadow-success/40 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
                  disabled={loading || parseFloat(amount) < 500}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><ArrowUpRight size={20} /> Withdraw {amount && `₹${parseFloat(amount).toLocaleString()}`}</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-12 h-12 border-3 border-primary/10 border-t-primary rounded-full animate-spin" />
              </div>
            ) : requests.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-card border border-white/5 flex items-center justify-center">
                  <History size={40} className="text-text-muted" />
                </div>
                <h3 className="text-xl font-bold mb-2">No Requests</h3>
                <p className="text-sm text-text-muted">Your withdrawal history will appear here</p>
              </div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible">
                {requests.map((request, index) => (
                  <motion.div
                    key={request.id}
                    variants={itemVariants}
                    className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-5 mb-4 transition-all duration-300 hover:-translate-y-1"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                      <div>
                        <h3 className="text-2xl font-extrabold text-danger mb-1.5">
                          -{formatCurrency(request.amount)}
                        </h3>
                        {request.remark && (
                          <p className="text-sm text-text-muted">{request.remark}</p>
                        )}
                      </div>
                      {getStatusBadge(request.status)}
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3 bg-bg-dark rounded-xl text-sm">
                      <div className="flex items-center gap-2.5 text-text-muted">
                        {getStatusIcon(request.status)}
                        <span>{new Date(request.createdAt).toLocaleString()}</span>
                      </div>
                      {request.processedAt && (
                        <span className="text-text-muted">
                          Processed: {new Date(request.processedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {request.adminRemark && (
                      <div className="mt-4 p-4 bg-primary/10 rounded-xl text-sm text-text-secondary border border-primary/20">
                        <strong>Admin note:</strong> {request.adminRemark}
                      </div>
                    )}
                  </motion.div>
                ))}
                {requests.length >= 10 && (
                  <motion.div 
                    className="flex justify-center mt-5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <motion.button 
                      className="py-2.5 px-5 rounded-xl font-semibold text-sm cursor-pointer bg-transparent text-text-secondary border border-white/10 transition-all duration-300 flex items-center gap-2 hover:bg-white/5 hover:text-white hover:border-primary/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setPage(page + 1)}
                    >
                      Load More <ChevronRight size={18} />
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Withdraw;
