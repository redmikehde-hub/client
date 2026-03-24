import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, Eye, EyeOff, User, Trophy, ArrowLeft, Sparkles, Gift, Shield, Zap, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Signup = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

  const handleSubmit = async (e) => {
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
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    { icon: Gift, text: 'Welcome Bonus', value: '100 Coins', color: 'var(--casino-green)' },
    { icon: Crown, text: 'Daily Rewards', value: 'Every Day', color: 'var(--casino-orange)' },
    { icon: Shield, text: 'Secure Gaming', value: '100% Safe', color: 'var(--casino-purple)' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--casino-dark)] via-[var(--casino-purple)]/20 to-[var(--casino-dark)] flex">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 overflow-hidden pointer-events-none"
        >
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--casino-green)]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[var(--casino-purple)]/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-[var(--casino-orange)]/5 rounded-full blur-3xl" />
        </motion.div>
      </AnimatePresence>

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

          <div className="bg-gradient-to-b from-[var(--casino-dark-3)]/80 to-[var(--casino-dark)]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className="relative w-20 h-20 mx-auto mb-4"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-purple)] rounded-2xl blur-lg opacity-75" />
                <div className="relative w-full h-full bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-purple)] rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles size={36} className="text-black" />
                </div>
              </motion.div>
              
              <h2 className="text-3xl font-black mb-2">
                <span className="bg-gradient-to-r from-[var(--casino-green)] via-[var(--casino-purple)] to-[var(--casino-orange)] bg-clip-text text-transparent">
                  Create Account
                </span>
              </h2>
              
              <p className="text-white/50">Join IndiaPlay and start winning today</p>
            </div>

            <div className="flex gap-2 p-1.5 bg-black/30 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => setIsPhone(false)}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300 ${
                  !isPhone 
                    ? 'bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-purple)] text-black shadow-lg shadow-green-500/30' 
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
                    ? 'bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-purple)] text-black shadow-lg shadow-green-500/30' 
                    : 'bg-transparent text-white/50 hover:text-white'
                }`}
              >
                Phone
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              </motion.div>

              {!isPhone ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all"
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
                  transition={{ delay: 0.15 }}
                >
                  <label className="block text-sm font-medium text-white/70 mb-2">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                      type="tel"
                      placeholder="Enter your phone"
                      className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all"
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
                    placeholder="Create a password"
                    className="w-full py-4 pl-12 pr-12 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="w-full py-4 pl-12 pr-12 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Referral Code <span className="text-white/30">(Optional)</span>
                </label>
                <div className="relative">
                  <Gift size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                  <input
                    type="text"
                    placeholder="Enter referral code"
                    className="w-full py-4 pl-12 pr-4 bg-black/40 border-2 border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:border-[var(--casino-green)] transition-all font-bold uppercase tracking-wider"
                    value={formData.referralCode}
                    onChange={(e) => setFormData({ ...formData, referralCode: e.target.value.toUpperCase() })}
                  />
                </div>
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className="w-full py-4 mt-2 rounded-2xl bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-purple)] text-black text-base font-bold shadow-xl shadow-green-500/30 flex items-center justify-center gap-2 transition-all hover:shadow-2xl hover:shadow-green-500/50 disabled:opacity-50"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    <Sparkles size={18} />
                    Create Account
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
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--casino-green)] font-bold hover:text-[var(--casino-purple)] transition-colors">
                Sign In
              </Link>
            </p>
          </div>

          <p className="text-center text-white/30 text-xs mt-6">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      </div>

      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--casino-green)]/10 via-[var(--casino-purple)]/10 to-[var(--casino-orange)]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center max-w-md"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--casino-green)]/20 to-[var(--casino-purple)]/20 blur-3xl rounded-full" />
              <div className="relative w-28 h-28 mx-auto bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-purple)] rounded-3xl flex items-center justify-center shadow-2xl shadow-green-500/30">
                <Gift size={56} className="text-black" />
              </div>
            </div>
            
            <h1 className="text-4xl font-black mb-4">
              <span className="bg-gradient-to-r from-white via-[var(--casino-green)] to-white bg-clip-text text-transparent">
                Get Started
              </span>
            </h1>
            
            <p className="text-lg text-white/60 mb-12">
              Join thousands of winners on India's most exciting gaming platform
            </p>

            <div className="grid grid-cols-1 gap-4">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-[var(--casino-green)]/30 transition-all"
                >
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${benefit.color}20` }}
                  >
                    <benefit.icon size={28} style={{ color: benefit.color }} />
                  </div>
                  <div className="text-left">
                    <span className="text-white font-bold block">{benefit.text}</span>
                    <span className="font-semibold text-sm" style={{ color: benefit.color }}>{benefit.value}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="mt-12 p-6 rounded-2xl bg-gradient-to-r from-[var(--casino-green)]/10 to-[var(--casino-purple)]/10 border border-[var(--casino-green)]/20"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy size={20} className="text-[var(--casino-orange)]" />
                <span className="text-white font-bold">Exclusive Welcome Offer</span>
              </div>
              <p className="text-3xl font-black bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-orange)] bg-clip-text text-transparent">
                +100 Bonus Coins
              </p>
              <p className="text-white/50 text-sm mt-2">On your first deposit!</p>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 flex gap-2"
          >
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-[var(--casino-green)]/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }}
                transition={{ delay: i * 0.2, duration: 2, repeat: Infinity }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
