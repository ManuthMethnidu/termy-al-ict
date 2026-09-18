import React from 'react';
import { UserStats } from '../../types';

interface ProfileViewProps {
  userStats: UserStats;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userStats }) => {
  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Profile Hero & Avatar Banner */}
      <div className="relative w-full rounded-2xl bg-surface-container overflow-hidden border border-card-border/60 shadow-md">
        {/* Top Terminal Graphic Backdrop */}
        <div className="relative w-full h-44 bg-surface-container-high flex items-center justify-center overflow-hidden">
          {/* Dot array pattern */}
          <svg className="absolute inset-0 w-full h-full text-card-border/40" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern height="24" id="grid-pattern" patternUnits="userSpaceOnUse" width="24">
                <circle cx="2" cy="2" fill="currentColor" r="1.5" />
              </pattern>
            </defs>
            <rect fill="url(#grid-pattern)" height="100%" width="100%" />
          </svg>
          <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-transparent to-surface-container-high/30" />

          {/* Centered Developer / Tech Avatar */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full pt-4">
            <svg className="w-36 h-36 drop-shadow-lg" fill="none" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg">
              <circle cx="80" cy="65" fill="#202c31" r="42" />
              <path d="M42 62C42 42 56 26 80 26C104 26 118 42 118 62C118 52 108 36 80 36C52 36 42 52 42 62Z" fill="#09151a" />
              <path d="M45 48C50 32 64 22 80 22C98 22 112 32 115 48C105 32 88 28 80 28C68 28 54 34 45 48Z" fill="#1b2e35" />
              <path d="M48 68C48 88 62 104 80 104C98 104 112 88 112 68C112 55 106 48 80 48C54 48 48 55 48 68Z" fill="#f4b285" />
              {/* Shades */}
              <rect fill="#09151a" height="15" rx="3" width="24" x="52" y="60" />
              <rect fill="#09151a" height="15" rx="3" width="24" x="84" y="60" />
              <path d="M76 66H84" stroke="#09151a" strokeLinecap="round" strokeWidth="4" />
              <path d="M54 63L68 63" stroke="#88ceff" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M86 63L100 63" stroke="#88ceff" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M73 88C76 90 82 90 87 88" stroke="#a75b33" strokeLinecap="round" strokeWidth="3" />
              <path d="M30 156C30 126 52 116 80 116C108 116 130 126 130 156" fill="#00a8ed" />
              <path d="M68 116L80 134L92 116" fill="#003954" />
            </svg>
          </div>
        </div>

        {/* Candidate Meta Info */}
        <div className="p-6 flex flex-col gap-2 bg-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-on-surface">{userStats.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs uppercase font-extrabold">
                  {userStats.batch}
                </span>
              </div>
              <div className="flex items-center gap-2 text-text-muted text-xs sm:text-sm mt-0.5">
                <span className="font-mono text-secondary font-semibold">{userStats.username}</span>
                <span>•</span>
                <span>Physical Science & ICT Stream</span>
              </div>
            </div>

            <button
              onClick={() => alert('Profile verified with Sri Lankan G.C.E. A/L ICT Examination Index.')}
              className="px-4 py-2 rounded-xl bg-surface-container-high text-on-surface hover:bg-card-border text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all self-start"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              <span>Edit Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-on-surface">Statistics</h3>
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

          {/* Current League */}
          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
            <span className="text-3xl">💎</span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-secondary font-mono">Tier V</span>
              <span className="text-xs text-text-muted">Diamond League</span>
            </div>
          </div>

          {/* Top 3 Finishes */}
          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex items-center gap-3.5 shadow-sm">
            <span className="text-3xl">🏆</span>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold text-lightning-gold font-mono">6</span>
              <span className="text-xs text-text-muted">Top 3 Finishes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Syllabus Unit Mastery Progress */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xl font-bold text-on-surface">Syllabus Mastery Breakdown</h3>
        <div className="flex flex-col gap-3">
          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold">
              <span>Unit 03: Digital Logic Gates & Boolean Algebra</span>
              <span className="text-primary font-mono">92% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '92%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold">
              <span>Unit 08: Algorithms & Python Programming</span>
              <span className="text-lightning-gold font-mono">94% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-lightning-gold rounded-full" style={{ width: '94%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold">
              <span>Unit 05: Data Communication & Networks</span>
              <span className="text-secondary font-mono">88% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full" style={{ width: '88%' }} />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-2">
            <div className="flex justify-between text-xs sm:text-sm font-bold">
              <span>Unit 06: Database Management Systems</span>
              <span className="text-pink-400 font-mono">85% Mastery</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div className="h-full bg-pink-400 rounded-full" style={{ width: '85%' }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
