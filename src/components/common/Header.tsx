import React from 'react';
import { NavTab, UserStats } from '../../types';

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

        {/* Quick Quick Practice Trigger on Desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onStartPractice}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-variant border border-card-border/60 text-xs font-bold uppercase tracking-wider text-primary transition-all active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-base">bolt</span>
            <span>Instant MCQ Drill</span>
          </button>
        </div>

        {/* Right Gamification Stats: Streak, Bits/Diamonds, Hearts, Avatar */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Daily Streak */}
          <div
            title={`${userStats.streakDays} Day Study Streak`}
            className="flex items-center gap-1 sm:gap-1.5 text-lightning-gold font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-base sm:text-lg leading-none">🔥</span>
            <span>{userStats.streakDays}</span>
          </div>

          {/* Bits / Gems */}
          <div
            title={`${userStats.gems} Bits Earned`}
            className="flex items-center gap-1 sm:gap-1.5 text-secondary font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-base sm:text-lg leading-none">💎</span>
            <span>{userStats.gems}</span>
          </div>

          {/* Exam Lives (Hearts) */}
          <div
            title={`${userStats.isPro ? 'Unlimited' : userStats.hearts} Exam Lives`}
            className="flex items-center gap-1 sm:gap-1.5 text-crimson-heart font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-xl bg-surface-container/60 border border-card-border/30 shadow-sm cursor-pointer hover:bg-surface-variant transition-colors"
          >
            <span className="text-base sm:text-lg leading-none">❤️</span>
            <span>{userStats.isPro ? '∞' : userStats.hearts}</span>
          </div>

          {/* User Avatar */}
          <button
            onClick={() => onSelectTab('profile')}
            aria-label="Profile"
            className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md hover:ring-2 hover:ring-primary/40 transition-all"
          >
            <span className="material-symbols-outlined text-lg">person</span>
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#131f24]/95 backdrop-blur-md border-t-2 border-card-border z-40 flex md:hidden items-center justify-around px-2 select-none">
        <button
          onClick={() => onSelectTab('learn')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'learn' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">terminal</span>
          <span className="text-[10px] font-bold uppercase">Learn</span>
        </button>

        <button
          onClick={() => onSelectTab('questions')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'questions' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">inventory_2</span>
          <span className="text-[10px] font-bold uppercase">Q-Bank</span>
        </button>

        <button
          onClick={() => onSelectTab('practice')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'practice' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">code</span>
          <span className="text-[10px] font-bold uppercase">Practice</span>
        </button>

        <button
          onClick={() => onSelectTab('leaderboards')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'leaderboards' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">military_tech</span>
          <span className="text-[10px] font-bold uppercase">League</span>
        </button>

        <button
          onClick={() => onSelectTab('quests')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'quests' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">assignment</span>
          <span className="text-[10px] font-bold uppercase">Quests</span>
        </button>

        <button
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center gap-0.5 p-2 ${
            activeTab === 'profile' ? 'text-primary' : 'text-text-muted'
          }`}
        >
          <span className="material-symbols-outlined text-2xl">badge</span>
          <span className="text-[10px] font-bold uppercase">Profile</span>
        </button>
      </nav>
    </>
  );
};
