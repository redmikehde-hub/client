import { useState } from 'react';
import { Send, Bell, Gift, Sparkles, AlertTriangle, Info, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/api';
import toast from 'react-hot-toast';

const AdminBroadcast = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'GENERAL',
    bonusCode: '',
    bonusCoins: '',
  });
  const [sending, setSending] = useState(false);
  const [history, setHistory] = useState([]);

  const notificationTypes = [
    { value: 'GENERAL', label: 'General', icon: Bell, color: '#6366f1' },
    { value: 'BONUS', label: 'Bonus', icon: Gift, color: '#10b981' },
    { value: 'PROMO', label: 'Promo', icon: Sparkles, color: '#f59e0b' },
    { value: 'MAINTENANCE', label: 'Maintenance', icon: AlertTriangle, color: '#ef4444' },
    { value: 'UPDATE', label: 'Update', icon: Info, color: '#3b82f6' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSending(true);
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
      };

      if (formData.type === 'BONUS') {
        if (!formData.bonusCode.trim()) {
          toast.error('Please enter a bonus code');
          setSending(false);
          return;
        }
        payload.bonusCode = formData.bonusCode;
        payload.bonusCoins = parseFloat(formData.bonusCoins) || 0;
      }

      const response = await adminService.sendBroadcast(payload);
      toast.success('Broadcast sent to all users!');
      
      setHistory(prev => [{
        ...response.data.broadcast,
        sentAt: new Date()
      }, ...prev]);

      setFormData({
        title: '',
        message: '',
        type: 'GENERAL',
        bonusCode: '',
        bonusCoins: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send broadcast');
    } finally {
      setSending(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (user?.role !== 'SUPER_ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-3xl bg-danger/10 flex items-center justify-center mb-6">
          <AlertTriangle size={40} className="text-danger" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-gray-400">Only Super Admins can send broadcasts</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent mb-2">
          Send Broadcast
        </h1>
        <p className="text-gray-400">Send notifications to all users instantly</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-3">Notification Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    className={`p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                      formData.type === type.value
                        ? 'border-current bg-current/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                    style={{ borderColor: formData.type === type.value ? type.color : undefined }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, type: type.value })}
                  >
                    <Icon size={24} style={{ color: type.color }} />
                    <span className="text-xs font-semibold" style={{ color: formData.type === type.value ? type.color : undefined }}>
                      {type.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter notification title"
              className="w-full px-4 py-3.5 bg-black/30 border-2 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-all"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-300 mb-2">Message</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Enter notification message"
              className="w-full px-4 py-3.5 bg-black/30 border-2 border-white/10 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500 transition-all resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-right text-xs text-gray-500 mt-1">
              {formData.message.length}/500
            </div>
          </div>

          {formData.type === 'BONUS' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="grid sm:grid-cols-2 gap-4 p-4 bg-success/5 rounded-xl border border-success/20"
            >
              <div>
                <label className="block text-sm font-bold text-success mb-2">Bonus Code</label>
                <input
                  type="text"
                  value={formData.bonusCode}
                  onChange={(e) => setFormData({ ...formData, bonusCode: e.target.value.toUpperCase() })}
                  placeholder="BONUS2024"
                  className="w-full px-4 py-3 bg-black/30 border-2 border-success/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-success transition-all font-bold tracking-wider"
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-success mb-2">Bonus Coins</label>
                <input
                  type="number"
                  value={formData.bonusCoins}
                  onChange={(e) => setFormData({ ...formData, bonusCoins: e.target.value })}
                  placeholder="500"
                  className="w-full px-4 py-3 bg-black/30 border-2 border-success/30 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-success transition-all"
                  min="0"
                />
              </div>
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
            disabled={sending}
            whileHover={{ scale: sending ? 1 : 1.02 }}
            whileTap={{ scale: sending ? 1 : 0.98 }}
          >
            {sending ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <>
                <Send size={24} />
                Send to All Users
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {history.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 p-6"
        >
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Bell size={20} className="text-amber-400" />
            Recent Broadcasts
          </h3>
          <div className="space-y-3">
            {history.map((item, index) => {
              const typeInfo = notificationTypes.find(t => t.value === item.type);
              const Icon = typeInfo?.icon || Bell;
              return (
                <div key={index} className="p-4 bg-black/20 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${typeInfo?.color}20` }}>
                      <Icon size={16} style={{ color: typeInfo?.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{item.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(item.sentAt)}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${typeInfo?.color}20`, color: typeInfo?.color }}>
                      {item.type}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 ml-11">{item.message}</p>
                  {item.bonusCode && (
                    <div className="mt-2 ml-11 flex items-center gap-2">
                      <span className="px-2 py-1 bg-success/10 text-success text-xs font-bold rounded">
                        {item.bonusCode}
                      </span>
                      <span className="text-xs text-gray-500">+{item.bonusCoins || 0} coins</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminBroadcast;
