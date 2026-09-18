import React, { useState, useEffect } from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';
import { signInWithGoogle, signOut } from '../../lib/auth';

interface SettingsViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onOpenHelp: () => void;
  onOpenAdmin?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userStats,
  onUpdateStats,
  onOpenHelp,
  onOpenAdmin,
}) => {
  // Supabase states
  const [supabaseUrl, setSupabaseUrl] = useState<string>('');
  const [supabaseKey, setSupabaseKey] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<{
    tested: boolean;
    loading: boolean;
    success: boolean;
    message: string;
    source: 'localStorage' | 'env' | 'none';
  }>({
    tested: false,
    loading: false,
    success: false,
    message: '',
    source: 'none',
  });

  const [authLoading, setAuthLoading] = useState<boolean>(false);

  const handleGoogleSignIn = async () => {
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

  useEffect(() => {
    const config = getSupabaseConfig();
    setSupabaseUrl(config.url);
    setSupabaseKey(config.key);
    setConnectionStatus((prev) => ({
      ...prev,
      source: config.source,
      success: config.source !== 'none',
    }));

    if (config.url && config.key) {
      testSupabaseConnection(config.url, config.key).then((res) => {
        setConnectionStatus({
          tested: true,
          loading: false,
          success: res.success,
          message: res.message,
          source: config.source,
        });
      });
    }
  }, []);

  const handleTestAndSaveSupabase = async () => {
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      alert('Please enter both Supabase Project URL and Anon Key.');
      return;
    }

    setConnectionStatus((prev) => ({ ...prev, loading: true, tested: false }));
    const result = await testSupabaseConnection(supabaseUrl.trim(), supabaseKey.trim());

    if (result.success) {
      sounds.playCorrect();
      saveSupabaseConfig(supabaseUrl.trim(), supabaseKey.trim());
      setConnectionStatus({
        tested: true,
        loading: false,
        success: true,
        message: result.message,
        source: 'localStorage',
      });
    } else {
      sounds.playIncorrect();
      setConnectionStatus({
        tested: true,
        loading: false,
        success: false,
        message: result.message,
        source: 'none',
      });
    }
  };

  const handleClearSupabase = () => {
    saveSupabaseConfig('', '');
    setSupabaseUrl('');
    setSupabaseKey('');
    setConnectionStatus({
      tested: false,
      loading: false,
      success: false,
      message: 'Disconnected. Termy is using local offline storage.',
      source: 'none',
    });
    alert('Supabase credentials cleared. Switched to offline storage.');
  };

  const toggleSound = () => {
    const next = !userStats.soundEnabled;
    sounds.setEnabled(next);
    if (next) sounds.playClick();
    onUpdateStats({ soundEnabled: next });
  };

  const toggleHaptics = () => {
    onUpdateStats({ hapticsEnabled: !userStats.hapticsEnabled });
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-8 pb-24 md:pb-12 select-none">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Preferences & Settings</h1>
        <button
          onClick={onOpenHelp}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container hover:bg-surface-variant text-secondary rounded-xl text-xs uppercase font-extrabold tracking-wider border border-secondary/30 transition-colors"
        >
          <span className="material-symbols-outlined text-base">help_outline</span>
          <span>Help & FAQs</span>
        </button>
      </div>

      {/* Google Sign-in / Supabase Auth Card */}
      <section className="p-6 rounded-2xl bg-card-dark border-2 border-secondary/40 flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center p-2 border border-card-border">
              <svg className="w-full h-full" viewBox="0 0 24 24">
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
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">Google Authentication</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    userStats.authProvider === 'google'
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-surface-container text-text-muted border border-card-border'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {userStats.authProvider === 'google' ? 'Google Account Linked' : 'Guest Mode'}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                {userStats.authProvider === 'google'
                  ? `Signed in as ${userStats.name} (${userStats.email || 'Google User'})`
                  : 'Sign in with Google to sync your study streak, XP, and queue across devices.'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          {userStats.authProvider === 'google' ? (
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="px-4 py-2 bg-surface-container hover:bg-surface-variant text-crimson-heart rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="px-5 py-2.5 bg-surface-container hover:bg-surface-variant text-on-surface rounded-xl text-xs uppercase font-extrabold tracking-wider border border-card-border shadow-sm flex items-center gap-2 transition-all active:translate-y-0.5"
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
              <span>{authLoading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          )}
        </div>
      </section>

      {/* Supabase PostgreSQL Backend Integration Card */}
      <section className="p-6 rounded-2xl bg-card-dark border-2 border-primary/40 flex flex-col gap-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/40 flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-xl">database</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">Supabase Cloud Database</h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                    connectionStatus.success
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'bg-lightning-gold/20 text-lightning-gold border border-lightning-gold/30'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {connectionStatus.success ? 'Connected' : 'Local Offline Mode'}
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Sync candidate XP, streaks, and Spaced Repetition queue to PostgreSQL.
              </p>
            </div>
          </div>
        </div>

        {/* Input fields */}
        <div className="flex flex-col gap-3 pt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-bold flex items-center justify-between">
              <span>Project URL</span>
              <span className="text-[10px] text-text-muted font-normal">
                Supabase Dashboard &gt; Project Settings &gt; API
              </span>
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={supabaseUrl}
              onChange={(e) => setSupabaseUrl(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-bold flex items-center justify-between">
              <span>Anon Public Key</span>
              <span className="text-[10px] text-text-muted font-normal">
                anon / public API key
              </span>
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={supabaseKey}
              onChange={(e) => setSupabaseKey(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
            />
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              onClick={handleTestAndSaveSupabase}
              disabled={connectionStatus.loading}
              className="px-5 py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-base">
                {connectionStatus.loading ? 'sync' : 'link'}
              </span>
              <span>{connectionStatus.loading ? 'Testing...' : 'Test & Connect'}</span>
            </button>

            {connectionStatus.success && (
              <button
                onClick={handleClearSupabase}
                className="px-4 py-2.5 bg-surface-container hover:bg-surface-variant text-text-muted hover:text-crimson-heart rounded-xl text-xs uppercase font-bold tracking-wider border border-card-border transition-colors"
              >
                Disconnect
              </button>
            )}

            <span className="text-[11px] text-text-muted font-mono">
              Schema file: <code className="text-primary">supabase/schema.sql</code>
            </span>
          </div>

          {/* Message feedback */}
          {connectionStatus.message && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-start gap-2 border ${
                connectionStatus.success
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-crimson-heart/10 border-crimson-heart/30 text-crimson-heart'
              }`}
            >
              <span className="material-symbols-outlined text-base shrink-0 mt-0.5">
                {connectionStatus.success ? 'check_circle' : 'error'}
              </span>
              <span>{connectionStatus.message}</span>
            </div>
          )}
        </div>
      </section>

      {/* Candidate Profile */}
      <section className="p-6 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-4 shadow-sm">
        <h2 className="text-base font-bold text-on-surface uppercase tracking-wider text-primary">
          Candidate Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-semibold">Full Name</label>
            <input
              type="text"
              value={userStats.name}
              onChange={(e) => onUpdateStats({ name: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-semibold">Syllabus Batch</label>
            <input
              type="text"
              value={userStats.batch}
              onChange={(e) => onUpdateStats({ batch: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-semibold">School / Stream</label>
            <input
              type="text"
              value={userStats.school}
              onChange={(e) => onUpdateStats({ school: e.target.value })}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-muted font-semibold">Target Exam Year</label>
            <select
              value={userStats.targetExamYear}
              onChange={(e) => onUpdateStats({ targetExamYear: parseInt(e.target.value, 10) })}
              className="px-3.5 py-2.5 rounded-xl bg-surface-container border border-card-border text-sm text-on-surface focus:outline-none focus:border-primary"
            >
              <option value={2025}>2025 G.C.E. A/L Exam</option>
              <option value={2026}>2026 G.C.E. A/L Exam</option>
              <option value={2027}>2027 G.C.E. A/L Exam</option>
            </select>
          </div>
        </div>
      </section>

      {/* Audio & Haptic Controls */}
      <section className="p-6 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-4 shadow-sm">
        <h2 className="text-base font-bold text-on-surface uppercase tracking-wider text-secondary">
          Audio & Haptics
        </h2>

        <div className="flex items-center justify-between py-2 border-b border-card-border/40">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">Sound Effects</span>
            <span className="text-xs text-text-muted">
              Audio feedback for correct answers, mistakes, and combo streaks.
            </span>
          </div>
          <button
            onClick={toggleSound}
            className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
              userStats.soundEnabled ? 'bg-primary' : 'bg-gray-inactive'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                userStats.soundEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between py-2">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">Vibration / Haptic Feedback</span>
            <span className="text-xs text-text-muted">
              Tactile vibrations on keypress and card submissions.
            </span>
          </div>
          <button
            onClick={toggleHaptics}
            className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 ${
              userStats.hapticsEnabled ? 'bg-primary' : 'bg-gray-inactive'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white transition-transform ${
                userStats.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </section>

      {/* Spaced Repetition & Daily Goal */}
      <section className="p-6 rounded-2xl bg-card-dark border border-card-border flex flex-col gap-4 shadow-sm">
        <h2 className="text-base font-bold text-on-surface uppercase tracking-wider text-lightning-gold">
          Daily Study Goal
        </h2>

        <div className="grid grid-cols-3 gap-3">
          {[10, 20, 30].map((mins) => (
            <button
              key={mins}
              onClick={() => onUpdateStats({ dailyGoalMinutes: mins })}
              className={`p-3 rounded-xl border text-center transition-all ${
                userStats.dailyGoalMinutes === mins
                  ? 'bg-lightning-gold/20 border-lightning-gold text-lightning-gold font-bold'
                  : 'bg-surface-container border-card-border text-text-muted hover:text-on-surface'
              }`}
            >
              <div className="text-lg font-bold font-mono">{mins} Min</div>
              <div className="text-[10px] uppercase font-bold mt-0.5">
                {mins === 10 ? 'Casual' : mins === 20 ? 'Regular' : 'Intense'}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Root Admin Console Gate */}
      <section className="p-5 rounded-2xl bg-card-dark border border-primary/40 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl">admin_panel_settings</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-on-surface">Root Administration</span>
            <span className="text-xs text-text-muted">MANA terminal console, telemetry & candidate records</span>
          </div>
        </div>
        <button
          onClick={onOpenAdmin}
          className="px-4 py-2 bg-primary/20 hover:bg-primary text-primary hover:text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider border border-primary/40 transition-all flex items-center gap-1.5 shrink-0"
        >
          <span className="material-symbols-outlined text-sm">lock</span>
          <span>Open Admin</span>
        </button>
      </section>

      {/* App Information */}
      <div className="text-center text-xs text-text-muted font-mono">
        Termy A/L ICT Revision Platform • Version 1.0.0 • G.C.E. Advanced Level Syllabus
      </div>
    </div>
  );
};
