import React, { useState, useEffect } from 'react';
import { FriendUser, UserStats } from '../../types';
import { getEligibleQuestPartners } from '../../lib/friendsSystem';
import { loadQuestsState, saveQuestsState } from '../../lib/questsSystem';
import { sounds } from '../../lib/sound';

interface QuestPartnerChooserModalProps {
  currentUser: UserStats;
  onClose: () => void;
  onPartnerSelected: (partner: FriendUser) => void;
}

export const QuestPartnerChooserModal: React.FC<QuestPartnerChooserModalProps> = ({
  currentUser,
  onClose,
  onPartnerSelected,
}) => {
  const [eligiblePartners, setEligiblePartners] = useState<FriendUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEligibleQuestPartners(currentUser.id).then((res) => {
      setEligiblePartners(res);
      setLoading(false);
    });
  }, [currentUser.id]);

  const handleChoose = (partner: FriendUser) => {
    sounds.playFanfare();
    const state = loadQuestsState();
    state.friendsQuest.partnerName = partner.name;
    state.friendsQuest.partnerUsername = partner.username;
    state.friendsQuest.partnerSchool = partner.school;
    state.friendsQuest.partnerAvatarUrl = partner.avatarUrl;
    saveQuestsState(state);

    onPartnerSelected(partner);
    onClose();
  };

  const handleAutoPair = () => {
    if (eligiblePartners.length > 0) {
      const randomPartner = eligiblePartners[Math.floor(Math.random() * eligiblePartners.length)];
      handleChoose(randomPartner);
    } else {
      sounds.playClick();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-3xl bg-[#131f24] border-2 border-card-border p-6 shadow-2xl flex flex-col gap-5 max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl">handshake</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-on-surface">Choose Quest Partner</h2>
              <p className="text-xs text-text-muted">
                Sunday 48-hour cooperative partner selection
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-variant flex items-center justify-center text-text-muted hover:text-on-surface transition-all"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Select any mutual friend who has completed at least one lesson this week. Both of your drill points combine toward the bulk goal!
        </p>

        {/* Partners List */}
        <div className="flex flex-col gap-2.5 overflow-y-auto flex-1 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-text-muted flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-base text-primary">sync</span>
              <span>Finding eligible mutual friends...</span>
            </div>
          ) : eligiblePartners.length === 0 ? (
            <div className="py-8 text-center text-xs text-text-muted flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-3xl text-purple-400">group_off</span>
              <span>No mutual friends active yet. Follow classmates to unlock team quests!</span>
            </div>
          ) : (
            eligiblePartners.map((partner) => (
              <div
                key={partner.id}
                className="p-3.5 rounded-2xl bg-surface-container border border-card-border flex items-center justify-between gap-3 hover:border-purple-500/40 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {partner.avatarUrl ? (
                    <img
                      src={partner.avatarUrl}
                      alt={partner.name}
                      className="w-11 h-11 rounded-2xl object-cover border-2 border-purple-500/40 shadow-sm"
                    />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl bg-purple-900/60 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-sm">
                      {partner.name.charAt(0)}
                    </div>
                  )}

                  <div className="flex flex-col min-w-0">
                    <span className="font-extrabold text-sm text-on-surface truncate">
                      {partner.name}
                    </span>
                    <span className="text-xs text-text-muted truncate font-mono">
                      {partner.school}
                    </span>
                    <span className="text-[11px] font-bold text-purple-300 font-mono mt-0.5">
                      {partner.weeklyXp} Weekly XP
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleChoose(partner)}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all shrink-0"
                >
                  Pair Up
                </button>
              </div>
            ))
          )}
        </div>

        {/* Auto Pair Option */}
        <button
          onClick={handleAutoPair}
          className="w-full py-3 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-card-border text-on-surface font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base text-lightning-gold">shuffle</span>
          <span>Let Termy Auto-Pair an Active Friend</span>
        </button>
      </div>
    </div>
  );
};
