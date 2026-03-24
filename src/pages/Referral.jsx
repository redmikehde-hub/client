import { useState, useEffect } from 'react';
import { Users, Gift, Copy, Share2, Check, Loader2, TrendingUp, Crown, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { referralSystemService } from '../services/api';
import toast from 'react-hot-toast';

const Referral = () => {
  const { user, fetchUser } = useAuth();
  const [referralData, setReferralData] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const [codeRes, listRes] = await Promise.all([
        referralSystemService.getCode(),
        referralSystemService.getList()
      ]);
      setReferralData(codeRes.data);
      setReferrals(listRes.data.referrals || []);
    } catch (error) {
      console.error('Failed to fetch referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopied(true);
      toast.success('Referral code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferral = () => {
    if (referralData?.referralCode) {
      const text = `Join IndiaPlay and get free coins! Use my referral code: ${referralData.referralCode}`;
      if (navigator.share) {
        navigator.share({
          title: 'IndiaPlay Referral',
          text,
          url: window.location.origin
        });
      } else {
        navigator.clipboard.writeText(text);
        toast.success('Share text copied to clipboard!');
      }
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-[600px] mx-auto">
        <div className="mb-8">
          <div className="h-10 w-40 rounded-lg skeleton mb-2" />
          <div className="h-5 w-48 rounded skeleton" />
        </div>

        <div className="relative overflow-hidden rounded-3xl p-6 skeleton skeleton-card mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl skeleton" />
            <div>
              <div className="h-5 w-32 rounded skeleton mb-2" />
              <div className="h-4 w-24 rounded skeleton" />
            </div>
          </div>
          <div className="p-4 rounded-2xl mb-4 skeleton">
            <div className="h-10 w-40 mx-auto rounded skeleton" />
          </div>
          <div className="flex gap-3">
            <div className="flex-1 h-14 rounded-xl skeleton" />
            <div className="flex-1 h-14 rounded-xl skeleton" />
          </div>
        </div>

        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl skeleton skeleton-avatar" />
              <div className="flex-1">
                <div className="h-4 w-24 rounded skeleton mb-1" />
                <div className="h-3 w-16 rounded skeleton" />
              </div>
              <div className="h-5 w-16 rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[600px] mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-black mb-2">Refer & Earn</h1>
        <p className="text-text-muted">Invite friends and earn free coins</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative overflow-hidden rounded-3xl p-6 mb-8 bg-gradient-to-br from-[var(--casino-green)]/10 via-[var(--casino-purple)]/10 to-[var(--casino-orange)]/10 border border-[var(--casino-green)]/20"
      >
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--casino-green)]/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--casino-green)] to-[var(--casino-purple)] flex items-center justify-center shadow-lg shadow-[var(--casino-green)]/30">
              <Users className="text-white" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold">Your Referral Code</h2>
              <p className="text-sm text-text-muted">Share and earn coins</p>
            </div>
          </div>

          <div className="p-4 bg-black/30 rounded-2xl mb-4">
            <p className="text-3xl font-black text-center tracking-wider text-[var(--casino-green)]">
              {referralData?.referralCode || 'Loading...'}
            </p>
          </div>

          <div className="flex gap-3">
            <motion.button
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[var(--casino-green)] to-[var(--casino-purple)] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-[var(--casino-green)]/30"
              whileTap={{ scale: 0.95 }}
              onClick={copyCode}
            >
              {copied ? (
                <>
                  <Check className="text-white" size={18} /> Copied!
                </>
              ) : (
                <>
                  <Copy size={18} /> Copy Code
                </>
              )}
            </motion.button>
            <motion.button
              className="flex-1 py-4 rounded-xl bg-white/10 text-white font-bold flex items-center justify-center gap-2 hover:bg-white/20 transition-all"
              whileTap={{ scale: 0.95 }}
              onClick={shareReferral}
            >
              <Share2 size={18} /> Share
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-2xl bg-bg-card-hover border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Gift className="text-success" size={18} />
            <span className="text-sm text-text-muted">You Get</span>
          </div>
          <p className="text-2xl font-black text-success">+{referralData?.referralBonus || 0}</p>
          <p className="text-xs text-text-muted">coins per referral</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-2xl bg-bg-card-hover border border-white/5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="text-primary" size={18} />
            <span className="text-sm text-text-muted">Friends Get</span>
          </div>
          <p className="text-2xl font-black text-primary">+{referralData?.referredBonus || 0}</p>
          <p className="text-xs text-text-muted">welcome bonus</p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-2xl bg-gradient-to-r from-warning/10 to-amber-500/10 border border-warning/20 mb-8"
      >
        <div className="flex items-center gap-3">
          <Crown className="text-warning" size={24} />
          <div>
            <p className="font-bold">Total Earnings</p>
            <p className="text-2xl font-black text-warning">
              {new Intl.NumberFormat('en-IN').format(referralData?.totalEarnings || 0)} coins
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="text-primary" size={20} />
          Your Referrals ({referrals.length})
        </h3>

        {referrals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-bg-card-hover border border-white/5 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-text-muted" />
            <p className="text-text-muted">No referrals yet</p>
            <p className="text-sm text-text-muted mt-1">Share your code to start earning!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((ref) => (
              <div
                key={ref.id}
                className="p-4 rounded-2xl bg-bg-card-hover border border-white/5 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center text-white font-bold">
                    {ref.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-bold">{ref.name}</p>
                    <p className="text-xs text-text-muted">
                      Joined {new Date(ref.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-success">+10</p>
                  <p className="text-xs text-text-muted">coins earned</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-2xl bg-white/5 border border-white/10"
      >
        <h3 className="font-bold mb-3">How It Works</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">1</div>
            <p className="text-sm text-text-muted">Share your unique referral code with friends</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">2</div>
            <p className="text-sm text-text-muted">Your friend signs up using your code</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold shrink-0">3</div>
            <p className="text-sm text-text-muted">Both of you get bonus coins!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Referral;
