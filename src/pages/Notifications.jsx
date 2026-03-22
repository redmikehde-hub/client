import { useState, useEffect } from 'react';
import { Bell, Trophy, Wallet, Gift, Award, AlertCircle, Trash2, CheckCheck, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { notificationService } from '../services/api';
import toast from 'react-hot-toast';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => { fetchNotifications(); }, [filter]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'unread') params.unreadOnly = true;
      const response = await notificationService.getAll(params);
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    setActionLoading(id);
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading('all');
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    setActionLoading(id);
    try {
      await notificationService.delete(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleDeleteAll = async () => {
    setActionLoading('deleteAll');
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      toast.success('All notifications deleted');
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setActionLoading(null);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      WIN: { icon: Trophy, color: '#f59e0b' },
      DEPOSIT: { icon: Wallet, color: '#10b981' },
      WITHDRAW: { icon: Wallet, color: '#ef4444' },
      BONUS: { icon: Gift, color: '#6366f1' },
      ACHIEVEMENT: { icon: Award, color: '#8b5cf6' },
      SYSTEM: { icon: AlertCircle, color: '#6b7280' },
      LEADERBOARD: { icon: Trophy, color: '#f59e0b' },
    };
    return icons[type] || icons.SYSTEM;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Notifications</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Stay updated with your activity</p>
        </div>
        {unreadCount > 0 && <span className="px-3 py-1.5 rounded-full bg-danger/20 text-danger text-xs font-semibold">{unreadCount} unread</span>}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          <button 
            className={`py-2.5 px-4 rounded-xl font-semibold text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${filter === 'all' ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`py-2.5 px-4 rounded-xl font-semibold text-sm whitespace-nowrap cursor-pointer transition-all duration-300 ${filter === 'unread' ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-text-muted border border-white/5 hover:bg-white/10 hover:text-white'}`}
            onClick={() => setFilter('unread')}
          >
            Unread
          </button>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <motion.button 
              className="p-2.5 rounded-xl bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:text-white hover:border-primary/30 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMarkAllRead}
              disabled={actionLoading === 'all'}
            >
              {actionLoading === 'all' ? <Loader2 size={18} className="animate-spin" /> : <CheckCheck size={18} />}
            </motion.button>
          )}
          {notifications.length > 0 && (
            <motion.button 
              className="p-2.5 rounded-xl bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-danger/10 hover:text-danger hover:border-danger/30 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDeleteAll}
              disabled={actionLoading === 'deleteAll'}
            >
              {actionLoading === 'deleteAll' ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
            </motion.button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card p-4 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl skeleton" />
              <div className="flex-1">
                <div className="h-4 w-3/4 rounded skeleton mb-2" />
                <div className="h-3 w-1/2 rounded skeleton mb-2" />
                <div className="h-3 w-24 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-card border border-white/5 flex items-center justify-center">
            <Bell size={40} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Notifications</h3>
          <p className="text-sm text-text-muted">{filter === 'unread' ? 'All notifications have been read' : "You're all caught up!"}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notification) => {
            const { icon: Icon, color } = getNotificationIcon(notification.type);
            return (
              <div 
                key={notification.id} 
                className={`flex items-start gap-4 p-4 bg-gradient-to-b from-bg-card-hover to-bg-card border rounded-2xl transition-all duration-300 ${!notification.isRead ? 'border-primary/30 bg-primary/5' : 'border-white/5'}`}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20`, color }}>
                  <Icon size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm sm:text-base mb-0.5">{notification.title}</div>
                  <div className="text-xs sm:text-sm text-text-muted mb-1.5">{notification.message}</div>
                  <div className="text-xs text-text-muted">{formatTime(notification.createdAt)}</div>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  {!notification.isRead && (
                    <motion.button 
                      className="p-2 rounded-lg bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/5 hover:text-white hover:border-primary/30 disabled:opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleMarkRead(notification.id)}
                      disabled={actionLoading === notification.id}
                    >
                      {actionLoading === notification.id ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                    </motion.button>
                  )}
                  <motion.button 
                    className="p-2 rounded-lg bg-transparent text-text-secondary border border-white/10 cursor-pointer transition-all duration-300 hover:bg-danger/10 hover:text-danger hover:border-danger/30 disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDelete(notification.id)}
                    disabled={actionLoading === notification.id}
                  >
                    {actionLoading === notification.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </motion.button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
