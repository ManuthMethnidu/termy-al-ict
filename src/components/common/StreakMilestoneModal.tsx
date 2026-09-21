import React from 'react';
import { UserStats } from '../../types';
import { STREAK_MILESTONES, StreakMilestone } from '../../lib/gemEconomy';
import { sounds } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface StreakMilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onUpdateStats: (partial: Partial<UserStats>) => void;
}

export const StreakMilestoneModal: React.FC<StreakMilestoneModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onUpdateStats,
}) => {
  if (!isOpen) return null;

  const currentStreak = userStats.streakDays || 0;
  const claimedMilestones = userStats.streakMilestonesClaimed || [];

  const handleClaim = (milestone: StreakMilestone) => {
    sounds.playFanfare();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    const nextClaimed = [...claimedMilestones, milestone.days];
    onUpdateStats({
      gems: (userStats.gems || 0) + milestone.gemsReward,
      streakMilestonesClaimed: nextClaimed,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#182228] border-2 border-card-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-5 border-b border-card-border/60 bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-lg text-2xl">
              🔥
            </div>
            <div>
              <h2 className="text-lg font-black text-on-surface">Streak Milestone Rewards</h2>
              <span className="text-xs text-lightning-gold font-bold">
                {currentStreak}-Day Active Revision Streak
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            aria-label="Close"
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-4 bg-surface-container/60 border-b border-card-border/40 text-xs text-text-muted leading-relaxed">
          <p>
            <span className="text-lightning-gold font-bold">Duolingo 25-Day Cycle:</span> Earn massive gem rewards at 25 days (25 💎), 50 days (250 💎), and 75 days (375 💎). Consistency in A/L ICT past paper review pays off!
          </p>
        </div>

        {/* Milestones List */}
        <div className="p-5 overflow-y-auto space-y-3 select-none">
          {STREAK_MILESTONES.map((m) => {
            const isReached = currentStreak >= m.days;
            const isClaimed = claimedMilestones.includes(m.days);
            const canClaim = isReached && !isClaimed;

            return (
              <div
                key={m.days}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  canClaim
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                    : isClaimed
                    ? 'bg-surface-container/40 border-card-border/40 opacity-70'
                    : 'bg-card-dark border-card-border/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isClaimed
                        ? 'bg-surface-container text-text-muted'
                        : canClaim
                        ? 'bg-amber-500 text-black shadow-md animate-bounce'
                        : 'bg-surface-container text-text-muted'
                    }`}
                  >
                    {isClaimed ? '✓' : `${m.days}d`}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-black text-xs ${canClaim ? 'text-lightning-gold' : 'text-on-surface'}`}>
                        {m.title}
                      </span>
                      <span className="font-mono text-[10px] text-text-muted uppercase">
                        ({m.days} Days)
                      </span>
                    </div>
                    <span className="text-[11px] text-secondary font-bold flex items-center gap-1 mt-0.5">
                      <span>Reward:</span>
                      <span>+{m.gemsReward} 💎 Bits</span>
                    </span>
                  </div>
                </div>

                <div>
                  {isClaimed ? (
                    <span className="px-3 py-1.5 rounded-lg bg-surface-container text-text-muted text-[11px] font-bold">
                      Claimed
                    </span>
                  ) : canClaim ? (
                    <button
                      onClick={() => handleClaim(m)}
                      className="px-4 py-2 rounded-xl bg-lightning-gold hover:bg-yellow-400 text-black font-black uppercase text-xs shadow-md active:translate-y-0.5 transition-transform flex items-center gap-1.5"
                    >
                      <span>Claim</span>
                      <span>+{m.gemsReward} 💎</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-mono text-text-muted">
                      {m.days - currentStreak} days to go
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
