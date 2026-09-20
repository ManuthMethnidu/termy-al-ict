import React, { useState, useEffect } from 'react';
import { UserStats, NavTab, LeaderboardEntry } from '../../types';
import { getRealDailyQuests, fetchRealLeaderboard } from '../../lib/supabase';

interface LearnViewProps {
  userStats: UserStats;
  onStartLesson: () => void;
  onOpenGuidebook: () => void;
  onSelectTab: (tab: NavTab) => void;
}

export const LearnView: React.FC<LearnViewProps> = ({
  userStats,
  onStartLesson,
  onOpenGuidebook,
  onSelectTab,
}) => {
  const [topLeaders, setTopLeaders] = useState<LeaderboardEntry[]>([]);
  const realQuests = getRealDailyQuests(userStats.streakDays);

  useEffect(() => {
    let isMounted = true;
    fetchRealLeaderboard(userStats).then((entries) => {
      if (isMounted) {
        setTopLeaders(entries.slice(0, 3));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userStats]);
  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl mx-auto pb-24 md:pb-12">
      {/* Central Learning Roadmap Column */}
      <div className="flex-1 max-w-[680px] mx-auto w-full flex flex-col">
        {/* Unit Header Card */}
        <div className="relative w-full rounded-2xl bg-surface-container p-5 sm:p-6 shadow-xl overflow-hidden mb-8 border border-card-border/60">
          <div className="absolute -right-8 -top-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-ecto-green-dark/30 text-primary text-xs uppercase tracking-wider font-extrabold">
                  Unit 3 of 14
                </span>
                <span className="text-text-muted text-xs uppercase tracking-wider">
                  • G.C.E. A/L ICT Syllabus
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface uppercase tracking-tight">
                Digital Logic Gates & Boolean Algebra
              </h2>
              <p className="text-sm text-text-muted">
                Master Karnaugh Maps, De Morgan laws, and Combinational Logic MCQs
              </p>
            </div>

            <button
              onClick={onOpenGuidebook}
              className="self-start sm:self-center shrink-0 flex items-center gap-2 px-4 py-2.5 bg-lightning-gold text-on-tertiary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider btn-pressable-gold"
            >
              <span
                className="material-symbols-outlined text-lg"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                menu_book
              </span>
              <span>Guidebook</span>
            </button>
          </div>
        </div>

        {/* Winding Learning Path */}
        <div className="relative w-full flex flex-col items-center py-4 select-none">
          {/* Dashed curve line */}
          <svg
            className="absolute top-8 left-1/2 -translate-x-1/2 w-80 h-[920px] pointer-events-none z-0 overflow-visible opacity-40"
            fill="none"
            viewBox="0 0 320 920"
          >
            <path
              d="M 160 30 C 100 80, 70 110, 80 160 C 90 210, 240 230, 240 290 C 240 350, 160 390, 160 450 C 160 510, 80 550, 90 610 C 100 670, 230 700, 220 760 C 210 820, 170 850, 160 890"
              stroke="#242e34"
              strokeDasharray="2 18"
              strokeLinecap="round"
              strokeWidth="12"
            />
          </svg>

          <div className="relative z-10 w-full flex flex-col items-center gap-12 sm:gap-14">
            {/* Step 1: Basic Gates (Completed) */}
            <div className="relative flex items-center justify-center translate-x-0 group">
              <div className="flex flex-col items-center">
                <button
                  onClick={onStartLesson}
                  className="relative w-16 h-16 rounded-full bg-primary text-on-primary-fixed flex items-center justify-center btn-pressable-primary"
                  title="Basic Gates: Completed"
                >
                  <span className="material-symbols-outlined text-3xl font-bold">check</span>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-lightning-gold text-on-tertiary-fixed flex items-center justify-center shadow">
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      military_tech
                    </span>
                  </div>
                </button>
                <span className="mt-2 text-xs font-bold text-text-muted text-center max-w-[140px] truncate">
                  1. Basic Gates
                </span>
              </div>
              <div className="hidden sm:flex absolute left-24 top-1 items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-card-border/50 shadow-md">
                <span className="material-symbols-outlined text-primary text-base">memory</span>
                <span className="text-xs text-text-muted font-mono">Y = A • B</span>
              </div>
            </div>

            {/* Step 2: Universal Gates (Completed) */}
            <div className="relative flex items-center justify-center -translate-x-16 group">
              <div className="flex flex-col items-center">
                <button
                  onClick={onStartLesson}
                  className="w-16 h-16 rounded-full bg-primary text-on-primary-fixed flex items-center justify-center btn-pressable-primary"
                  title="Universal Gates: Completed"
                >
                  <span className="material-symbols-outlined text-3xl font-bold">check</span>
                </button>
                <span className="mt-2 text-xs font-bold text-text-muted text-center max-w-[140px] truncate">
                  2. Universal Gates
                </span>
              </div>
              <div className="hidden sm:flex absolute -left-48 top-2 items-center gap-1.5 bg-surface-container px-3 py-1.5 rounded-lg border border-card-border/50 shadow-md">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-xs text-text-muted font-mono">NAND / NOR</span>
              </div>
            </div>

            {/* Step 3: 2019 MCQ Drill Chest (Claimed) */}
            <div className="relative flex items-center justify-center translate-x-16 group">
              <div className="flex flex-col items-center">
                <button
                  onClick={onStartLesson}
                  className="relative w-16 h-16 rounded-2xl bg-lightning-gold text-on-tertiary-fixed flex items-center justify-center btn-pressable-gold"
                  title="2019 Past Paper Chest: Claimed"
                >
                  <span
                    className="material-symbols-outlined text-3xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    inventory_2
                  </span>
                  <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-surface-container-high text-lightning-gold text-[10px] font-extrabold uppercase">
                    Done
                  </div>
                </button>
                <span className="mt-2 text-xs font-bold text-lightning-gold text-center max-w-[140px] truncate">
                  3. 2019 MCQ Drill
                </span>
              </div>
              <div className="hidden sm:flex absolute left-24 top-2 items-center gap-1.5 bg-card-dark px-3 py-1.5 rounded-lg border border-card-border/50 shadow-md">
                <span className="material-symbols-outlined text-lightning-gold text-base">verified</span>
                <span className="text-xs text-on-surface font-mono">+50 XP Past Paper</span>
              </div>
            </div>

            {/* Step 4: Boolean & De Morgan (Active Current Lesson) */}
            <div className="relative flex items-center justify-center translate-x-0 z-20">
              <div className="flex flex-col items-center">
                {/* Floating start bubble */}
                <div className="relative -top-2 z-30 animate-bounce">
                  <button
                    onClick={onStartLesson}
                    className="px-4 py-1.5 bg-primary text-on-primary-fixed rounded-xl text-xs uppercase font-extrabold tracking-wider flex items-center gap-1.5 shadow-[0_4px_0_#46a302] whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-lg">play_arrow</span>
                    <span>Start Lesson +15 XP</span>
                  </button>
                  <div className="w-3 h-3 bg-primary rotate-45 mx-auto -mt-1.5" />
                </div>

                <div className="relative">
                  <div className="absolute -inset-2.5 rounded-full bg-primary/25 animate-pulse" />
                  <button
                    onClick={onStartLesson}
                    className="relative w-20 h-20 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-[0_6px_0_#46a302] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_1px_0_#46a302] transition-all cursor-pointer"
                  >
                    <span
                      className="material-symbols-outlined text-4xl"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      developer_board
                    </span>
                  </button>
                </div>
                <span className="mt-2 text-base font-bold text-primary text-center">
                  4. Boolean & De Morgan
                </span>
              </div>

              {/* Side Formula Card */}
              <div className="hidden md:flex flex-col gap-1 absolute -left-56 top-8 p-3 bg-card-dark rounded-xl border border-card-border/60 shadow-lg w-48">
                <div className="flex items-center justify-between text-text-muted text-xs uppercase font-mono">
                  <span>De Morgan #1</span>
                  <span className="material-symbols-outlined text-secondary text-sm">terminal</span>
                </div>
                <div className="p-2 bg-surface-container rounded font-mono text-xs text-primary font-bold">
                  (A + B)' = A' • B'
                </div>
              </div>
            </div>

            {/* Step 5: Truth Tables (Locked) */}
            <div className="relative flex items-center justify-center -translate-x-14 group">
              <div className="flex flex-col items-center opacity-70">
                <button
                  disabled
                  className="w-16 h-16 rounded-full bg-gray-inactive text-text-muted flex items-center justify-center shadow-[0_5px_0_#242e34] cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </button>
                <span className="mt-2 text-xs font-bold text-text-muted text-center max-w-[140px] truncate">
                  5. Truth Tables
                </span>
              </div>
            </div>

            {/* Step 6: Adders & Circuits (Locked) */}
            <div className="relative flex items-center justify-center translate-x-14 group">
              <div className="flex flex-col items-center opacity-70">
                <button
                  disabled
                  className="w-16 h-16 rounded-full bg-gray-inactive text-text-muted flex items-center justify-center shadow-[0_5px_0_#242e34] cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-2xl">lock</span>
                </button>
                <span className="mt-2 text-xs font-bold text-text-muted text-center max-w-[140px] truncate">
                  6. Adders & Circuits
                </span>
              </div>
            </div>

            {/* Step 7: Unit 3 Final Challenge (Locked) */}
            <div className="relative flex items-center justify-center translate-x-0 group pb-6">
              <div className="flex flex-col items-center opacity-70">
                <button
                  disabled
                  className="w-20 h-20 rounded-full bg-surface-container-high text-text-muted flex items-center justify-center shadow-[0_5px_0_#242e34] cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-4xl text-text-muted">trophy</span>
                </button>
                <span className="mt-2 text-xs font-bold text-text-muted text-center">
                  Unit 3 Final Challenge
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Next Syllabus Unit Preview */}
        <div className="w-full mt-6 p-5 rounded-2xl bg-card-dark border border-card-border/60 shadow-xl flex flex-col gap-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-text-muted">
                <span className="material-symbols-outlined text-2xl">hub</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-text-muted font-extrabold">
                  Next Syllabus Unit
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  Unit 4: Computer Networks & OSI 7-Layer Model
                </h3>
              </div>
            </div>
            <span className="material-symbols-outlined text-text-muted text-2xl">lock</span>
          </div>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Prerequisite: Complete Unit 3 Final Challenge</span>
              <span className="font-mono">0/24 Lessons Complete</span>
            </div>
            <div className="w-full h-2.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '0%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right Desktop Sidebar Widgets */}
      <aside className="w-80 hidden xl:flex flex-col gap-6 sticky top-20 self-start">
        {/* Super Termy Pro Banner */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#1b2e35] to-[#152126] border-2 border-secondary/40 p-5 shadow-[0_4px_0_#1899d6]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-widest text-secondary font-extrabold">
              PRO PASS
            </span>
            <span className="material-symbols-outlined text-secondary text-xl">memory</span>
          </div>
          <h4 className="font-bold text-base text-on-surface mb-1">Super Termy</h4>
          <p className="text-xs text-text-muted mb-4 leading-relaxed">
            Unlimited Hearts, Python code-sandbox drills & full 2011-2024 Past Paper scheme analysis.
          </p>
          <button
            onClick={() => onSelectTab('shop')}
            className="w-full py-2 px-4 bg-secondary text-on-secondary font-extrabold text-xs uppercase rounded-lg border-b-4 border-macaw-blue-dark active:translate-y-0.5 active:border-b-2 transition-all text-center"
          >
            Upgrade to Pro
          </button>
        </div>

        {/* Daily ICT Quests Card */}
        <div className="rounded-xl bg-card-dark border-2 border-card-border p-5 shadow-[0_3px_0_#242e34]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lightning-gold text-xl">bolt</span>
              <h4 className="font-bold text-base text-on-surface">Daily ICT Quests</h4>
            </div>
            <button
              onClick={() => onSelectTab('quests')}
              className="text-xs text-primary uppercase font-bold hover:underline"
            >
              View All
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {realQuests.slice(0, 2).map((q) => {
              const pct = Math.min(100, Math.round((q.current / q.target) * 100));
              return (
                <div key={q.id} className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface truncate pr-2">{q.title}</span>
                    <span className={`font-mono ${q.completed ? 'text-lightning-gold font-bold' : 'text-text-muted'}`}>
                      {q.completed ? 'Completed' : `${q.current}/${q.target}`}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden border border-card-border">
                    <div
                      className={`h-full rounded-full transition-all ${
                        q.completed ? 'bg-lightning-gold' : 'bg-primary'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* League Mini Leaderboard */}
        <div className="rounded-xl bg-card-dark border-2 border-card-border p-5 shadow-[0_3px_0_#242e34]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-xl">trophy</span>
              <h4 className="font-bold text-base text-on-surface">{userStats.league || 'Bronze League'}</h4>
            </div>
            <button
              onClick={() => onSelectTab('leaderboards')}
              className="text-xs text-secondary uppercase font-bold hover:underline"
            >
              Leaderboard
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {topLeaders.length === 0 ? (
              <div className="p-3 rounded-lg bg-surface-container text-xs text-text-muted text-center">
                Syncing live rankings...
              </div>
            ) : (
              topLeaders.map((lead) => (
                <div
                  key={lead.id || lead.rank}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    lead.isCurrentUser
                      ? 'bg-surface-container border-2 border-primary'
                      : 'bg-surface-container-high/60 border border-card-border'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-xs font-bold ${
                        lead.rank === 1
                          ? 'text-lightning-gold'
                          : lead.isCurrentUser
                          ? 'text-primary'
                          : 'text-text-muted'
                      }`}
                    >
                      {lead.rank}
                    </span>
                    <span className="text-xs text-on-surface font-semibold truncate">
                      {lead.name} {lead.isCurrentUser ? '(You)' : ''}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono shrink-0 ${
                      lead.isCurrentUser ? 'text-primary font-bold' : 'text-text-muted'
                    }`}
                  >
                    {lead.xp.toLocaleString()} XP
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
