import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogOut, ChevronRight, Gift, Trophy, Edit2, Save, X, Sparkles, Gamepad2, Eye, EyeOff, Copy, Check, Bell, Shield, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updateMe(editData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passwordData.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    try {
      await userService.changePassword({ currentPassword: passwordData.currentPassword, newPassword: passwordData.newPassword });
      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount || 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const menuItems = [
    { icon: Edit2, title: 'Edit Profile', subtitle: 'Update your information', onClick: () => setShowEditModal(true), color: '#6366f1' },
    { icon: Lock, title: 'Change Password', subtitle: 'Update your security', onClick: () => setShowPasswordModal(true), color: '#10b981' },
    { icon: Gift, title: 'Referral Code', subtitle: user?.referralCode || 'No code', onClick: () => user?.referralCode && copyToClipboard(user.referralCode), color: '#f59e0b' },
    { icon: Bell, title: 'Notifications', subtitle: 'Manage notifications', onClick: () => navigate('/dashboard/notifications'), color: '#ef4444' },
    { icon: Trophy, title: 'Achievements', subtitle: 'View your badges', onClick: () => navigate('/dashboard/achievements'), color: '#ffd700' },
    { icon: HelpCircle, title: 'Help & Support', subtitle: 'Get help', onClick: () => {}, color: '#8b5cf6' },
    { icon: Shield, title: 'Privacy & Security', subtitle: 'Manage your data', onClick: () => {}, color: '#06b6d4' },
  ];

  if (!user) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="mb-6 sm:mb-7">
          <div className="h-10 w-32 rounded-lg skeleton mb-2" />
          <div className="h-5 w-40 rounded skeleton" />
        </div>

        <div className="rounded-3xl p-8 sm:p-10 text-center skeleton skeleton-card">
          <div className="w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full skeleton skeleton-avatar" />
          <div className="h-8 w-40 mx-auto rounded-lg skeleton mb-3" />
          <div className="h-5 w-48 mx-auto rounded skeleton mb-4" />
          <div className="h-8 w-24 mx-auto rounded-full skeleton" />
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4 my-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl p-4 sm:p-6 text-center skeleton skeleton-card">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl skeleton" />
              <div className="h-6 w-20 mx-auto rounded skeleton mb-2" />
              <div className="h-3 w-16 mx-auto rounded skeleton" />
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
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Profile</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Manage your account</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-3xl p-8 sm:p-10 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="relative w-28 h-28 sm:w-32 sm:h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-4xl sm:text-5xl font-extrabold shadow-xl shadow-primary/40"
          >
            {user?.name?.charAt(0).toUpperCase()}
            <motion.div
              className="absolute bottom-0 right-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-neon-purple border-4 border-bg-card flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowEditModal(true)}
            >
              <Edit2 size={16} color="white" />
            </motion.div>
          </motion.div>
          
          <motion.h2 
            className="text-2xl sm:text-3xl font-extrabold mb-2"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {user?.name}
          </motion.h2>
          
          <motion.p 
            className="text-base text-text-muted mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            {user?.email || user?.phone}
          </motion.p>
          
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="inline-block px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-semibold capitalize">
              {user?.role?.toLowerCase() || 'Member'}
            </span>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3 sm:gap-4 my-6">
          <motion.div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/30" whileHover={{ y: -4 }}>
            <div className="w-12 h-12 sm:w-13 sm:h-13 mx-auto mb-3 rounded-xl bg-primary/15 flex items-center justify-center">
              <Sparkles size={24} className="text-primary" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent mb-1">{formatCurrency(user?.balance || 0)}</div>
            <div className="text-[10px] sm:text-xs text-text-muted font-medium">Balance</div>
          </motion.div>
          <motion.div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-success/30" whileHover={{ y: -4 }}>
            <div className="w-12 h-12 sm:w-13 sm:h-13 mx-auto mb-3 rounded-xl bg-success/15 flex items-center justify-center">
              <Trophy size={24} className="text-success" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-success to-emerald-400 bg-clip-text text-transparent mb-1">{formatCurrency(user?.totalWinnings || 0)}</div>
            <div className="text-[10px] sm:text-xs text-text-muted font-medium">Winnings</div>
          </motion.div>
          <motion.div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-warning/30" whileHover={{ y: -4 }}>
            <div className="w-12 h-12 sm:w-13 sm:h-13 mx-auto mb-3 rounded-xl bg-warning/15 flex items-center justify-center">
              <Gamepad2 size={24} className="text-warning" />
            </div>
            <div className="text-lg sm:text-xl font-extrabold bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent mb-1">{user?.gamesWon || 0}</div>
            <div className="text-[10px] sm:text-xs text-text-muted font-medium">Games Won</div>
          </motion.div>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col gap-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              className="flex items-center gap-4 p-4 bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-xl cursor-pointer transition-all duration-300 hover:translate-x-1"
              onClick={item.onClick}
              whileHover={{ x: 4, borderColor: `${item.color}40` }}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${item.color}15`, color: item.color }}>
                <item.icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm sm:text-base">{item.title}</div>
                <div className="text-xs text-text-muted truncate">{item.subtitle}</div>
              </div>
              {item.title === 'Referral Code' && copied ? (
                <Check size={20} className="text-success shrink-0" />
              ) : (
                <ChevronRight size={20} className="text-text-muted shrink-0" />
              )}
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={itemVariants} className="flex items-center gap-4 p-4 bg-gradient-to-b from-bg-card-hover to-bg-card border border-danger/20 rounded-xl cursor-pointer mt-6 transition-all duration-300 hover:translate-x-1 hover:border-danger/40" onClick={handleLogout}>
          <div className="w-12 h-12 rounded-xl bg-danger/10 flex items-center justify-center shrink-0">
            <LogOut size={24} className="text-danger" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-danger">Logout</div>
            <div className="text-xs text-text-muted">Sign out of your account</div>
          </div>
          <LogOut size={20} className="text-danger shrink-0" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {showEditModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              className="bg-gradient-to-b from-bg-card-hover to-bg-dark border border-primary/20 rounded-3xl w-full max-w-md p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <motion.button 
                  className="p-2 rounded-lg bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(false)}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <form onSubmit={handleUpdateProfile}>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Full Name</label>
                  <input 
                    type="text" 
                    className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-base transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="Enter your name" 
                    value={editData.name} 
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })} 
                    required 
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Phone Number</label>
                  <input 
                    type="tel" 
                    className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-base transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="Enter phone number" 
                    value={editData.phone} 
                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })} 
                  />
                </div>
                <motion.button 
                  type="submit" 
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-base cursor-pointer bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/40 transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-6 h-6 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Save size={20} className="inline mr-2" /> Save Changes</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              className="bg-gradient-to-b from-bg-card-hover to-bg-dark border border-primary/20 rounded-3xl w-full max-w-md p-8 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-7">
                <h2 className="text-xl font-bold">Change Password</h2>
                <motion.button 
                  className="p-2 rounded-lg bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:text-white"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowPasswordModal(false)}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Current Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      className="w-full py-4 px-4 pr-12 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-base transition-all duration-300 focus:outline-none focus:border-primary" 
                      placeholder="Enter current password" 
                      value={passwordData.currentPassword} 
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-text-muted cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">New Password</label>
                  <input 
                    type="password" 
                    className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-base transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="Enter new password" 
                    value={passwordData.newPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} 
                    required 
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-text-secondary mb-2.5">Confirm New Password</label>
                  <input 
                    type="password" 
                    className="w-full py-4 px-4 bg-black/30 border-2 border-white/10 rounded-2xl text-white text-base transition-all duration-300 focus:outline-none focus:border-primary" 
                    placeholder="Confirm new password" 
                    value={passwordData.confirmPassword} 
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} 
                    required 
                  />
                </div>
                <motion.button 
                  type="submit" 
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-base cursor-pointer bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/40 transition-all duration-300 disabled:opacity-50"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-6 h-6 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <><Lock size={20} className="inline mr-2" /> Change Password</>
                  )}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Profile;
