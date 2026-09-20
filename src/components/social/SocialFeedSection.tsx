import React, { useState, useEffect } from 'react';
import { SocialActivity, FriendUser } from '../../types';
import { getSocialFeed, fetchSocialFeed, reactToActivity } from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface SocialFeedSectionProps {
  onOpenUserProfile?: (user: FriendUser) => void;
  onOpenAddFriends?: () => void;
}

export const SocialFeedSection: React.FC<SocialFeedSectionProps> = ({
  onOpenUserProfile,
  onOpenAddFriends,
}) => {
  const [feed, setFeed] = useState<SocialActivity[]>(() => getSocialFeed());

  useEffect(() => {
    fetchSocialFeed().then((latest) => {
      if (latest && latest.length > 0) {
        setFeed(latest);
      }
    });
  }, []);

  const handleReact = (
    activityId: string,
    reaction: 'highFive' | 'congrats' | 'celebrate' | 'letsGo'
  ) => {
    sounds.playFanfare();

    // Mini celebratory burst
    if (typeof window !== 'undefined') {
      confetti({
        particleCount: 20,
        spread: 50,
        origin: { y: 0.7 },
        scalar: 0.8,
      });
    }

    const res = reactToActivity(activityId, reaction);
    setFeed([...res.feed]);
  };

  return (
    <div className="flex flex-col gap-4 w-full select-none">
      {/* Feed Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-2xl">dynamic_feed</span>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-black text-on-surface">Friends Activity Feed</h3>
            <span className="px-2 py-0.5 rounded-full bg-secondary/20 text-secondary text-[10px] font-black uppercase">
              Live Timeline
            </span>
          </div>
        </div>

        {onOpenAddFriends && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAddFriends();
            }}
            className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">person_add</span>
            <span>Discover Friends</span>
          </button>
        )}
      </div>

      <p className="text-xs text-text-muted">
        Cheer on your classmates as they conquer past papers, achieve massive streaks, and get promoted in national leagues!
      </p>

      {/* Feed List */}
      <div className="flex flex-col gap-3.5">
        {feed.map((act) => {
          return (
            <div
              key={act.id}
              className="p-5 rounded-3xl bg-card-dark border border-card-border shadow-sm flex flex-col gap-3.5 hover:border-card-border/80 transition-all"
            >
              {/* User Header */}
              <div className="flex items-center justify-between">
                <div
                  onClick={() => {
                    if (onOpenUserProfile) {
                      onOpenUserProfile({
                        id: act.userId,
                        name: act.userName,
                        username: act.userUsername,
                        avatarUrl: act.userAvatarUrl,
                        school: 'Royal College • Colombo 07',
                        streakDays: 48,
                        xp: 2840,
                        weeklyXp: 720,
                        leagueId: 10,
                        leagueName: 'Diamond League',
                        isFollowing: true,
                        isFollower: true,
                        isMutual: true,
                      });
                    }
                  }}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  {act.userAvatarUrl ? (
                    <img
                      src={act.userAvatarUrl}
                      alt={act.userName}
                      className="w-10 h-10 rounded-2xl object-cover border border-card-border group-hover:ring-2 group-hover:ring-primary transition-all"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-black text-sm">
                      {act.userName.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col">
                    <span className="font-extrabold text-sm text-on-surface group-hover:text-primary transition-colors">
                      {act.userName}
                    </span>
                    <span className="text-[11px] text-text-muted font-mono">{act.userUsername}</span>
                  </div>
                </div>

                <span className="text-[11px] text-text-muted font-mono font-medium">
                  {act.timeAgo}
                </span>
              </div>

              {/* Milestone Event Banner */}
              <div className="p-3.5 rounded-2xl bg-surface-container/70 border border-card-border/60 flex flex-col gap-1">
                <h4 className="font-black text-sm text-on-surface flex items-center gap-2">
                  <span>{act.title}</span>
                </h4>
                <p className="text-xs text-text-muted leading-relaxed">{act.description}</p>
              </div>

              {/* Celebration Reaction Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-card-border/40">
                <button
                  onClick={() => handleReact(act.id, 'highFive')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    act.userReaction === 'highFive'
                      ? 'bg-primary text-on-primary-fixed shadow scale-105'
                      : 'bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface border border-card-border/50'
                  }`}
                >
                  <span>👋</span>
                  <span>High Five</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {act.reactions.highFive > 0 && `(${act.reactions.highFive})`}
                  </span>
                </button>

                <button
                  onClick={() => handleReact(act.id, 'congrats')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    act.userReaction === 'congrats'
                      ? 'bg-amber-400 text-black shadow scale-105'
                      : 'bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface border border-card-border/50'
                  }`}
                >
                  <span>🎉</span>
                  <span>Congrats</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {act.reactions.congrats > 0 && `(${act.reactions.congrats})`}
                  </span>
                </button>

                <button
                  onClick={() => handleReact(act.id, 'celebrate')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    act.userReaction === 'celebrate'
                      ? 'bg-purple-500 text-white shadow scale-105'
                      : 'bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface border border-card-border/50'
                  }`}
                >
                  <span>🚀</span>
                  <span>Celebrate</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {act.reactions.celebrate > 0 && `(${act.reactions.celebrate})`}
                  </span>
                </button>

                <button
                  onClick={() => handleReact(act.id, 'letsGo')}
                  className={`py-1.5 px-3 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                    act.userReaction === 'letsGo'
                      ? 'bg-orange-500 text-white shadow scale-105'
                      : 'bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface border border-card-border/50'
                  }`}
                >
                  <span>🔥</span>
                  <span>Let's Go</span>
                  <span className="font-mono text-[11px] opacity-80">
                    {act.reactions.letsGo > 0 && `(${act.reactions.letsGo})`}
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
