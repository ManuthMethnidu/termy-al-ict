import React, { useState, useEffect } from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';
import {
  ECONOMY_PRICES,
  GEM_PACK_TIERS,
  GemPackTier,
  STREAK_MILESTONES,
  getTimeUntilNextHeart,
  getTimeUntilNextEnergy,
  getTimeUntilFreeRefill,
} from '../../lib/gemEconomy';
import confetti from 'canvas-confetti';

interface ShopViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  onStartPractice?: () => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  userStats,
  onUpdateStats,
  onOpenAuth,
  onStartPractice,
}) => {
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('LKR');
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);
  const [adWatching, setAdWatching] = useState<boolean>(false);
  const [adCountdown, setAdCountdown] = useState<number>(5);
  const [, setTick] = useState<number>(Date.now());

  // Tick every second for live regeneration countdowns
  useEffect(() => {
    const timer = setInterval(() => setTick(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const livesMode = userStats.livesMode || 'hearts';
  const isHearts = livesMode === 'hearts';
  const currentCapacity = isHearts ? userStats.hearts : (userStats.energyUnits ?? 25);
  const maxCapacity = isHearts ? userStats.maxHearts : (userStats.maxEnergyUnits ?? 25);
  const isLivesFull = currentCapacity >= maxCapacity;

  const heartCountdown = getTimeUntilNextHeart(userStats.lastHeartRegenTime);
  const energyCountdown = getTimeUntilNextEnergy(userStats.lastEnergyRegenTime);
  const freeRefillStatus = getTimeUntilFreeRefill(userStats.lastFreeRefillTime);

  const handleToggleMode = (mode: 'hearts' | 'energy') => {
    sounds.playClick();
    onUpdateStats({ livesMode: mode });
  };

  // 1. Full Refill (50 Gems - Cheaper price)
  const handleBuyFullRefill = () => {
    if (isLivesFull) {
      alert(`${isHearts ? 'Exam lives' : 'Energy'} already full!`);
      return;
    }
    const cost = isHearts ? ECONOMY_PRICES.FULL_HEARTS_REFILL : ECONOMY_PRICES.FULL_ENERGY_REFILL;
    if (userStats.gems < cost) {
      sounds.playIncorrect();
      alert(`Not enough Gems! You have ${userStats.gems} 💎, but need ${cost} 💎.`);
      return;
    }

    sounds.playCorrect();
    if (isHearts) {
      onUpdateStats({
        hearts: maxCapacity,
        gems: userStats.gems - cost,
        lastHeartRegenTime: Date.now(),
      });
      alert('Exam lives fully replenished to 5/5! (50 💎)');
    } else {
      onUpdateStats({
        energyUnits: maxCapacity,
        gems: userStats.gems - cost,
        lastEnergyRegenTime: Date.now(),
      });
      alert('Energy battery fully recharged to 25/25! (50 💎)');
    }
  };

  // 2. Single Emergency Refill (15 Gems)
  const handleBuySingleRefill = () => {
    if (isLivesFull) {
      alert('Lives already full!');
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
        hearts: Math.min(maxCapacity, (userStats.hearts || 0) + 1),
        gems: userStats.gems - cost,
      });
      alert('Added +1 Exam Heart! (15 💎)');
    } else {
      onUpdateStats({
        energyUnits: Math.min(maxCapacity, (userStats.energyUnits || 0) + 5),
        gems: userStats.gems - cost,
      });
      alert('Added +5 Energy Units! (10 💎)');
    }
  };

  // 3. 4-Hour Free Recharge Claim
  const handleClaimFreeRefill = () => {
    if (!freeRefillStatus.isAvailable) {
      alert(`Free recharge cooling down! Next free refill available in ${freeRefillStatus.formatted}.`);
      return;
    }
    sounds.playCorrect();
    if (isHearts) {
      onUpdateStats({
        hearts: Math.min(maxCapacity, (userStats.hearts || 0) + 1),
        lastFreeRefillTime: Date.now(),
      });
      alert('Claimed +1 Exam Heart from 4-hour recharge station! ❤️');
    } else {
      onUpdateStats({
        energyUnits: Math.min(maxCapacity, (userStats.energyUnits || 0) + 5),
        lastFreeRefillTime: Date.now(),
      });
      alert('Claimed +5 Energy Units from 4-hour recharge station! ⚡');
    }
  };

  // 4. Study Break Ad Refill
  const handleWatchAdRefill = () => {
    if (isLivesFull) {
      alert('Your lives are already at max capacity!');
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
              hearts: Math.min(maxCapacity, (userStats.hearts || 0) + 1),
            });
            alert('Study Break complete! +1 Exam Heart redeemed! ❤️');
          } else {
            onUpdateStats({
              energyUnits: Math.min(maxCapacity, (userStats.energyUnits || 0) + 5),
            });
            alert('Study Break complete! +5 Energy Units redeemed! ⚡');
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 5. Streak Freeze (Cheaper: 50 Gems!)
  const streakFreezes = userStats.streakFreezesCount || 0;
  const handleBuyFreeze = () => {
    if (streakFreezes >= ECONOMY_PRICES.MAX_STREAK_FREEZES) {
      alert(`You already have maximum Streak Freezes equipped (${streakFreezes}/${ECONOMY_PRICES.MAX_STREAK_FREEZES})!`);
      return;
    }
    if (userStats.gems < ECONOMY_PRICES.STREAK_FREEZE) {
      sounds.playIncorrect();
      alert(`Not enough Gems! Streak Freeze costs ${ECONOMY_PRICES.STREAK_FREEZE} 💎.`);
      return;
    }

    sounds.playCorrect();
    onUpdateStats({
      gems: userStats.gems - ECONOMY_PRICES.STREAK_FREEZE,
      streakFreezesCount: streakFreezes + 1,
    });
    alert(`Streak Freeze equipped (${streakFreezes + 1}/${ECONOMY_PRICES.MAX_STREAK_FREEZES})! Your revision streak is protected for tomorrow.`);
  };

  // 6. 2x XP Turbo (Cheaper: 20 Gems!)
  const handleBuyTurbo = () => {
    if (userStats.gems < ECONOMY_PRICES.TIMER_BOOST) {
      sounds.playIncorrect();
      alert(`Not enough Gems! 2x XP Turbo costs ${ECONOMY_PRICES.TIMER_BOOST} 💎.`);
      return;
    }

    sounds.playFanfare();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    onUpdateStats({
      gems: userStats.gems - ECONOMY_PRICES.TIMER_BOOST,
      boostActiveUntil: Date.now() + 15 * 60 * 1000,
    });
    alert('⚡ 2x XP Turbo activated for 15 minutes! All MCQ drill points are doubled!');
  };

  // 7. Legendary Challenge Pass (25 Gems)
  const handleBuyLegendaryPass = () => {
    if (userStats.gems < ECONOMY_PRICES.LEGENDARY_CHALLENGE) {
      sounds.playIncorrect();
      alert(`Not enough Gems! Legendary Challenge Pass costs ${ECONOMY_PRICES.LEGENDARY_CHALLENGE} 💎.`);
      return;
    }
    sounds.playFanfare();
    onUpdateStats({
      gems: userStats.gems - ECONOMY_PRICES.LEGENDARY_CHALLENGE,
    });
    alert('🏆 Legendary Challenge Pass unlocked! Dive into official past paper distinction drills.');
  };

  // 8. Gem Bundle Purchase Simulation
  const handleBuyGemPack = (pack: GemPackTier) => {
    setPurchasingPack(pack.id);
    sounds.playClick();

    setTimeout(() => {
      setPurchasingPack(null);
      sounds.playFanfare();
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      onUpdateStats({
        gems: (userStats.gems || 0) + pack.gemQuantity,
      });
      alert(`Top-up successful! Added +${pack.gemQuantity.toLocaleString()} Gems to your balance! 💎`);
    }, 700);
  };

  const handleCopyUsername = () => {
    const textToCopy = userStats.username.startsWith('@')
      ? userStats.username
      : `@${userStats.username}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      sounds.playClick();
      setCopiedUsername(true);
      setTimeout(() => setCopiedUsername(false), 2500);
    }
  };

  const isGuest = !userStats.email && userStats.authProvider === 'guest';

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-8 pb-24 md:pb-12 select-none">
      {/* 0. Top Gem Economy Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container border border-card-border shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-2xl shadow-inner">
            💎
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base text-on-surface">
                Termy Gem Economy
              </span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Cheaper Student Rates
              </span>
            </div>
            <span className="text-xs text-text-muted">
              Current Balance:{' '}
              <span className="text-secondary font-black font-mono text-sm">
                {userStats.gems} Gems (Bits)
              </span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex p-0.5 rounded-lg bg-surface-container-high border border-card-border">
            <button
              type="button"
              onClick={() => setCurrency('LKR')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                currency === 'LKR' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-text-muted'
              }`}
            >
              LKR (Rs)
            </button>
            <button
              type="button"
              onClick={() => setCurrency('USD')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                currency === 'USD' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-text-muted'
              }`}
            >
              USD ($)
            </button>
          </div>
        </div>
      </div>

      {/* 1. Super Termy Pro Hero Card */}
      {userStats.isPro ? (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#182a4d] via-[#1b3438] to-[#1a3826] p-6 sm:p-8 border-2 border-primary/50 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border-2 border-primary flex items-center justify-center text-primary shadow-lg shrink-0">
                <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  workspace_premium
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-extrabold bg-primary/20 border border-primary/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    PRO ACTIVE
                  </span>
                  <span className="text-xs text-lightning-gold font-bold">★ UNLIMITED LIVES</span>
                </div>
                <h2 className="text-2xl font-extrabold text-on-surface">Super Termy Pro Plan</h2>
                <p className="text-xs text-text-muted leading-relaxed max-w-md">
                  Your Pro account is fully active. You have unlimited exam lives, step-by-step marking scheme breakdowns, and Spaced Repetition boosters.
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="px-2.5 py-1 rounded-lg bg-surface-container/80 text-[11px] font-mono text-secondary border border-card-border">
                    Username: {userStats.username}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-crimson-heart/20 text-[11px] font-bold text-crimson-heart border border-crimson-heart/30">
                    Exam Lives: Unlimited (∞)
                  </span>
                </div>
              </div>
            </div>

            <a
              href="https://t.me/ManuthMethnidu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-surface-container hover:bg-surface-variant text-text-muted hover:text-on-surface text-xs font-bold border border-card-border flex items-center gap-2 transition-colors shrink-0 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-base">support_agent</span>
              <span>Pro Support</span>
            </a>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#121c2c] via-[#1a233a] to-[#251b38] p-6 sm:p-8 border-2 border-primary/40 shadow-2xl flex flex-col gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#00a8ed] to-[#74e930] flex items-center justify-center shadow-lg shrink-0">
                <span className="material-symbols-outlined text-surface-container-lowest text-4xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                  terminal
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-secondary font-extrabold bg-[#00a8ed]/20 px-2 py-0.5 rounded">
                    PRO PASS
                  </span>
                  <span className="text-xs text-lightning-gold font-bold">★ A/L ICT EXAM PACK</span>
                </div>
                <h2 className="text-2xl font-extrabold text-on-surface">Super Termy Pro Plan</h2>
                <p className="text-xs text-text-muted leading-relaxed max-w-lg">
                  Unlimited hearts, verified marking scheme derivations, and priority active recall drills for all 2,636 official syllabus questions. Skip microtransactions entirely!
                </p>
              </div>
            </div>

            <a
              href="https://t.me/ManuthMethnidu"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full md:w-auto px-6 py-3.5 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs uppercase font-extrabold tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all shrink-0 active:translate-y-0.5"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.52 2.77-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
              <span>Upgrade via Telegram</span>
            </a>
          </div>

          {/* Pro Benefits Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-card-border/60">
            <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex flex-col gap-1">
              <span className="text-crimson-heart font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-base">favorite</span>
                <span>Unlimited</span>
              </span>
              <span className="text-[11px] text-text-muted">Exam Lives / Hearts</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex flex-col gap-1">
              <span className="text-lightning-gold font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-base">menu_book</span>
                <span>2,636 MCQs</span>
              </span>
              <span className="text-[11px] text-text-muted">Full Marking Schemes</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex flex-col gap-1">
              <span className="text-secondary font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-base">autorenew</span>
                <span>SM-2 Turbo</span>
              </span>
              <span className="text-[11px] text-text-muted">Adaptive Active Recall</span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex flex-col gap-1">
              <span className="text-primary font-bold text-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-base">bolt</span>
                <span>2x XP Boost</span>
              </span>
              <span className="text-[11px] text-text-muted">Diamond League Climb</span>
            </div>
          </div>

          {/* Bank Payment Instructions Box */}
          <div className="rounded-2xl bg-[#0b1317] border-2 border-secondary/40 p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 text-secondary font-extrabold text-sm uppercase tracking-wider">
              <span className="material-symbols-outlined text-lg">payments</span>
              <span>How to Activate Super Termy Pro</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col gap-1.5">
                <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary font-extrabold flex items-center justify-center text-xs">
                  1
                </div>
                <span className="font-bold text-on-surface">Ask for Bank Details</span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Send a message to{' '}
                  <a
                    href="https://t.me/ManuthMethnidu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-secondary font-bold hover:underline"
                  >
                    @ManuthMethnidu
                  </a>{' '}
                  on Telegram to request the official bank transfer details.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col gap-1.5">
                <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary font-extrabold flex items-center justify-center text-xs">
                  2
                </div>
                <span className="font-bold text-on-surface">Transfer & Send Slip</span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Transfer the payment using online banking or CDM, and send a clear photo or PDF of the payment slip.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col gap-1.5">
                <div className="w-6 h-6 rounded-full bg-secondary/20 text-secondary font-extrabold flex items-center justify-center text-xs">
                  3
                </div>
                <span className="font-bold text-on-surface">Include Your Username</span>
                <p className="text-text-muted text-[11px] leading-relaxed">
                  Send your Termy username in the chat. The admin will verify your payment and activate your Pro Pass in the system!
                </p>
              </div>
            </div>

            {/* Candidate Username Copy Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-surface-container-high border border-card-border">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">badge</span>
                <div className="flex flex-col">
                  <span className="text-[10px] text-text-muted uppercase font-bold tracking-wider">
                    Your Termy Username to Send:
                  </span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {userStats.username}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleCopyUsername}
                  className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-variant border border-card-border text-xs font-bold text-on-surface flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">
                    {copiedUsername ? 'check' : 'content_copy'}
                  </span>
                  <span>{copiedUsername ? 'Copied!' : 'Copy Username'}</span>
                </button>

                {isGuest && onOpenAuth && (
                  <button
                    type="button"
                    onClick={() => onOpenAuth('signup')}
                    className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-on-primary-fixed text-xs font-extrabold transition-colors shadow-sm"
                  >
                    Sign In / Sign Up First
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Lives System (Hearts vs Energy Battery) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`material-symbols-outlined text-2xl ${isHearts ? 'text-crimson-heart' : 'text-lightning-gold'}`}
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              {isHearts ? 'favorite' : 'bolt'}
            </span>
            <div>
              <h3 className="text-xl font-bold text-on-surface">The Lives System</h3>
              <span className="text-xs text-text-muted">
                Choose between Loss-Aversion Hearts (5) or Continuous Energy Battery (25)
              </span>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex p-1 rounded-xl bg-surface-container border border-card-border self-start sm:self-auto">
            <button
              onClick={() => handleToggleMode('hearts')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                isHearts ? 'bg-crimson-heart text-white shadow-sm' : 'text-text-muted hover:text-on-surface'
              }`}
            >
              <span>❤️</span>
              <span>Option A: Hearts</span>
            </button>
            <button
              onClick={() => handleToggleMode('energy')}
              className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                !isHearts ? 'bg-lightning-gold text-black shadow-sm' : 'text-text-muted hover:text-on-surface'
              }`}
            >
              <span>⚡</span>
              <span>Option B: Energy</span>
            </button>
          </div>
        </div>

        {/* Ad simulation player */}
        {adWatching && (
          <div className="p-6 rounded-2xl bg-[#0e161a] border-2 border-lightning-gold flex flex-col items-center justify-center text-center gap-3 animate-pulse">
            <span className="material-symbols-outlined text-4xl text-lightning-gold">smart_display</span>
            <h4 className="text-sm font-black text-on-surface">Watching Sponsor Study Break...</h4>
            <div className="w-12 h-12 rounded-full bg-lightning-gold/20 text-lightning-gold border border-lightning-gold/40 flex items-center justify-center font-mono font-black text-lg">
              {adCountdown}s
            </div>
          </div>
        )}

        {/* Lives Card */}
        <div className="rounded-3xl bg-card-dark border-2 border-card-border p-5 sm:p-6 shadow-md flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${
                isHearts ? 'bg-crimson-heart/15 border border-crimson-heart/30 text-crimson-heart' : 'bg-lightning-gold/15 border border-lightning-gold/30 text-lightning-gold'
              }`}>
                {isHearts ? '❤️' : '⚡'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-on-surface">
                    {isHearts ? 'Exam Lives (Hearts)' : 'Energy Unit Battery'}
                  </h4>
                  <span className="text-xs text-primary font-bold">
                    ({userStats.isPro ? 'Unlimited Pro' : `${currentCapacity}/${maxCapacity}`})
                  </span>
                </div>
                <p className="text-xs text-text-muted max-w-md mt-0.5">
                  {isHearts
                    ? 'Only mistakes deduct a heart. Perfect answers cost nothing! Regenerates 1 heart every 5 hours.'
                    : 'Smartphone battery style. Each answered question costs 1 energy unit. Regenerates 1 unit every 42 mins.'}
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-text-muted font-mono">
                  <span>
                    Passive Regen:{' '}
                    <strong className="text-on-surface">
                      {isHearts ? heartCountdown.formatted : energyCountdown.formatted}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    4h Recharge:{' '}
                    <strong className={freeRefillStatus.isAvailable ? 'text-primary' : 'text-on-surface'}>
                      {freeRefillStatus.formatted}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Actions button group */}
            <div className="flex flex-wrap sm:flex-col items-center sm:items-end gap-2 shrink-0">
              <button
                onClick={handleBuyFullRefill}
                disabled={isLivesFull || userStats.isPro}
                className={`px-4 py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all ${
                  isLivesFull || userStats.isPro
                    ? 'bg-surface-container text-text-muted cursor-not-allowed border border-card-border'
                    : 'bg-secondary hover:bg-secondary-hover text-on-secondary shadow-md active:translate-y-0.5'
                }`}
              >
                {isLivesFull ? 'Capacity Full' : 'Full Refill (50 💎)'}
              </button>

              <button
                onClick={handleBuySingleRefill}
                disabled={isLivesFull || userStats.isPro}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${
                  isLivesFull || userStats.isPro
                    ? 'bg-surface-container text-text-muted cursor-not-allowed border-card-border'
                    : 'bg-surface-container hover:bg-surface-variant text-on-surface border-card-border'
                }`}
              >
                Emergency Unit ({isHearts ? '15 💎' : '10 💎'})
              </button>
            </div>
          </div>

          {/* Free Refill Alternatives Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-card-border/60">
            {/* Free Practice */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-primary font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">school</span>
                  <span>1. Practice Review</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Solve 5 past paper MCQs for free to earn back {isHearts ? '+1 Heart' : '+5 Energy'} and 3 Gems!
                </p>
              </div>
              <button
                onClick={() => {
                  sounds.playClick();
                  if (onStartPractice) onStartPractice();
                }}
                className="w-full py-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 rounded-lg text-[11px] font-extrabold uppercase transition-all"
              >
                Practice Drill (Free)
              </button>
            </div>

            {/* 4-Hour Recharge Button */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-secondary font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">battery_charging_full</span>
                  <span>2. 4h Recharge Station</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Free booster dispenser replenishes {isHearts ? '+1 Heart' : '+5 Units'} every 4 hours.
                </p>
              </div>
              <button
                onClick={handleClaimFreeRefill}
                disabled={!freeRefillStatus.isAvailable || isLivesFull}
                className={`w-full py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                  freeRefillStatus.isAvailable && !isLivesFull
                    ? 'bg-secondary/20 hover:bg-secondary/30 text-secondary border border-secondary/40 active:translate-y-0.5'
                    : 'bg-surface-container-high text-text-muted cursor-not-allowed border border-card-border'
                }`}
              >
                {freeRefillStatus.isAvailable ? 'Claim Free Refill' : freeRefillStatus.formatted}
              </button>
            </div>

            {/* Sponsor Study Break Ad Refill */}
            <div className="p-3.5 rounded-xl bg-surface-container border border-card-border flex flex-col justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-lightning-gold font-bold text-xs">
                  <span className="material-symbols-outlined text-sm">smart_display</span>
                  <span>3. Study Break Clip</span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Watch a 5-second sponsor video to instantly redeem {isHearts ? '+1 Heart' : '+5 Energy'}.
                </p>
              </div>
              <button
                onClick={handleWatchAdRefill}
                disabled={adWatching || isLivesFull}
                className={`w-full py-1.5 rounded-lg text-[11px] font-extrabold uppercase transition-all ${
                  adWatching || isLivesFull
                    ? 'bg-surface-container-high text-text-muted cursor-not-allowed border border-card-border'
                    : 'bg-lightning-gold/20 hover:bg-lightning-gold/30 text-lightning-gold border border-lightning-gold/40 active:translate-y-0.5'
                }`}
              >
                {adWatching ? 'Watching...' : 'Watch Clip'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Study Boosters & Power-ups (Cheaper Prices!) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lightning-gold text-2xl">bolt</span>
            <h3 className="text-xl font-bold text-on-surface">Study Boosters</h3>
          </div>
          <span className="text-xs text-lightning-gold font-bold uppercase tracking-wider">
            Discounted Student Prices
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak Freeze (50 Gems - was 150/200) */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md hover:border-secondary/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-secondary text-2xl">ac_unit</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-on-surface">Streak Freeze</h4>
                  <span className="font-mono text-[10px] text-text-muted">
                    {streakFreezes}/2 Equipped
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Preserves study streak if you miss a revision day during term tests.
                </p>
              </div>
            </div>
            <button
              onClick={handleBuyFreeze}
              disabled={streakFreezes >= 2}
              className={`w-full py-2.5 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all ${
                streakFreezes >= 2
                  ? 'bg-surface-container text-text-muted cursor-not-allowed border border-card-border'
                  : 'bg-surface-container hover:bg-surface-variant text-secondary border border-secondary/40'
              }`}
            >
              {streakFreezes >= 2 ? 'Equipped Max (2/2)' : 'Equip Freeze (50 💎)'}
            </button>
          </div>

          {/* 2x XP Turbo (20 Gems - was 100) */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md hover:border-lightning-gold/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-lightning-gold text-2xl">double_arrow</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-on-surface">2x XP Turbo (15m)</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Double every point earned during rapid past paper review to climb leagues!
                </p>
              </div>
            </div>
            <button
              onClick={handleBuyTurbo}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-variant text-lightning-gold border border-lightning-gold/40 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all active:translate-y-0.5"
            >
              Activate Turbo (20 💎)
            </button>
          </div>

          {/* Legendary Challenge Pass (25 Gems - was 100) */}
          <div className="p-5 rounded-2xl bg-card-dark border border-card-border flex flex-col justify-between gap-4 shadow-md hover:border-primary/50 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-2xl">military_tech</span>
              </div>
              <div className="flex flex-col">
                <h4 className="text-sm font-bold text-on-surface">Legendary Challenge</h4>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  Lock in permanent gold distinction status on tricky syllabus unit drills.
                </p>
              </div>
            </div>
            <button
              onClick={handleBuyLegendaryPass}
              className="w-full py-2.5 bg-surface-container hover:bg-surface-variant text-primary border border-primary/40 rounded-xl text-xs uppercase font-extrabold tracking-wider transition-all active:translate-y-0.5"
            >
              Unlock Test (25 💎)
            </button>
          </div>
        </div>
      </div>

      {/* 4. The Gem Buying System (Real-Money Microtransactions at Cheaper Student Pricing!) */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-2xl">payments</span>
            <div>
              <h3 className="text-xl font-bold text-on-surface">💳 Gem Vault (Real-Money Bundles)</h3>
              <span className="text-xs text-text-muted">
                Cheaper student discount packs for emergency freezes & refills
              </span>
            </div>
          </div>

          <div className="text-xs text-secondary font-bold bg-secondary/10 border border-secondary/20 px-3 py-1 rounded-full self-start sm:self-auto">
            Save up to 75% vs Duolingo ($3.99 - $9.99)
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GEM_PACK_TIERS.map((pack) => {
            const priceLabel = currency === 'LKR' ? `Rs. ${pack.costLkr}` : `$${pack.costUsd.toFixed(2)}`;

            return (
              <div
                key={pack.id}
                className={`relative p-5 rounded-2xl border-2 flex flex-col justify-between gap-4 transition-all ${
                  pack.popular
                    ? 'bg-[#152733] border-secondary shadow-lg ring-1 ring-secondary/50'
                    : 'bg-card-dark border-card-border/80 hover:border-secondary/40'
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-extrabold text-[10px] uppercase tracking-wider shadow">
                    {pack.badge}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <div className="w-12 h-12 rounded-xl bg-surface-container-high border border-card-border/60 flex items-center justify-center text-2xl shadow-inner">
                    {pack.icon}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-base text-on-surface">{pack.name}</h4>
                    <span className="font-mono font-black text-secondary text-sm">
                      +{pack.gemQuantity.toLocaleString()} Gems 💎
                    </span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{pack.bestFor}</p>
                  <span className="text-[10px] text-lightning-gold font-bold bg-lightning-gold/10 px-2 py-0.5 rounded border border-lightning-gold/20 self-start">
                    {pack.duoComparison}
                  </span>
                </div>

                <div className="pt-3 border-t border-card-border/50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-lg font-black text-on-surface font-mono">{priceLabel}</span>
                    <span className="text-[9px] text-text-muted uppercase font-bold">One-time bundle</span>
                  </div>

                  <button
                    onClick={() => handleBuyGemPack(pack)}
                    disabled={purchasingPack === pack.id}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-on-secondary rounded-xl text-xs uppercase font-extrabold tracking-wider shadow-md transition-all active:translate-y-0.5"
                  >
                    {purchasingPack === pack.id ? 'Adding...' : 'Top-Up'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Progressive Streak Milestones Summary */}
      <div className="p-6 rounded-3xl bg-surface-container border border-card-border flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <h3 className="text-base font-bold text-on-surface">Streak Milestone Gem Rewards</h3>
              <span className="text-xs text-text-muted">
                Duolingo 25-Day Cycle Rewards (25d = 25 💎, 50d = 250 💎, 75d = 375 💎)
              </span>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-lightning-gold bg-lightning-gold/10 px-2.5 py-1 rounded-lg border border-lightning-gold/20">
            Current: {userStats.streakDays} Days
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {STREAK_MILESTONES.slice(0, 4).map((m) => {
            const isReached = (userStats.streakDays || 0) >= m.days;
            return (
              <div
                key={m.days}
                className={`p-3 rounded-xl border flex flex-col gap-1 ${
                  isReached
                    ? 'bg-amber-500/10 border-amber-500/40 text-lightning-gold'
                    : 'bg-card-dark border-card-border/60 text-text-muted'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-extrabold">
                  <span>{m.days} Days</span>
                  <span>{isReached ? 'Unlocked ✓' : 'Upcoming'}</span>
                </div>
                <span className="font-mono font-bold text-xs text-secondary">
                  +{m.gemsReward} 💎 Gems
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
