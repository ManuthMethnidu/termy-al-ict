import React, { useState, useEffect } from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../../lib/supabase';

interface SettingsViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onOpenHelp: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  userStats,
  onUpdateStats,
  onOpenHelp,
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

      {/* App Information */}
      <div className="text-center text-xs text-text-muted font-mono">
        Termy A/L ICT Revision Platform • Version 1.0.0 • G.C.E. Advanced Level Syllabus
      </div>
    </div>
  );
};
