import React, { useState } from 'react';
import { UserStats } from '../../types';
import { sounds } from '../../lib/sound';

interface ShopViewProps {
  userStats: UserStats;
  onUpdateStats: (newStats: Partial<UserStats>) => void;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const ShopView: React.FC<ShopViewProps> = ({
  userStats,
  onUpdateStats,
  onOpenAuth,
}) => {
  const [copiedUsername, setCopiedUsername] = useState(false);

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
    <div className="flex flex-col w-full max-w-3xl mx-auto gap-8 pb-24 md:pb-12">
      {/* Super Termy Pro Hero Card */}
      {userStats.isPro ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#182a4d] via-[#1b3438] to-[#1a3826] p-6 sm:p-8 border-2 border-primary/50 shadow-xl">
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
                  <span className="text-xs text-lightning-gold font-bold">★ UNLIMITED ACCESS</span>
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
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#121c2c] via-[#1a233a] to-[#251b38] p-6 sm:p-8 border-2 border-primary/40 shadow-2xl flex flex-col gap-6">
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
                  Unlimited hearts, verified marking scheme derivations, and priority active recall drills for all 2,636 official syllabus questions.
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

            {isGuest && (
              <div className="text-[11px] text-lightning-gold flex items-center gap-1.5 px-1">
                <span className="material-symbols-outlined text-sm shrink-0">info</span>
                <span>
                  You are currently in Guest mode. Please create an account or sign in before upgrading so your Pro subscription is linked permanently to your profile.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

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
