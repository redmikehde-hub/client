import { useState, useEffect } from 'react';
import { Shield, Plus, RefreshCw, Users, Mail, Calendar, Trash2, Edit2, CheckCircle, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminService, userService } from '../services/api';
import toast from 'react-hot-toast';

const AdminSubadmins = () => {
  const { user: currentUser } = useAuth();
  const [subadmins, setSubadmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (isSuperAdmin) fetchSubadmins();
    else setLoading(false);
  }, []);

  const fetchSubadmins = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ role: 'SUB_ADMIN', page: 1, limit: 50 });
      setSubadmins(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch subadmins:', error);
      toast.error('Failed to load sub-admins');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setSubmitting(true);
    try {
      await adminService.createSubadmin(formData);
      toast.success('Sub-admin created successfully');
      setShowModal(false);
      setFormData({ name: '', email: '', password: '' });
      fetchSubadmins();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create sub-admin');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center mb-6">
          <Shield size={40} className="text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
        <p className="text-sm text-gray-400">Only Super Admins can manage sub-admins</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Sub-Admin Management</h1>
          <p className="text-sm text-gray-400">{subadmins.length} sub-admins</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchSubadmins}
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </motion.button>
          <motion.button
            className="px-4 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 flex items-center gap-2 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} /> Create Sub-Admin
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-white/10 p-4 text-center">
          <Shield size={20} className="mx-auto mb-1 text-amber-400" />
          <div className="text-xl font-bold text-amber-400">{subadmins.length}</div>
          <div className="text-xs text-gray-400">Sub-Admins</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-white/10 p-4 text-center">
          <CheckCircle size={20} className="mx-auto mb-1 text-emerald-400" />
          <div className="text-xl font-bold text-emerald-400">{subadmins.filter(s => s.isActive !== false).length}</div>
          <div className="text-xs text-gray-400">Active</div>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/20 border border-white/10 p-4 text-center">
          <Users size={20} className="mx-auto mb-1 text-gray-400" />
          <div className="text-xl font-bold text-gray-400">1</div>
          <div className="text-xs text-gray-400">Super Admin</div>
        </div>
      </div>

      {/* Sub-Admins List */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card skeleton-glow p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 rounded-xl skeleton skeleton-avatar" />
                <div className="flex-1">
                  <div className="h-4 w-24 rounded skeleton mb-2" />
                  <div className="h-3 w-32 rounded skeleton" />
                </div>
              </div>
              <div className="h-10 rounded skeleton" />
            </div>
          ))}
        </div>
      ) : subadmins.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-gray-800/30 border border-white/5">
          <Shield size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Sub-Admins Yet</h3>
          <p className="text-sm text-gray-400 mb-6">Create your first sub-admin to help manage the platform</p>
          <motion.button
            className="px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30"
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={16} className="inline mr-2" /> Create Sub-Admin
          </motion.button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subadmins.map((subadmin, index) => (
            <motion.div
              key={subadmin.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-white/10 p-5 hover:border-amber-500/30 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-amber-500/20">
                  {subadmin.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white mb-1 truncate">{subadmin.name}</h3>
                  <span className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400">
                    Sub Admin
                  </span>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                  <Mail size={14} className="text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-400 truncate">{subadmin.email}</span>
                </div>
                <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                  <Calendar size={14} className="text-gray-500 shrink-0" />
                  <span className="text-xs text-gray-400">Created {formatDate(subadmin.createdAt)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <motion.button
                  className="flex-1 py-2 rounded-lg bg-white/5 text-gray-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-white/10 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <Edit2 size={12} /> Edit
                </motion.button>
                <motion.button
                  className="flex-1 py-2 rounded-lg bg-red-500/10 text-red-400 text-xs font-medium flex items-center justify-center gap-1.5 hover:bg-red-500/20 transition-all"
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 size={12} /> Remove
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="w-full max-w-md rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Shield size={20} className="text-amber-400" />
                  Create Sub-Admin
                </h2>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <X size={18} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
                  <input
                    type="text"
                    className="w-full py-3 px-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="Enter name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Email</label>
                  <input
                    type="email"
                    className="w-full py-3 px-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
                  <input
                    type="password"
                    className="w-full py-3 px-4 bg-black/30 border border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder="Min 6 characters"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    minLength={6}
                    required
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <motion.button
                    type="submit"
                    className="flex-1 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                    whileTap={{ scale: 0.98 }}
                    disabled={submitting}
                  >
                    {submitting ? <RefreshCw size={16} className="animate-spin" /> : <><Shield size={16} /> Create Sub-Admin</>}
                  </motion.button>
                  <motion.button
                    type="button"
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-white/5 text-gray-400 border border-white/10 transition-all"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminSubadmins;
