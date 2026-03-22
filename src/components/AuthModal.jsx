import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Lock, Phone, User, Eye, EyeOff, Trophy, UserPlus, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import toast from 'react-hot-toast';

const AuthModal = () => {
  const navigate = useNavigate();
  const { login, loginPhone, register, user } = useAuth();
  const { isOpen, mode, closeModal, switchMode } = useAuthModal();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        referralCode: '',
      });
      setShowPassword(false);
      setIsPhone(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let result;
      if (isPhone) {
        result = await loginPhone(formData.phone, formData.password);
      } else {
        result = await login(formData.email, formData.password);
      }
      toast.success('Welcome back!');
      closeModal();
      
      const userRole = result?.user?.role;
      if (userRole === 'SUPER_ADMIN' || userRole === 'SUB_ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    try {
      const data = {
        name: formData.name,
        password: formData.password,
      };
      
      if (isPhone) {
        data.phone = formData.phone;
      } else {
        data.email = formData.email;
      }
      
      if (formData.referralCode) {
        data.referralCode = formData.referralCode;
      }
      
      const result = await register(data);
      toast.success('Account created successfully!');
      closeModal();
      
      const userRole = result?.user?.role;
      if (userRole === 'SUPER_ADMIN' || userRole === 'SUB_ADMIN') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    toast.error('Google Sign-in coming soon');
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-5"
      onClick={closeModal}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
      
      <div 
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-bg-card-hover to-bg-dark border border-primary/20 rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white/60 flex items-center justify-center transition-all duration-200 hover:bg-white/10 hover:text-white z-10"
        >
          <X size={18} />
        </button>

        <div className="p-8 pt-12">
          <div className="text-center mb-7">
            <div className="w-[72px] h-[72px] mx-auto mb-4 bg-gradient-to-br from-primary to-neon-purple rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40">
              <Trophy size={36} color="white" />
            </div>
            <h2 className="text-2xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-2">
              {mode === 'login' ? 'Welcome Back' : 'Join IndiaPlay'}
            </h2>
            <p className="text-sm text-white/50">
              {mode === 'login' ? 'Sign in to continue your winning journey' : 'Create your account and start winning'}
            </p>
          </div>

          <div className="flex gap-2 p-1.5 bg-black/30 rounded-2xl mb-6">
            <button
              onClick={() => setIsPhone(false)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 ${!isPhone ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-transparent text-white/50 hover:text-white'}`}
            >
              Email
            </button>
            <button
              onClick={() => setIsPhone(true)}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-200 ${isPhone ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' : 'bg-transparent text-white/50 hover:text-white'}`}
            >
              Phone
            </button>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleRegister}>
            {mode === 'signup' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full py-3.5 pl-11 pr-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            {!isPhone ? (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full py-3.5 pl-11 pr-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <label className="block text-sm font-medium text-white/70 mb-2">Phone</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="tel"
                    placeholder="Enter your phone"
                    className="w-full py-3.5 pl-11 pr-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="tel"
                    required
                  />
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className="w-full py-3.5 pl-11 pr-11 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-none border-none text-white/30 cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className="w-full py-3.5 pl-11 pr-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm transition-all duration-300 focus:outline-none focus:border-primary"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="mb-5">
                  <label className="block text-sm font-medium text-white/70 mb-2">Referral Code (Optional)</label>
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    className="w-full py-3.5 px-4 bg-black/30 border-2 border-white/10 rounded-xl text-white text-sm font-semibold uppercase tracking-wider transition-all duration-300 focus:outline-none focus:border-primary"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-2xl border-none bg-gradient-to-r from-primary to-neon-purple text-white text-base font-bold cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-primary/40 disabled:opacity-70"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  {mode === 'login' ? <ArrowLeft size={18} className="rotate-180" /> : <UserPlus size={18} />}
                </>
              )}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/30 text-sm">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <button
            onClick={handleGoogleAuth}
            className="w-full py-3.5 px-6 rounded-2xl border border-white/10 bg-white/5 text-white text-sm font-semibold cursor-pointer flex items-center justify-center gap-2.5 transition-all duration-200 hover:bg-white/10"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center mt-6 text-sm text-white/50">
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="bg-none border-none text-primary font-bold cursor-pointer text-sm"
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
