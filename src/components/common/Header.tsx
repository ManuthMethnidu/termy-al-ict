import React, { useState } from 'react';
import { NavTab, UserStats } from '../../types';
import { signInWithGoogle, signOut } from '../../lib/auth';
import { getLeagueById } from '../../lib/leagueSystem';

interface HeaderProps {
  userStats: UserStats;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onStartPractice: () => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onOpenLivesModal?: () => void;
  onOpenStreakMilestones?: () => void;
  onOpenGemTopup?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userStats,
  activeTab,
  onSelectTab,
  onStartPractice,
  onOpenAuth,
  onOpenLivesModal,
  onOpenStreakMilestones,
  onOpenGemTopup,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userLeagueDef = getLeagueById(userStats.leagueId || 1);
  const isEnergyMode = userStats.livesMode === 'energy';

  const handleGoogleAuth = async () => {
    setAuthLoading(true);
    const { error } = await signInWithGoogle();
    setAuthLoading(false);
    if (error) {
      alert(error.message);
      onSelectTab('more');
    }
  };

  const handleSignOut = async () => {
    setAuthLoading(true);
    await signOut();
    setShowUserMenu(false);
    setAuthLoading(false);
    window.location.reload();
  };

  const isAuthenticated =
    userStats.authProvider === 'google' ||
    userStats.authProvider === 'email' ||
    (!!userStats.id && userStats.authProvider !== 'guest');

  return (
    <>
      {/* Top Bar (fixed on desktop left-64, mobile left-0) */}
      <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-[#131f24]/95 backdrop-blur-md border-b-2 border-card-border z-30 px-4 md:px-8 flex items-center justify-between select-none">
        {/* Mobile brand mark */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-card-dark border border-card-border flex items-center justify-center text-primary font-bold">
            <span className="material-symbols-outlined text-lg">terminal</span>
          </div>
          <span className="font-extrabold text-lg text-primary">TERMY</span>
        </div>

        {/* Quick Practice Trigger on Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onStartPractice}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border/60 text-xs font-bold uppercase tracking-wider text-primary transition-all active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Instant MCQ Drill</span>
          </button>
        </div>

        {/* Right Gamification Stats & Auth Profile */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          {/* League Pill */}
          <button
            onClick={() => onSelectTab('leaderboards')}
            title={`${userStats.league || 'Bronze League'} — Division #${userStats.leagueGroupNumber || 1} • Click to view league cohort`}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/40 hover:border-primary/50 text-xs font-black transition-all cursor-pointer shadow-sm active:translate-y-0.5"
          >
            <span
              className="material-symbols-outlined text-sm"
              style={{
                color: userLeagueDef.color,
                fontVariationSettings: '"FILL" 1',
              }}
            >
              {userLeagueDef.icon}
            </span>
            <span className="truncate max-w-[85px]" style={{ color: userLeagueDef.color }}>
              {userLeagueDef.name}
            </span>
          </button>

          {/* Daily Streak */}
          <button
            type="button"
            onClick={() => {
              if (onOpenStreakMilestones) onOpenStreakMilestones();
            }}
            title={`${userStats.streakDays} Day Study Streak — Click to view 25-day milestone rewards!`}
            className="flex items-center gap-1 sm:gap-1.5 text-lightning-gold font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-all active:translate-y-0.5"
          >
            <span className="text-sm sm:text-base leading-none">🔥</span>
            <span>{userStats.streakDays}</span>
          </button>

          {/* Bits / Gems */}
          <button
            type="button"
            onClick={() => {
              if (onOpenGemTopup) {
                onOpenGemTopup();
              } else {
                onSelectTab('shop');
              }
            }}
            title={`${userStats.gems} Gems / Bits — Click to open gem vault!`}
            className="flex items-center gap-1 sm:gap-1.5 text-secondary font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-all active:translate-y-0.5"
          >
            <span className="text-sm sm:text-base leading-none">💎</span>
            <span>{userStats.gems}</span>
          </button>

          {/* Exam Lives (Hearts or Energy) */}
          <button
            type="button"
            onClick={() => {
              if (onOpenLivesModal) onOpenLivesModal();
            }}
            title={
              userStats.isPro
                ? 'Super Termy Pro: Unlimited Lives'
                : isEnergyMode
                ? `${userStats.energyUnits ?? 25} Energy Battery Units — Click to recharge`
                : `${userStats.hearts} Exam Lives — Click to refill or practice`
            }
            className={`flex items-center gap-1 sm:gap-1.5 font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-all active:translate-y-0.5 ${
              isEnergyMode ? 'text-lightning-gold' : 'text-crimson-heart'
            }`}
          >
            <span className="text-sm sm:text-base leading-none">
              {isEnergyMode ? '⚡' : '❤️'}
            </span>
            <span>
              {userStats.isPro
                ? '∞'
                : isEnergyMode
                ? userStats.energyUnits ?? 25
                : userStats.hearts}
            </span>
          </button>

          {/* Candidate Sign-in / User Profile Menu */}
          <div className="relative">
            {isAuthenticated ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border transition-all"
                title={`${userStats.name} (${userStats.email || 'Candidate Account'})`}
              >
                {userStats.avatarUrl ? (
                  <img
                    src={userStats.avatarUrl}
                    alt={userStats.name}
                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-primary/60"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-bold text-xs">
                    {userStats.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="material-symbols-outlined text-text-muted text-sm pr-1">
                  expand_more
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth('signup') : handleGoogleAuth())}
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary hover:bg-primary-hover text-on-primary-fixed text-xs font-extrabold transition-all shadow-sm active:translate-y-0.5"
                  title="Create a free Termy account"
                >
                  <span className="material-symbols-outlined text-sm">person_add</span>
                  <span>Sign Up</span>
                </button>
                <button
                  onClick={() => (onOpenAuth ? onOpenAuth('signin') : handleGoogleAuth())}
                  disabled={authLoading}
                  className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border/80 text-xs font-bold text-on-surface transition-all shadow-sm active:translate-y-0.5"
                  title="Sign In with Google or Email"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Login</span>
                </button>
              </div>
            )}

            {/* Dropdown User Menu */}
            {showUserMenu && isAuthenticated && (
              <div className="absolute right-0 mt-2 w-56 bg-card-dark rounded-2xl border border-card-border shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-card-border/50">
                  <div className="text-xs font-bold text-on-surface truncate">{userStats.name}</div>
                  <div className="text-[10px] text-text-muted truncate">{userStats.email}</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{userStats.authProvider === 'google' ? 'Google Verified' : 'Termy Verified'}</span>
                  </div>
                </div>

                <a
                  href="/profile"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserMenu(false);
                    onSelectTab('profile');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span>View Profile</span>
                </a>

                <a
                  href="/settings"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserMenu(false);
                    onSelectTab('more');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  <span>Settings & Preferences</span>
                </a>

                <a
                  href="/privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserMenu(false);
                    onSelectTab('privacy');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Privacy Policy</span>
                </a>

                <a
                  href="/terms"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowUserMenu(false);
                    onSelectTab('terms');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">gavel</span>
                  <span>Terms of Service</span>
                </a>

                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-crimson-heart hover:bg-crimson-heart/10 rounded-xl text-left transition-colors border-t border-card-border/40 mt-1 pt-2"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#131f24]/95 backdrop-blur-md border-t-2 border-card-border z-40 flex md:hidden items-center justify-around px-1 select-none">
        <button
          onClick={() => onSelectTab('learn')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'learn' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">terminal</span>
          <span className="text-[10px] font-bold uppercase">Learn</span>
        </button>

        <button
          onClick={() => onSelectTab('questions')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'questions' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">inventory_2</span>
          <span className="text-[10px] font-bold uppercase">Q-Bank</span>
        </button>

        <button
          onClick={() => onSelectTab('practice')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'practice' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">code</span>
          <span className="text-[10px] font-bold uppercase">Practice</span>
        </button>

        <button
          onClick={() => onSelectTab('leaderboards')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'leaderboards' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">military_tech</span>
          <span className="text-[10px] font-bold uppercase">League</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'profile' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">badge</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>

        <button
          onClick={() => onSelectTab('more')}
          className={`flex flex-col items-center gap-0.5 p-1.5 ${
            activeTab === 'more' ||
            activeTab === 'settings' ||
            activeTab === 'privacy' ||
            activeTab === 'terms'
              ? 'text-primary'
              : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">more_horiz</span>
          <span className="text-[10px] font-bold uppercase">More</span>
        </button>
      </nav>
    </>
  );
};
