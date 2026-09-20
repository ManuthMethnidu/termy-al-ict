import React, { useState } from 'react';
import { UserStats } from '../../types';
import { getRealUnitMastery, getLocalAttempts } from '../../lib/supabase';
import { signInWithGoogle, signOut } from '../../lib/auth';

interface ProfileViewProps {
  userStats: UserStats;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ userStats, onOpenAuth }) => {
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

  const isAuthenticated =
    userStats.authProvider === 'google' ||
    userStats.authProvider === 'email' ||
    (!!userStats.id && userStats.authProvider !== 'guest');

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
                {isAuthenticated && (
                  <span className="px-2.5 py-0.5 rounded-full bg-primary/20 text-primary text-xs uppercase font-extrabold flex items-center gap-1 border border-primary/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {userStats.authProvider === 'google' ? 'Google Verified' : 'Termy Verified'}
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
