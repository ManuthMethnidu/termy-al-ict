import React, { useState } from 'react';
import { UserStats } from '../../types';
import { getRealUnitMastery, getLocalAttempts } from '../../lib/supabase';
import { signInWithGoogle, signOut } from '../../lib/auth';

interface ProfileViewProps {
  userStats: UserStats;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userStats }) => {
  const [authLoading, setAuthLoading] = useState(false);
  const unitMasteries = getRealUnitMastery();
  const attempts = getLocalAttempts();

  const totalAttempted = attempts.length;
  const totalCorrect = attempts.filter((a) => a.isCorrect).length;
  const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;

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

  const isGoogleUser = userStats.authProvider === 'google';

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Profile Hero & Avatar Banner */}
      <div className="relative w-full rounded-2xl bg-surface-container overflow-hidden border border-card-border/60 shadow-md">
        {/* Top Terminal Graphic Backdrop */}
        <div className="relative w-full h-44 bg-surface-container-high flex items-center justify-center overflow-hidden">
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
                className="w-28 h-28 rounded-2xl object-cover ring-4 ring-primary shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-tr from-[#1b2e35] to-[#243b46] border-2 border-primary/60 flex items-center justify-center shadow-2xl text-primary">
                <span className="material-symbols-outlined text-6xl">person</span>
              </div>
            )}
          </div>
        </div>

        {/* Candidate Meta Info */}
        <div className="p-6 flex flex-col gap-2 bg-surface-container">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-on-surface">{userStats.name}</h1>
                {isGoogleUser && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs uppercase font-extrabold flex items-center gap-1 border border-primary/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Google Verified
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-text-muted text-xs uppercase font-extrabold">
                  {userStats.batch}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-text-muted text-xs sm:text-sm mt-0.5">
                <span className="font-mono text-secondary font-semibold">{userStats.username}</span>
                {userStats.email && (
                  <>
                    <span>•</span>
                    <span>{userStats.email}</span>
                  </>
                )}
                <span>•</span>
                <span>{userStats.school}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start">
              {isGoogleUser ? (
                <button
                  onClick={handleSignOut}
                  disabled={authLoading}
                  className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-crimson-heart/20 text-text-muted hover:text-crimson-heart text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all border border-card-border"
                >
                  <span className="material-symbols-outlined text-base">logout</span>
                  <span>Sign Out</span>
                </button>
              ) : (
                <button
                  onClick={handleGoogleAuth}
                  disabled={authLoading}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all border border-card-border"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Connect Google</span>
                </button>
              )}
            </div>
          </div>
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
  );
};
