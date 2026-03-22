import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, Trophy, ArrowLeft, Sparkles, Shield, Zap, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, loginPhone } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPhone, setIsPhone] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    password: '',
  });

  const handleSubmit = async (e) => {
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

  const features = [
    { icon: Shield, text: 'Secure & Protected' },
    { icon: Zap, text: 'Instant Access' },
    { icon: Star, text: 'Premium Games' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg-dark via-purple-950/30 to-bg-dark flex">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl" />
        </motion.div>
      </AnimatePresence>

      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-neon-purple/20 to-pink-500/30" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-md"
          >
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-primary via-neon-purple to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-primary/50">
              <Trophy size={48} className="text-white" />
            </div>
            
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            
            <p className="text-lg text-white/60 mb-12">
              Continue your winning journey with India's most exciting gaming platform
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-neon-purple/30 flex items-center justify-center">
                    <feature.icon size={24} className="text-primary" />
                  </div>
                  <span className="text-white font-semibold">{feature.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-12 flex gap-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </Link>

          <div className="bg-gradient-to-b from-bg-card-hover/80 to-bg-card/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-neon-purple rounded-2xl flex items-center justify-center shadow-xl shadow-primary/40"
              >
                <Trophy size={32} className="text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-black mb-2">
                <span className="bg-gradient-to-r from-primary via-neon-purple to-pink-500 bg-clip-text text-transparent">
                  Sign In
                </span>
              </h2>
              
              <p className="text-white/50">Access your IndiaPlay account</p>
            </div>

            <div className="flex gap-2 p-1.5 bg-black/30 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setIsPhone(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300 ${
                  !isPhone 
                    ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' 
                    : 'bg-transparent text-white/50 hover:text-white'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setIsPhone(true)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300 ${
                  isPhone 
                    ? 'bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30' 
                    : 'bg-transparent text-white/50 hover:text-white'
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isPhone ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      autoComplete="email"
                      required
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      placeholder="Enter your phone"
                      className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-all"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      autoComplete="tel"
                      required
                    />
                  </div>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="w-full py-4 pl-12 pr-12 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-primary transition-all"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-end"
              >
                <button type="button" className="text-sm text-primary hover:text-pink-400 transition-colors">
                  Forgot Password?
                </button>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary via-neon-purple to-pink-500 text-white text-base font-bold shadow-xl shadow-primary/30 flex items-center justify-center gap-2 transition-all hover:shadow-2xl hover:shadow-primary/50 disabled:opacity-50"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowLeft size={18} className="rotate-180" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-white/30 text-sm">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <button
              className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <p className="text-center mt-6 text-white/50">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary font-bold hover:text-pink-400 transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
