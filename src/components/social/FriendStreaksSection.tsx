import React, { useState } from 'react';
import { FriendStreak, UserStats } from '../../types';
import { getFriendStreaks } from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';

interface FriendStreaksSectionProps {
  currentUser: UserStats;
  onOpenAddFriends?: () => void;
  onStartDrill?: () => void;
}

export const FriendStreaksSection: React.FC<FriendStreaksSectionProps> = ({
  currentUser,
  onOpenAddFriends,
  onStartDrill,
}) => {
  const [streaks] = useState<FriendStreak[]>(() => getFriendStreaks(currentUser));
  const [nudgedFriends, setNudgedFriends] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleNudge = (streak: FriendStreak) => {
    sounds.playClick();
    setNudgedFriends((prev) => [...prev, streak.friendId]);
    sounds.playCorrect();
    setToastMessage(`Nudged ${streak.friendName} to complete today's ICT drill and keep your ${streak.streakDays}-day streak burning! 🔥`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="flex flex-col gap-3.5 w-full select-none">
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-surface-container-highest/95 border-2 border-primary text-on-surface text-xs font-black shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
          <span>🔥</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔥</span>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-on-surface">Friend Streaks</h3>
            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-black uppercase tracking-wider">
              {streaks.length}/5 Active
            </span>
          </div>
        </div>

        {streaks.length < 5 && onOpenAddFriends && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddFriends();
            }}
            className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Add Friend Streak</span>
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted">
        Shared commitment with mutual friends. Both of you must complete at least 1 drill daily to keep each sub-streak alive!
      </p>

      {/* Streaks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {streaks.map((streak) => {
          const isNudged = nudgedFriends.includes(streak.friendId);

          return (
            <div
              key={streak.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#271810]/80 via-card-dark to-[#161f24] border border-orange-500/30 shadow-md flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  {streak.friendAvatarUrl ? (
                    <img
                      src={streak.friendAvatarUrl}
                      alt={streak.friendName}
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-orange-400 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-orange-950 border border-orange-500/50 text-orange-300 flex items-center justify-center font-black text-base">
                      {streak.friendName.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm text-on-surface truncate">
                      {streak.friendName}
                    </span>
                    <span className="text-[11px] text-text-muted truncate font-mono">
                      {streak.friendUsername}
                    </span>
                  </div>
                </div>

                {/* Flame Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-black text-sm shrink-0">
                  <span className="text-base animate-pulse">🔥</span>
                  <span>{streak.streakDays}d</span>
                </div>
              </div>

              {/* Status Indicators: You vs Friend */}
              <div className="flex items-center justify-between pt-2 border-t border-card-border/50 text-xs">
                <div className="flex items-center gap-3">
                  <div
                    onClick={() => onStartDrill && onStartDrill()}
                    className={`flex items-center gap-1.5 font-bold ${onStartDrill ? 'cursor-pointer hover:underline' : ''}`}
                    title="Practice a drill to keep your friend streaks burning"
                  >
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-text-muted">You:</span>
                    <span className="text-primary">Done ✓</span>
                  </div>

                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        streak.friendCompletedToday ? 'bg-primary' : 'bg-amber-400 animate-ping'
                      }`}
                    />
                    <span className="text-text-muted">{streak.friendName.split(' ')[0]}:</span>
                    <span className={streak.friendCompletedToday ? 'text-primary' : 'text-amber-400'}>
                      {streak.friendCompletedToday ? 'Done ✓' : 'Waiting...'}
                    </span>
                  </div>
                </div>

                {!streak.friendCompletedToday && (
                  <button
                    onClick={() => handleNudge(streak)}
                    disabled={isNudged}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                      isNudged
                        ? 'bg-surface-container text-text-muted'
                        : 'bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-400/30 active:scale-95'
                    }`}
                  >
                    {isNudged ? 'Nudged 💬' : 'Nudge 🔔'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty Slot Card to prompt adding up to 5 */}
        {streaks.length < 5 && (
          <div
            onClick={() => {
              sounds.playClick();
              if (onOpenAddFriends) onOpenAddFriends();
            }}
            className="p-4 rounded-2xl bg-surface-container/30 border-2 border-dashed border-card-border/70 hover:border-primary/50 hover:bg-surface-container/60 cursor-pointer transition-all flex items-center justify-center gap-3 text-text-muted hover:text-on-surface min-h-[90px]"
          >
            <span className="material-symbols-outlined text-2xl text-primary">add_circle</span>
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-on-surface">
                Start a New Friend Streak
              </span>
              <span className="text-[11px] text-text-muted">
                Pick a mutual friend ({5 - streaks.length} slots left)
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
