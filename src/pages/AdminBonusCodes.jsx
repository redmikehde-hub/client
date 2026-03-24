import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Plus, Edit2, Trash2, Calendar, Percent, Coins, X, Check, Loader2, Clock, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { coinBonusService } from '../services/api';
import toast from 'react-hot-toast';

const AdminBonusCodes = () => {
  const [codes, setCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCode, setEditingCode] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    coinAmount: '',
    discountPercent: '',
    description: '',
    maxUses: '',
    minDeposit: '',
    startsAt: '',
    expiresAt: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const response = await coinBonusService.getAll();
      setCodes(response.data.codes || []);
    } catch (error) {
      toast.error('Failed to fetch bonus codes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = {
        ...formData,
        coinAmount: parseFloat(formData.coinAmount) || 0,
        discountPercent: parseFloat(formData.discountPercent) || 0,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        minDeposit: formData.minDeposit ? parseFloat(formData.minDeposit) : null
      };

      if (editingCode) {
        await coinBonusService.update(editingCode.id, data);
        toast.success('Bonus code updated successfully');
      } else {
        await coinBonusService.create(data);
        toast.success('Bonus code created successfully');
      }

      setShowModal(false);
      setEditingCode(null);
      resetForm();
      fetchCodes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save bonus code');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (code) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      coinAmount: code.coinAmount.toString(),
      discountPercent: code.discountPercent?.toString() || '0',
      description: code.description || '',
      maxUses: code.maxUses?.toString() || '',
      minDeposit: code.minDeposit?.toString() || '',
      startsAt: code.startsAt ? code.startsAt.split('T')[0] : '',
      expiresAt: code.expiresAt ? code.expiresAt.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this bonus code?')) return;

    try {
      await coinBonusService.delete(id);
      toast.success('Bonus code deleted');
      fetchCodes();
    } catch (error) {
      toast.error('Failed to delete bonus code');
    }
  };

  const handleToggleActive = async (code) => {
    try {
      await coinBonusService.update(code.id, { isActive: !code.isActive });
      toast.success(`Bonus code ${code.isActive ? 'deactivated' : 'activated'}`);
      fetchCodes();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      coinAmount: '',
      discountPercent: '',
      description: '',
      maxUses: '',
      minDeposit: '',
      startsAt: '',
      expiresAt: ''
    });
  };

  const formatDate = (date) => {
    if (!date) return 'No expiry';
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const isExpired = (code) => {
    if (!code.expiresAt) return false;
    return new Date() > new Date(code.expiresAt);
  };

  const isUpcoming = (code) => {
    if (!code.startsAt) return false;
    return new Date() < new Date(code.startsAt);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-black text-white">Bonus Codes</h1>
          <p className="text-sm text-gray-400">Create and manage bonus codes</p>
        </div>
        <motion.button
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setEditingCode(null);
            resetForm();
            setShowModal(true);
          }}
        >
          <Plus size={18} /> Create Code
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--casino-green)]" />
        </div>
      ) : (
        <div className="bg-gray-900/50 border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Code</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Coins</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Discount</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Min Deposit</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Starts</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Expires</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Uses</th>
                  <th className="text-left p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Status</th>
                  <th className="text-right p-4 text-xs font-bold text-[var(--casino-green)] uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((code) => (
                  <tr key={code.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className="font-bold text-amber-400 text-lg">{code.code}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Coins className="text-yellow-500" size={16} />
                        <span className="font-bold">{code.coinAmount}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {code.discountPercent > 0 ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-bold">
                          +{code.discountPercent}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {code.minDeposit ? (
                        <span className="text-gray-300">₹{code.minDeposit}</span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        {code.startsAt ? (
                          <>
                            <Clock size={14} className="text-gray-400" />
                            <span className={isUpcoming(code) ? 'text-blue-400' : 'text-gray-300'}>
                              {formatDate(code.startsAt)}
                            </span>
                          </>
                        ) : (
                          <span className="text-gray-500">Now</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={14} className="text-gray-400" />
                        <span className={isExpired(code) ? 'text-red-400' : 'text-gray-300'}>
                          {formatDate(code.expiresAt)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-gray-300">
                          {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ''}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(code)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                          code.isActive
                            ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        }`}
                      >
                        {code.isActive ? (
                          <>
                            <ToggleRight size={16} /> Active
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <motion.button
                          className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(code)}
                        >
                          <Edit2 size={16} />
                        </motion.button>
                        <motion.button
                          className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(code.id)}
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </tr>
                ))}
                {codes.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-gray-400">
                      No bonus codes found. Create one to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-gray-900 to-gray-950 border border-white/10 rounded-3xl p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Gift className="text-[var(--casino-green)]" size={24} />
                  {editingCode ? 'Edit Bonus Code' : 'Create Bonus Code'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Code *</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold uppercase tracking-wider focus:outline-none focus:border-amber-500"
                      placeholder="WELCOME100"
                      required
                      disabled={editingCode}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Coins Amount *</label>
                    <input
                      type="number"
                      value={formData.coinAmount}
                      onChange={(e) => setFormData({ ...formData, coinAmount: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                      placeholder="100"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Discount %</label>
                    <input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({ ...formData, discountPercent: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Min Deposit (₹)</label>
                    <input
                      type="number"
                      value={formData.minDeposit}
                      onChange={(e) => setFormData({ ...formData, minDeposit: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    placeholder="Welcome bonus for new users"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Start Date</label>
                    <input
                      type="date"
                      value={formData.startsAt}
                      onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Expiry Date</label>
                    <input
                      type="date"
                      value={formData.expiresAt}
                      onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                      className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Max Uses (0 = unlimited)</label>
                  <input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-white font-bold focus:outline-none focus:border-amber-500"
                    placeholder="100"
                  />
                </div>

                <motion.button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-500/30 disabled:opacity-50"
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : (
                    <>
                      <Check size={18} className="inline mr-2" />
                      {editingCode ? 'Update Code' : 'Create Code'}
                    </>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminBonusCodes;
