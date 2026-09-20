import React, { useState, useEffect } from 'react';
import { UserStats, DailyQuest } from '../../types';
import {
  getThreeTierDailyQuests,
  loadQuestsState,
  claimDailyQuest,
  claimFriendsQuest,
  claimWeekendQuest,
  sendFriendNudge,
  sendFriendBoost,
  getMonthlyChallenge,
  getTimeUntilMidnight,
  isWeekendSprintActive,
  getRemainingBoostTime,
} from '../../lib/questsSystem';
import { sounds } from '../../lib/sound';
import { QuestPartnerChooserModal } from '../social/QuestPartnerChooserModal';
import { FriendUser } from '../../types';

interface QuestsViewProps {
  userStats: UserStats;
  onUpdateStats?: (partial: Partial<UserStats>) => void;
  onStartDrill?: () => void;
}

type QuestTab = 'daily' | 'friends' | 'weekend' | 'monthly';

export const QuestsView: React.FC<QuestsViewProps> = ({
  userStats,
  onUpdateStats,
  onStartDrill,
}) => {
  const [activeTab, setActiveTab] = useState<QuestTab>('daily');
  const [countdown, setCountdown] = useState<{ hours: number; minutes: number; formatted: string }>(
    getTimeUntilMidnight()
  );
  const [boostStatus, setBoostStatus] = useState(getRemainingBoostTime(userStats.boostActiveUntil));
  const [unboxingQuest, setUnboxingQuest] = useState<DailyQuest | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [isGifting, setIsGifting] = useState(false);
  const [isChooserOpen, setIsChooserOpen] = useState(false);
  const [questsState, setQuestsState] = useState(loadQuestsState());

  // Refresh countdown timer every 30 seconds and boost status every second
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setCountdown(getTimeUntilMidnight());
    }, 30000);

    const boostInterval = setInterval(() => {
      setBoostStatus(getRemainingBoostTime(userStats.boostActiveUntil));
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(boostInterval);
    };
  }, [userStats.boostActiveUntil]);

  const handlePartnerSelected = (partner: FriendUser) => {
    setQuestsState(loadQuestsState());
    showToast(`🤝 Paired with ${partner.name} for this week's Friends Quest!`);
  };

  const dailyQuests = getThreeTierDailyQuests(userStats);
  const friendsQuest = questsState.friendsQuest;
  const weekendQuest = questsState.weekendQuest;
  const monthlyChallenge = getMonthlyChallenge(userStats.questPoints || 0);
  const isWeekend = isWeekendSprintActive();

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => {
      setFeedbackToast((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Handler: Claim Daily Quest Chest
  const handleClaimDailyChest = (questId: string) => {
    sounds.playFanfare();
    const result = claimDailyQuest(questId, userStats);
    if (result) {
      setUnboxingQuest(result.quest);
      if (onUpdateStats) {
        onUpdateStats(result.updatedStats);
      }
    }
  };

  // Handler: Claim Friends Quest
  const handleClaimFriendsQuest = () => {
    sounds.playFanfare();
    const result = claimFriendsQuest(userStats);
    if (result) {
      showToast('🎉 Friends Quest Claimed! +100 Gems, 30m 2x XP Boost, +5 Quest Points!');
      if (onUpdateStats) {
        onUpdateStats(result.updatedStats);
      }
    }
  };

  // Handler: Claim Weekend Quest
  const handleClaimWeekendQuest = () => {
    sounds.playFanfare();
    const result = claimWeekendQuest(userStats);
    if (result) {
      showToast('🏛️ Turing Monolith Completed! +100 Gems, 30m 2x XP Boost, +3 Quest Points!');
      if (onUpdateStats) {
        onUpdateStats(result.updatedStats);
      }
    }
  };

  // Handler: Send Motivational Nudge
  const handleSendNudge = () => {
    setIsNudging(true);
    sounds.playClick();
    const result = sendFriendNudge();
    setTimeout(() => {
      setIsNudging(false);
      sounds.playCorrect();
      showToast(`💬 ${result.message}`);
    }, 400);
  };

  // Handler: Gift Boost (-20 Gems)
  const handleSendBoost = () => {
    if (userStats.gems < 20) {
      sounds.playIncorrect();
      showToast('⚠️ Not enough Gems! You need 20 💎 to gift a 15-minute XP Boost.');
      return;
    }
    setIsGifting(true);
    sounds.playClick();
    const result = sendFriendBoost(userStats);
    setTimeout(() => {
      setIsGifting(false);
      if (result.success) {
        sounds.playFanfare();
        if (onUpdateStats) {
          onUpdateStats(result.updatedStats);
        }
        showToast(result.message);
      } else {
        sounds.playIncorrect();
        showToast(result.message);
      }
    }, 500);
  };

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto gap-6 pb-24 md:pb-16 text-on-surface">
      {/* Toast Feedback Notification */}
      {feedbackToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-surface-container-highest/95 border-2 border-primary text-on-surface text-xs sm:text-sm font-extrabold shadow-2xl backdrop-blur-md flex items-center gap-3 animate-bounce">
          <span className="material-symbols-outlined text-primary text-xl">verified</span>
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Hero Banner with Dynamic 2x XP Boost Strip */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2e1065] via-[#1e1b4b] to-[#0f172a] p-6 sm:p-8 border border-card-border/80 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col gap-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lightning-gold/20 text-lightning-gold text-xs font-black uppercase tracking-wider border border-lightning-gold/30">
                <span className="material-symbols-outlined text-sm">stars</span>
                <span>Duolingo-Style Quests</span>
              </span>
              {boostStatus.isActive ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/40 animate-pulse">
                  <span className="material-symbols-outlined text-sm">bolt</span>
                  <span>⚡ 2x XP Turbo: {boostStatus.formatted} left</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-text-muted text-xs font-bold border border-card-border">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  <span>Reset: {countdown.formatted}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              A/L ICT Quests & Challenges
            </h1>
            <p className="text-xs sm:text-sm text-secondary-fixed/90 leading-relaxed">
              Conquer 3 daily quest tiers, team up in weekly Friends Quests, build the Weekend Turing Monolith, and earn Quest Points for monthly pioneer distinction badges!
            </p>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="flex items-center gap-3 shrink-0 bg-surface-container/60 backdrop-blur-md p-3.5 rounded-2xl border border-card-border/80 shadow-inner">
            <div className="flex flex-col items-center px-3 border-r border-card-border/60">
              <span className="text-xs text-text-muted uppercase font-bold">Quest Pts</span>
              <span className="text-xl sm:text-2xl font-black text-secondary font-mono">
                {userStats.questPoints || 0}
              </span>
            </div>
            <div className="flex flex-col items-center px-3 border-r border-card-border/60">
              <span className="text-xs text-text-muted uppercase font-bold">Gems</span>
              <span className="text-xl sm:text-2xl font-black text-lightning-gold font-mono">
                {userStats.gems}
              </span>
            </div>
            <div className="flex flex-col items-center px-3">
              <span className="text-xs text-text-muted uppercase font-bold">Streak</span>
              <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono flex items-center gap-0.5">
                <span>{userStats.streakDays}</span>
                <span className="material-symbols-outlined text-base">local_fire_department</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 p-1.5 bg-surface-container rounded-2xl border border-card-border overflow-x-auto select-none">
        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('daily');
          }}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === 'daily'
              ? 'bg-primary text-on-primary-fixed shadow-md scale-[1.02]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">fact_check</span>
          <span>Daily Quests (3)</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('friends');
          }}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === 'friends'
              ? 'bg-primary text-on-primary-fixed shadow-md scale-[1.02]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">group</span>
          <span>Friends Quest</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('weekend');
          }}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === 'weekend'
              ? 'bg-primary text-on-primary-fixed shadow-md scale-[1.02]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">account_balance</span>
          <span>Weekend Sprint</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setActiveTab('monthly');
          }}
          className={`flex-1 min-w-[130px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
            activeTab === 'monthly'
              ? 'bg-primary text-on-primary-fixed shadow-md scale-[1.02]'
              : 'text-text-muted hover:text-on-surface hover:bg-surface-variant/50'
          }`}
        >
          <span className="material-symbols-outlined text-lg">military_tech</span>
          <span>Monthly Trophy</span>
        </button>
      </div>

      {/* TAB 1: DAILY QUESTS (3 Tiers: Bronze, Silver, Gold Chests) */}
      {activeTab === 'daily' && (
        <section className="flex flex-col gap-5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-lightning-gold/10 border border-lightning-gold/30 flex items-center justify-center text-lightning-gold">
                <span className="material-symbols-outlined text-xl">inventory_2</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-on-surface">
                  Daily 3-Tier Quests
                </h2>
                <p className="text-xs text-text-muted">
                  Scaled dynamically by your study habits. Resets at midnight ({countdown.formatted}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-lightning-gold px-3 py-1.5 rounded-xl bg-surface-container border border-card-border">
              <span className="material-symbols-outlined text-sm">schedule</span>
              <span>{countdown.formatted}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {dailyQuests.map((quest) => {
              const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));

              // Tier styling
              const isSilver = quest.tier === 'silver';
              const isGold = quest.tier === 'gold';

              const tierBorder = isGold
                ? 'border-amber-400/50 bg-gradient-to-r from-[#291e0a]/90 to-[#1e1b24]'
                : isSilver
                ? 'border-sky-400/40 bg-gradient-to-r from-[#0c1f2e]/90 to-[#131f24]'
                : 'border-orange-500/40 bg-gradient-to-r from-[#26150b]/90 to-[#181d20]';

              const chestBadge = isGold
                ? { label: 'Mega Chest', icon: '🏆', color: 'text-amber-400 bg-amber-400/10 border-amber-400/30' }
                : isSilver
                ? { label: 'Rare Chest', icon: '🎁', color: 'text-sky-300 bg-sky-400/10 border-sky-400/30' }
                : { label: 'Common Chest', icon: '📦', color: 'text-orange-300 bg-orange-500/10 border-orange-500/30' };

              return (
                <div
                  key={quest.id}
                  className={`relative p-5 sm:p-6 rounded-3xl border-2 ${tierBorder} shadow-lg transition-all flex flex-col md:flex-row md:items-center justify-between gap-5`}
                >
                  <div className="flex items-start sm:items-center gap-4 min-w-0">
                    {/* Chest Graphic Avatar */}
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-surface-container-high border-2 border-card-border flex items-center justify-center text-3xl sm:text-4xl shrink-0 shadow-inner">
                      <span>{chestBadge.icon}</span>
                      {quest.hasBoostReward && (
                        <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black uppercase tracking-wider flex items-center gap-0.5 shadow-md">
                          <span className="material-symbols-outlined text-[11px]">bolt</span>
                          <span>2x</span>
                        </div>
                      )}
                    </div>

                    {/* Quest Text & Progress Bar */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-extrabold text-base sm:text-lg text-on-surface">
                          {quest.title}
                        </h3>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${chestBadge.color}`}>
                          {chestBadge.label}
                        </span>
                        {quest.hasBoostReward && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-400/40">
                            +15m 2x XP Turbo
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-text-muted mb-3 leading-relaxed">
                        {quest.description}
                      </p>

                      {/* Progress bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-3 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-card-border/40">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              quest.completed ? 'bg-primary' : isGold ? 'bg-amber-400' : 'bg-secondary'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono font-extrabold text-on-surface shrink-0">
                          {quest.current} / {quest.target}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rewards & Action CTA */}
                  <div className="flex flex-wrap md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-card-border/40 shrink-0">
                    <div className="flex items-center gap-2.5 text-xs font-mono font-extrabold">
                      <span className="text-primary-fixed-dim">+{quest.xpReward} XP</span>
                      <span className="text-lightning-gold">+{quest.gemReward} 💎</span>
                      <span className="text-purple-300">+{quest.questPointsReward} QP</span>
                    </div>

                    {quest.claimed ? (
                      <div className="px-4 py-2 rounded-xl bg-surface-container text-text-muted text-xs font-extrabold uppercase tracking-wider border border-card-border flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                        <span>Chest Claimed</span>
                      </div>
                    ) : quest.completed ? (
                      <button
                        onClick={() => handleClaimDailyChest(quest.id)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-on-primary-fixed font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 animate-bounce"
                      >
                        <span className="material-symbols-outlined text-sm">lock_open</span>
                        <span>Claim Chest!</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => (onStartDrill ? onStartDrill() : null)}
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider border border-card-border flex items-center gap-1.5 transition-all"
                      >
                        <span className="material-symbols-outlined text-sm">play_arrow</span>
                        <span>Practice Drill</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* TAB 2: FRIENDS QUEST (Weekly Cooperative Team Challenge) */}
      {activeTab === 'friends' && (
        userStats.friendsQuestsEnabled === false ? (
          <div className="p-8 rounded-3xl bg-card-dark border-2 border-card-border text-center flex flex-col items-center gap-4 max-w-md mx-auto my-6 shadow-xl animate-fadeIn">
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 flex items-center justify-center text-3xl">
              <span className="material-symbols-outlined text-3xl">person_off</span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-xl font-black text-on-surface">Friends Quests Paused</h3>
              <p className="text-xs text-text-muted leading-relaxed">
                You currently have Friends Quests turned off in your Preferences. You can re-enable them anytime to team up with mutual study partners.
              </p>
            </div>
            {onUpdateStats && (
              <button
                onClick={() => onUpdateStats({ friendsQuestsEnabled: true })}
                className="px-6 py-2.5 rounded-xl bg-primary text-on-primary-fixed text-xs font-black uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all"
              >
                Enable Friends Quests
              </button>
            )}
          </div>
        ) : (
          <section className="flex flex-col gap-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <span className="material-symbols-outlined text-xl">handshake</span>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-on-surface">
                    Weekly Friends Quest
                  </h2>
                  <p className="text-xs text-text-muted">
                    Team up with an active study partner to tackle big past paper goals together.
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-xl bg-surface-container text-secondary text-xs font-extrabold border border-card-border">
                {friendsQuest.deadlineText}
              </span>
            </div>

            {/* Main Cooperative Challenge Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e1b4b] via-[#131f24] to-[#0d1619] border-2 border-purple-500/40 shadow-xl flex flex-col gap-6">
              {/* Study Partner Spotlight */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/70 border border-card-border">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                    {friendsQuest.partnerName.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-on-surface">
                        {friendsQuest.partnerName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                        Study Partner
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {friendsQuest.partnerUsername} • {friendsQuest.partnerSchool}
                    </span>
                  </div>
                </div>

                {/* Action Buttons: Choose Partner, Nudge & Gift Boost */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setIsChooserOpen(true);
                    }}
                    className="px-3 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-secondary text-xs font-bold flex items-center gap-1.5 transition-all border border-card-border active:scale-95"
                    title="Choose partner from mutual friends (Sunday 48-hour window)"
                  >
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>Change Partner</span>
                  </button>

                  <button
                    onClick={handleSendNudge}
                    disabled={isNudging}
                    className="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-variant text-on-surface text-xs font-bold flex items-center gap-1.5 transition-all border border-card-border active:scale-95"
                    title="Send free encouragement prompt"
                  >
                    <span className="material-symbols-outlined text-sm text-lightning-gold">waving_hand</span>
                    <span>{isNudging ? 'Sending...' : 'Send Free Nudge'}</span>
                  </button>

                  <button
                    onClick={handleSendBoost}
                    disabled={isGifting}
                    className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                    title="Send a 15-minute 2x XP Boost (costs 20 Gems)"
                  >
                    <span className="material-symbols-outlined text-sm">bolt</span>
                    <span>Gift 15m Boost (-20 💎)</span>
                  </button>
                </div>
              </div>

            {/* Objective & Shared Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h3 className="text-lg font-black text-on-surface">{friendsQuest.objectiveTitle}</h3>
                  <p className="text-xs text-text-muted">{friendsQuest.objectiveDescription}</p>
                </div>
                <div className="text-right font-mono text-sm font-black text-secondary">
                  {friendsQuest.currentTeamTotal} / {friendsQuest.targetTotal} XP
                </div>
              </div>

              {/* Huge Shared Progress Bar */}
              <div className="w-full h-5 rounded-full bg-surface-container-high overflow-hidden p-1 border border-card-border shadow-inner">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 via-primary to-lightning-gold transition-all duration-700 shadow-md"
                  style={{
                    width: `${Math.min(100, (friendsQuest.currentTeamTotal / friendsQuest.targetTotal) * 100)}%`,
                  }}
                />
              </div>

              {/* Contribution Breakdown */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-base">person</span>
                    <span className="text-xs font-bold text-on-surface">Your Effort</span>
                  </div>
                  <span className="font-mono text-xs font-black text-primary">
                    {friendsQuest.userContribution} XP
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface-container/60 border border-card-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-purple-400 text-base">partner_exchange</span>
                    <span className="text-xs font-bold text-on-surface">{friendsQuest.partnerName.split(' ')[0]}'s Effort</span>
                  </div>
                  <span className="font-mono text-xs font-black text-purple-400">
                    {friendsQuest.partnerContribution} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Rewards & Claim Box */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/80 border border-purple-500/30">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-extrabold text-purple-300">Quest Rewards</span>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-mono font-black mt-0.5">
                  <span className="text-lightning-gold">+100 Gems 💎</span>
                  <span className="text-amber-400">+30m 2x XP Boost ⚡</span>
                  <span className="text-secondary">+5 Quest Points 🌟</span>
                </div>
              </div>

              {friendsQuest.claimed ? (
                <div className="px-4 py-2 rounded-xl bg-surface-container text-text-muted text-xs font-extrabold uppercase tracking-wider border border-card-border flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                  <span>Quest Rewards Claimed</span>
                </div>
              ) : friendsQuest.currentTeamTotal >= friendsQuest.targetTotal ? (
                <button
                  onClick={handleClaimFriendsQuest}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-on-primary-fixed font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 animate-bounce"
                >
                  <span className="material-symbols-outlined text-sm">celebration</span>
                  <span>Claim Rewards!</span>
                </button>
              ) : (
                <button
                  onClick={() => (onStartDrill ? onStartDrill() : null)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">play_arrow</span>
                  <span>Drill for Team XP</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )
    )}

      {/* TAB 3: WEEKEND QUEST (5-Milestone Statue Construction) */}
      {activeTab === 'weekend' && (
        <section className="flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <span className="material-symbols-outlined text-xl">token</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-on-surface">
                  Weekend Sprint: Monument Construction
                </h2>
                <p className="text-xs text-text-muted">
                  Runs Friday through Sunday. Carve 5 milestone blocks of the Alan Turing Monolith!
                </p>
              </div>
            </div>

            <div className={`px-3 py-1 rounded-xl text-xs font-extrabold border ${
              isWeekend
                ? 'bg-primary/20 text-primary border-primary/30 animate-pulse'
                : 'bg-surface-container text-text-muted border-card-border'
            }`}>
              {isWeekend ? '🟢 Sprint Active Now' : '⏳ Starts Friday'}
            </div>
          </div>

          {/* Statue Construction Board */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1e1e24] via-[#152126] to-[#0f172a] border-2 border-amber-400/40 shadow-xl flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-col gap-2 max-w-lg">
                <span className="text-xs font-black uppercase text-amber-400 tracking-wider">
                  Ancient ICT Computing Artifact
                </span>
                <h3 className="text-2xl font-black text-white">{weekendQuest.statueName}</h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  {weekendQuest.description} Each completed drill carves out a new tier of the monument, unlocking massive double XP boosts and distinction gems!
                </p>
              </div>

              {/* 5-Block Monument Graphic */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-surface-container/60 border border-card-border shrink-0">
                <div className="flex flex-col-reverse items-center gap-1.5 w-44">
                  {[1, 2, 3, 4, 5].map((level) => {
                    const isCarved = weekendQuest.currentMilestone >= level;
                    const labels = [
                      'Base: De Morgan Logic',
                      'Tier 2: Von Neumann Bus',
                      'Tier 3: Turing Enigma Core',
                      'Tier 4: Shannon Entropy Gate',
                      'Apex: Distinction Crown',
                    ];

                    return (
                      <div
                        key={level}
                        className={`w-full py-1.5 px-3 rounded-lg text-center font-bold text-[10px] uppercase tracking-wider transition-all duration-500 border ${
                          isCarved
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black border-amber-300 shadow-md scale-[1.02]'
                            : 'bg-surface-container-high/60 text-text-muted border-card-border/50'
                        }`}
                      >
                        <span>{isCarved ? `✓ ${labels[level - 1]}` : `Block ${level}: Locked`}</span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs font-mono font-black text-amber-400 mt-2">
                  {weekendQuest.currentMilestone} / {weekendQuest.totalMilestones} Milestones Carved
                </span>
              </div>
            </div>

            {/* Action & Reward Capsule */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container/80 border border-card-border">
              <div className="flex flex-col">
                <span className="text-xs uppercase font-extrabold text-amber-300">Monolith Completion Loot</span>
                <div className="flex items-center gap-3 text-xs sm:text-sm font-mono font-black mt-0.5">
                  <span className="text-lightning-gold">+100 Gems 💎</span>
                  <span className="text-amber-400">+30m 2x XP Turbo ⚡</span>
                  <span className="text-secondary">+3 Quest Points 🌟</span>
                </div>
              </div>

              {weekendQuest.claimed ? (
                <div className="px-4 py-2 rounded-xl bg-surface-container text-text-muted text-xs font-extrabold uppercase tracking-wider border border-card-border flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                  <span>Statue Loot Claimed</span>
                </div>
              ) : weekendQuest.currentMilestone >= weekendQuest.totalMilestones ? (
                <button
                  onClick={handleClaimWeekendQuest}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-xs uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 animate-bounce"
                >
                  <span className="material-symbols-outlined text-sm">trophy</span>
                  <span>Claim Turing Loot!</span>
                </button>
              ) : (
                <button
                  onClick={() => (onStartDrill ? onStartDrill() : null)}
                  className="px-5 py-2.5 rounded-xl bg-primary text-on-primary-fixed font-black text-xs uppercase tracking-wider shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">hardware</span>
                  <span>Carve Next Milestone</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* TAB 4: MONTHLY CHALLENGE (Historical Pioneer Badges) */}
      {activeTab === 'monthly' && (
        <section className="flex flex-col gap-6 animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-secondary/10 border border-secondary/30 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-xl">workspace_premium</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-on-surface">
                  Monthly Challenge & Pioneer Badge
                </h2>
                <p className="text-xs text-text-muted">
                  Earn Quest Points through daily and weekly quests to unlock historical computing icons permanently.
                </p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-surface-container text-secondary text-xs font-extrabold border border-card-border">
              {monthlyChallenge.monthName}
            </span>
          </div>

          {/* Monthly Badge Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#1a2e3b] via-[#15232d] to-[#0f172a] border-2 border-secondary/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Mascot Avatar Graphic */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-secondary/30 via-primary/20 to-lightning-gold/20 border-2 border-secondary flex flex-col items-center justify-center shrink-0 shadow-2xl">
              <span className="material-symbols-outlined text-6xl text-secondary animate-pulse">
                {monthlyChallenge.badgeIcon}
              </span>
              <span className="text-[10px] font-black uppercase text-secondary mt-1">
                {monthlyChallenge.badgeMascot}
              </span>
              {monthlyChallenge.completed && (
                <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-black flex items-center justify-center font-bold text-sm shadow-md">
                  ✓
                </div>
              )}
            </div>

            {/* Badge Info & Progress */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {monthlyChallenge.badgeTitle}
                </h3>
                {monthlyChallenge.completed && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase">
                    Unlocked!
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-text-muted mb-4 leading-relaxed">
                {monthlyChallenge.description}
              </p>

              {/* Quest Points Progress */}
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center text-xs font-mono font-black">
                  <span className="text-secondary">Progress: {monthlyChallenge.currentPoints} / {monthlyChallenge.targetPoints} Quest Points</span>
                  <span className="text-text-muted">
                    {Math.min(100, Math.round((monthlyChallenge.currentPoints / monthlyChallenge.targetPoints) * 100))}%
                  </span>
                </div>
                <div className="w-full h-4 rounded-full bg-surface-container-high overflow-hidden p-0.5 border border-card-border shadow-inner">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-lightning-gold transition-all duration-700"
                    style={{
                      width: `${Math.min(100, (monthlyChallenge.currentPoints / monthlyChallenge.targetPoints) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              {/* Point Earning Guide */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px] font-bold text-text-muted">
                <span className="px-2 py-1 rounded-lg bg-surface-container border border-card-border">
                  Daily Quest: <strong className="text-white">+1 QP</strong>
                </span>
                <span className="px-2 py-1 rounded-lg bg-surface-container border border-card-border">
                  Weekend Monolith: <strong className="text-white">+3 QP</strong>
                </span>
                <span className="px-2 py-1 rounded-lg bg-surface-container border border-card-border">
                  Friends Quest: <strong className="text-white">+5 QP</strong>
                </span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Pro-Tips Callout (Cross-Platform, Midnight Reset & Turbo Stacking) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-surface-container/60 border border-card-border shadow-sm flex flex-col gap-3.5">
        <div className="flex items-center gap-2 text-lightning-gold">
          <span className="material-symbols-outlined text-xl">tips_and_updates</span>
          <h4 className="font-extrabold text-sm uppercase tracking-wider">
            Pro-Tips for Maximizing Duolingo Quests
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs text-text-muted">
          <div className="p-3 rounded-2xl bg-surface-container-high/50 border border-card-border/60 flex flex-col gap-1">
            <span className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-primary">sync</span>
              <span>Cross-Platform Sync</span>
            </span>
            <p className="leading-relaxed">
              Drills solved on mobile or laptop instantly synchronize to your central Supabase profile and count toward your active quests.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-high/50 border border-card-border/60 flex flex-col gap-1">
            <span className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-lightning-gold">alarm</span>
              <span>Midnight Clock</span>
            </span>
            <p className="leading-relaxed">
              Daily quests refresh strictly at 00:00 local time. Complete all 3 tiers before midnight to collect all 3 daily Quest Points!
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-surface-container-high/50 border border-card-border/60 flex flex-col gap-1">
            <span className="font-bold text-on-surface flex items-center gap-1.5">
              <span className="material-symbols-outlined text-sm text-amber-400">bolt</span>
              <span>2x Turbo Stacking</span>
            </span>
            <p className="leading-relaxed">
              Mega Chests, Weekend Sprints, and Friends Quests stack 15–30 minute double XP periods to skyrocket up the 10 National Leagues!
            </p>
          </div>
        </div>
      </div>

      {/* CHEST UNBOXING CELEBRATION MODAL */}
      {unboxingQuest && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#241734] to-[#12181c] border-2 border-primary/60 p-6 sm:p-8 text-center shadow-2xl flex flex-col items-center gap-5">
            {/* Chest Icon Burst */}
            <div className="relative w-24 h-24 rounded-3xl bg-primary/20 border-2 border-primary flex items-center justify-center text-6xl shadow-[0_0_40px_rgba(116,233,48,0.4)] animate-bounce">
              {unboxingQuest.chestType === 'mega' ? '🏆' : unboxingQuest.chestType === 'rare' ? '🎁' : '📦'}
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-black uppercase text-lightning-gold tracking-widest">
                Chest Opened!
              </span>
              <h3 className="text-2xl font-black text-white">{unboxingQuest.title}</h3>
              <p className="text-xs text-text-muted">
                You conquered today's challenge and claimed the following rewards:
              </p>
            </div>

            {/* Loot Reveal Pills */}
            <div className="grid grid-cols-2 gap-3 w-full">
              <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
                <span className="text-xs text-text-muted font-bold">Experience</span>
                <span className="text-lg font-black text-primary font-mono">+{unboxingQuest.xpReward} XP</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
                <span className="text-xs text-text-muted font-bold">Bits & Gems</span>
                <span className="text-lg font-black text-lightning-gold font-mono">+{unboxingQuest.gemReward} 💎</span>
              </div>
              <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
                <span className="text-xs text-text-muted font-bold">Monthly Badge</span>
                <span className="text-lg font-black text-secondary font-mono">+{unboxingQuest.questPointsReward} QP</span>
              </div>
              {unboxingQuest.hasBoostReward ? (
                <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex flex-col items-center">
                  <span className="text-xs text-amber-300 font-bold">2x Turbo Boost</span>
                  <span className="text-lg font-black text-amber-400 font-mono">15 Mins ⚡</span>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-surface-container border border-card-border flex flex-col items-center">
                  <span className="text-xs text-text-muted font-bold">Streak Kept</span>
                  <span className="text-lg font-black text-orange-400 font-mono">{userStats.streakDays} Days 🔥</span>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                sounds.playClick();
                setUnboxingQuest(null);
              }}
              className="w-full py-3 rounded-2xl bg-primary text-on-primary-fixed font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all mt-2"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

      {/* Quest Partner Chooser Modal */}
      {isChooserOpen && (
        <QuestPartnerChooserModal
          currentUser={userStats}
          onClose={() => setIsChooserOpen(false)}
          onPartnerSelected={handlePartnerSelected}
        />
      )}
    </div>
  );
};
