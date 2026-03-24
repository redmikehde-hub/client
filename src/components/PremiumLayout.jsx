import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Wallet, User, Trophy, Bell, Gift, Users, Settings, LogOut, Crown, Shield, Plus, ArrowDownToLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useState, useEffect } from 'react';

const LIVE_WINNERS = [
  { id: 1, name: 'Vikram S.', game: 'Ludo', amount: 8500, img: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 2, name: 'Priya R.', game: 'Matka', amount: 12000, img: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 3, name: 'Amit K.', game: 'Colour', amount: 25000, img: 'https://randomuser.me/api/portraits/men/67.jpg' },
  { id: 4, name: 'Sneha M.', game: 'Aviator', amount: 15000, img: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { id: 5, name: 'Raj P.', game: 'Sport', amount: 9500, img: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { id: 6, name: 'Kavita J.', game: 'Ludo', amount: 32000, img: 'https://randomuser.me/api/portraits/women/28.jpg' },
];

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

export default function PremiumLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'SUB_ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems = [
    { path: '/dashboard', icon: Home, label: 'Home', exact: true },
    { path: '/dashboard/games', icon: Gamepad2, label: 'Games' },
    { path: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
    { path: '/dashboard/profile', icon: User, label: 'Profile' },
  ];

  const adminMenuItems = [
    { path: '/dashboard/admin', icon: Home, label: 'Dashboard', exact: true },
    { path: '/dashboard/admin/users', icon: Users, label: 'Users' },
    { path: '/dashboard/admin/broadcast', icon: Bell, label: 'Broadcast' },
    { path: '/dashboard/admin/deposits', icon: ArrowDownToLine, label: 'Deposits' },
    { path: '/dashboard/admin/settings', icon: Settings, label: 'Settings' },
  ];

  const menuItems = isAdmin ? adminMenuItems : userMenuItems;

  return (
    <div className="min-h-screen bg-[var(--casino-dark)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 w-[280px] h-screen flex-col z-50">
        <div className="flex-1 flex flex-col glass-dark rounded-r-3xl m-3 overflow-hidden">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <div 
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--casino-green)] to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <Crown size={24} className="text-black" />
              </div>
              <div>
                <span className="text-xl font-black text-white">IndiaPlay</span>
                <p className="text-[10px] text-[var(--casino-green)] uppercase tracking-widest font-medium">Premium Gaming</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-4 border-b border-white/10">
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/dashboard/deposit')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--casino-green)] to-emerald-600 text-black font-bold text-sm shadow-lg shadow-green-500/30 hover:scale-105 transition-transform"
              >
                <Plus size={16} />
                Add Money
              </button>
              <button 
                onClick={() => navigate('/dashboard/withdraw')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-sm hover:bg-white/10 transition-colors"
              >
                <ArrowDownToLine size={16} />
                Withdraw
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.exact}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-[var(--casino-green)]/20 to-transparent border-l-2 border-[var(--casino-green)] text-[var(--casino-green)]'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className="font-semibold">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--casino-purple)] to-[var(--casino-blue)]"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                  <p className="text-xs text-[var(--casino-green)] font-bold">{formatCurrency(user.balance)}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 glass-dark border-b border-white/10">
        <div className="flex items-center justify-between px-4 py-3">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--casino-green)] to-emerald-600 flex items-center justify-center">
              <Crown size={16} className="text-black" />
            </div>
            <span className="font-bold text-white">IndiaPlay</span>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--casino-green)]/10 border border-[var(--casino-green)]/30">
                <span className="text-[var(--casino-green)] font-bold text-sm">{formatCurrency(user.balance)}</span>
              </div>
            )}
            <NotificationBell />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:ml-[280px] min-h-screen">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 mobile-nav z-50 pb-safe">
        <div className="flex justify-around items-center py-2">
          {menuItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `mobile-nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={22} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
