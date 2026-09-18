import React from 'react';
import { UserStats } from '../../types';
import { getRealDailyQuests, getLocalAttempts } from '../../lib/supabase';
import { loadSRData } from '../../lib/spacedRepetition';

interface QuestsViewProps {
  userStats: UserStats;
  onClaimQuest?: (questId: string) => void;
}

export const QuestsView: React.FC<QuestsViewProps> = ({ userStats }) => {
  const quests = getRealDailyQuests(userStats.streakDays);
  const attempts = getLocalAttempts();
  const srData = loadSRData();

  // Dynamic milestone metrics based on REAL candidate attempts
  const logicAttempts = attempts.filter((a) => a.unit === 3 && a.isCorrect).length;
  const networkAttempts = attempts.filter((a) => a.unit === 9 && a.isCorrect).length;
  const pythonAttempts = attempts.filter((a) => a.unit === 6 && a.isCorrect).length;
  const srMastered = Object.values(srData).filter((item) => item.consecutiveCorrect >= 2).length;

  const badges = [
    {
      name: 'De Morgan Master',
      desc: 'Master Boolean algebra, Karnaugh maps & logic gate inversions.',
      icon: 'memory',
      unlocked: logicAttempts >= 5,
      progress: `${logicAttempts}/5 Correct`,
      tier: 'Gold',
    },
    {
      name: 'Subnet Samurai',
      desc: 'Calculate CIDR network, host block sizes and broadcast subnets.',
      icon: 'hub',
      unlocked: networkAttempts >= 5,
      progress: `${networkAttempts}/5 Correct`,
      tier: 'Silver',
    },
    {
      name: 'Python Bug Squasher',
      desc: 'Conquer past paper trace tables, string loops & nested logic.',
      icon: 'code',
      unlocked: pythonAttempts >= 5,
      progress: `${pythonAttempts}/5 Correct`,
      tier: 'Gold',
    },
    {
      name: 'Spaced Memory Lock',
      desc: 'Retain tricky questions in long-term memory across intervals.',
      icon: 'psychology',
      unlocked: srMastered >= 3,
      progress: `${srMastered}/3 Mastered`,
      tier: 'Diamond',
    },
  ];

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Top Welcome / Quest Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#581c87] via-[#3b0764] to-[#1e1b4b] p-6 sm:p-8 border border-card-border/60 shadow-lg">
        <div className="absolute -right-6 -bottom-6 w-48 h-48 rounded-full bg-secondary/10 blur-2xl pointer-events-none" />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col max-w-[420px] gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-lightning-gold/20 text-lightning-gold w-fit text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-sm">bolt</span>
              <span>A/L Target Sprint</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface">Daily ICT Sprints</h2>
            <p className="text-xs sm:text-sm text-secondary-fixed leading-relaxed">
              Complete daily drills to earn Bits, maintain your {userStats.streakDays}-day study streak, and boost your Sri Lankan A/L national percentile.
            </p>
          </div>

          {/* Cyber Chip Graphic */}
          <div className="relative hidden sm:flex items-center justify-center w-28 h-28 shrink-0">
            <svg
              className="w-24 h-24 text-secondary/80 animate-pulse"
              fill="none"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect fill="#152126" height="50" rx="10" stroke="currentColor" strokeWidth="2" width="50" x="25" y="25" />
              <path d="M40 38L48 46" stroke="#74e930" strokeLinecap="round" strokeWidth="2.5" />
              <path d="M60 38L52 46" stroke="#74e930" strokeLinecap="round" strokeWidth="2.5" />
              <circle cx="50" cy="62" fill="#ffc800" r="5" />
              <path
                d="M50 15V25M50 75V85M15 50H25M75 50H85M28 28L35 35M72 72L65 65M72 28L65 35M28 72L35 65"
                stroke="currentColor"
                strokeLinecap="round"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-lightning-gold text-3xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                terminal
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lightning-gold text-2xl">assignment</span>
          <h3 className="text-xl font-bold text-on-surface">Daily Quests</h3>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-lightning-gold text-xs font-bold">
          <span className="material-symbols-outlined text-sm">timer</span>
          <span>Resets at Midnight</span>
        </div>
      </div>

      {/* Quests Container */}
      <div className="flex flex-col gap-3">
        {quests.map((quest) => {
          const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));

          return (
            <div
              key={quest.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-card-dark border border-card-border shadow-sm gap-4 hover:bg-surface-variant transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                  <span
                    className="material-symbols-outlined text-lightning-gold text-2xl"
                    style={{ fontVariationSettings: '"FILL" 1' }}
                  >
                    {quest.icon}
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-on-surface truncate">
                      {quest.title}
                    </span>
                    {quest.unitTag && (
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-text-muted text-[10px] font-bold">
                        {quest.unitTag}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-muted">{quest.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-40 sm:w-48 h-2 rounded-full bg-surface-container-high overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quest.completed ? 'bg-lightning-gold' : 'bg-primary'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-bold text-on-surface">
                      {quest.current} / {quest.target}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rewards status */}
              <div className="flex items-center gap-3 sm:self-center shrink-0">
                <div className="flex items-center gap-2 text-xs font-mono font-bold">
                  <span className="text-primary-fixed-dim">+{quest.xpReward} XP</span>
                  <span className="text-secondary">+{quest.gemReward} 💎</span>
                </div>
                {quest.completed ? (
                  <span className="px-3 py-1.5 rounded-xl bg-lightning-gold/20 text-lightning-gold text-xs font-bold uppercase tracking-wider border border-lightning-gold/40 flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm">check</span>
                    <span>Completed</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 rounded-xl bg-surface-container text-text-muted text-xs font-bold uppercase tracking-wider">
                    In Progress
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Badges & Syllabus Milestones */}
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-2xl">military_tech</span>
          <h3 className="text-xl font-bold text-on-surface">Syllabus Milestones & Badges</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border flex items-start gap-4 ${
                badge.unlocked
                  ? 'bg-card-dark border-card-border hover:border-secondary/40'
                  : 'bg-surface-container-low/60 border-card-border/40 opacity-60'
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                badge.unlocked ? 'bg-secondary-container text-on-secondary-container' : 'bg-gray-inactive text-text-muted'
              }`}>
                <span className="material-symbols-outlined text-2xl">{badge.icon}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-on-surface">{badge.name}</h4>
                  <span className="text-[10px] uppercase font-bold text-secondary">{badge.tier}</span>
                </div>
                <p className="text-xs text-text-muted mt-1">{badge.desc}</p>
                <span className="text-[11px] font-mono mt-1 text-primary font-bold">{badge.progress}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
