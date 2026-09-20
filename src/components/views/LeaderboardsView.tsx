import React, { useState, useEffect } from 'react';
import { UserStats, LeaderboardEntry } from '../../types';
import { fetchRealLeaderboard } from '../../lib/supabase';
import {
  LEAGUES,
  LeagueDefinition,
  getLeagueById,
  getTimeUntilWeeklyReset,
  DIAMOND_TOURNAMENT_ROUNDS,
} from '../../lib/leagueSystem';
import { sounds } from '../../lib/sound';

interface LeaderboardsProps {
  userStats: UserStats;
  onStartPractice?: () => void;
}

export const LeaderboardsView: React.FC<LeaderboardsProps> = ({
  userStats,
  onStartPractice,
}) => {
  const currentLeagueId = userStats.leagueId || 1;
  const [selectedLeagueId, setSelectedLeagueId] = useState<number>(currentLeagueId);
  const [activeTabMode, setActiveTabMode] = useState<'cohort' | 'tournament'>('cohort');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState<boolean>(false);
  const [resetCountdown, setResetCountdown] = useState(getTimeUntilWeeklyReset());

  // Active selected league metadata
  const selectedLeague: LeagueDefinition = getLeagueById(selectedLeagueId);
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

  // Fetch 30-learner cohort whenever selected league or user changes
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
  const userRank = userRankEntry?.rank || 15;

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto pb-24 md:pb-12 px-2 sm:px-4">
      {/* 1. HORIZONTAL LEAGUE EMBLER CAROUSEL (All 10 Leagues in Order) */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-primary">military_tech</span>
            National League Tiers (1 to 10)
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

        {/* Scrollable League Bar */}
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
                className={`relative flex flex-col items-center justify-center p-2.5 rounded-2xl min-w-[76px] transition-all duration-200 shrink-0 border-2 ${
                  isSelected
                    ? `bg-surface-container ${league.borderColor} shadow-lg scale-105`
                    : 'bg-card-dark/60 border-card-border/60 hover:border-card-border hover:bg-surface-container/40 opacity-80'
                }`}
              >
                {/* User Current League Indicator Tag */}
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
                  {league.tierLabel}
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

      {/* 2. LEAGUE HERO CARD & RESET TIMER */}
      <div
        className={`relative w-full rounded-3xl p-6 sm:p-7 border-2 ${selectedLeague.borderColor} bg-gradient-to-b ${selectedLeague.gradient} shadow-2xl mb-6 overflow-hidden select-none`}
      >
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-20"
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
                {selectedLeague.tierLabel}
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
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container/70 border border-card-border/60">
              <span className="material-symbols-outlined text-sm text-lightning-gold">schedule</span>
              <span className="text-xs font-mono font-bold text-on-surface">
                {resetCountdown.formatted}
              </span>
            </div>
            <span className="text-[11px] text-text-muted">
              Division #{userStats.leagueGroupNumber || 1} • 30 Learners
            </span>
          </div>
        </div>

        {/* Promotion & Demotion Rules Banner for this League */}
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

      {/* 3. MODE TABS (For Diamond League: Cohort vs Tournament Bracket) */}
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
            <span>Division Cohort (30 Learners)</span>
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

      {/* 4. DIAMOND TOURNAMENT BRACKET VIEW */}
      {selectedLeague.id === 10 && activeTabMode === 'tournament' ? (
        <div className="flex flex-col gap-4 animate-in fade-in duration-200">
          <div className="p-6 rounded-2xl bg-card-dark border-2 border-cyan-500/40 shadow-xl flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-md">
                <span className="material-symbols-outlined text-2xl font-bold">trophy</span>
              </div>
              <div className="flex flex-col">
                <h3 className="text-lg font-black text-on-surface">The Diamond Tournament</h3>
                <span className="text-xs text-text-muted">
                  Multi-week championship rounds for the top A/L ICT candidates across Sri Lanka
                </span>
              </div>
            </div>

            <p className="text-xs text-text-muted leading-relaxed">
              When you reach the Diamond League, finishing in the Top 10 of your weekly cohort advances
              you into the multi-week knockout tournament. Outlast contenders in the Quarter-Finals and
              Semi-Finals to reach the National Finals!
            </p>

            {/* Tournament Progression Steps */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
              {DIAMOND_TOURNAMENT_ROUNDS.map((round, idx) => {
                const isCurrentStage =
                  userStats.tournamentStage === round.stage ||
                  (userStats.tournamentStage === 'none' && idx === 0);

                return (
                  <div
                    key={round.stage}
                    className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                      isCurrentStage
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                        : 'bg-surface-container/60 border-card-border'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] uppercase font-mono font-black text-cyan-400">
                          {round.week}
                        </span>
                        {isCurrentStage && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500 text-black">
                            Current Stage
                          </span>
                        )}
                      </div>
                      <h4 className="font-extrabold text-sm text-on-surface">{round.title}</h4>
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
                );
              })}
            </div>

            <div className="p-4 rounded-xl bg-surface-container flex items-center justify-between gap-4 mt-2">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">verified</span>
                <span className="text-xs text-text-muted">
                  Your Current Standing: Rank{' '}
                  <strong className="text-on-surface font-mono">#{userRank}</strong> (
                  {userRank <= 10 ? (
                    <span className="text-primary font-bold">In Qualification Zone!</span>
                  ) : (
                    <span className="text-text-muted">Climb to Top 10 to Qualify</span>
                  )}
                  )
                </span>
              </div>
              {onStartPractice && (
                <button
                  onClick={onStartPractice}
                  className="px-4 py-2 bg-cyan-500 text-black rounded-xl text-xs font-black uppercase tracking-wider shadow hover:brightness-110 shrink-0"
                >
                  Drill for Tournament
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 5. 30-CANDIDATE COHORT LEADERBOARD TABLE */
        <div className="flex flex-col gap-2.5 w-full select-none" id="leaderboard-table">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-text-muted">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">
                sync
              </span>
              <span className="text-xs font-mono">
                Assembling Division #{userStats.leagueGroupNumber || 1} (30 Active Learners)...
              </span>
            </div>
          ) : leaderboardData.length === 0 ? (
            <div className="text-center py-12 p-6 rounded-2xl bg-card-dark border border-card-border text-text-muted">
              <span className="material-symbols-outlined text-4xl text-primary mb-2">military_tech</span>
              <h3 className="text-base font-bold text-on-surface">Cohort Division Initializing</h3>
              <p className="text-xs mt-1">Complete your first drill session to take the lead!</p>
            </div>
          ) : (
            leaderboardData.map((item, index) => {
              const isFirst = item.rank === 1;
              const isSecond = item.rank === 2;
              const isThird = item.rank === 3;

              // Compute zone for this rank
              const isPromotion = item.rank <= selectedLeague.minPromoteRank;
              const isDemotion =
                selectedLeague.maxDemoteRank > 0 && item.rank >= selectedLeague.maxDemoteRank;

              // Check if we need to render a zone separator header
              const showPromotionHeader = index === 0;
              const showSafeHeader = index === selectedLeague.minPromoteRank;
              const showDemotionHeader =
                selectedLeague.maxDemoteRank > 0 && index === selectedLeague.maxDemoteRank - 1;

              return (
                <React.Fragment key={item.id || item.rank}>
                  {/* Zone Separator: Promotion Zone Header */}
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

                  {/* Zone Separator: Safe Zone Header */}
                  {showSafeHeader && (
                    <div className="flex items-center gap-2 py-1 px-3 rounded-lg bg-surface-container/60 border border-card-border/60 text-text-muted text-[10px] font-extrabold uppercase tracking-wider my-1">
                      <span className="material-symbols-outlined text-xs">horizontal_rule</span>
                      <span>Safe Zone (Ranks 8 to 25 Retain {selectedLeague.name} League)</span>
                    </div>
                  )}

                  {/* Zone Separator: Demotion Zone Header */}
                  {showDemotionHeader && (
                    <div className="flex items-center gap-2 py-1.5 px-3 rounded-lg bg-crimson-heart/10 border border-crimson-heart/30 text-crimson-heart text-[11px] font-black uppercase tracking-wider my-1">
                      <span className="material-symbols-outlined text-sm font-bold">arrow_downward</span>
                      <span>Demotion Zone (Bottom 5 Drop Down on Weekly Reset)</span>
                    </div>
                  )}

                  {/* Candidate Row */}
                  <div
                    className={`relative rounded-2xl p-3.5 sm:p-4 transition-all duration-150 flex items-center justify-between ${
                      item.isCurrentUser
                        ? 'bg-surface-container border-2 border-primary shadow-[0_3px_0_#46a302] ring-2 ring-primary/30'
                        : isPromotion
                        ? 'bg-card-dark border border-primary/20 hover:bg-surface-variant'
                        : isDemotion
                        ? 'bg-card-dark border border-crimson-heart/20 hover:bg-surface-variant'
                        : 'bg-card-dark border border-card-border hover:bg-surface-variant'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                      {/* Rank Number / Medal */}
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
                            : 'bg-surface-container-high/60 text-text-muted'
                        }`}
                      >
                        {isFirst ? (
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
                            workspace_premium
                          </span>
                        ) : isSecond ? (
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
                            military_tech
                          </span>
                        ) : isThird ? (
                          <span
                            className="material-symbols-outlined text-2xl"
                            style={{ fontVariationSettings: '"FILL" 1' }}
                          >
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
                          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center font-bold text-xs sm:text-sm text-on-surface">
                            {item.name
                              .split(' ')
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join('')}
                          </div>
                        )}
                        {item.streak > 2 && (
                          <span className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-surface-container-lowest px-1 py-0.5 rounded-full shadow-sm">
                            🔥
                          </span>
                        )}
                      </div>

                      {/* Name & School info */}
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <span className="font-extrabold text-sm sm:text-base text-on-surface truncate">
                            {item.name}
                          </span>
                          {item.isCurrentUser && (
                            <span className="px-1.5 py-0.5 rounded bg-primary text-on-primary-fixed text-[10px] font-black uppercase shrink-0">
                              You
                            </span>
                          )}
                          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-[10px] text-lightning-gold font-extrabold shrink-0 hidden sm:inline">
                            {item.level}
                          </span>
                        </div>
                        <span className="text-[11px] sm:text-xs text-text-muted truncate">
                          {item.school}
                        </span>
                      </div>
                    </div>

                    {/* Weekly XP Count & Zone Arrow */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0 pl-3">
                      <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                              item.isCurrentUser ? 'text-primary' : 'text-on-surface'
                            }`}
                          >
                            {item.xp.toLocaleString()}
                          </span>
                          <span className="text-[10px] uppercase font-black text-text-muted">
                            XP
                          </span>
                        </div>
                        <span className="text-[9px] text-text-muted font-bold tracking-wider">
                          Weekly
                        </span>
                      </div>

                      {/* Zone Status Icon */}
                      <div className="w-5 text-center hidden sm:block">
                        {isPromotion ? (
                          <span className="material-symbols-outlined text-primary text-lg" title="In Promotion Zone">
                            arrow_drop_up
                          </span>
                        ) : isDemotion ? (
                          <span className="material-symbols-outlined text-crimson-heart text-lg" title="In Demotion Zone">
                            arrow_drop_down
                          </span>
                        ) : (
                          <span className="material-symbols-outlined text-text-muted/40 text-sm">
                            remove
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              );
            })
          )}
        </div>
      )}

      {/* 6. HOW LEAGUES WORK MODAL */}
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
              <div className="flex flex-col">
                <h3 className="text-xl font-extrabold text-on-surface">How Leagues Work</h3>
                <span className="text-xs text-text-muted">
                  Rules of the National A/L ICT Weekly League Competition
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3.5 text-xs text-text-muted leading-relaxed">
              <div className="p-3.5 rounded-xl bg-card-dark border border-card-border flex gap-3">
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

              <div className="p-3.5 rounded-xl bg-card-dark border border-card-border flex gap-3">
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

              <div className="p-3.5 rounded-xl bg-card-dark border border-card-border flex gap-3">
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

              <div className="p-3.5 rounded-xl bg-card-dark border border-card-border flex gap-3">
                <span className="material-symbols-outlined text-cyan-400 text-2xl shrink-0 mt-0.5">
                  diamond
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-on-surface mb-0.5">
                    4. Diamond Tournament
                  </h4>
                  <p>
                    Reaching Tier X (Diamond League) unlocks multi-week knockout tournament rounds
                    (Quarter-Finals ➔ Semi-Finals ➔ National Finals) for top performers!
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
    </div>
  );
};
