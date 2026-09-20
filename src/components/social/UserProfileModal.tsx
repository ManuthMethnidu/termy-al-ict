import React, { useState } from 'react';
import { FriendUser, UserStats } from '../../types';
import { toggleFollowUser, blockUser, startFriendStreak } from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';
import { getLeagueById } from '../../lib/leagueSystem';

interface UserProfileModalProps {
  currentUser: UserStats;
  targetUser: FriendUser;
  onClose: () => void;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onStreakStarted?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  currentUser,
  targetUser: initialUser,
  onClose,
  onUpdateStats,
  onStreakStarted,
}) => {
  const [user, setUser] = useState<FriendUser>(initialUser);
  const [isBlocked, setIsBlocked] = useState(false);
  const [streakToast, setStreakToast] = useState<string | null>(null);

  const league = getLeagueById(user.leagueId || 1);

  const handleToggleFollow = async () => {
    sounds.playClick();
    const res = await toggleFollowUser(currentUser, user);
    if (res.isFollowing) {
      sounds.playCorrect();
    }
    setUser((prev) => ({
      ...prev,
      isFollowing: res.isFollowing,
      isMutual: res.isMutual,
    }));
    if (onUpdateStats) {
      onUpdateStats({ followingCount: res.followingCount });
    }
  };

  const handleStartStreak = async () => {
    sounds.playFanfare();
    const res = await startFriendStreak(currentUser, user);
    setStreakToast(res.message);
    if (res.success) {
      setUser((prev) => ({ ...prev, hasFriendStreak: true, friendStreakDays: 1 }));
      if (onStreakStarted) onStreakStarted();
    }
    setTimeout(() => setStreakToast(null), 4000);
  };

  const handleBlockUser = async () => {
    if (window.confirm(`Are you sure you want to block ${user.name}? They will no longer see your activity or follow you.`)) {
      sounds.playIncorrect();
      await blockUser(currentUser.id || 'guest', user.id);
      setIsBlocked(true);
      setTimeout(() => onClose(), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      {streakToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-amber-500/90 text-black text-xs sm:text-sm font-black shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span>🔥</span>
          <span>{streakToast}</span>
        </div>
      )}

      <div className="relative w-full max-w-md rounded-3xl bg-[#131f24] border-2 border-card-border p-6 shadow-2xl flex flex-col gap-5 select-none">
        {/* Close Button */}
        <button
          onClick={() => {
            sounds.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* User Avatar & Basic Info */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="relative">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-3xl object-cover border-4 border-card-border shadow-xl ring-2 ring-primary/40"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-purple-800 to-indigo-700 border-4 border-card-border text-white text-3xl font-black flex items-center justify-center shadow-xl">
                {user.name.charAt(0)}
              </div>
            )}
            {user.isMutual && (
              <div
                className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-primary to-emerald-400 text-black text-[10px] font-black uppercase tracking-wider shadow-md flex items-center gap-1"
                title="Mutual Friends: You follow each other!"
              >
                <span>✨ Mutual</span>
              </div>
            )}
          </div>

          <h3 className="text-xl font-black text-on-surface mt-3">{user.name}</h3>
          <span className="text-xs text-secondary font-mono font-bold">{user.username}</span>
          <span className="text-xs text-text-muted mt-0.5">{user.school}</span>
        </div>

        {/* League & Streak Pills */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-text-muted">League</span>
            <span className="text-xs font-black text-on-surface mt-0.5 truncate w-full text-center" style={{ color: league.color }}>
              {league.name}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-text-muted">Streak</span>
            <span className="text-xs font-black text-orange-400 mt-0.5 flex items-center gap-0.5">
              <span>{user.streakDays}d</span>
              <span>🔥</span>
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase text-text-muted">Weekly XP</span>
            <span className="text-xs font-mono font-black text-primary mt-0.5">
              {user.weeklyXp || 0}
            </span>
          </div>
        </div>

        {/* Primary Action Button: Follow / Following */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleToggleFollow}
            className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 ${
              user.isFollowing
                ? 'bg-surface-container-high border border-card-border text-on-surface hover:text-crimson-heart hover:border-crimson-heart/40'
                : 'bg-primary text-on-primary-fixed hover:brightness-110'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {user.isFollowing ? 'check' : 'person_add'}
            </span>
            <span>{user.isFollowing ? 'Following (Tap to Unfollow)' : 'Follow Candidate'}</span>
          </button>

          {/* If Mutual Follow: Offer Friend Streak */}
          {user.isMutual && (
            <button
              onClick={handleStartStreak}
              disabled={user.hasFriendStreak}
              className={`w-full py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                user.hasFriendStreak
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-400/40 cursor-default'
                  : 'bg-gradient-to-r from-orange-500 to-amber-500 text-black hover:brightness-110 active:scale-95 shadow-md'
              }`}
            >
              <span>🔥</span>
              <span>
                {user.hasFriendStreak
                  ? `Active Friend Streak (${user.friendStreakDays || 1}d)`
                  : 'Initiate Mutual Friend Streak'}
              </span>
            </button>
          )}
        </div>

        {/* Privacy: Block User Option */}
        <div className="pt-2 border-t border-card-border/60 flex items-center justify-between text-xs text-text-muted">
          <span>Unilateral follow privacy</span>
          <button
            onClick={handleBlockUser}
            disabled={isBlocked}
            className="text-[11px] font-bold text-text-muted hover:text-crimson-heart transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">block</span>
            <span>{isBlocked ? 'Blocked' : 'Block User'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
