import React, { useState, useEffect } from 'react';
import { UserStats, McqQuestion } from '../../types';
import { getQueueStats, getDueQuestions, getTrickyQuestions } from '../../lib/spacedRepetition';
import { SYLLABUS_QUESTIONS } from '../../data/syllabusQuestions';

interface PracticeHubProps {
  userStats: UserStats;
  onStartCustomDrill: (questions: McqQuestion[]) => void;
}

export const PracticeHubView: React.FC<PracticeHubProps> = ({
  userStats,
  onStartCustomDrill,
}) => {
  const [stats, setStats] = useState({
    dueCount: 3,
    masteredCount: 14,
    learningCount: 8,
    accuracyRate: 92,
  });

  useEffect(() => {
    const queueStats = getQueueStats(SYLLABUS_QUESTIONS);
    setStats(queueStats);
  }, []);

  const handleStartDueReview = () => {
    const due = getDueQuestions(SYLLABUS_QUESTIONS);
    if (due.length > 0) {
      onStartCustomDrill(due);
    } else {
      // If none due, practice tricky or all
      onStartCustomDrill(SYLLABUS_QUESTIONS.slice(0, 5));
    }
  };

  const handleStartTrickyDrill = () => {
    const tricky = getTrickyQuestions(SYLLABUS_QUESTIONS);
    if (tricky.length > 0) {
      onStartCustomDrill(tricky);
    } else {
      onStartCustomDrill(SYLLABUS_QUESTIONS.filter((q) => q.difficulty === 'hard'));
    }
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Top Banner: Past Paper Review Drills */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-card-dark via-surface-container-high to-surface-container p-6 sm:p-8 border border-card-border/60 shadow-xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex-1 flex flex-col gap-2 text-left">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/20 text-secondary text-xs uppercase tracking-wider font-extrabold">
                SUPER TERMY
              </span>
              <span className="flex items-center gap-1 text-lightning-gold text-xs font-bold">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                  bolt
                </span>
                SPACED RECALL ENGINE
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              Past Paper Review Drills
            </h2>
            <p className="text-sm text-text-muted max-w-lg leading-relaxed">
              Zero-in on official G.C.E. A/L past paper patterns (2015–2024). Train targeted algorithmic speed, decode scheme rubrics, and master high-frequency traps.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onStartCustomDrill(SYLLABUS_QUESTIONS)}
                className="px-6 py-2.5 bg-secondary text-on-secondary rounded-xl text-xs uppercase font-extrabold tracking-wider shadow-md hover:brightness-110 active:translate-y-0.5 transition-all btn-pressable-secondary"
              >
                Launch All 2015-2024 Drills
              </button>
              <span className="text-xs text-text-muted flex items-center gap-1 font-mono">
                <span className="material-symbols-outlined text-sm text-primary">verified</span>
                100% Verified Scheme Solutions • {userStats.streakDays} Day Streak
              </span>
            </div>
          </div>

          {/* Glowing CPU/Micro-architecture Vector Accent */}
          <div className="w-40 h-40 shrink-0 flex items-center justify-center relative">
            <div className="absolute inset-0 rounded-2xl bg-secondary/10 rotate-6" />
            <div className="w-36 h-36 rounded-2xl bg-surface-container-lowest p-3 flex flex-col justify-between border border-card-border shadow-xl">
              <div className="flex items-center justify-between text-secondary">
                <span className="material-symbols-outlined text-xl">memory</span>
                <span className="font-mono text-[10px] tracking-widest text-text-muted">A/L ICT 2024</span>
              </div>
              <svg className="w-full h-16 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 100 50">
                <path className="opacity-40" d="M 10 25 L 30 25 L 45 10 L 75 10 L 90 25" strokeDasharray="2 2" strokeWidth="2" />
                <path className="opacity-40" d="M 10 25 L 30 25 L 45 40 L 75 40 L 90 25" strokeDasharray="2 2" strokeWidth="2" />
                <circle className="fill-card-dark stroke-secondary" cx="50" cy="25" r="8" strokeWidth="2" />
                <circle className="fill-primary stroke-none" cx="50" cy="25" r="3" />
              </svg>
              <div className="flex justify-between items-center text-[10px] font-mono text-primary font-bold">
                <span>QUEUE: SYNCED</span>
                <span className="text-lightning-gold">50/50 MCQ</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Spaced Repetition Active Queue Strip */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">autorenew</span>
            <h3 className="text-xl font-bold text-on-surface">Active Recall & Spaced Repetition Queue</h3>
          </div>
          <span className="text-xs text-text-muted font-mono">Algorithm: SuperMemo SM-2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Due for Review Card */}
          <div className="p-5 rounded-2xl bg-card-dark border-2 border-primary/50 flex flex-col justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold text-primary tracking-wider">
                  Due For Review
                </span>
                <span className="w-3 h-3 rounded-full bg-primary animate-ping" />
              </div>
              <div className="text-3xl font-extrabold text-on-surface font-mono">
                {stats.dueCount} <span className="text-sm text-text-muted font-sans">Questions</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Questions ready at their optimal memory retention boundary.
              </p>
            </div>
            <button
              onClick={handleStartDueReview}
              className="w-full py-2.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary"
            >
              Clear Due Queue →
            </button>
          </div>

          {/* Tricky Questions / Mistake Box */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold text-crimson-heart tracking-wider">
                  Mistake Recycler
                </span>
                <span className="material-symbols-outlined text-crimson-heart text-lg">warning</span>
              </div>
              <div className="text-3xl font-extrabold text-on-surface font-mono">
                {stats.learningCount} <span className="text-sm text-text-muted font-sans">Concepts</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Syllabus items with recent errors cycled back for repetition.
              </p>
            </div>
            <button
              onClick={handleStartTrickyDrill}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-variant text-crimson-heart border border-crimson-heart/40 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all"
            >
              Drill Mistakes Only
            </button>
          </div>

          {/* Mastered Long-Term Retention */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs uppercase font-extrabold text-secondary tracking-wider">
                  Long-Term Retention
                </span>
                <span className="material-symbols-outlined text-secondary text-lg">military_tech</span>
              </div>
              <div className="text-3xl font-extrabold text-on-surface font-mono">
                {stats.masteredCount} <span className="text-sm text-text-muted font-sans">Locked In</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Achieved 3+ consecutive correct intervals (Interval &gt; 3 days).
              </p>
            </div>
            <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full"
                style={{ width: `${Math.min(100, (stats.masteredCount / 20) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Targeted Syllabus Module Drills */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lightning-gold text-2xl">target</span>
          <h3 className="text-xl font-bold text-on-surface">Targeted Unit MCQ Drills</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit 3 */}
          <div
            onClick={() => onStartCustomDrill(SYLLABUS_QUESTIONS.filter((q) => q.unit === 3))}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-primary/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-primary">UNIT 03</span>
              <span className="text-xs text-text-muted font-mono">5 Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
              Digital Logic Gates & Boolean Algebra
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              XOR/XNOR, K-maps, Half/Full Adders, NAND universality.
            </p>
            <div className="flex items-center text-xs font-bold text-primary gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 5 */}
          <div
            onClick={() => onStartCustomDrill(SYLLABUS_QUESTIONS.filter((q) => q.unit === 5))}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-secondary/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-secondary">UNIT 05</span>
              <span className="text-xs text-text-muted font-mono">4 Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
              Networking & OSI 7-Layer Model
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              CIDR Subnetting, MAC/IP routing, TCP vs UDP, Protocols.
            </p>
            <div className="flex items-center text-xs font-bold text-secondary gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 8 */}
          <div
            onClick={() => onStartCustomDrill(SYLLABUS_QUESTIONS.filter((q) => q.unit === 8))}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-lightning-gold/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-lightning-gold">UNIT 08</span>
              <span className="text-xs text-text-muted font-mono">6 Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-lightning-gold transition-colors">
              Algorithms & Python Programming
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              Loops, integer division traps, recursions, lists, dictionaries.
            </p>
            <div className="flex items-center text-xs font-bold text-lightning-gold gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 6 */}
          <div
            onClick={() => onStartCustomDrill(SYLLABUS_QUESTIONS.filter((q) => q.unit === 6))}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-pink-400/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-pink-400">UNIT 06</span>
              <span className="text-xs text-text-muted font-mono">4 Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-pink-400 transition-colors">
              Database Management Systems
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              1NF/2NF/3NF Normalization, ER diagrams, SQL queries.
            </p>
            <div className="flex items-center text-xs font-bold text-pink-400 gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
