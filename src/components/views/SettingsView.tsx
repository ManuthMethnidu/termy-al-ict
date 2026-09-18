import React from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';

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
    <div className="flex flex-col w-full max-w-2xl mx-auto gap-8 pb-24 md:pb-12">
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

      {/* Account Info */}
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
