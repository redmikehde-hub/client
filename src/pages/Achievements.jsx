import { useState, useEffect } from 'react';
import { Trophy, Check, Lock, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { achievementService } from '../services/api';
import toast from 'react-hot-toast';

const Achievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [myAchievements, setMyAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [allRes, myRes] = await Promise.all([
        achievementService.getAll(),
        achievementService.getMy(),
      ]);
      setAchievements(allRes.data.achievements || []);
      setMyAchievements(myRes.data.userAchievements || []);
    } catch (error) {
      console.error('Failed to fetch achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (achievementId) => {
    setClaiming(achievementId);
    try {
      await achievementService.claim(achievementId);
      toast.success('Achievement claimed!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to claim');
    } finally {
      setClaiming(null);
    }
  };

  const getProgress = (achievement) => {
    const myAch = myAchievements.find((a) => a.achievementId === achievement.id);
    if (!myAch) return 0;
    return Math.min((myAch.progress / achievement.target) * 100, 100);
  };

  const isUnlocked = (achievement) => myAchievements.some((a) => a.achievementId === achievement.id && a.unlockedAt);
  const canClaim = (achievement) => {
    const myAch = myAchievements.find((a) => a.achievementId === achievement.id);
    return myAch && myAch.progress >= achievement.target && !myAch.unlockedAt;
  };

  const rarityColors = { common: '#a0a0b0', rare: '#6366f1', epic: '#8b5cf6', legendary: '#f59e0b' };
  const unlockedCount = myAchievements.filter((a) => a.unlockedAt).length;

  if (loading) {
    return (
      <div className="w-full max-w-[1400px] mx-auto">
        <div className="mb-6 sm:mb-8">
          <div className="h-10 w-40 rounded-lg skeleton mb-2" />
          <div className="h-5 w-32 rounded skeleton" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="rounded-2xl skeleton skeleton-card p-5 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl skeleton" />
              <div className="h-5 w-24 mx-auto rounded skeleton mb-2" />
              <div className="h-3 w-32 mx-auto rounded skeleton mb-3" />
              <div className="h-2 w-full rounded-full skeleton mb-2" />
              <div className="h-4 w-16 mx-auto rounded skeleton" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 sm:mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">Achievements</h1>
          <p className="text-sm sm:text-base text-text-muted mt-1">Unlock rewards by completing challenges</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-success to-emerald-400 bg-clip-text text-transparent mb-1">{unlockedCount}</div>
          <div className="text-[10px] sm:text-xs text-text-muted font-medium">Unlocked</div>
        </div>
        <div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-primary to-neon-purple bg-clip-text text-transparent mb-1">{achievements.length}</div>
          <div className="text-[10px] sm:text-xs text-text-muted font-medium">Total</div>
        </div>
        <div className="bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl p-4 sm:p-6 text-center">
          <div className="text-xl sm:text-2xl font-extrabold bg-gradient-to-r from-warning to-amber-400 bg-clip-text text-transparent mb-1">{achievements.length - unlockedCount}</div>
          <div className="text-[10px] sm:text-xs text-text-muted font-medium">Remaining</div>
        </div>
      </div>

      {achievements.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-bg-card border border-white/5 flex items-center justify-center">
            <Trophy size={40} className="text-text-muted" />
          </div>
          <h3 className="text-xl font-bold mb-2">No Achievements</h3>
          <p className="text-sm text-text-muted">Check back later for new achievements</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {achievements.map((achievement) => {
            const progress = getProgress(achievement);
            const unlocked = isUnlocked(achievement);
            const claimable = canClaim(achievement);
            const color = rarityColors[achievement.rarity] || rarityColors.common;

            return (
              <div key={achievement.id} className="flex items-center gap-4 p-4 sm:p-5 bg-gradient-to-b from-bg-card-hover to-bg-card border border-white/5 rounded-2xl transition-all duration-300 hover:border-primary/30">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 ${unlocked ? '' : 'opacity-50'}`} style={{ backgroundColor: unlocked ? color : undefined }}>
                  {unlocked ? <Check size={28} color="white" /> : <Lock size={28} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-sm sm:text-base">{achievement.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase" style={{ backgroundColor: `${color}20`, color }}>
                      {achievement.rarity}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm text-text-muted mb-2">{achievement.description}</div>
                  {!unlocked && (
                    <div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: color }} />
                      </div>
                      <p className="text-xs text-text-muted mt-1.5">
                        {myAchievements.find((a) => a.achievementId === achievement.id)?.progress || 0} / {achievement.target}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="text-lg font-extrabold text-success">₹{achievement.reward}</div>
                  {claimable && (
                    <motion.button 
                      className="py-2 px-4 rounded-xl font-semibold text-xs cursor-pointer bg-gradient-to-r from-primary to-neon-purple text-white shadow-lg shadow-primary/30 transition-all duration-300 disabled:opacity-50"
                      onClick={() => handleClaim(achievement.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      disabled={claiming === achievement.id}
                    >
                      {claiming === achievement.id ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Claim'}
                    </motion.button>
                  )}
                  {unlocked && <span className="px-3 py-1 rounded-full bg-success/20 text-success text-xs font-semibold">Claimed</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Achievements;
