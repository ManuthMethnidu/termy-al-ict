import React from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';

interface ShopViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  userStats,
  onUpdateStats,
}) => {
  const handleBuyHearts = () => {
    if (userStats.hearts >= userStats.maxHearts) {
      alert('Your exam lives are already full (5/5)!');
      return;
    }
    if (userStats.gems < 200) {
      alert('Not enough Bits/Gems! Complete daily drills to earn more.');
      return;
    }
    sounds.playCorrect();
    onUpdateStats({
      hearts: userStats.maxHearts,
      gems: userStats.gems - 200,
    });
    alert('Exam lives fully replenished to 5/5!');
  };

  const handleBuyFreeze = () => {
    if (userStats.gems < 150) {
      alert('Not enough Bits/Gems! Complete daily drills to earn more.');
      return;
    }
    sounds.playCorrect();
    onUpdateStats({
      gems: userStats.gems - 150,
    });
    alert('Streak Freeze equipped! Your study streak is protected for tomorrow.');
  };

  const handleTogglePro = () => {
    sounds.playFanfare();
    const nextPro = !userStats.isPro;
    onUpdateStats({
      isPro: nextPro,
      hearts: nextPro ? 999 : 5,
    });
    alert(nextPro ? 'Super Termy Pro Plan Activated! Unlimited hearts enabled.' : 'Switched back to standard plan.');
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Super Termy Pro Hero Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#182a4d] via-[#1f2452] to-[#2b1b4d] p-6 sm:p-8 border border-card-border/60 shadow-xl">
        <div className="absolute -right-6 -bottom-10 opacity-15 pointer-events-none">
          <svg
            className="text-secondary w-64 h-64"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              d="M9 3v2m6-2v2M9 19v2m6-2v2M3 9h2m-2 6h2m16-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00a8ed] to-[#74e930] flex items-center justify-center shadow-md shrink-0">
              <span
                className="material-symbols-outlined text-surface-container-lowest text-4xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                terminal
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-secondary font-extrabold bg-[#00a8ed]/20 px-2 py-0.5 rounded">
                  PRO PASS
                </span>
                <span className="text-xs text-lightning-gold font-bold">
                  ★ 7-DAY FREE TRIAL
                </span>
              </div>
              <h2 className="text-2xl font-extrabold text-on-surface">Super Termy Pro Plan</h2>
              <p className="text-xs text-secondary-fixed leading-relaxed">
                Unlimited hearts, official marking scheme step-by-step breakdowns, and advanced algorithmic drills.
              </p>
            </div>
          </div>

          <button
            onClick={handleTogglePro}
            className="w-full md:w-auto px-6 py-3 bg-on-surface text-surface-container-lowest text-xs uppercase font-extrabold tracking-wider rounded-xl shadow-[0_4px_0_#88957d] hover:brightness-105 active:translate-y-1 active:shadow-[0_1px_0_#88957d] transition-all shrink-0 text-center"
          >
            {userStats.isPro ? 'Pro Active (Toggle)' : 'Start Free 7-Day Pro'}
          </button>
        </div>
      </div>

      {/* Hearts / Exam Lives Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-crimson-heart text-2xl"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              favorite
            </span>
            <h3 className="text-xl font-bold text-on-surface">Exam Heart Refills</h3>
          </div>
          <span className="text-xs uppercase tracking-wider text-text-muted">
            Auto-replenishes every 4 hours
          </span>
        </div>

        <div className="rounded-2xl bg-card-dark border border-card-border p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#381e1e] border border-crimson-heart/30 flex items-center justify-center shrink-0">
              <span
                className="material-symbols-outlined text-crimson-heart text-3xl"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                favorite
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-on-surface">Refill Exam Lives</h4>
                <span className="text-xs text-primary font-bold">
                  ({userStats.isPro ? 'Unlimited Pro' : `${userStats.hearts}/5`})
                </span>
              </div>
              <p className="text-xs text-text-muted">
                Stay in your late-night study flow without interruptions when analyzing tricky MCQs.
              </p>
            </div>
          </div>

          <button
            onClick={handleBuyHearts}
            disabled={userStats.hearts >= userStats.maxHearts || userStats.isPro}
            className={`px-5 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all shrink-0 ${
              userStats.hearts >= userStats.maxHearts || userStats.isPro
                ? 'bg-gray-inactive text-text-muted cursor-not-allowed'
                : 'bg-crimson-heart text-white btn-pressable-dark'
            }`}
          >
            {userStats.hearts >= userStats.maxHearts || userStats.isPro
              ? 'Hearts Full'
              : 'Refill (200 💎)'}
          </button>
        </div>
      </div>

      {/* Power-ups: Streak Freezes & Double XP */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-lightning-gold text-2xl">bolt</span>
          <h3 className="text-xl font-bold text-on-surface">Study Boosters</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Streak Freeze */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-2xl">ac_unit</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-on-surface">Streak Freeze</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Preserves your study streak if you miss a revision day during school term tests.
                </p>
              </div>
            </div>
            <button
              onClick={handleBuyFreeze}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-variant text-secondary border border-secondary/40 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all"
            >
              Equip Freeze (150 💎)
            </button>
          </div>

          {/* Double XP Boost */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lightning-gold text-2xl">double_arrow</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-base font-bold text-on-surface">2x XP Turbo (15 Min)</h4>
                <p className="text-xs text-text-muted mt-1 leading-relaxed">
                  Double every point earned during rapid past paper review to climb Diamond League!
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                alert('2x Turbo Boost activated for 15 minutes!');
              }}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-variant text-lightning-gold border border-lightning-gold/40 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all"
            >
              Activate Turbo (100 💎)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
