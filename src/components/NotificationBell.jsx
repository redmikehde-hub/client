import { useState, useEffect, useRef } from 'react';
import { Bell, X, Copy, Check, Gift, Sparkles, AlertCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { broadcastService } from '../services/api';
import toast from 'react-hot-toast';

const NotificationBell = () => {
  const { user } = useAuth();
  const { socket, joinRoom } = useSocket();
  const [showPanel, setShowPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [copied, setCopied] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const panelRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      joinRoom(user.id);
      fetchNotifications();
      fetchUnreadCount();
    }
  }, [user?.id]);

  useEffect(() => {
    if (socket) {
      socket.on('new_notification', (notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });
    }

    return () => {
      if (socket) {
        socket.off('new_notification');
      }
    };
  }, [socket]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setShowPanel(false);
      }
    };

    if (showPanel) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showPanel]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await broadcastService.getAll();
      setNotifications(response.data.broadcasts || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await broadcastService.getUnreadCount();
      setUnreadCount(response.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await broadcastService.markRead(id);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await broadcastService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Code copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'BONUS':
        return { icon: Gift, color: '#10b981', bg: 'bg-success/20' };
      case 'PROMO':
        return { icon: Sparkles, color: '#f59e0b', bg: 'bg-warning/20' };
      case 'MAINTENANCE':
        return { icon: AlertCircle, color: '#ef4444', bg: 'bg-danger/20' };
      case 'UPDATE':
        return { icon: Info, color: '#6366f1', bg: 'bg-primary/20' };
      default:
        return { icon: Bell, color: '#8b5cf6', bg: 'bg-neon-purple/20' };
    }
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
    return `${days}d ago`;
  };

  if (!user) return null;

  return (
    <div className="relative" ref={panelRef}>
      <motion.button
        className="relative p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowPanel(!showPanel)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-gradient-to-r from-danger to-red-600 text-white rounded-full px-1 shadow-lg shadow-danger/50 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {showPanel && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPanel(false)}
            />
            <motion.div
              className="absolute right-0 top-full mt-3 w-[380px] max-h-[500px] sm:max-h-[600px] rounded-3xl bg-gradient-to-b from-[#1a1a2e] to-[#0f0f1a] border border-white/10 shadow-2xl shadow-black/50 overflow-hidden z-50"
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-white/10 bg-gradient-to-r from-[#13131f] to-[#1a1a2e]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center">
                      <Bell size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Notifications</h3>
                      <p className="text-xs text-gray-400">{unreadCount} unread</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <motion.button
                        className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all text-xs font-medium disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleMarkAllRead}
                        disabled={markingAll}
                      >
                        {markingAll ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          'Mark all read'
                        )}
                      </motion.button>
                    )}
                    <button
                      className="p-2 rounded-lg bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                      onClick={() => setShowPanel(false)}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-y-auto max-h-[400px] sm:max-h-[480px] scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                      <Bell size={28} className="text-gray-500" />
                    </div>
                    <h4 className="font-semibold text-white mb-1">No notifications</h4>
                    <p className="text-sm text-gray-400">You're all caught up!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-white/5">
                    {notifications.map((notification, index) => {
                      const { icon: Icon, color, bg } = getNotificationIcon(notification.type);
                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`p-4 hover:bg-white/5 transition-all cursor-pointer ${
                            !notification.isRead ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                          }`}
                          onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                        >
                          <div className="flex gap-3">
                            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
                              <Icon size={20} style={{ color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-semibold text-sm ${!notification.isRead ? 'text-white' : 'text-gray-300'}`}>
                                  {notification.title}
                                </h4>
                                <span className="text-[10px] text-gray-500 shrink-0">
                                  {formatTime(notification.createdAt)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                                {notification.message}
                              </p>
                              
                              {notification.type === 'BONUS' && notification.bonusCode && (
                                <div className="mt-3 p-3 rounded-xl bg-black/30 border border-white/10">
                                  <div className="flex items-center justify-between gap-2">
                                    <div>
                                      <span className="text-[10px] text-gray-400 block mb-0.5">Bonus Code</span>
                                      <span className="font-bold text-sm text-warning tracking-wider">
                                        {notification.bonusCode}
                                      </span>
                                    </div>
                                    <motion.button
                                      className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-success to-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-success/30"
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyCode(notification.bonusCode);
                                      }}
                                    >
                                      {copied === notification.bonusCode ? (
                                        <>
                                          <Check size={12} /> Copied!
                                        </>
                                      ) : (
                                        <>
                                          <Copy size={12} /> Copy
                                        </>
                                      )}
                                    </motion.button>
                                  </div>
                                  {notification.bonusCoins && (
                                    <div className="mt-2 flex items-center gap-1.5 text-xs text-success">
                                      <Sparkles size={12} />
                                      <span>+{notification.bonusCoins.toLocaleString()} coins on claim</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {notification.type === 'BONUS' && notification.bonusCode && (
                                <motion.button
                                  className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-warning to-amber-600 text-black text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-warning/30"
                                  whileTap={{ scale: 0.98 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(notification.bonusCode);
                                    toast.success('Code copied! Go to Bonus page to claim.');
                                  }}
                                >
                                  <Gift size={14} />
                                  Claim Bonus
                                </motion.button>
                              )}
                            </div>
                          </div>
                          {!notification.isRead && (
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
