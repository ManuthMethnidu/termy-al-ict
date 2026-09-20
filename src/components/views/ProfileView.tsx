import React, { useState, useEffect } from 'react';
import { UserStats, FriendUser } from '../../types';
import { getRealUnitMastery, getLocalAttempts } from '../../lib/supabase';
import { signInWithGoogle, signOut } from '../../lib/auth';
import { getLeagueById } from '../../lib/leagueSystem';
import { getMonthlyChallenge } from '../../lib/questsSystem';
import { getAllFriendsList } from '../../lib/friendsSystem';
import { sounds } from '../../lib/sound';
import { AddFriendsModal } from '../social/AddFriendsModal';
import { FollowingListModal } from '../social/FollowingListModal';
import { UserProfileModal } from '../social/UserProfileModal';
import { FriendStreaksSection } from '../social/FriendStreaksSection';
import { SocialFeedSection } from '../social/SocialFeedSection';

interface ProfileViewProps {
  userStats: UserStats;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onStartDrill?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userStats,
  onOpenAuth,
  onUpdateStats,
  onStartDrill,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'streaks' | 'feed'>('overview');
  const [isAddFriendsOpen, setIsAddFriendsOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [followingTab, setFollowingTab] = useState<'following' | 'followers' | 'mutual'>('following');
  const [inspectUser, setInspectUser] = useState<FriendUser | null>(null);
  const [followCounts, setFollowCounts] = useState({ following: 3, followers: 3, mutual: 2 });

  const unitMasteries = getRealUnitMastery();
  const attempts = getLocalAttempts();
  const leagueDef = getLeagueById(userStats.leagueId || 1);
  const monthlyChallenge = getMonthlyChallenge(userStats.questPoints || 0);

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

  useEffect(() => {
    getAllFriendsList(userStats.id).then((res) => {
      setFollowCounts({
        following: res.following.length,
        followers: res.followers.length,
        mutual: res.mutual.length,
      });
    });
  }, [userStats.id, userStats.followingCount]);

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    const { error } = await signInWithGoogle();
    setAuthLoading(false);
    if (error) {
      alert(error.message);
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await signOut();
    setAuthLoading(false);
    window.location.reload();
  };

  const isAuthenticated =
    userStats.authProvider === 'google' ||
    userStats.authProvider === 'email' ||
    (!!userStats.id && userStats.authProvider !== 'guest');

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-6 pb-24 md:pb-12 select-none">
      {/* Profile Hero & Avatar Banner */}
      <div className="relative w-full rounded-3xl bg-surface-container overflow-hidden border border-card-border/60 shadow-lg">
        {/* Top Terminal Graphic Backdrop */}
        <div className="relative w-full h-40 bg-surface-container-high flex items-center justify-center overflow-hidden">
          <svg className="absolute inset-0 w-full h-full text-card-border/40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="24" id="grid-pattern" patternUnits="userSpaceOnUse" width="24">
                <circle cx="2" cy="2" fill="currentColor" r="1.5" />
              </pattern>
            </defs>
            <rect fill="url(#grid-pattern)" height="100%" width="100%" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-surface-container-high/30" />

          {/* Centered Avatar */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full pt-4">
            {userStats.avatarUrl ? (
              <img
                src={userStats.avatarUrl}
                alt={userStats.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-primary shadow-2xl"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-[#1b2e35] to-[#243b46] border-2 border-primary/60 flex items-center justify-center shadow-2xl text-primary">
                <span className="material-symbols-outlined text-5xl sm:text-6xl">person</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Meta Info */}
        <div className="p-5 sm:p-6 flex flex-col gap-3 bg-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">{userStats.name}</h1>
                {isAuthenticated && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] uppercase font-extrabold flex items-center gap-1 border border-primary/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {userStats.authProvider === 'google' ? 'Google Verified' : 'Termy Verified'}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-text-muted text-[10px] uppercase font-extrabold">
                  {userStats.batch}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-text-muted text-xs sm:text-sm mt-1">
                <span className="font-mono text-secondary font-semibold">{userStats.username}</span>
                {userStats.email && (
                  <>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{userStats.email}</span>
                  </>
                )}
                <span>•</span>
                <span>{userStats.school}</span>
              </div>

              {/* Duolingo-style Friends & Following Bar */}
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setFollowingTab('following');
                    setIsFollowingModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs text-text-muted hover:text-on-surface font-bold transition-colors bg-surface-container-high px-3 py-1.5 rounded-xl border border-card-border"
                >
                  <strong className="text-on-surface font-mono">{followCounts.following}</strong> Following
                  <span className="opacity-40">•</span>
                  <strong className="text-on-surface font-mono">{followCounts.followers}</strong> Followers
                  <span className="opacity-40">•</span>
                  <strong className="text-primary font-mono">{followCounts.mutual}</strong> Mutual
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setIsAddFriendsOpen(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary-fixed text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Add Friends</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              {isAuthenticated ? (
                <button
                  onClick={handleSignOut}
                  disabled={authLoading}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-crimson-heart/20 text-text-muted hover:text-crimson-heart text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border border-card-border"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (onOpenAuth ? onOpenAuth('signup') : handleGoogleAuth())}
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-on-primary-fixed text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">person_add</span>
                    <span>Sign Up</span>
                  </button>
                  <button
                    onClick={() => (onOpenAuth ? onOpenAuth('signin') : handleGoogleAuth())}
                    disabled={authLoading}
                    className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border border-card-border"
                  >
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs: Overview, Friend Streaks, Social Feed */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-2xl border border-card-border select-none">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('overview');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'overview'
              ? 'bg-primary text-on-primary-fixed shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">analytics</span>
          <span>Overview</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('streaks');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'streaks'
              ? 'bg-primary text-on-primary-fixed shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span>🔥</span>
          <span>Friend Streaks</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveSubTab('feed');
          }}
          className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'feed'
              ? 'bg-primary text-on-primary-fixed shadow-md'
              : 'text-text-muted hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-base">dynamic_feed</span>
          <span>Social Feed</span>
        </button>
      </div>

      {/* SUBTAB 1: OVERVIEW */}
      {activeSubTab === 'overview' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          {/* Current League Progression Card */}
          <div
            className={`p-5 rounded-2xl border-2 ${leagueDef.borderColor} bg-gradient-to-r ${leagueDef.gradient} flex items-center justify-between shadow-lg`}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md ${leagueDef.badgeBg}`}
                style={{ color: leagueDef.color }}
              >
                <span
                  className="material-symbols-outlined text-3xl"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  {leagueDef.icon}
                </span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-on-surface">{leagueDef.name} League</h3>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container/80 border border-card-border/60 text-[10px] font-black uppercase text-text-muted">
                    {leagueDef.tierLabel}
                  </span>
                </div>
                <span className="text-xs text-text-muted mt-0.5">
                  Division #{userStats.leagueGroupNumber || 1} • {userStats.weeklyXp || userStats.xp || 0} Weekly XP
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs font-mono font-bold text-lightning-gold">
                Rank #{userStats.leagueRank || 1}
              </span>
              <span className="text-[11px] text-text-muted">
                {userStats.leagueId === 10
                  ? 'Diamond Tournament Tier'
                  : `Top ${leagueDef.minPromoteRank} Promotes`}
              </span>
            </div>
          </div>

          {/* Real Statistics Section */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-on-surface">Telemetry & Performance</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* Day Streak */}
              <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl">🔥</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-on-surface font-mono">{userStats.streakDays}</span>
                  <span className="text-xs text-text-muted">Day Streak</span>
                </div>
              </div>

              {/* Total XP */}
              <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl">⚡</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-on-surface font-mono">{userStats.xp.toLocaleString()}</span>
                  <span className="text-xs text-text-muted">Total XP</span>
                </div>
              </div>

              {/* Real MCQs Attempted */}
              <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl">🎯</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-secondary font-mono">{totalAttempted}</span>
                  <span className="text-xs text-text-muted">Drill Attempts</span>
                </div>
              </div>

              {/* Real Accuracy */}
              <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
                <span className="text-3xl">📊</span>
                <div className="flex flex-col">
                  <span className="text-xl font-extrabold text-lightning-gold font-mono">{overallAccuracy}%</span>
                  <span className="text-xs text-text-muted">Real Accuracy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Pioneer Challenge Trophy Showcase */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-2xl">workspace_premium</span>
                <h3 className="text-xl font-bold text-on-surface">Monthly Pioneer Trophies</h3>
              </div>
              <span className="text-xs font-mono font-bold text-secondary">
                {userStats.questPoints || 0} / {monthlyChallenge.targetPoints} Quest Points
              </span>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#172530] via-card-dark to-[#1f1b33] border-2 border-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border shrink-0 ${
                  monthlyChallenge.completed
                    ? 'bg-secondary/20 border-secondary text-secondary'
                    : 'bg-surface-container border-card-border text-text-muted opacity-60'
                }`}>
                  <span className="material-symbols-outlined text-3xl">
                    {monthlyChallenge.badgeIcon}
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <h4 className="font-extrabold text-base text-on-surface">
                      {monthlyChallenge.badgeTitle}
                    </h4>
                    {monthlyChallenge.completed ? (
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                        Permanent Trophy
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-text-muted text-[10px] font-bold uppercase">
                        In Progress ({monthlyChallenge.monthName})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted mt-0.5 max-w-lg leading-relaxed">
                    {monthlyChallenge.completed
                      ? `Earned for accumulating 30 Quest Points in ${monthlyChallenge.monthName}. Commemorates the pioneer of computer science!`
                      : `Earn ${Math.max(0, monthlyChallenge.targetPoints - (userStats.questPoints || 0))} more Quest Points via Daily Quests (+1), Weekend Monolith (+3), or Friends Quests (+5) to permanently claim this badge!`}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                <div className="w-36 h-2.5 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-card-border/40">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-primary transition-all duration-500"
                    style={{
                      width: `${Math.min(100, ((userStats.questPoints || 0) / monthlyChallenge.targetPoints) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-[11px] font-mono text-text-muted">
                  {Math.min(100, Math.round(((userStats.questPoints || 0) / monthlyChallenge.targetPoints) * 100))}% Complete
                </span>
              </div>
            </div>
          </div>

          {/* REAL Syllabus Unit Mastery Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-on-surface">Real Syllabus Mastery Breakdown</h3>
              <span className="text-xs text-text-muted font-mono">
                {totalAttempted} Verified Candidate Logs
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {unitMasteries.map((m) => {
                const colorClass =
                  m.masteryPercent >= 80
                    ? 'bg-primary text-primary'
                    : m.masteryPercent >= 50
                    ? 'bg-lightning-gold text-lightning-gold'
                    : m.masteryPercent > 0
                    ? 'bg-secondary text-secondary'
                    : 'bg-text-muted text-text-muted';

                return (
                  <div key={m.unit} className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                      <span className="truncate mr-2">{m.unitTitle}</span>
                      <span className={`font-mono shrink-0 ${colorClass.split(' ')[1]}`}>
                        {m.attemptCount > 0 ? `${m.masteryPercent}% (${m.correctCount}/${m.attemptCount})` : '0% (0 attempts)'}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorClass.split(' ')[0]}`}
                        style={{ width: `${Math.max(m.attemptCount > 0 ? 5 : 0, m.masteryPercent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: FRIEND STREAKS (Up to 5 Mutual Friends) */}
      {activeSubTab === 'streaks' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <FriendStreaksSection
            currentUser={userStats}
            onOpenAddFriends={() => setIsAddFriendsOpen(true)}
            onStartDrill={onStartDrill}
          />
        </div>
      )}

      {/* SUBTAB 3: SOCIAL FEED (Mini Timeline & Reactions) */}
      {activeSubTab === 'feed' && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <SocialFeedSection
            onOpenUserProfile={(target) => setInspectUser(target)}
            onOpenAddFriends={() => setIsAddFriendsOpen(true)}
          />
        </div>
      )}

      {/* MODAL: ADD FRIENDS (Search, Direct Link, Suggested) */}
      {isAddFriendsOpen && (
        <AddFriendsModal
          currentUser={userStats}
          onClose={() => setIsAddFriendsOpen(false)}
          onUpdateStats={onUpdateStats}
          onOpenUserProfile={(user) => setInspectUser(user)}
        />
      )}

      {/* MODAL: FOLLOWING / FOLLOWERS / MUTUAL LIST */}
      {isFollowingModalOpen && (
        <FollowingListModal
          currentUser={userStats}
          initialTab={followingTab}
          onClose={() => setIsFollowingModalOpen(false)}
          onUpdateStats={onUpdateStats}
          onOpenUserProfile={(user) => setInspectUser(user)}
        />
      )}

      {/* MODAL: USER PROFILE INSPECTOR */}
      {inspectUser && (
        <UserProfileModal
          currentUser={userStats}
          targetUser={inspectUser}
          onClose={() => setInspectUser(null)}
          onUpdateStats={onUpdateStats}
          onStreakStarted={() => {
            getAllFriendsList(userStats.id).then((res) => {
              setFollowCounts({
                following: res.following.length,
                followers: res.followers.length,
                mutual: res.mutual.length,
              });
            });
          }}
        />
      )}
    </div>
  );
};
