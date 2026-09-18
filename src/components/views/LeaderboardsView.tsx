import React, { useState, useEffect } from 'react';
import { UserStats, LeaderboardEntry } from '../../types';
import { fetchRealLeaderboard } from '../../lib/supabase';

interface LeaderboardsProps {
  userStats: UserStats;
}

export const LeaderboardsView: React.FC<LeaderboardsProps> = ({ userStats }) => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchRealLeaderboard(userStats).then((data) => {
      if (isMounted) {
        setLeaderboardData(data);
        setLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userStats]);

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto pb-24 md:pb-12">
      {/* Tier V League Emblem Stack */}
      <div className="flex flex-col items-center mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-14 rounded-xl bg-surface-container-high flex items-center justify-center opacity-40 shadow-sm">
            <span className="material-symbols-outlined text-text-muted text-2xl">shield</span>
          </div>
          <div className="w-14 h-16 rounded-xl bg-surface-container-high flex items-center justify-center opacity-60 shadow-sm">
            <span className="material-symbols-outlined text-text-muted text-3xl">military_tech</span>
          </div>
          <div className="w-20 h-24 rounded-2xl bg-gradient-to-b from-[#1e3e4a] to-[#12242c] flex flex-col items-center justify-center shadow-xl border border-secondary/40 -mt-2">
            <span
              className="material-symbols-outlined text-secondary text-4xl drop-shadow-[0_0_10px_rgba(136,206,255,0.6)]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              diamond
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-secondary mt-1">
              Tier V
            </span>
          </div>
          <div className="w-14 h-16 rounded-xl bg-surface-container-high flex items-center justify-center opacity-60 shadow-sm">
            <span className="material-symbols-outlined text-text-muted text-3xl">stars</span>
          </div>
          <div className="w-12 h-14 rounded-xl bg-surface-container-high flex items-center justify-center opacity-40 shadow-sm">
            <span className="material-symbols-outlined text-text-muted text-2xl">lock</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-on-surface tracking-wide mb-1 text-center">
          Diamond League
        </h1>
        <p className="text-sm text-text-muted text-center flex items-center gap-2 justify-center">
          <span>Top candidates qualify for Sri Lankan A/L Distinction Hall</span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-card-border" />
          <span className="text-lightning-gold font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-base">schedule</span> Weekly Reset Sunday
          </span>
        </p>

        {/* Weekly ICT Sprint Banner */}
        <div className="w-full mt-6 p-4 rounded-xl bg-surface-container-low border border-card-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-2xl">terminal</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-bold text-on-surface">Weekly Active Sprint</span>
              <span className="text-xs text-text-muted">Real-time candidate telemetry from PostgreSQL</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="block text-[10px] text-text-muted uppercase tracking-wider">Advancement Pool</span>
              <span className="text-sm font-bold text-secondary">+50 Bits & Badge</span>
            </div>
            <div className="h-8 w-px bg-card-border" />
            <div className="text-right">
              <span className="block text-[10px] text-text-muted uppercase tracking-wider">Your XP</span>
              <span className="text-sm font-bold text-primary">{userStats.xp.toLocaleString()} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table List */}
      <div className="flex flex-col gap-2.5 w-full select-none" id="leaderboard-table">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-text-muted">
            <span className="material-symbols-outlined text-3xl animate-spin text-primary">
              sync
            </span>
            <span className="text-xs font-mono">Fetching live rankings from Supabase...</span>
          </div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-12 p-6 rounded-2xl bg-card-dark border border-card-border text-text-muted">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">military_tech</span>
            <h3 className="text-base font-bold text-on-surface">No Candidates Registered Yet</h3>
            <p className="text-xs mt-1">Complete your first drill session to claim Rank 1!</p>
          </div>
        ) : (
          leaderboardData.map((item) => {
            const isGold = item.rank === 1;
            const isSilver = item.rank === 2 && !item.isCurrentUser;
            const isBronze = item.rank === 3;

            let rankBadgeBg = 'bg-text-muted/15 text-text-muted';
            if (isGold) rankBadgeBg = 'bg-lightning-gold/20 text-lightning-gold';
            else if (isSilver) rankBadgeBg = 'bg-secondary/20 text-secondary';
            else if (isBronze) rankBadgeBg = 'bg-orange-400/20 text-orange-400';
            if (item.isCurrentUser) rankBadgeBg = 'bg-primary/20 text-primary';

            return (
              <div
                key={item.id || item.rank}
                className={`relative rounded-xl p-4 shadow-md transition-all duration-150 flex items-center justify-between ${
                  item.isCurrentUser
                    ? 'bg-surface-container border-2 border-primary shadow-[0_3px_0_#46a302]'
                    : 'bg-card-dark border border-card-border hover:bg-surface-variant'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank number or medal */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 font-bold text-sm ${rankBadgeBg}`}>
                    {isGold ? (
                      <span
                        className="material-symbols-outlined text-lightning-gold text-2xl"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        workspace_premium
                      </span>
                    ) : (
                      item.rank
                    )}
                  </div>

                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {item.avatarUrl ? (
                      <img
                        src={item.avatarUrl}
                        alt={item.name}
                        className="w-11 h-11 rounded-xl object-cover border border-card-border"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center font-bold text-sm text-on-surface">
                        {item.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    )}
                    {item.streak > 3 && (
                      <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-surface-container-lowest px-1 py-0.5 rounded-full shadow-sm">
                        🔥
                      </span>
                    )}
                  </div>

                  {/* Name & School info */}
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm sm:text-base text-on-surface truncate">
                        {item.name} {item.isCurrentUser ? '(You)' : ''}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-lightning-gold font-extrabold shrink-0">
                        {item.level}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted truncate">
                      {item.school}
                    </span>
                  </div>
                </div>

                {/* XP Count */}
                <div className="flex items-center gap-1.5 shrink-0 pl-4">
                  <span className={`text-base sm:text-lg font-extrabold font-mono tracking-tight ${
                    item.isCurrentUser ? 'text-primary' : 'text-on-surface'
                  }`}>
                    {item.xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] uppercase font-extrabold text-text-muted">
                    XP
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
