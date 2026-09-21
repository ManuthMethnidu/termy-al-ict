import React, { useState, useEffect } from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';
import {
  ECONOMY_PRICES,
  getTimeUntilNextHeart,
  getTimeUntilNextEnergy,
  getTimeUntilFreeRefill,
} from '../../lib/gemEconomy';

interface LivesRefillModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onUpdateStats: (partial: Partial<UserStats>) => void;
  onStartPractice: () => void;
  onOpenShop?: () => void;
}

export const LivesRefillModal: React.FC<LivesRefillModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onUpdateStats,
  onStartPractice,
  onOpenShop,
}) => {
  const [adWatching, setAdWatching] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(5);
  const [, setNow] = useState<number>(Date.now());

  // Tick timer every second for live countdowns
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const livesMode = userStats.livesMode || 'hearts';
  const isHearts = livesMode === 'hearts';
  const currentCount = isHearts ? userStats.hearts : (userStats.energyUnits ?? 25);
  const maxCount = isHearts ? userStats.maxHearts : (userStats.maxEnergyUnits ?? 25);
  const isFull = currentCount >= maxCount;

  const heartCountdown = getTimeUntilNextHeart(userStats.lastHeartRegenTime);
  const energyCountdown = getTimeUntilNextEnergy(userStats.lastEnergyRegenTime);
  const freeRefillStatus = getTimeUntilFreeRefill(userStats.lastFreeRefillTime);

  const handleToggleMode = (mode: 'hearts' | 'energy') => {
    sounds.playClick();
    onUpdateStats({ livesMode: mode });
  };

  const handleBuyFullRefill = () => {
    if (isFull) {
      alert(`${isHearts ? 'Exam lives' : 'Energy'} already at maximum capacity!`);
      return;
    }
    const cost = isHearts ? ECONOMY_PRICES.FULL_HEARTS_REFILL : ECONOMY_PRICES.FULL_ENERGY_REFILL;
    if (userStats.gems < cost) {
      sounds.playIncorrect();
      alert(`Not enough Gems! You have ${userStats.gems} 💎, but need ${cost} 💎. Complete quests or top up in the shop.`);
      return;
    }

    sounds.playCorrect();
    if (isHearts) {
      onUpdateStats({
        hearts: maxCount,
        gems: userStats.gems - cost,
        lastHeartRegenTime: Date.now(),
      });
    } else {
      onUpdateStats({
        energyUnits: maxCount,
        gems: userStats.gems - cost,
        lastEnergyRegenTime: Date.now(),
      });
    }
  };

  const handleBuySingleRefill = () => {
    if (isFull) {
      alert('Already full!');
      return;
    }
    const cost = isHearts ? ECONOMY_PRICES.SINGLE_HEART_REFILL : ECONOMY_PRICES.SINGLE_ENERGY_REFILL;
    if (userStats.gems < cost) {
      sounds.playIncorrect();
      alert(`Not enough Gems! You need ${cost} 💎.`);
      return;
    }

    sounds.playCorrect();
    if (isHearts) {
      onUpdateStats({
        hearts: Math.min(maxCount, (userStats.hearts || 0) + 1),
        gems: userStats.gems - cost,
      });
    } else {
      onUpdateStats({
        energyUnits: Math.min(maxCount, (userStats.energyUnits || 0) + 5),
        gems: userStats.gems - cost,
      });
    }
  };

  const handleClaimFreeRefill = () => {
    if (!freeRefillStatus.isAvailable) {
      alert(`Free recharge cooling down! Next free refill available in ${freeRefillStatus.formatted}.`);
      return;
    }

    sounds.playCorrect();
    if (isHearts) {
      onUpdateStats({
        hearts: Math.min(maxCount, (userStats.hearts || 0) + 1),
        lastFreeRefillTime: Date.now(),
      });
      alert('Claimed +1 Exam Heart from the 4-hour recharge station! ❤️');
    } else {
      onUpdateStats({
        energyUnits: Math.min(maxCount, (userStats.energyUnits || 0) + 5),
        lastFreeRefillTime: Date.now(),
      });
      alert('Claimed +5 Energy Units from the 4-hour recharge station! ⚡');
    }
  };

  const handleWatchAdRefill = () => {
    if (isFull) {
      alert('Your lives are already full!');
      return;
    }
    setAdWatching(true);
    setAdCountdown(5);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setAdWatching(false);
          sounds.playFanfare();
          if (isHearts) {
            onUpdateStats({
              hearts: Math.min(maxCount, (userStats.hearts || 0) + 1),
            });
            alert('Study Break complete! +1 Exam Heart redeemed! ❤️');
          } else {
            onUpdateStats({
              energyUnits: Math.min(maxCount, (userStats.energyUnits || 0) + 5),
            });
            alert('Study Break complete! +5 Energy Units redeemed! ⚡');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#182228] border-2 border-card-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between p-5 border-b border-card-border/60 bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              isHearts ? 'bg-crimson-heart/20 text-crimson-heart border border-crimson-heart/30' : 'bg-lightning-gold/20 text-lightning-gold border border-lightning-gold/30'
            }`}>
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                {isHearts ? 'favorite' : 'bolt'}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-black text-on-surface">
                {isHearts ? 'Exam Lives (Hearts)' : 'Energy Battery'}
              </h2>
              <span className="text-xs text-text-muted">
                {userStats.isPro
                  ? 'Super Termy Pro: Unlimited (∞)'
                  : isHearts
                  ? `${userStats.hearts} of 5 Hearts remaining`
                  : `${userStats.energyUnits ?? 25} of 25 Energy Units`}
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

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs select-none">
          {/* Ad Simulation Screen */}
          {adWatching && (
            <div className="p-6 rounded-2xl bg-[#0e161a] border-2 border-lightning-gold/50 flex flex-col items-center justify-center text-center gap-3 animate-pulse">
              <span className="material-symbols-outlined text-4xl text-lightning-gold">smart_display</span>
              <h3 className="text-sm font-black text-on-surface">Sponsor Study Break in Progress</h3>
              <p className="text-[11px] text-text-muted max-w-xs">
                Reviewing official AL ICT syllabus sponsor note. Your life will refill when timer finishes.
              </p>
              <div className="w-12 h-12 rounded-full bg-lightning-gold/20 text-lightning-gold border border-lightning-gold/40 flex items-center justify-center font-mono font-black text-lg">
                {adCountdown}s
              </div>
            </div>
          )}

          {/* Mode Switcher Pill */}
          <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-text-muted">
                Pacing Mechanism
              </span>
              <span className="text-[10px] text-secondary font-bold">
                Duolingo Pacing System
              </span>
            </div>
            <div className="grid grid-cols-2 p-1 rounded-xl bg-card-dark border border-card-border/60">
              <button
                type="button"
                onClick={() => handleToggleMode('hearts')}
                className={`py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  isHearts
                    ? 'bg-crimson-heart text-white shadow-sm'
                    : 'text-text-muted hover:text-on-surface'
                }`}
              >
                <span>❤️</span>
                <span>Hearts (5)</span>
              </button>
              <button
                type="button"
                onClick={() => handleToggleMode('energy')}
                className={`py-2 px-3 rounded-lg font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all ${
                  !isHearts
                    ? 'bg-lightning-gold text-black shadow-sm'
                    : 'text-text-muted hover:text-on-surface'
                }`}
              >
                <span>⚡</span>
                <span>Energy Battery (25)</span>
              </button>
            </div>
            <p className="text-[11px] text-text-muted leading-relaxed">
              {isHearts
                ? 'Option A (Legacy Hearts): You start with 5 hearts. Only mistakes / wrong answers deduct 1 heart. Perfect answers cost zero.'
                : 'Option B (New Energy Battery): You start with 25 capacity. Every question answered consumes 1 unit. Avoids frustration from early mistakes!'}
            </p>
          </div>

          {/* Current Status & Passive Regeneration Info */}
          <div className="p-4 rounded-2xl bg-surface-container/80 border border-card-border flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {isHearts ? '❤️' : '⚡'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-on-surface text-sm">
                  {userStats.isPro
                    ? 'Unlimited (∞) Pro'
                    : isHearts
                    ? `${userStats.hearts}/5 Hearts Available`
                    : `${userStats.energyUnits ?? 25}/25 Energy Available`}
                </span>
                <span className="text-[11px] text-text-muted">
                  {userStats.isPro
                    ? 'Pro membership grants infinite attempts'
                    : isHearts
                    ? isFull
                      ? 'Hearts are currently full!'
                      : `Next heart regens in: ${heartCountdown.formatted} (1 every 5h)`
                    : isFull
                    ? 'Battery is fully charged!'
                    : `Next unit regens in: ${energyCountdown.formatted} (1 every 42m)`}
                </span>
              </div>
            </div>

            {/* 4-Hour Free Station */}
            <button
              onClick={handleClaimFreeRefill}
              disabled={!freeRefillStatus.isAvailable || isFull}
              className={`px-3 py-2 rounded-xl text-[11px] font-extrabold uppercase tracking-wider border transition-all ${
                freeRefillStatus.isAvailable && !isFull
                  ? 'bg-primary/20 text-primary border-primary/40 hover:bg-primary/30 active:translate-y-0.5'
                  : 'bg-surface-container text-text-muted border-card-border/50 cursor-not-allowed'
              }`}
              title="Recharge station gives free units every 4 hours"
            >
              {freeRefillStatus.isAvailable ? 'Free +1' : freeRefillStatus.formatted}
            </button>
          </div>

          {/* Refill Options (Free & Cheap) */}
          <div className="space-y-2.5">
            <span className="font-black text-[11px] uppercase tracking-wider text-text-muted px-1">
              Ways to Refill Lives
            </span>

            {/* 1. Practice to Refill (100% Free) */}
            <div className="p-3.5 rounded-2xl bg-card-dark border border-card-border flex items-center justify-between gap-3 hover:border-primary/40 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">school</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">Practice Session</span>
                    <span className="px-1.5 py-0.2 bg-primary/20 text-primary font-mono text-[9px] font-bold rounded">
                      100% FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Complete a quick 5-MCQ active recall review to earn back {isHearts ? '+1 Heart' : '+5 Energy'} and 3 Gems!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  onStartPractice();
                }}
                className="px-4 py-2 bg-primary text-on-primary-fixed rounded-xl font-extrabold uppercase text-[11px] tracking-wider shrink-0 btn-pressable-primary"
              >
                Practice
              </button>
            </div>

            {/* 2. Sponsor Study Break / Ad Refill (Free) */}
            <div className="p-3.5 rounded-2xl bg-card-dark border border-card-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-xl">videocam</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">Study Break Clip</span>
                    <span className="px-1.5 py-0.2 bg-secondary/20 text-secondary font-mono text-[9px] font-bold rounded">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Watch a quick 5-second student clip to instantly replenish {isHearts ? '+1 Heart' : '+5 Energy'}.
                  </p>
                </div>
              </div>

              <button
                onClick={handleWatchAdRefill}
                disabled={adWatching || isFull}
                className={`px-3.5 py-2 rounded-xl font-extrabold uppercase text-[11px] tracking-wider shrink-0 transition-all ${
                  adWatching || isFull
                    ? 'bg-surface-container text-text-muted cursor-not-allowed border border-card-border'
                    : 'bg-secondary/20 text-secondary border border-secondary/40 hover:bg-secondary/30 active:translate-y-0.5'
                }`}
              >
                {adWatching ? 'Watching...' : 'Watch Clip'}
              </button>
            </div>

            {/* 3. Gem Full Refill (Cheaper Price: 50 Gems!) */}
            <div className="p-3.5 rounded-2xl bg-card-dark border-2 border-secondary/30 flex items-center justify-between gap-3 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 text-secondary flex items-center justify-center shrink-0">
                  <span className="text-xl">💎</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-on-surface">
                      Full Structural Refill ({isHearts ? '5/5 Hearts' : '25/25 Battery'})
                    </span>
                    <span className="px-1.5 py-0.2 bg-lightning-gold/20 text-lightning-gold font-mono text-[9px] font-bold rounded">
                      SAVE 89% vs DUO (450 💎)
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted">
                    Instantly restores full capacity. Ultra-affordable for students!
                  </p>
                </div>
              </div>

              <button
                onClick={handleBuyFullRefill}
                disabled={isFull || userStats.isPro}
                className={`px-3.5 py-2 rounded-xl font-extrabold uppercase text-[11px] tracking-wider shrink-0 flex items-center gap-1.5 transition-all ${
                  isFull || userStats.isPro
                    ? 'bg-surface-container text-text-muted cursor-not-allowed border border-card-border'
                    : 'bg-secondary text-on-secondary shadow-md active:translate-y-0.5'
                }`}
              >
                <span>50 💎</span>
                <span>Refill</span>
              </button>
            </div>

            {/* 4. Single Unit Refill (15 Gems) */}
            <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{isHearts ? '❤️' : '⚡'}</span>
                <div>
                  <span className="font-bold text-on-surface">
                    Emergency Unit ({isHearts ? '+1 Heart' : '+5 Energy'})
                  </span>
                  <p className="text-[10px] text-text-muted">Single quick boost to finish your current drill.</p>
                </div>
              </div>

              <button
                onClick={handleBuySingleRefill}
                disabled={isFull || userStats.isPro}
                className={`px-3 py-1.5 rounded-lg font-extrabold text-[11px] tracking-wider border transition-all ${
                  isFull || userStats.isPro
                    ? 'bg-surface-container text-text-muted cursor-not-allowed border-card-border'
                    : 'bg-surface-container-high hover:bg-surface-variant text-on-surface border-card-border active:translate-y-0.5'
                }`}
              >
                15 💎
              </button>
            </div>
          </div>

          {/* Super Termy Pro Banner */}
          {!userStats.isPro && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#182a4d] to-[#1a3826] border border-primary/40 flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-1 text-lightning-gold font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">workspace_premium</span>
                  <span>Super Termy Pro Pass</span>
                </div>
                <p className="text-[11px] text-text-muted mt-0.5">
                  Never worry about exam lives again with unlimited attempts and full marking schemes.
                </p>
              </div>

              {onOpenShop && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    onOpenShop();
                  }}
                  className="px-3.5 py-2 bg-primary text-on-primary-fixed rounded-xl font-extrabold uppercase text-[10px] tracking-wider shrink-0"
                >
                  View Pro
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
