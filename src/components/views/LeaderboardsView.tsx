import React, { useState, useEffect } from 'react';
import { UserStats, LeaderboardEntry, FriendUser } from '../../types';
import { fetchRealLeaderboard } from '../../lib/supabase';
import {
  LEAGUES,
  LeagueDefinition,
  getLeagueById,
  getTimeUntilWeeklyReset,
  DIAMOND_TOURNAMENT_ROUNDS,
} from '../../lib/leagueSystem';
import { sounds } from '../../lib/sound';
import { UserProfileModal } from '../social/UserProfileModal';
import { isUserFollowed } from '../../lib/friendsSystem';

interface LeaderboardsProps {
  userStats: UserStats;
  onStartPractice?: () => void;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
}

type MainViewMode = 'division' | 'showcase';

export const LeaderboardsView: React.FC<LeaderboardsProps> = ({
  userStats,
  onStartPractice,
  onUpdateStats,
}) => {
  const currentLeagueId = userStats.leagueId || 1;
  const [viewMode, setViewMode] = useState<MainViewMode>('division');
  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(currentLeagueId);
  const [activeTabMode, setActiveTabMode] = useState<'cohort' | 'tournament'>('cohort');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [resetCountdown, setResetCountdown] = useState(getTimeUntilWeeklyReset());
  const [inspectUser, setInspectUser] = useState<FriendUser | null>(null);

  // Active selected league metadata
  const selectedLeague: LeagueDefinition = getLeagueById(selectedLeagueId);
  const userLeague: LeagueDefinition = getLeagueById(currentLeagueId);
  const isViewingUserLeague = selectedLeagueId === currentLeagueId;

  // Sync selected league when user's actual league changes
  useEffect(() => {
    setSelectedLeagueId(userStats.leagueId || 1);
  }, [userStats.leagueId]);

  // Live countdown timer ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setResetCountdown(getTimeUntilWeeklyReset());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch cohort whenever selected league or user stats change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetchRealLeaderboard(
      userStats,
      selectedLeagueId,
      userStats.leagueGroupNumber || 1
    ).then((data) => {
      if (isMounted) {
        setLeaderboardData(data);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedLeagueId, userStats.weeklyXp, userStats.xp, userStats.leagueGroupNumber]);

  // Find user's dynamic rank in this cohort
  const userRankEntry = leaderboardData.find((entry) => entry.isCurrentUser);
  const userRank = userRankEntry?.rank || 1;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto pb-24 md:pb-12 px-2 sm:px-4 select-none">
      {/* 1. TOP VIEW SWITCHER: [ My Division Leaderboard ] vs [ All 10 Leagues Showcase ] */}
      <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-surface-container border-2 border-card-border mb-6 shadow-md">
        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('division');
            setSelectedLeagueId(currentLeagueId);
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            viewMode === 'division'
              ? 'bg-primary text-on-primary-fixed shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl font-bold">military_tech</span>
          <span>My Division Leaderboard</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setViewMode('showcase');
          }}
          className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
            viewMode === 'showcase'
              ? 'bg-secondary text-on-secondary shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-lg sm:text-xl font-bold">shield</span>
          <span>All 10 Leagues Showcase</span>
        </button>
      </div>

      {/* VIEW MODE 1: MY DIVISION LEADERBOARD */}
      {viewMode === 'division' ? (
        <>
          {/* Quick League Selector Carousel */}
          <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-text-muted flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm text-primary">emoji_events</span>
                Leagues in Order (1 to 10)
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  setIsHowItWorksOpen(true);
                }}
                className="text-xs text-primary hover:text-primary-hover font-bold flex items-center gap-1 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">info</span>
                <span>How Leagues Work</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar select-none">
              {LEAGUES.map((league) => {
                const isUserCurrent = league.id === currentLeagueId;
                const isSelected = league.id === selectedLeagueId;
                const isUnlocked = league.id <= currentLeagueId;

                return (
                  <button
                    key={league.id}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedLeagueId(league.id);
                      if (league.id !== 10 && activeTabMode === 'tournament') {
                        setActiveTabMode('cohort');
                      }
                    }}
                    className={`relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[76px] transition-all duration-200 shrink-0 border-2 ${
                      isSelected
                        ? `bg-surface-container ${league.borderColor} shadow-lg scale-105`
                        : 'bg-surface-container-low/70 border-card-border/60 hover:border-card-border hover:bg-surface-container/50 opacity-80'
                    }`}
                  >
                    {isUserCurrent && (
                      <span className="absolute -top-2 px-1.5 py-0.5 rounded-full bg-primary text-on-primary-fixed text-[9px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                        You
                      </span>
                    )}

                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-1 ${league.badgeBg}`}
                      style={{ color: league.color }}
                    >
                      <span
                        className="material-symbols-outlined text-2xl"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        {league.icon}
                      </span>
                    </div>

                    <span className="text-[11px] font-extrabold text-on-surface leading-tight">
                      {league.name}
                    </span>
                    <span className="text-[9px] text-text-muted font-bold tracking-wider uppercase mt-0.5">
                      #{league.order}
                    </span>

                    {!isUnlocked && (
                      <span className="absolute bottom-1 right-1 text-text-muted/60 material-symbols-outlined text-xs">
                        lock
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User Not In Selected League Notice */}
          {!isViewingUserLeague && (
            <div className="mb-4 p-3.5 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-lg">info</span>
                <span className="text-text-muted">
                  You are competing in <strong className="text-on-surface">{userLeague.name} League</strong>. Currently viewing preview of <strong className="text-primary">{selectedLeague.name} League</strong>.
                </span>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  setSelectedLeagueId(currentLeagueId);
                }}
                className="px-3 py-1 rounded-xl bg-primary text-on-primary-fixed text-xs font-black uppercase tracking-wider hover:brightness-110 shrink-0"
              >
                Back to My League
              </button>
            </div>
          )}

          {/* ACTIVE LEAGUE HERO CARD & RESET TIMER */}
          <div
            className={`relative w-full rounded-3xl p-6 sm:p-7 border-2 ${selectedLeague.borderColor} bg-gradient-to-b ${selectedLeague.gradient} shadow-2xl mb-6 overflow-hidden`}
          >
            <div
              className="absolute -right-12 -top-12 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: selectedLeague.color }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-xl ${selectedLeague.badgeBg} ${selectedLeague.borderColor}`}
                  style={{ color: selectedLeague.color }}
                >
                  <span
                    className="material-symbols-outlined text-4xl sm:text-5xl drop-shadow-md"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {selectedLeague.icon}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-0.5">
                    Order #{selectedLeague.order}
                  </span>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-on-surface tracking-wide">
                      {selectedLeague.name} League
                    </h1>
                    {isViewingUserLeague && (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-xs font-extrabold uppercase tracking-wide">
                        Active Division
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text-muted mt-1 leading-relaxed max-w-md">
                    {selectedLeague.description}
                  </p>
                </div>
              </div>

              {/* Division Cohort Telemetry & Timer */}
              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container/70 border border-card-border/60">
                    <span className="material-symbols-outlined text-sm text-lightning-gold">schedule</span>
                    <span className="text-xs font-mono font-bold text-on-surface">
                      {resetCountdown.formatted}
                    </span>
                  </div>
                  {onStartPractice && (
                    <button
                      onClick={onStartPractice}
                      className="px-3 py-1.5 rounded-xl bg-primary text-on-primary-fixed text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-sm flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm font-bold">bolt</span>
                      <span>Practice</span>
                    </button>
                  )}
                </div>
                <span className="text-[11px] text-text-muted">
                  Division #{userStats.leagueGroupNumber || 1} • Your Rank: #{userRank}
                </span>
              </div>
            </div>

            {/* Promotion & Demotion Rules Banner */}
            <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <span className="material-symbols-outlined text-primary text-base">arrow_upward</span>
                <span className="text-text-muted">
                  {selectedLeague.id === 10 ? (
                    <>Top <strong className="text-on-surface">10</strong> qualify for Tournament</>
                  ) : (
                    <>Top <strong className="text-on-surface">{selectedLeague.minPromoteRank}</strong> promote to next tier</>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <span className="material-symbols-outlined text-text-muted text-base">remove</span>
                <span className="text-text-muted">
                  Ranks <strong className="text-on-surface">8–25</strong> maintain safe status
                </span>
              </div>

              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/30 border border-white/5">
                <span className="material-symbols-outlined text-crimson-heart text-base">arrow_downward</span>
                <span className="text-text-muted">
                  {selectedLeague.maxDemoteRank === 0 ? (
                    <><strong className="text-on-surface">No demotion</strong> in Bronze</>
                  ) : (
                    <>Bottom <strong className="text-on-surface">5</strong> (Ranks 26–30) demote</>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* TOURNAMENT TAB SWITCHER (For Diamond League) */}
          {selectedLeague.id === 10 && (
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-surface-container border border-card-border mb-6">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTabMode('cohort');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTabMode === 'cohort'
                    ? 'bg-primary text-on-primary-fixed shadow-md'
                    : 'text-text-muted hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-base">groups</span>
                <span>Division Leaderboard</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTabMode('tournament');
                }}
                className={`py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  activeTabMode === 'tournament'
                    ? 'bg-cyan-500 text-black shadow-md'
                    : 'text-cyan-400 hover:text-cyan-300'
                }`}
              >
                <span className="material-symbols-outlined text-base">emoji_events</span>
                <span>Diamond Tournament</span>
              </button>
            </div>
          )}

          {/* DIAMOND TOURNAMENT VIEW */}
          {selectedLeague.id === 10 && activeTabMode === 'tournament' ? (
            <div className="flex flex-col gap-4 animate-in fade-in duration-200">
              <div className="p-6 rounded-2xl bg-surface-container border-2 border-cyan-500/40 shadow-xl flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
                    <span className="material-symbols-outlined text-2xl font-bold">trophy</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-on-surface">The Diamond Tournament</h3>
                    <span className="text-xs text-text-muted">
                      Multi-week knockout championship for the highest achieving A/L ICT students
                    </span>
                  </div>
                </div>

                <p className="text-xs text-text-muted leading-relaxed">
                  Reaching the Diamond League unlocks multi-week knockout tournament rounds for top performers. Finishing in the Top 10 advances you through the Quarter-Finals and Semi-Finals to the National Championship!
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {DIAMOND_TOURNAMENT_ROUNDS.map((round) => (
                    <div
                      key={round.stage}
                      className="p-4 rounded-xl border bg-surface-container-high/60 border-card-border flex flex-col justify-between gap-3"
                    >
                      <div>
                        <span className="text-[10px] uppercase font-mono font-black text-cyan-400">
                          {round.week}
                        </span>
                        <h4 className="font-extrabold text-sm text-on-surface mt-1">{round.title}</h4>
                        <p className="text-[11px] text-text-muted mt-1 leading-normal">
                          {round.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-lightning-gold">
                          {round.cutoffText}
                        </span>
                        <span className="text-[10px] text-text-muted font-mono">{round.reward}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* COHORT LEADERBOARD TABLE */
            <div className="flex flex-col gap-2.5 w-full select-none" id="leaderboard-table">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
                  <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
                  <span className="text-xs font-mono">
                    Loading {selectedLeague.name} Division leaderboard...
                  </span>
                </div>
              ) : leaderboardData.length === 0 ? (
                <div className="text-center py-12 p-6 rounded-2xl bg-surface-container border border-card-border text-text-muted">
                  <span className="material-symbols-outlined text-4xl text-primary mb-2">military_tech</span>
                  <h3 className="text-base font-bold text-on-surface">No Candidates in this League Yet</h3>
                  <p className="text-xs mt-1">Complete drills and earn XP to advance into this tier!</p>
                </div>
              ) : (
                leaderboardData.map((item, index) => {
                  const isFirst = item.rank === 1;
                  const isSecond = item.rank === 2;
                  const isThird = item.rank === 3;

                  // Zone classifications
                  const isPromotion = item.rank <= selectedLeague.minPromoteRank;
                  const isDemotion =
                    selectedLeague.maxDemoteRank > 0 && item.rank >= selectedLeague.maxDemoteRank;

                  const showPromotionHeader = index === 0;
                  const showSafeHeader = index === selectedLeague.minPromoteRank;
                  const showDemotionHeader =
                    selectedLeague.maxDemoteRank > 0 && index === selectedLeague.maxDemoteRank - 1;

                  return (
                    <React.Fragment key={item.id || item.rank}>
                      {showPromotionHeader && (
                        <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-[11px] font-black uppercase tracking-wider mb-0.5">
                          <span className="material-symbols-outlined text-sm font-bold">arrow_upward</span>
                          {selectedLeague.id === 10 ? (
                            <span>Diamond Tournament Qualification Zone (Top 10 Advance)</span>
                          ) : (
                            <span>Promotion Zone (Top {selectedLeague.minPromoteRank} Advance to Next League)</span>
                          )}
                        </div>
                      )}

                      {showSafeHeader && (
                        <div className="flex items-center gap-2 py-1 px-3 rounded-lg bg-surface-container/60 border border-card-border/60 text-text-muted text-[10px] font-extrabold uppercase tracking-wider my-1">
                          <span className="material-symbols-outlined text-xs">horizontal_rule</span>
                          <span>Safe Zone (Ranks 8 to 25 Retain {selectedLeague.name} League)</span>
                        </div>
                      )}

                      {showDemotionHeader && (
                        <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-crimson-heart/10 border border-crimson-heart/30 text-crimson-heart text-[11px] font-black uppercase tracking-wider my-1">
                          <span className="material-symbols-outlined text-sm font-bold">arrow_downward</span>
                          <span>Demotion Zone (Bottom 5 Drop Down on Weekly Reset)</span>
                        </div>
                      )}

                      {/* Candidate Card */}
                      <div
                        onClick={() => {
                          if (!item.isCurrentUser) {
                            sounds.playClick();
                            const targetId = item.id || `user_${item.username.replace('@', '')}`;
                            setInspectUser({
                              id: targetId,
                              name: item.name,
                              username: item.username,
                              avatarUrl: item.avatarUrl,
                              school: item.school,
                              streakDays: item.streak,
                              xp: item.xp,
                              weeklyXp: item.xp,
                              leagueId: selectedLeague.id,
                              leagueName: selectedLeague.name,
                              isFollowing: isUserFollowed(targetId),
                              isFollower: false,
                              isMutual: false,
                            });
                          }
                        }}
                        className={`relative rounded-2xl p-3.5 sm:p-4 transition-all duration-150 flex items-center justify-between ${
                          item.isCurrentUser
                            ? 'bg-surface-container border-2 border-primary shadow-[0_3px_0_#46a302] ring-2 ring-primary/30'
                            : isPromotion
                            ? 'bg-surface-container border border-primary/20 hover:bg-surface-container-high cursor-pointer group'
                            : isDemotion
                            ? 'bg-surface-container border border-crimson-heart/20 hover:bg-surface-container-high cursor-pointer group'
                            : 'bg-surface-container border border-card-border hover:bg-surface-container-high cursor-pointer group'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          {/* Rank Badge */}
                          <div
                            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                              isFirst
                                ? 'bg-lightning-gold/25 text-lightning-gold shadow-sm'
                                : isSecond
                                ? 'bg-slate-300/25 text-slate-200 shadow-sm'
                                : isThird
                                ? 'bg-amber-600/25 text-amber-500 shadow-sm'
                                : item.isCurrentUser
                                ? 'bg-primary/20 text-primary'
                                : 'bg-surface-container-high text-text-muted'
                            }`}
                          >
                            {isFirst ? (
                              <span className="material-symbols-outlined text-2xl font-bold">
                                workspace_premium
                              </span>
                            ) : isSecond ? (
                              <span className="material-symbols-outlined text-2xl font-bold">
                                military_tech
                              </span>
                            ) : isThird ? (
                              <span className="material-symbols-outlined text-2xl font-bold">
                                stars
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
                                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover border border-card-border"
                              />
                            ) : (
                              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-purple-800 to-indigo-700 text-white font-bold flex items-center justify-center text-sm">
                                {item.name.charAt(0)}
                              </div>
                            )}
                          </div>

                          {/* Details */}
                          <div className="min-w-0 flex flex-col">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-extrabold truncate ${
                                  item.isCurrentUser ? 'text-primary' : 'text-on-surface'
                                }`}
                              >
                                {item.name}
                              </span>
                              {item.isCurrentUser && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-primary text-on-primary-fixed">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-text-muted truncate">
                              <span className="font-mono text-[11px]">{item.username}</span>
                              <span>•</span>
                              <span className="truncate">{item.school}</span>
                            </div>
                          </div>
                        </div>

                        {/* XP & Streak & Top 3 Gem Prize */}
                        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
                          {item.rank <= 3 && selectedLeague.gemPrizes && (
                            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-secondary/15 border border-secondary/30 text-secondary font-mono font-bold text-xs shadow-sm" title={`Top 3 Podium Reward: +${selectedLeague.gemPrizes[item.rank - 1]} Gems`}>
                              <span>💎</span>
                              <span>+{selectedLeague.gemPrizes[item.rank - 1]}</span>
                            </div>
                          )}

                          {item.streak > 0 && (
                            <div className="hidden sm:flex items-center gap-1 text-xs font-mono font-bold text-amber-400">
                              <span>🔥</span>
                              <span>{item.streak}</span>
                            </div>
                          )}
                          <div className="flex flex-col items-end">
                            <span className="text-sm sm:text-base font-black font-mono text-on-surface">
                              {item.xp} <span className="text-xs text-lightning-gold">XP</span>
                            </span>
                            <span className="text-[10px] text-text-muted">this week</span>
                          </div>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })
              )}
            </div>
          )}
        </>
      ) : (
        /* VIEW MODE 2: ALL 10 LEAGUES SHOWCASE */
        <div className="flex flex-col gap-6 animate-in fade-in duration-200">
          {/* Header Explanation of the 10-Tier Hierarchy */}
          <div className="p-6 sm:p-7 rounded-3xl bg-surface-container border-2 border-card-border shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary shadow-md">
                <span className="material-symbols-outlined text-2xl font-bold">trophy</span>
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-on-surface">
                  Official National League System
                </h2>
                <span className="text-xs text-text-muted">
                  10 Leagues in Order • Weekly Promotion & Demotion • Diamond Tournament
                </span>
              </div>
            </div>

            {/* The 4 Core Rules Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-card-border flex gap-2.5">
                <span className="material-symbols-outlined text-lightning-gold text-xl shrink-0 mt-0.5">
                  schedule
                </span>
                <div>
                  <strong className="text-on-surface block text-xs mb-0.5">Weekly Reset</strong>
                  <p className="text-text-muted leading-relaxed">
                    Competitions reset weekly (Sunday midnight UTC), and your XP points go back to zero for the new leaderboard.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-card-border flex gap-2.5">
                <span className="material-symbols-outlined text-secondary text-xl shrink-0 mt-0.5">
                  groups
                </span>
                <div>
                  <strong className="text-on-surface block text-xs mb-0.5">30-Learner Grouping</strong>
                  <p className="text-text-muted leading-relaxed">
                    You are placed in a group with up to 30 other active learners who started earning XP around the same time.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-card-border flex gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl shrink-0 mt-0.5">
                  swap_vert
                </span>
                <div>
                  <strong className="text-on-surface block text-xs mb-0.5">Promotion and Demotion</strong>
                  <p className="text-text-muted leading-relaxed">
                    Finishing near the top (Top 7) moves you up to the next league, while finishing at the bottom can drop you down.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-container-high/60 border border-card-border flex gap-2.5">
                <span className="material-symbols-outlined text-cyan-400 text-xl shrink-0 mt-0.5">
                  diamond
                </span>
                <div>
                  <strong className="text-on-surface block text-xs mb-0.5">Diamond Tournament</strong>
                  <p className="text-text-muted leading-relaxed">
                    Reaching the Diamond League unlocks multi-week tournament rounds for top performers across Sri Lanka!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ALL 10 LEAGUES IN STRICT ORDER (1 TO 10) */}
          <div className="flex flex-col gap-3.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-text-muted px-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">format_list_numbered</span>
              All 10 Leagues in Order
            </h3>

            {LEAGUES.map((league) => {
              const isCurrent = league.id === currentLeagueId;
              const isCompleted = league.id < currentLeagueId;

              return (
                <div
                  key={league.id}
                  className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrent
                      ? `bg-surface-container ${league.borderColor} shadow-xl ring-2 ring-primary/40`
                      : isCompleted
                      ? 'bg-surface-container/90 border-card-border/80 opacity-90'
                      : 'bg-surface-container/60 border-card-border/50 opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Order Number & League Badge */}
                    <div
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border shadow-md ${league.badgeBg} ${league.borderColor}`}
                      style={{ color: league.color }}
                    >
                      <span
                        className="material-symbols-outlined text-3xl sm:text-4xl"
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        {league.icon}
                      </span>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black font-mono text-text-muted uppercase tracking-wider">
                          Order #{league.order}
                        </span>
                        <h4 className="text-lg font-black text-on-surface">
                          {league.name} League
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container-high border border-card-border text-[10px] font-black uppercase tracking-wider text-text-muted">
                          {league.tierLabel}
                        </span>

                        {isCurrent && (
                          <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary-fixed text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
                            Your Current League
                          </span>
                        )}
                        {isCompleted && (
                          <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/40 text-[10px] font-black uppercase tracking-wider">
                            Unlocked ✓
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-text-muted mt-1 leading-relaxed max-w-xl">
                        {league.description}
                      </p>

                      {/* Promotion / Demotion Rules */}
                      <div className="flex items-center gap-3 text-[11px] text-text-muted mt-2">
                        <span className="flex items-center gap-1 text-primary font-bold">
                          <span className="material-symbols-outlined text-xs">arrow_upward</span>
                          {league.id === 10
                            ? 'Top 10 Qualify for Tournament'
                            : `Top ${league.minPromoteRank} Promote`}
                        </span>
                        <span>•</span>
                        <span>Ranks 8–25 Safe</span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-crimson-heart font-bold">
                          <span className="material-symbols-outlined text-xs">arrow_downward</span>
                          {league.maxDemoteRank === 0 ? 'No Demotion' : 'Bottom 5 Demote'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Action / Status Badge */}
                  <div className="flex items-center justify-end gap-2 shrink-0 border-t sm:border-t-0 border-white/10 pt-2 sm:pt-0">
                    {isCurrent ? (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setSelectedLeagueId(league.id);
                          setViewMode('division');
                        }}
                        className="px-4 py-2 rounded-xl bg-primary text-on-primary-fixed text-xs font-black uppercase tracking-wider hover:brightness-110 shadow-md"
                      >
                        View Leaderboard
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setSelectedLeagueId(league.id);
                          setViewMode('division');
                        }}
                        className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-text-muted hover:text-on-surface text-xs font-bold border border-card-border transition-all"
                      >
                        Preview Cohort
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* DIAMOND TOURNAMENT SHOWCASE BANNER */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-950/60 to-surface-container border-2 border-cyan-400/50 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                <span className="material-symbols-outlined text-3xl font-bold">emoji_events</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-on-surface">The Diamond Tournament Format</h3>
                <span className="text-xs text-cyan-400">
                  Unlocked upon reaching Tier 10 (Diamond League)
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              When candidates reach the Diamond League, finishing in the Top 10 enters them into the multi-week knockout tournament. Outlast contenders in the Quarter-Finals and Semi-Finals to compete in the National Finals!
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {DIAMOND_TOURNAMENT_ROUNDS.map((round) => (
                <div
                  key={round.stage}
                  className="p-4 rounded-2xl bg-surface-container-high/80 border border-cyan-400/30 flex flex-col justify-between gap-2"
                >
                  <div>
                    <span className="text-[10px] font-mono font-black text-cyan-400 uppercase">
                      {round.week}
                    </span>
                    <h5 className="font-extrabold text-sm text-on-surface mt-0.5">{round.title}</h5>
                    <p className="text-[11px] text-text-muted mt-1 leading-normal">
                      {round.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-white/10 flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-lightning-gold">
                      {round.cutoffText}
                    </span>
                    <span className="text-[10px] text-text-muted font-mono">{round.reward}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HOW LEAGUES WORK POPUP MODAL */}
      {isHowItWorksOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 select-none"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsHowItWorksOpen(false);
          }}
        >
          <div className="relative w-full max-w-lg bg-surface-container rounded-3xl border-2 border-card-border p-6 sm:p-8 shadow-2xl animate-in zoom-in-95 duration-150 flex flex-col gap-5">
            <button
              onClick={() => setIsHowItWorksOpen(false)}
              className="absolute top-4 right-4 text-text-muted hover:text-on-surface p-1 rounded-xl hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary shadow-md">
                <span className="material-symbols-outlined text-2xl font-bold">emoji_events</span>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-on-surface">How Leagues Work</h3>
                <span className="text-xs text-text-muted">
                  Rules of the National A/L ICT Weekly League Competition
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 text-xs text-text-muted leading-relaxed">
              <div className="p-3.5 rounded-xl bg-surface-container-high border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-lightning-gold text-2xl shrink-0 mt-0.5">
                  autorenew
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">1. Weekly Reset</h4>
                  <p>
                    Competitions reset every Sunday at midnight UTC. Your weekly XP points go back to
                    zero for the fresh leaderboard, while your total lifetime XP and streak remain
                    permanently saved in your profile.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-high border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">
                  groups
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">2. 30-Learner Grouping</h4>
                  <p>
                    You are placed in a competitive division with up to 30 other active Sri Lankan
                    candidates who started earning XP around the same time in your league tier.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-high border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-primary text-2xl shrink-0 mt-0.5">
                  swap_vert
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">
                    3. Promotion & Demotion
                  </h4>
                  <p>
                    Finishing near the top (Top 7) moves you up to the next league! Finishing at the
                    bottom (Bottom 5, Ranks 26–30) drops you down to the previous league. Bronze candidates
                    are immune to demotion.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-high border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-cyan-400 text-2xl shrink-0 mt-0.5">
                  diamond
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">
                    4. Diamond Tournament
                  </h4>
                  <p>
                    Reaching Tier 10 (Diamond League) unlocks multi-week knockout tournament rounds
                    (Quarter-Finals ➔ Semi-Finals ➔ National Finals) for top performers!
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container-high border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-secondary text-2xl shrink-0 mt-0.5">
                  workspace_premium
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">
                    5. Weekly Top 3 Gem Payouts 💎
                  </h4>
                  <p>
                    Finishing on the podium (Ranks 1, 2, or 3) awards substantial gem payouts based on your league tier (from 60 💎 in Bronze up to 500 💎 in Diamond) when the weekly timer resets!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsHowItWorksOpen(false)}
              className="w-full py-3 bg-primary text-on-primary-fixed rounded-xl text-xs font-black uppercase tracking-wider btn-pressable-primary shadow-md"
            >
              Got It, Let's Compete!
            </button>
          </div>
        </div>
      )}

      {/* Candidate Profile / Follow Inspector Modal */}
      {inspectUser && (
        <UserProfileModal
          currentUser={userStats}
          targetUser={inspectUser}
          onClose={() => setInspectUser(null)}
          onUpdateStats={onUpdateStats}
        />
      )}
    </div>
  );
};
