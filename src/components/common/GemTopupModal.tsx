import React, { useState } from 'react';
import { UserStats } from '../../types';
import { GEM_PACK_TIERS, GemPackTier } from '../../lib/gemEconomy';
import { sounds } from '../../lib/sound';
import confetti from 'canvas-confetti';

interface GemTopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
  onUpdateStats: (partial: Partial<UserStats>) => void;
  onOpenShop?: () => void;
}

export const GemTopupModal: React.FC<GemTopupModalProps> = ({
  isOpen,
  onClose,
  userStats,
  onUpdateStats,
  onOpenShop,
}) => {
  const [currency, setCurrency] = useState<'USD' | 'LKR'>('LKR');
  const [purchasingPack, setPurchasingPack] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSimulatePurchase = (pack: GemPackTier) => {
    setPurchasingPack(pack.id);
    sounds.playClick();

    setTimeout(() => {
      setPurchasingPack(null);
      sounds.playFanfare();
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
      });

      onUpdateStats({
        gems: (userStats.gems || 0) + pack.gemQuantity,
      });

      alert(`Success! +${pack.gemQuantity.toLocaleString()} Gems added to your account! 💎`);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#182228] border-2 border-card-border/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-card-border/60 bg-surface-container-high">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/20 border border-secondary/40 flex items-center justify-center text-secondary text-2xl shadow-md">
              💎
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-on-surface">Gem Vault Top-Up</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary font-bold text-[10px] uppercase">
                  Student Pricing
                </span>
              </div>
              <span className="text-xs text-text-muted">
                Current Balance: <span className="text-secondary font-bold font-mono">{userStats.gems} 💎</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Currency toggle */}
            <div className="flex p-0.5 rounded-lg bg-surface-container border border-card-border">
              <button
                type="button"
                onClick={() => setCurrency('LKR')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  currency === 'LKR' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-text-muted'
                }`}
              >
                LKR (Rs)
              </button>
              <button
                type="button"
                onClick={() => setCurrency('USD')}
                className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                  currency === 'USD' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-text-muted'
                }`}
              >
                USD ($)
              </button>
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
        </div>

        {/* Comparison Notice */}
        <div className="p-3.5 bg-gradient-to-r from-secondary/15 via-primary/10 to-transparent border-b border-card-border/40 text-xs text-text-muted flex items-center gap-2.5">
          <span className="material-symbols-outlined text-secondary text-lg shrink-0">savings</span>
          <p className="text-[11px] leading-relaxed">
            <span className="text-secondary font-bold">Cheaper Student Rates:</span> Termy bundles are priced up to 75% lower than Duolingo microtransactions ($3.99–$9.99), designed specifically for Sri Lankan A/L candidates.
          </p>
        </div>

        {/* Gem Packs List */}
        <div className="p-5 overflow-y-auto space-y-3.5 select-none">
          {GEM_PACK_TIERS.map((pack) => {
            const priceLabel = currency === 'LKR' ? `Rs. ${pack.costLkr}` : `$${pack.costUsd.toFixed(2)}`;

            return (
              <div
                key={pack.id}
                className={`relative p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  pack.popular
                    ? 'bg-[#152733] border-secondary shadow-lg ring-1 ring-secondary/40'
                    : 'bg-card-dark border-card-border/80 hover:border-secondary/40'
                }`}
              >
                {pack.badge && (
                  <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full bg-secondary text-on-secondary font-extrabold text-[10px] uppercase tracking-wider shadow">
                    {pack.badge}
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-surface-container-high border border-card-border/60 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    {pack.icon}
                  </div>

                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-sm sm:text-base text-on-surface">
                        {pack.name}
                      </h3>
                      <span className="font-mono font-black text-secondary text-xs sm:text-sm">
                        +{pack.gemQuantity.toLocaleString()} 💎
                      </span>
                    </div>

                    <p className="text-[11px] text-text-muted mt-1 leading-snug">
                      {pack.bestFor}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-lightning-gold font-bold bg-lightning-gold/10 px-2 py-0.5 rounded-md border border-lightning-gold/20">
                        {pack.duoComparison}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-card-border/40">
                  <div className="flex flex-col sm:text-right">
                    <span className="text-base sm:text-lg font-black text-on-surface font-mono">
                      {priceLabel}
                    </span>
                    <span className="text-[10px] text-text-muted">One-time refill</span>
                  </div>

                  <button
                    onClick={() => handleSimulatePurchase(pack)}
                    disabled={purchasingPack === pack.id}
                    className="px-4 py-2 bg-secondary hover:bg-secondary-hover text-on-secondary rounded-xl text-xs uppercase font-extrabold tracking-wider shadow-md transition-all active:translate-y-0.5 shrink-0"
                  >
                    {purchasingPack === pack.id ? 'Processing...' : 'Get Pack'}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Super Termy Pro Alternative Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#182a4d] to-[#1a3826] border border-primary/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
            <div>
              <div className="flex items-center gap-1.5 text-lightning-gold font-bold text-xs">
                <span className="material-symbols-outlined text-base">workspace_premium</span>
                <span>Prefer Unlimited Lives & No Microtransactions?</span>
              </div>
              <p className="text-[11px] text-text-muted mt-1 max-w-sm">
                Upgrade to Super Termy Pro for full unlimited exam lives, marking schemes, and priority recall.
              </p>
            </div>

            {onOpenShop && (
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  onOpenShop();
                }}
                className="px-4 py-2 bg-primary text-on-primary-fixed rounded-xl font-extrabold uppercase text-[11px] tracking-wider shrink-0 shadow-sm"
              >
                Super Termy Pro →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
