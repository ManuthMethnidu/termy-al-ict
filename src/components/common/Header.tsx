import React, { useState } from 'react';
import { NavTab, UserStats } from '../../types';
import { signInWithGoogle, signOut } from '../../lib/auth';

interface HeaderProps {
  userStats: UserStats;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onStartPractice: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userStats,
  activeTab,
  onSelectTab,
  onStartPractice,
}) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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

  const isGoogleUser = userStats.authProvider === 'google';

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
          {/* Daily Streak */}
          <div
            title={`${userStats.streakDays} Day Study Streak`}
            className="flex items-center gap-1 sm:gap-1.5 text-lightning-gold font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-sm sm:text-base leading-none">🔥</span>
            <span>{userStats.streakDays}</span>
          </div>

          {/* Bits / Gems */}
          <div
            title={`${userStats.gems} Bits Earned`}
            className="flex items-center gap-1 sm:gap-1.5 text-secondary font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-sm sm:text-base leading-none">💎</span>
            <span>{userStats.gems}</span>
          </div>

          {/* Exam Lives (Hearts) */}
          <div
            title={`${userStats.isPro ? 'Unlimited' : userStats.hearts} Exam Lives`}
            className="flex items-center gap-1 sm:gap-1.5 text-crimson-heart font-extrabold text-xs sm:text-sm px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-sm sm:text-base leading-none">❤️</span>
            <span>{userStats.isPro ? '∞' : userStats.hearts}</span>
          </div>

          {/* Google Sign-in / User Profile Menu */}
          <div className="relative">
            {isGoogleUser ? (
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border transition-all"
                title={`${userStats.name} (${userStats.email || 'Google Account'})`}
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
              <button
                onClick={handleGoogleAuth}
                disabled={authLoading}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border/80 text-xs font-bold text-on-surface transition-all shadow-sm active:translate-y-0.5"
                title="Sign in with Google via Supabase"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="hidden sm:inline">Google Login</span>
                <span className="sm:hidden">Login</span>
              </button>
            )}

            {/* Dropdown User Menu */}
            {showUserMenu && isGoogleUser && (
              <div className="absolute right-0 mt-2 w-56 bg-card-dark rounded-2xl border border-card-border shadow-2xl p-2 z-50 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2 border-b border-card-border/50">
                  <div className="text-xs font-bold text-on-surface truncate">{userStats.name}</div>
                  <div className="text-[10px] text-text-muted truncate">{userStats.email}</div>
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-primary font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>Google Verified</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectTab('profile');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">badge</span>
                  <span>View Profile</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectTab('more');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">settings</span>
                  <span>Settings & Preferences</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectTab('privacy');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">verified_user</span>
                  <span>Privacy Policy</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    onSelectTab('terms');
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-on-surface hover:bg-surface-container rounded-xl text-left transition-colors"
                >
                  <span className="material-symbols-outlined text-base">gavel</span>
                  <span>Terms of Service</span>
                </button>

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
