import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Wallet, User, Trophy, Bell, Gift, Medal, Zap, LogOut, Crown, Sparkles, Shield, Users, DollarSign, Settings, LayoutDashboard, BarChart3, CreditCard, AlertCircle, Coins, Share2, Tag, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { useState, useEffect } from 'react';

const LIVE_WINNERS = [
  { id: 1, name: 'Vikram S.', game: 'Ludo King', amount: 8500, img: 'https://randomuser.me/api/portraits/men/32.jpg', city: 'Mumbai' },
  { id: 2, name: 'Priya R.', game: 'Teen Patti', amount: 12000, img: 'https://randomuser.me/api/portraits/women/44.jpg', city: 'Delhi' },
  { id: 3, name: 'Amit K.', game: 'Andar Bahar', amount: 25000, img: 'https://randomuser.me/api/portraits/men/67.jpg', city: 'Bangalore' },
  { id: 4, name: 'Sneha M.', game: 'Rummy', amount: 15000, img: 'https://randomuser.me/api/portraits/women/65.jpg', city: 'Chennai' },
  { id: 5, name: 'Raj Patel', game: 'Ludo King', amount: 9500, img: 'https://randomuser.me/api/portraits/men/45.jpg', city: 'Ahmedabad' },
  { id: 6, name: 'Kavita J.', game: 'Poker', amount: 32000, img: 'https://randomuser.me/api/portraits/women/28.jpg', city: 'Hyderabad' },
  { id: 7, name: 'Suresh T.', game: 'Teen Patti', amount: 18000, img: 'https://randomuser.me/api/portraits/men/78.jpg', city: 'Pune' },
  { id: 8, name: 'Meera D.', game: 'Ludo King', amount: 11000, img: 'https://randomuser.me/api/portraits/women/89.jpg', city: 'Kolkata' },
  { id: 9, name: 'Arjun N.', game: 'Rummy', amount: 22000, img: 'https://randomuser.me/api/portraits/men/56.jpg', city: 'Jaipur' },
  { id: 10, name: 'Divya G.', game: 'Andar Bahar', amount: 7500, img: 'https://randomuser.me/api/portraits/women/12.jpg', city: 'Lucknow' },
  { id: 11, name: 'Ravi K.', game: 'Ludo King', amount: 28000, img: 'https://randomuser.me/api/portraits/men/23.jpg', city: 'Chandigarh' },
  { id: 12, name: 'Pooja S.', game: 'Teen Patti', amount: 14000, img: 'https://randomuser.me/api/portraits/women/33.jpg', city: 'Surat' },
  { id: 13, name: 'Anil M.', game: 'Poker', amount: 45000, img: 'https://randomuser.me/api/portraits/men/91.jpg', city: 'Goa' },
  { id: 14, name: 'Sunita R.', game: 'Ludo King', amount: 6500, img: 'https://randomuser.me/api/portraits/women/55.jpg', city: 'Indore' },
  { id: 15, name: 'Gaurav V.', game: 'Rummy', amount: 19000, img: 'https://randomuser.me/api/portraits/men/84.jpg', city: 'Nagpur' },
  { id: 16, name: 'Neha P.', game: 'Andar Bahar', amount: 21000, img: 'https://randomuser.me/api/portraits/women/77.jpg', city: 'Bhopal' },
  { id: 17, name: 'Karan B.', game: 'Teen Patti', amount: 55000, img: 'https://randomuser.me/api/portraits/men/52.jpg', city: 'Patna' },
  { id: 18, name: 'Lakshmi K.', game: 'Ludo King', amount: 13500, img: 'https://randomuser.me/api/portraits/women/68.jpg', city: 'Kochi' },
];

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'SUB_ADMIN' || user?.role === 'SUPER_ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const currentHomeItem = user ? { path: isAdmin ? '/dashboard/admin' : '/dashboard' } : { path: '/' };

  // Admin Sidebar
  const AdminSidebar = () => (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-[280px] h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,158,11,0.15)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-500" />
      
      <div className="relative z-10 p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(currentHomeItem.path)}
            style={{ cursor: 'pointer' }}
          >
            <Shield size={24} color="white" />
          </motion.div>
          <div>
            <span className="text-xl font-black text-white tracking-tight">Admin Panel</span>
            <p className="text-[10px] text-amber-400/80 uppercase tracking-widest font-medium">
              {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Sub Admin'}
            </p>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] font-bold text-amber-400/80 uppercase tracking-[0.2em] px-4 mb-3">Management</div>
        
          {[
            { path: '/dashboard/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
            { path: '/dashboard/admin/users', icon: Users, label: 'Users', exact: true },
            { path: '/dashboard/admin/withdrawals', icon: DollarSign, label: 'Withdrawals', exact: true },
            ...(user?.role === 'SUPER_ADMIN' ? [
              { path: '/dashboard/admin/subadmins', icon: Shield, label: 'Sub-Admins' },
              { path: '/dashboard/admin/bonus-codes', icon: Tag, label: 'Bonus Codes' },
              { path: '/dashboard/admin/broadcast', icon: Megaphone, label: 'Broadcast' }
            ] : []),
          ].map((item) => (
          <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3 rounded-xl text-[14px] font-medium no-underline transition-all duration-300 mb-1.5 relative group ${isActive ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400' : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent" />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-amber-400 rounded-l-full shadow-lg shadow-amber-400/50" />
                    </>
                  )}
                  <span className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-amber-500/20' : 'bg-white/5 group-hover:bg-amber-500/10'} transition-all`}>
                    <item.icon size={18} />
                  </span>
                  <span className="relative z-10 font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}

        <div className="text-[10px] font-bold text-gray-500/80 uppercase tracking-[0.2em] px-4 mt-6 mb-3">Quick Stats</div>
        
        {[
          { label: 'Total Users', value: '2,450', color: 'text-blue-400' },
          { label: 'Pending Withdraw', value: '₹45,000', color: 'text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="px-4 py-3 mb-1">
            <div className="text-[10px] text-gray-500 mb-0.5">{stat.label}</div>
            <div className={`text-sm font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </nav>

      <div className="relative z-10 p-4 border-t border-white/10">
        <motion.div 
          className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/5 rounded-xl mb-4 border border-amber-500/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-amber-400 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</div>
            </div>
          </div>
        </motion.div>

        <motion.button 
          onClick={handleLogout} 
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-red-400 font-semibold text-[13px] bg-red-500/10 border border-red-500/20 transition-all duration-300 hover:bg-red-500/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );

  // User Sidebar
  const UserSidebar = () => (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 w-[280px] h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-black z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.1)_0%,transparent_70%)]" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />
      
      <div className="relative z-10 p-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <motion.div 
            className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(currentHomeItem.path)}
            style={{ cursor: 'pointer' }}
          >
            <Crown size={24} color="white" />
          </motion.div>
          <div>
            <span className="text-xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
              IndiaPlay
            </span>
            <p className="text-[10px] text-pink-400/60 uppercase tracking-widest">Premium Gaming</p>
          </div>
        </div>
      </div>

      <nav className="relative z-10 flex-1 p-4 overflow-y-auto scrollbar-hide">
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mb-3">Main Menu</div>
        
        {[
          { path: '/', icon: Home, label: 'Home', exact: true },
          { path: '/dashboard/games', icon: Gamepad2, label: 'Games' },
          { path: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
          { path: '/dashboard/leaderboard', icon: Medal, label: 'Leaderboard' },
          { path: '/dashboard/profile', icon: User, label: 'Profile' },
        ].map((item) => (
          <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <NavLink
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium no-underline transition-all duration-300 mb-1.5 relative group ${isActive ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-pink-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-transparent" />
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-pink-500 to-purple-500 rounded-l-full shadow-lg shadow-pink-500/50" />
                    </>
                  )}
                  <span className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-pink-500/20' : 'bg-white/5 group-hover:bg-white/10'} transition-all`}>
                    <item.icon size={20} />
                  </span>
                  <span className="relative z-10 font-semibold">{item.label}</span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}

        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] px-4 mt-8 mb-3">More</div>
        
        {[
          { path: '/dashboard/deposit', icon: Coins, label: 'Buy Coins' },
          { path: '/dashboard/bonus', icon: Gift, label: 'Bonus' },
          { path: '/dashboard/referral', icon: Share2, label: 'Refer & Earn' },
          { path: '/dashboard/withdraw', icon: Zap, label: 'Withdraw' },
          { path: '/dashboard/achievements', icon: Trophy, label: 'Achievements' },
        ].map((item) => (
          <motion.div key={item.path} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
            <NavLink
              to={item.path}
              className={({ isActive }) => `flex items-center gap-4 px-4 py-3.5 rounded-xl text-[15px] font-medium no-underline transition-all duration-300 mb-1.5 relative group ${isActive ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/10 text-pink-400' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-pink-500/10 to-transparent" />
                  )}
                  <span className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-pink-500/20' : 'bg-white/5 group-hover:bg-white/10'} transition-all flex items-center gap-2`}>
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </span>
                  {item.badge > 0 && (
                    <span className="relative z-10 ml-auto px-2.5 py-1 bg-red-500 text-white text-[10px] font-bold rounded-full shadow-lg shadow-red-500/30 animate-pulse">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="relative z-10 p-4 border-t border-white/5">
        {user ? (
          <>
            <motion.div 
              className="p-4 bg-gradient-to-br from-pink-500/10 to-purple-500/5 rounded-2xl mb-4 border border-pink-500/20 backdrop-blur-sm cursor-pointer group"
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate('/dashboard/profile')}
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-pink-500/20">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-[15px] text-white truncate">{user?.name}</div>
                  <div className="text-[11px] text-pink-400 capitalize font-medium">{user?.role?.toLowerCase()}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
            </motion.div>

            <motion.div 
              className="relative p-5 bg-gradient-to-br from-pink-500/15 to-purple-500/10 rounded-2xl mb-4 border border-pink-500/20 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl" />
              <Sparkles size={16} className="absolute top-4 right-4 text-amber-400 animate-pulse" />
              <div className="relative z-10">
                <div className="text-[10px] text-gray-400/80 font-bold uppercase tracking-wider mb-1.5">Total Balance</div>
                <div className="text-2xl font-black bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {formatCurrency(user?.balance)}
                </div>
              </div>
            </motion.div>

            <motion.button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl text-red-400 font-semibold text-[14px] bg-red-500/5 border border-red-500/10 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500/30"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </motion.button>
          </>
        ) : (
          <div className="text-center p-5 space-y-3">
            <p className="text-gray-400/80 text-sm">
              Sign in to unlock all features
            </p>
            <motion.button 
              className="w-full py-3.5 px-6 rounded-xl font-bold text-sm cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </motion.button>
            <motion.button 
              className="w-full py-3 px-5 rounded-xl font-semibold text-sm cursor-pointer bg-white/5 border border-white/10 text-white transition-all duration-300 hover:bg-white/10"
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/signup')}
            >
              Create Account
            </motion.button>
          </div>
        )}
      </div>
    </aside>
  );

  // Mobile Bottom Nav - Admin
  const AdminBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t border-amber-500/30 px-2 py-2 flex justify-around items-center z-50 lg:hidden shadow-[0_-10px_40px_rgba(245,158,11,0.15)]">
      {[
        { path: '/dashboard/admin', icon: LayoutDashboard, label: 'Home' },
        { path: '/dashboard/admin/users', icon: Users, label: 'Users' },
        { path: '/dashboard/admin/withdrawals', icon: DollarSign, label: 'Withdraw' },
        { path: '/dashboard/profile', icon: User, label: 'Profile' },
      ].map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 p-2 rounded-xl no-underline transition-all duration-300 flex-1 max-w-[80px] relative ${isActive ? 'text-amber-400' : 'text-gray-500'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-0 bg-amber-500/10 rounded-xl" />
              )}
              <span className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-amber-500/20' : ''} transition-all`}>
                <item.icon size={22} className={isActive ? 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : ''} />
              </span>
              <span className={`relative z-10 text-[10px] font-bold ${isActive ? 'text-amber-400' : ''}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  // Mobile Bottom Nav - User
  const UserBottomNav = () => (
    <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-slate-900/95 to-slate-900/90 backdrop-blur-xl border-t border-pink-500/20 px-2 py-2 flex justify-around items-center z-50 lg:hidden shadow-[0_-10px_40px_rgba(236,72,153,0.15)]">
      {[
        { path: '/', icon: Home, label: 'Home', exact: true },
        { path: '/dashboard/games', icon: Gamepad2, label: 'Games' },
        { path: '/dashboard/wallet', icon: Wallet, label: 'Wallet' },
        { path: '/dashboard/leaderboard', icon: Medal, label: 'Rank' },
        { path: '/dashboard/profile', icon: User, label: 'Profile' },
      ].map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.exact}
          className={({ isActive }) => `flex flex-col items-center justify-center gap-1 p-2 rounded-xl no-underline transition-all duration-300 flex-1 max-w-[72px] relative ${isActive ? 'text-pink-400' : 'text-gray-500'}`}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span className="absolute inset-0 bg-gradient-to-t from-pink-500/10 to-transparent rounded-xl" />
              )}
              <span className={`relative z-10 p-1.5 rounded-lg ${isActive ? 'bg-pink-500/20' : ''} transition-all`}>
                <item.icon size={24} className={isActive ? 'drop-shadow-[0_0_8px_rgba(236,72,153,0.5)]' : ''} />
              </span>
              <span className={`relative z-10 text-[10px] font-bold ${isActive ? 'text-pink-400' : ''}`}>{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black">
      {isAdmin ? <AdminSidebar /> : <UserSidebar />}

      <div className="flex-1 lg:ml-[280px] flex flex-col min-h-screen w-0">
        {/* Premium Header with Live Winners Ticker */}
        <header className="sticky top-0 z-30">
          {/* Main Header Bar */}
          <div className="bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Logo - Mobile Only */}
              <div 
                className={`flex items-center gap-2 lg:hidden ${isAdmin ? 'text-amber-400' : 'bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent'}`}
                onClick={() => navigate(currentHomeItem.path)}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isAdmin ? 'bg-amber-500' : 'bg-gradient-to-br from-pink-500 to-purple-600'}`}>
                  {isAdmin ? <Shield size={16} color="white" /> : <Crown size={16} color="white" />}
                </div>
                <span className="font-bold">{isAdmin ? 'Admin' : 'IndiaPlay'}</span>
              </div>

              {/* Balance - Logged in Users */}
              {user && !isAdmin && (
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20 backdrop-blur-sm">
                  <Wallet size={14} className="text-pink-400" />
                  <span className="font-bold text-sm bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                    {formatCurrency(user?.balance)}
                  </span>
                </div>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Auth Buttons / Profile */}
              <div className="flex items-center gap-2 sm:gap-3">
                {user ? (
                  <>
                    {/* Deposit Button */}
                    <motion.button
                      className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-500/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/dashboard/deposit')}
                    >
                      <Coins size={14} />
                      <span>Deposit</span>
                    </motion.button>

                    {/* Mobile Deposit Icon */}
                    <motion.button
                      className="sm:hidden w-10 h-10 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard/deposit')}
                    >
                      <Coins size={18} className="text-white" />
                    </motion.button>

                    {/* Notification Bell */}
                    <NotificationBell />

                    {/* Profile Avatar */}
                    <motion.div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base cursor-pointer shadow-lg transition-all duration-300 hover:scale-105 ${isAdmin ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' : 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-pink-500/20'}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/dashboard/profile')}
                    >
                      {user?.name?.charAt(0).toUpperCase()}
                    </motion.div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <motion.button 
                      className="py-2 px-4 rounded-xl font-semibold text-sm cursor-pointer bg-white/5 border border-white/10 text-white transition-all duration-300 hover:bg-white/10"
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/signup')}
                    >
                      Sign Up
                    </motion.button>
                    <motion.button 
                      className="py-2.5 px-5 rounded-xl font-semibold text-sm cursor-pointer bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-pink-500/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/login')}
                    >
                      Sign In
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Premium Recent Winners Ticker */}
          {!isAdmin && (
            <div className="relative overflow-hidden bg-gradient-to-r from-purple-950/20 via-black/90 to-purple-950/20 border-b border-white/[0.05] z-20">
              {/* Section Title */}
              <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Trophy size={18} className="text-amber-400" />
                  <span className="text-white/90 font-bold text-sm tracking-wide">Recent Winners</span>
                </div>
                <div className="h-8 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              </div>

              {/* Gradient Edges */}
              <div className="absolute inset-y-0 left-0 w-20 md:w-52 bg-gradient-to-r from-black/95 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-black/95 to-transparent z-10" />

              {/* Premium Ticker */}
              <div className="relative group">
                <div className="flex py-3.5 pl-4 md:pl-56 overflow-hidden">
                  <div className="flex gap-3 animate-ticker-smooth hover:pause-animation">
                    {[...Array(3)].map((_, outerIdx) => (
                      <div key={outerIdx} className="flex shrink-0 gap-3">
                        {LIVE_WINNERS.map((winner) => (
                          <motion.div
                            key={`${outerIdx}-${winner.id}`}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/[0.04] backdrop-blur-xl border border-white/[0.06] hover:border-pink-500/40 hover:bg-white/[0.08] transition-all duration-300 cursor-pointer shadow-xl hover:shadow-pink-500/10"
                            whileHover={{ scale: 1.02, y: -2 }}
                          >
                            {/* Avatar with Ring */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={winner.img}
                                alt={winner.name}
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-500/40 shadow-lg"
                              />
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-md">
                                <Trophy size={10} className="text-white" />
                              </div>
                            </div>
                            
                            {/* Info */}
                            <div className="flex flex-col min-w-0">
                              <p className="text-white font-semibold text-sm truncate">{winner.name}</p>
                              <p className="text-white/40 text-xs">{winner.game}</p>
                            </div>
                            
                            {/* Amount */}
                            <div className="flex items-center gap-1.5 ml-2 pl-3 border-l border-white/10">
                              <span className="text-emerald-400 font-black text-base tracking-tight">
                                ₹{winner.amount.toLocaleString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        <main className="flex-1 overflow-hidden py-4 sm:py-6 px-4 sm:px-6 lg:px-8 pb-24 sm:pb-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full animate-slide-up"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {isAdmin ? <AdminBottomNav /> : <UserBottomNav />}
    </div>
  );
};

export default AppLayout;
