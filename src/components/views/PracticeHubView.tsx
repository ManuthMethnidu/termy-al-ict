import React, { useState, useEffect } from 'react';
import { UserStats, McqQuestion } from '../../types';
import { getQueueStats, getDueQuestions, getTrickyQuestions } from '../../lib/spacedRepetition';
import { getAllMasterQuestions } from '../../lib/questionBankLoader';
import { SYLLABUS_QUESTIONS } from '../../data/syllabusQuestions';

interface PracticeHubProps {
  userStats: UserStats;
  onStartCustomDrill: (questions: McqQuestion[]) => void;
}

export const PracticeHubView: React.FC<PracticeHubProps> = ({
  userStats,
  onStartCustomDrill,
}) => {
  const [allQuestions, setAllQuestions] = useState<McqQuestion[]>(SYLLABUS_QUESTIONS);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState({
    dueCount: 0,
    masteredCount: 0,
    learningCount: 0,
    accuracyRate: 100,
  });

  useEffect(() => {
    let isMounted = true;
    getAllMasterQuestions().then((questions) => {
      if (isMounted) {
        setAllQuestions(questions);
        const queueStats = getQueueStats(questions);
        setStats(queueStats);
        setLoading(false);
      }
    }).catch(() => {
      if (isMounted) {
        const queueStats = getQueueStats(SYLLABUS_QUESTIONS);
        setStats(queueStats);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const sampleQuestions = (pool: McqQuestion[], count: number = 5): McqQuestion[] => {
    if (pool.length <= count) return pool;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };

  const handleStartDueReview = () => {
    const due = getDueQuestions(allQuestions);
    if (due.length > 0) {
      onStartCustomDrill(sampleQuestions(due, 8));
    } else {
      onStartCustomDrill(sampleQuestions(allQuestions, 5));
    }
  };

  const handleStartTrickyDrill = () => {
    const tricky = getTrickyQuestions(allQuestions);
    if (tricky.length > 0) {
      onStartCustomDrill(sampleQuestions(tricky, 8));
    } else {
      const hardQuestions = allQuestions.filter((q) => q.difficulty === 'hard');
      onStartCustomDrill(sampleQuestions(hardQuestions.length > 0 ? hardQuestions : allQuestions, 5));
    }
  };

  const handleStartUnitDrill = (unitNumber: number) => {
    const unitPool = allQuestions.filter((q) => q.unit === unitNumber);
    onStartCustomDrill(sampleQuestions(unitPool.length > 0 ? unitPool : allQuestions, 6));
  };

  const unit3Count = allQuestions.filter((q) => q.unit === 3).length;
  const unit6Count = allQuestions.filter((q) => q.unit === 6).length;
  const unit7Count = allQuestions.filter((q) => q.unit === 7).length;
  const unit9Count = allQuestions.filter((q) => q.unit === 9).length;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-8 pb-24 md:pb-12 select-none">
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
                <span>Active Recall Engine</span>
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">
              A/L Past Paper Rapid Drills
            </h2>
            <p className="text-xs sm:text-sm text-text-muted max-w-lg leading-relaxed">
              Target tricky questions from 2,636 verified G.C.E. Advanced Level MCQs. Keep your {userStats.streakDays}-day streak going with active recall!
            </p>
          </div>

          <button
            onClick={() => onStartCustomDrill(sampleQuestions(allQuestions, 8))}
            className="w-full md:w-auto px-6 py-3.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-primary flex items-center justify-center gap-2 shrink-0 shadow-lg"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Launch Quick 8-MCQ Drill</span>
          </button>
        </div>
      </section>

      {/* Spaced Repetition Overview Matrix */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">autorenew</span>
            <h3 className="text-xl font-bold text-on-surface">Spaced Repetition Memory Matrix</h3>
          </div>
          <span className="text-xs text-text-muted font-mono">
            {loading ? 'Indexing 2.6K items...' : `${allQuestions.length} Questions Indexed`}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div
            onClick={handleStartDueReview}
            className="p-4 rounded-2xl bg-card-dark border border-card-border hover:border-primary/50 cursor-pointer transition-all hover:bg-surface-variant group shadow-sm"
          >
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Due Today</span>
              <span className="material-symbols-outlined text-primary group-hover:rotate-45 transition-transform text-xl">
                schedule
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-on-surface">
              {stats.dueCount}
            </div>
            <span className="text-[11px] text-primary font-bold mt-1 inline-block">
              Review Queue →
            </span>
          </div>

          <div
            onClick={handleStartTrickyDrill}
            className="p-4 rounded-2xl bg-card-dark border border-card-border hover:border-crimson-heart/50 cursor-pointer transition-all hover:bg-surface-variant group shadow-sm"
          >
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tricky / Missed</span>
              <span className="material-symbols-outlined text-crimson-heart group-hover:scale-110 transition-transform text-xl">
                warning
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-crimson-heart">
              {getTrickyQuestions(allQuestions).length}
            </div>
            <span className="text-[11px] text-crimson-heart font-bold mt-1 inline-block">
              Target Traps →
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card-dark border border-card-border shadow-sm">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Mastered</span>
              <span className="material-symbols-outlined text-lightning-gold text-xl">
                verified
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-lightning-gold">
              {stats.masteredCount}
            </div>
            <span className="text-[11px] text-text-muted font-mono mt-1 inline-block">
              Consecutive 3+ Correct
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-card-dark border border-card-border shadow-sm">
            <div className="flex items-center justify-between text-text-muted mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Accuracy</span>
              <span className="material-symbols-outlined text-secondary text-xl">
                trending_up
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-secondary">
              {stats.accuracyRate}%
            </div>
            <span className="text-[11px] text-text-muted font-mono mt-1 inline-block">
              Live Drill Success
            </span>
          </div>
        </div>
      </section>

      {/* Targeted Unit MCQ Drills */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lightning-gold text-2xl">target</span>
          <h3 className="text-xl font-bold text-on-surface">Targeted Unit MCQ Drills</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unit 3: Digital Electronics */}
          <div
            onClick={() => handleStartUnitDrill(3)}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-primary/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-primary">UNIT 03</span>
              <span className="text-xs text-text-muted font-mono">{unit3Count} Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-primary transition-colors">
              Digital Logic Gates & Boolean Algebra
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              XOR/XNOR, K-maps, Half/Full Adders, De Morgan laws, NAND universality.
            </p>
            <div className="flex items-center text-xs font-bold text-primary gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 6: Programming Concepts */}
          <div
            onClick={() => handleStartUnitDrill(6)}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-lightning-gold/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-lightning-gold">UNIT 06</span>
              <span className="text-xs text-text-muted font-mono">{unit6Count} Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-lightning-gold transition-colors">
              Algorithms & Python Programming
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              Loops, integer division, trace tables, recursions, lists, dictionaries.
            </p>
            <div className="flex items-center text-xs font-bold text-lightning-gold gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 7: Database Management */}
          <div
            onClick={() => handleStartUnitDrill(7)}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-pink-400/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-pink-400">UNIT 07</span>
              <span className="text-xs text-text-muted font-mono">{unit7Count} Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-pink-400 transition-colors">
              Database Management Systems (DBMS)
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              1NF/2NF/3NF Normalization, ER diagrams, foreign keys, SQL queries.
            </p>
            <div className="flex items-center text-xs font-bold text-pink-400 gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>

          {/* Unit 9: Networking */}
          <div
            onClick={() => handleStartUnitDrill(9)}
            className="p-5 rounded-2xl bg-card-dark border border-card-border hover:border-secondary/60 cursor-pointer transition-all hover:bg-surface-variant group shadow-md"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-secondary">UNIT 09</span>
              <span className="text-xs text-text-muted font-mono">{unit9Count} Questions</span>
            </div>
            <h4 className="font-bold text-base text-on-surface group-hover:text-secondary transition-colors">
              Data Communication & Networking
            </h4>
            <p className="text-xs text-text-muted mt-1 mb-3">
              CIDR Subnetting, MAC/IP routing, TCP vs UDP, OSI 7-layer protocols.
            </p>
            <div className="flex items-center text-xs font-bold text-secondary gap-1">
              <span>Start Unit Practice</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
